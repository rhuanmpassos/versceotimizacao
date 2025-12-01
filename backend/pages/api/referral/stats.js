import { z } from 'zod'
import prisma from '../../../lib/prisma'
import { applyCors } from '../../../utils/cors'
import {
  setSecurityHeaders,
  sanitizeString,
  checkPayloadSize,
  sanitizeError,
  rateLimit,
} from '../../../utils/security'

// Rate limiter para stats (proteção contra brute force)
const statsRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  maxRequests: 20, // 20 requisições por minuto
})

// Validação do token (64 caracteres hex)
const tokenSchema = z.object({
  token: z.string()
    .length(64, 'Token inválido')
    .regex(/^[a-f0-9]+$/, 'Token inválido'),
})

// Constantes de liberação de pagamento (em dias)
const CARD_RELEASE_DAYS = 31
const PIX_RELEASE_DAYS = 7

export default async function handler(req, res) {
  // Apply security headers
  setSecurityHeaders(req, res)
  
  if (applyCors(req, res)) {
    return
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // Apply rate limiting (proteção contra brute force)
  if (statsRateLimit(req, res)) {
    return
  }

  try {
    // Sanitize input
    const sanitizedToken = sanitizeString(req.query?.token || '', 64).toLowerCase()

    const { token } = tokenSchema.parse({ token: sanitizedToken })
    
    // Buscar o referrer pelo access_token
    const referrer = await prisma.referrer.findUnique({
      where: { access_token: token },
    })

    // Se não existe, retorna erro genérico (não revelar se token existe ou não)
    if (!referrer) {
      return res.status(401).json({
        message: 'Acesso não autorizado',
      })
    }

    // Contar total de cliques (ReferralHit)
    const totalClicks = await prisma.referralHit.count({
      where: { referral_code: referrer.referral_code },
    })

    // Contar leads/indicações que vieram desse referral_code
    const totalReferrals = await prisma.lead.count({
      where: { referral_code: referrer.referral_code },
    })

    // Buscar TODAS as transações deste afiliado (para mostrar pendentes, expiradas, etc)
    const allTransactions = await prisma.transaction.findMany({
      where: { 
        affiliate_id: referrer.id,
      },
      select: {
        id: true,
        amount_affiliate: true,
        payment_method: true,
        status: true,
        created_at: true,
        scheduled_date: true,
        scheduled_time: true,
        lead_id: true,
        lead: {
          select: {
            nome: true,
            whatsapp: true,
            email: true,
            tracking_id: true,
            ip: true,
            user_agent: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    })

    // Filtrar transações bem-sucedidas para cálculo de ganhos
    const transactions = allTransactions.filter(t => t.status === 'succeeded')

    // Calcular valores
    const now = new Date()
    let totalEarnings = 0
    let pendingEarnings = 0
    let availableEarnings = 0

    const salesData = transactions.map(tx => {
      const amountAffiliate = tx.amount_affiliate / 100 // Converter de centavos para reais
      totalEarnings += amountAffiliate

      // Calcular data de liberação
      const createdAt = new Date(tx.created_at)
      const releaseDays = tx.payment_method === 'pix' ? PIX_RELEASE_DAYS : CARD_RELEASE_DAYS
      const releaseDate = new Date(createdAt)
      releaseDate.setDate(releaseDate.getDate() + releaseDays)

      const isReleased = now >= releaseDate

      if (isReleased) {
        availableEarnings += amountAffiliate
      } else {
        pendingEarnings += amountAffiliate
      }

      return {
        id: tx.id,
        leadName: tx.lead?.nome || 'Cliente',
        amount: amountAffiliate,
        paymentMethod: tx.payment_method,
        createdAt: tx.created_at,
        releaseDate: releaseDate.toISOString(),
        isReleased,
      }
    })

    const totalConverted = transactions.length

    // Buscar histórico de indicações (sem expor dados sensíveis)
    const referrals = await prisma.lead.findMany({
      where: { referral_code: referrer.referral_code },
      select: {
        id: true,
        nome: true,
        whatsapp: true,
        email: true,
        tracking_id: true,
        stage: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
      take: 100, // Buscar mais para poder agrupar
    })

    // Prioridade de stage (maior = mais importante)
    const stagePriority = {
      'COMPRADO': 100,
      'EM_CONTATO': 50,
      'NA_BASE': 30,
      'REJEITADO': 10,
    }

    // Agrupar referrals por pessoa (WhatsApp > Email > Tracking ID > ID)
    const referralsByPerson = new Map()
    
    const getReferralPersonKey = (r) => {
      if (r.whatsapp) return `whatsapp:${r.whatsapp}`
      if (r.email) return `email:${r.email}`
      if (r.tracking_id) return `tracking:${r.tracking_id}`
      return `lead:${r.id}`
    }
    
    for (const r of referrals) {
      const personKey = getReferralPersonKey(r)
      const existing = referralsByPerson.get(personKey)
      
      // Se não existe ou o novo tem stage mais importante, substitui
      if (!existing || (stagePriority[r.stage] || 0) > (stagePriority[existing.stage] || 0)) {
        referralsByPerson.set(personKey, r)
      }
    }

    // Formatar indicações para o frontend (agrupadas por pessoa)
    const formattedReferrals = Array.from(referralsByPerson.values())
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 50) // Limitar a 50
      .map(r => ({
        id: r.id,
        nome: r.nome,
        status: r.stage === 'COMPRADO' ? 'Convertido' : 
                r.stage === 'EM_CONTATO' ? 'Em contato' : 
                r.stage === 'REJEITADO' ? 'Não converteu' : 'Pendente',
        data: r.created_at,
      }))

    // Mapear status para português
    const statusMap = {
      'requires_payment_method': 'Aguardando Pagamento',
      'requires_confirmation': 'Aguardando Confirmação',
      'processing': 'Processando',
      'requires_action': 'Ação Necessária',
      'requires_capture': 'Aguardando Captura',
      'canceled': 'Cancelado/Expirado',
      'succeeded': 'Aprovado',
    }

    // Prioridade de status (maior = mais importante)
    const statusPriority = {
      'succeeded': 100,
      'processing': 80,
      'requires_action': 70,
      'requires_confirmation': 60,
      'requires_payment_method': 50,
      'requires_capture': 40,
      'canceled': 10,
    }

    // Agrupar transações por pessoa usando múltiplos identificadores
    // Prioridade: WhatsApp > E-mail > IP+UA > lead_id
    const transactionsByPerson = new Map()
    
    const getPersonKey = (tx) => {
      // Tentar identificar a pessoa por múltiplos fatores (ordem de prioridade)
      if (tx.lead?.whatsapp) return `whatsapp:${tx.lead.whatsapp}`
      if (tx.lead?.email) return `email:${tx.lead.email}`
      if (tx.lead?.tracking_id) return `tracking:${tx.lead.tracking_id}`
      if (tx.lead?.ip && tx.lead?.user_agent) return `fingerprint:${tx.lead.ip}:${tx.lead.user_agent.substring(0, 50)}`
      return `lead:${tx.lead_id}`
    }
    
    for (const tx of allTransactions) {
      const personKey = getPersonKey(tx)
      const existing = transactionsByPerson.get(personKey)
      
      // Se não existe ou a nova tem prioridade maior, substitui
      if (!existing || (statusPriority[tx.status] || 0) > (statusPriority[existing.status] || 0)) {
        transactionsByPerson.set(personKey, tx)
      }
    }

    // Preparar dados das transações (uma por pessoa, a mais relevante)
    const allTransactionsData = Array.from(transactionsByPerson.values()).map(tx => {
      const amountAffiliate = tx.amount_affiliate / 100
      const createdAt = new Date(tx.created_at)
      
      // Calcular data de liberação (só para aprovados)
      let releaseDate = null
      let isReleased = false
      
      if (tx.status === 'succeeded') {
        const releaseDays = tx.payment_method === 'pix' ? PIX_RELEASE_DAYS : CARD_RELEASE_DAYS
        releaseDate = new Date(createdAt)
        releaseDate.setDate(releaseDate.getDate() + releaseDays)
        isReleased = now >= releaseDate
      }

      return {
        id: tx.id,
        leadId: tx.lead_id,
        leadName: tx.lead?.nome || 'Cliente',
        leadWhatsapp: tx.lead?.whatsapp || null,
        amount: amountAffiliate,
        paymentMethod: tx.payment_method,
        status: tx.status,
        statusLabel: statusMap[tx.status] || tx.status,
        createdAt: tx.created_at,
        scheduledDate: tx.scheduled_date,
        scheduledTime: tx.scheduled_time,
        releaseDate: releaseDate?.toISOString() || null,
        isReleased,
      }
    })

    // Ordenar por data (mais recente primeiro)
    allTransactionsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    // Contar por status
    const pendingPayments = allTransactions.filter(t => 
      ['requires_payment_method', 'processing', 'requires_action'].includes(t.status)
    ).length
    const canceledPayments = allTransactions.filter(t => t.status === 'canceled').length

    return res.status(200).json({
      referrer: {
        nome: referrer.nome,
        referral_code: referrer.referral_code,
        pix_key: referrer.pix_key || null,
        created_at: referrer.created_at,
      },
      stats: {
        totalClicks,
        totalReferrals,
        totalConverted,
        totalEarnings,
        pendingEarnings,
        availableEarnings,
        pendingPayments,     // Quantidade aguardando pagamento
        canceledPayments,    // Quantidade cancelado/expirado
        // Manter compatibilidade com versão anterior
        earnings: totalEarnings,
        freeOptimization: totalConverted >= 5,
        remainingForFree: Math.max(0, 5 - totalConverted),
      },
      sales: salesData,
      transactions: allTransactionsData, // TODAS as transações com status
      referrals: formattedReferrals,
      paymentInfo: {
        cardReleaseDays: CARD_RELEASE_DAYS,
        pixReleaseDays: PIX_RELEASE_DAYS,
      },
    })
  } catch (error) {
    const isProduction = process.env.NODE_ENV === 'production'
    
    if (!isProduction) {
      console.error('Erro em /api/referral/stats', error)
    } else {
      console.error('Erro em /api/referral/stats', {
        message: error.message,
        name: error.name,
      })
    }

    if (error instanceof z.ZodError) {
      return res.status(401).json({
        message: 'Acesso não autorizado',
      })
    }

    const errorResponse = sanitizeError(error, isProduction)
    return res.status(500).json(errorResponse)
  }
}
