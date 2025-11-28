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

    // Contar quantas indicações compraram (stage = COMPRADO)
    const totalConverted = await prisma.lead.count({
      where: { 
        referral_code: referrer.referral_code,
        stage: 'COMPRADO',
      },
    })

    // Calcular ganhos (R$ 60 por conversão)
    const earnings = totalConverted * 60

    // Buscar histórico de indicações (sem expor dados sensíveis)
    const referrals = await prisma.lead.findMany({
      where: { referral_code: referrer.referral_code },
      select: {
        id: true,
        nome: true,
        stage: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
      take: 50, // Limitar a 50 últimas
    })

    // Formatar indicações para o frontend
    const formattedReferrals = referrals.map(r => ({
      id: r.id,
      nome: r.nome,
      status: r.stage === 'COMPRADO' ? 'Convertido' : 
              r.stage === 'EM_CONTATO' ? 'Em contato' : 
              r.stage === 'REJEITADO' ? 'Não converteu' : 'Pendente',
      data: r.created_at,
    }))

    return res.status(200).json({
      referrer: {
        nome: referrer.nome,
        referral_code: referrer.referral_code,
        created_at: referrer.created_at,
      },
      stats: {
        totalClicks,
        totalReferrals,
        totalConverted,
        earnings,
        freeOptimization: totalConverted >= 5, // Ganhou otimização grátis?
        remainingForFree: Math.max(0, 5 - totalConverted), // Faltam X para otimização grátis
      },
      referrals: formattedReferrals,
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
