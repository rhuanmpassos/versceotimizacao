import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import prisma from '../../../lib/prisma'
import { applyCors } from '../../../utils/cors'
import {
  extractIp,
  setSecurityHeaders,
  sanitizeString,
  validateWhatsApp,
  checkPayloadSize,
  sanitizeError,
  rateLimit,
} from '../../../utils/security'

// Rate limiter para criação de referrers
const createRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  maxRequests: 5, // Apenas 5 criações por hora
})

const referrerSchema = z.object({
  nome: z.string()
    .min(2, 'Informe seu nome completo')
    .max(100, 'Nome muito longo')
    .refine((val) => sanitizeString(val, 100) === val, 'Nome contém caracteres inválidos'),
  whatsapp: z.string()
    .min(8, 'Informe um WhatsApp válido')
    .max(20, 'WhatsApp inválido')
    .refine((val) => validateWhatsApp(val), 'WhatsApp inválido'),
})

const sanitizeUrl = (url) => url.replace(/\/$/, '')

function resolveBaseUrl() {
  if (process.env.REFERRAL_BASE_URL) {
    return sanitizeUrl(process.env.REFERRAL_BASE_URL)
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return sanitizeUrl(process.env.NEXT_PUBLIC_SITE_URL)
  }

  if (process.env.VERCEL_URL) {
    return sanitizeUrl(`https://${process.env.VERCEL_URL}`)
  }

  return 'http://localhost:5173'
}

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
  if (!checkPayloadSize(req, 1024 * 5)) {
    return res.status(413).json({ message: 'Payload muito grande' })
  }

  // Apply rate limiting
  if (createRateLimit(req, res)) {
    return
  }

  try {
    // Sanitize input
    const sanitizedBody = {
      nome: sanitizeString(req.body?.nome || '', 100),
      whatsapp: sanitizeString(req.body?.whatsapp || '', 20),
    }

    const { nome, whatsapp } = referrerSchema.parse(sanitizedBody)
    
    // Normalize WhatsApp before checking and saving
    const normalizedWhatsApp = whatsapp.replace(/\D/g, '')
    
    // Check if WhatsApp already exists (prevent duplicate accounts)
    const existingReferrer = await prisma.referrer.findFirst({
      where: {
        whatsapp: normalizedWhatsApp,
      },
    })

    if (existingReferrer) {
      return res.status(409).json({
        message: 'Este WhatsApp já está cadastrado no programa de indicação.',
      })
    }
    
    const referral_code = uuidv4()

    await prisma.referrer.create({
      data: {
        nome: sanitizeString(nome, 100),
        whatsapp: normalizedWhatsApp, // Save normalized WhatsApp
        referral_code,
      },
    })

    const referralLink = `${resolveBaseUrl()}/?ref=${referral_code}`

    return res.status(201).json({ referralLink, referral_code })
  } catch (error) {
    const isProduction = process.env.NODE_ENV === 'production'
    
    if (!isProduction) {
      console.error('Erro em /api/referral/create', error)
    } else {
      console.error('Erro em /api/referral/create', {
        message: error.message,
        name: error.name,
      })
    }

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Dados inválidos',
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
