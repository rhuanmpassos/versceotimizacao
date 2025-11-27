import { z } from 'zod'
import prisma from '../../../lib/prisma'
import { applyCors } from '../../../utils/cors'
import {
  extractIp,
  setSecurityHeaders,
  sanitizeString,
  validateUUID,
  checkPayloadSize,
  sanitizeError,
  rateLimit,
} from '../../../utils/security'

// Rate limiter para tracking (mais permissivo)
const trackRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  maxRequests: 30, // 30 requisições por minuto
})

// Validação flexível: aceita UUID ou slug customizado (3-30 chars, alfanumérico com - e _)
const trackSchema = z.object({
  referral_code: z.string()
    .min(3, 'Código de indicação inválido')
    .max(36, 'Código de indicação inválido')
    .refine((val) => {
      // Aceita UUID
      if (validateUUID(val)) return true
      // Aceita slug customizado (letras, números, hífen, underscore)
      return /^[a-zA-Z0-9_-]+$/.test(val)
    }, 'Código de indicação inválido'),
})

export default async function handler(req, res) {
  // Apply security headers
  setSecurityHeaders(req, res)
  
  if (applyCors(req, res)) {
    return
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // Check payload size
  if (!checkPayloadSize(req, 1024 * 2)) {
    return res.status(413).json({ message: 'Payload muito grande' })
  }

  // Apply rate limiting
  if (trackRateLimit(req, res)) {
    return
  }

  try {
    // Sanitize input
    const sanitizedBody = {
      referral_code: sanitizeString(req.body?.referral_code || '', 36).toLowerCase(),
    }

    const { referral_code } = trackSchema.parse(sanitizedBody)
    
    // Verificar se o referrer existe e está ativo
    const referrer = await prisma.referrer.findUnique({ 
      where: { referral_code } 
    })

    // Se não existe ou está inativo, não rastreia mas não retorna erro
    if (!referrer || !referrer.ativo) {
      return res.status(200).json({
        tracked: false,
        message: 'Código de indicação não encontrado ou inativo',
      })
    }

    const ip = extractIp(req)
    const user_agent = sanitizeString(req.headers['user-agent'] || 'unknown', 500)

    // Verificar se este IP já foi registrado para este referral_code
    const existingHit = await prisma.referralHit.findFirst({
      where: {
        referral_code,
        ip,
      },
    })

    let isNewClick = false

    // Só registra se for um IP novo (1 clique por IP)
    if (!existingHit) {
      await prisma.referralHit.create({
        data: {
          referral_code,
          ip,
          user_agent,
        },
      })
      isNewClick = true
    }

    // Contar total de cliques únicos (cada registro = 1 IP único)
    const totalClicks = await prisma.referralHit.count({ 
      where: { referral_code } 
    })

    return res.status(200).json({
      tracked: true,
      isNewClick,
      totalClicks,
      referrer: {
        nome: referrer.nome,
        tipo: referrer.tipo,
      },
    })
  } catch (error) {
    const isProduction = process.env.NODE_ENV === 'production'
    
    if (!isProduction) {
      console.error('Erro em /api/referral/track', error)
    } else {
      console.error('Erro em /api/referral/track', {
        message: error.message,
        name: error.name,
      })
    }

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Código de indicação inválido',
        issues: error.issues.map(issue => ({
          path: issue.path,
          message: issue.message,
        })),
      })
    }

    const errorResponse = sanitizeError(error, isProduction)
    return res.status(500).json(errorResponse)
  }
}
