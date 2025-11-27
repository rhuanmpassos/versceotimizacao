import { z } from 'zod'
import prisma from '../../../../lib/prisma'
import { withAdminAuth } from '../../../../utils/adminAuth'
import { sanitizeString, sanitizeError } from '../../../../utils/security'
import { sendAdminNotification } from '../../../../utils/discord'

const toggleSchema = z.object({
  id: z.string().uuid('ID inválido'),
})

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const sanitizedBody = {
      id: sanitizeString(req.body?.id || '', 36),
    }

    const { id } = toggleSchema.parse(sanitizedBody)

    // Buscar influencer
    const influencer = await prisma.referrer.findUnique({
      where: { id },
    })

    if (!influencer) {
      return res.status(404).json({ error: 'Influencer não encontrado' })
    }

    if (influencer.tipo !== 'INFLUENCER') {
      return res.status(400).json({ error: 'Este registro não é um influencer' })
    }

    // Toggle status
    const updatedInfluencer = await prisma.referrer.update({
      where: { id },
      data: {
        ativo: !influencer.ativo,
      },
    })

    console.info('[Admin] Influencer status alterado:', {
      id: updatedInfluencer.id,
      nome: updatedInfluencer.nome,
      ativo: updatedInfluencer.ativo,
      changedBy: req.adminUser?.email,
    })

    // Notificar no Discord
    sendAdminNotification({
      type: 'influencer_toggled',
      email: req.adminUser?.email || 'admin',
      influencerName: updatedInfluencer.nome,
      slug: updatedInfluencer.referral_code,
    }).catch(err => {
      console.error('[Admin] Erro ao notificar toggle:', err)
    })

    return res.status(200).json({
      success: true,
      influencer: {
        id: updatedInfluencer.id,
        nome: updatedInfluencer.nome,
        slug: updatedInfluencer.referral_code,
        ativo: updatedInfluencer.ativo,
      },
    })
  } catch (error) {
    console.error('[Admin] Erro ao alterar status:', error)

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

