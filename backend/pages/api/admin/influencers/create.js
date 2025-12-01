import { z } from 'zod'
import prisma from '../../../../lib/prisma'
import { withAdminAuth, validateSlug } from '../../../../utils/adminAuth'
import { sanitizeString, validateWhatsApp, sanitizeError } from '../../../../utils/security'
import { sendAdminNotification } from '../../../../utils/discord'

const createSchema = z.object({
  nome: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),
  whatsapp: z.string()
    .min(8, 'WhatsApp inválido')
    .max(20, 'WhatsApp inválido')
    .refine(val => validateWhatsApp(val), 'WhatsApp inválido'),
  slug: z.string()
    .min(3, 'Slug deve ter pelo menos 3 caracteres')
    .max(30, 'Slug deve ter no máximo 30 caracteres'),
  pix_key: z.string().max(140).optional(),
})

// Normaliza a chave PIX (remove +55 de telefone)
const normalizePixKey = (pixKey) => {
  if (!pixKey) return null
  // Se começa com +55, remove
  if (pixKey.startsWith('+55')) {
    return pixKey.substring(3)
  }
  return pixKey
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Sanitizar inputs
    const sanitizedBody = {
      nome: sanitizeString(req.body?.nome || '', 100),
      whatsapp: sanitizeString(req.body?.whatsapp || '', 20),
      slug: sanitizeString(req.body?.slug || '', 30),
      pix_key: req.body?.pix_key ? sanitizeString(req.body.pix_key, 140).trim() : undefined,
    }

    // Validar schema
    const data = createSchema.parse(sanitizedBody)

    // Validar slug
    const slugValidation = validateSlug(data.slug)
    if (!slugValidation.valid) {
      return res.status(400).json({ error: slugValidation.error })
    }

    const normalizedSlug = slugValidation.slug
    const normalizedWhatsApp = data.whatsapp.replace(/\D/g, '')

    // Verificar se slug já existe
    const existingSlug = await prisma.referrer.findUnique({
      where: { referral_code: normalizedSlug },
    })

    if (existingSlug) {
      return res.status(409).json({ 
        error: 'Este slug já está em uso. Escolha outro.',
      })
    }

    // Verificar se WhatsApp já existe como influencer
    const existingWhatsApp = await prisma.referrer.findFirst({
      where: {
        whatsapp: normalizedWhatsApp,
        tipo: 'INFLUENCER',
      },
    })

    if (existingWhatsApp) {
      return res.status(409).json({ 
        error: 'Este WhatsApp já está cadastrado como influencer.',
      })
    }

    // Normalizar chave PIX se fornecida
    const normalizedPixKey = normalizePixKey(data.pix_key)

    // Criar influencer
    const influencer = await prisma.referrer.create({
      data: {
        nome: sanitizeString(data.nome, 100),
        whatsapp: normalizedWhatsApp,
        referral_code: normalizedSlug,
        pix_key: normalizedPixKey,
        tipo: 'INFLUENCER',
        ativo: true,
        created_by: req.adminUser?.email || 'admin',
      },
    })

    console.info('[Admin] Influencer criado:', {
      id: influencer.id,
      nome: influencer.nome,
      slug: normalizedSlug,
      createdBy: req.adminUser?.email,
    })

    // Notificar no Discord
    sendAdminNotification({
      type: 'influencer_created',
      email: req.adminUser?.email || 'admin',
      influencerName: influencer.nome,
      slug: normalizedSlug,
    }).catch(err => {
      console.error('[Admin] Erro ao notificar criação:', err)
    })

    // Gerar link
    const baseUrl = process.env.REFERRAL_BASE_URL || 
                    process.env.NEXT_PUBLIC_SITE_URL || 
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173')
    
    const referralLink = `${baseUrl.replace(/\/$/, '')}/?ref=${normalizedSlug}`

    return res.status(201).json({
      success: true,
      influencer: {
        id: influencer.id,
        nome: influencer.nome,
        whatsapp: normalizedWhatsApp,
        slug: normalizedSlug,
        pix_key: normalizedPixKey,
        referralLink,
        ativo: influencer.ativo,
        created_at: influencer.created_at,
      },
    })
  } catch (error) {
    console.error('[Admin] Erro ao criar influencer:', error)

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

