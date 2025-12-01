import prisma from '../../../../lib/prisma'
import { withAdminAuth } from '../../../../utils/adminAuth'
import { sanitizeError } from '../../../../utils/security'

async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Buscar todos os influencers
    const influencers = await prisma.referrer.findMany({
      where: {
        tipo: 'INFLUENCER',
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    // Para cada influencer, buscar estatísticas
    const influencersWithStats = await Promise.all(
      influencers.map(async (influencer) => {
        const [totalClicks, totalLeads] = await Promise.all([
          // Total de cliques (cada registro = 1 IP único)
          prisma.referralHit.count({
            where: { referral_code: influencer.referral_code },
          }),
          // Total de leads convertidos
          prisma.lead.count({
            where: { referral_code: influencer.referral_code },
          }),
        ])

        // Gerar link
        const baseUrl = process.env.REFERRAL_BASE_URL || 
                        process.env.NEXT_PUBLIC_SITE_URL || 
                        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173')
        
        const referralLink = `${baseUrl.replace(/\/$/, '')}/?ref=${influencer.referral_code}`

        return {
          id: influencer.id,
          nome: influencer.nome,
          whatsapp: influencer.whatsapp,
          slug: influencer.referral_code,
          pix_key: influencer.pix_key,
          referralLink,
          ativo: influencer.ativo,
          created_at: influencer.created_at,
          created_by: influencer.created_by,
          stats: {
            totalClicks, // Cada clique = 1 IP único
            totalLeads,
          },
        }
      })
    )

    return res.status(200).json({
      success: true,
      influencers: influencersWithStats,
      total: influencersWithStats.length,
    })
  } catch (error) {
    console.error('[Admin] Erro ao listar influencers:', error)
    const errorResponse = sanitizeError(error, process.env.NODE_ENV === 'production')
    return res.status(500).json(errorResponse)
  }
}

export default withAdminAuth(handler)

