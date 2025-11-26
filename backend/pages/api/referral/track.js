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

const trackSchema = z.object({
  referral_code: z.string()
    .uuid('Código de indicação inválido')
    .refine((val) => validateUUID(val), 'Código de indicação inválido'),
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
      referral_code: sanitizeString(req.body?.referral_code || '', 36),
    }

    const { referral_code } = trackSchema.parse(sanitizedBody)
    const ip = extractIp(req)
    const user_agent = sanitizeString(req.headers['user-agent'] || 'unknown', 500)

    await prisma.referralHit.create({
      data: {
        referral_code,
        ip,
        user_agent,
      },
    })

    const [total_hits, uniqueIps, referrer] = await Promise.all([
      prisma.referralHit.count({ where: { referral_code } }),
      prisma.referralHit.findMany({
        where: { referral_code },
        select: { ip: true },
        distinct: ['ip'],
      }),
      prisma.referrer.findUnique({ where: { referral_code } }),
    ])

    const total_unique_ips = uniqueIps.length

    return res.status(200).json({
      tracked: true,
      total_hits,
      total_unique_ips,
      referrer,
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
