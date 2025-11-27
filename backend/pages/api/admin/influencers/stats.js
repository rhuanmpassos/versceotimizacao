import { z } from 'zod'
import prisma from '../../../../lib/prisma'
import { withAdminAuth } from '../../../../utils/adminAuth'
import { sanitizeString, sanitizeError } from '../../../../utils/security'

const statsSchema = z.object({
  id: z.string().uuid('ID inválido').optional(),
  slug: z.string().min(3).max(30).optional(),
})

async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const sanitizedQuery = {
      id: req.query?.id ? sanitizeString(req.query.id, 36) : undefined,
      slug: req.query?.slug ? sanitizeString(req.query.slug, 30) : undefined,
    }

    const { id, slug } = statsSchema.parse(sanitizedQuery)

    // Precisa de pelo menos um identificador
    if (!id && !slug) {
      return res.status(400).json({ error: 'Informe id ou slug' })
    }

    // Buscar influencer
    const influencer = await prisma.referrer.findFirst({
      where: {
        OR: [
          id ? { id } : {},
          slug ? { referral_code: slug.toLowerCase() } : {},
        ].filter(obj => Object.keys(obj).length > 0),
        tipo: 'INFLUENCER',
      },
    })

    if (!influencer) {
      return res.status(404).json({ error: 'Influencer não encontrado' })
    }

    // Buscar estatísticas detalhadas
    const [
      totalHits,
      uniqueIps,
      totalLeads,
      hitsLast7Days,
      hitsLast30Days,
      leadsLast7Days,
      leadsLast30Days,
      recentHits,
      recentLeads,
    ] = await Promise.all([
      // Total de cliques
      prisma.referralHit.count({
        where: { referral_code: influencer.referral_code },
      }),
      
      // IPs únicos
      prisma.referralHit.findMany({
        where: { referral_code: influencer.referral_code },
        select: { ip: true },
        distinct: ['ip'],
      }),
      
      // Total de leads
      prisma.lead.count({
        where: { referral_code: influencer.referral_code },
      }),
      
      // Hits últimos 7 dias
      prisma.referralHit.count({
        where: {
          referral_code: influencer.referral_code,
          created_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      
      // Hits últimos 30 dias
      prisma.referralHit.count({
        where: {
          referral_code: influencer.referral_code,
          created_at: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
      
      // Leads últimos 7 dias
      prisma.lead.count({
        where: {
          referral_code: influencer.referral_code,
          created_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      
      // Leads últimos 30 dias
      prisma.lead.count({
        where: {
          referral_code: influencer.referral_code,
          created_at: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
      
      // Últimos 10 hits
      prisma.referralHit.findMany({
        where: { referral_code: influencer.referral_code },
        orderBy: { created_at: 'desc' },
        take: 10,
        select: {
          id: true,
          ip: true,
          created_at: true,
        },
      }),
      
      // Últimos 10 leads
      prisma.lead.findMany({
        where: { referral_code: influencer.referral_code },
        orderBy: { created_at: 'desc' },
        take: 10,
        select: {
          id: true,
          nome: true,
          created_at: true,
        },
      }),
    ])

    // Calcular taxa de conversão
    const conversionRate = totalHits > 0 
      ? ((totalLeads / totalHits) * 100).toFixed(2) 
      : 0

    // Gerar link
    const baseUrl = process.env.REFERRAL_BASE_URL || 
                    process.env.NEXT_PUBLIC_SITE_URL || 
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173')
    
    const referralLink = `${baseUrl.replace(/\/$/, '')}/?ref=${influencer.referral_code}`

    return res.status(200).json({
      success: true,
      influencer: {
        id: influencer.id,
        nome: influencer.nome,
        whatsapp: influencer.whatsapp,
        slug: influencer.referral_code,
        referralLink,
        ativo: influencer.ativo,
        created_at: influencer.created_at,
      },
      stats: {
        total: {
          hits: totalHits,
          uniqueIps: uniqueIps.length,
          leads: totalLeads,
          conversionRate: `${conversionRate}%`,
        },
        last7Days: {
          hits: hitsLast7Days,
          leads: leadsLast7Days,
        },
        last30Days: {
          hits: hitsLast30Days,
          leads: leadsLast30Days,
        },
        recent: {
          hits: recentHits,
          leads: recentLeads,
        },
      },
    })
  } catch (error) {
    console.error('[Admin] Erro ao buscar estatísticas:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        issues: error.issues.map(i => ({
          path: i.path,
          message: i.message,
        })),
      })
    }

    const errorResponse = sanitizeError(error, process.env.NODE_ENV === 'production')
    return res.status(500).json(errorResponse)
  }
}

export default withAdminAuth(handler)

