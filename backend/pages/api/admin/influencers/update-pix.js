import { z } from 'zod'
import prisma from '../../../../lib/prisma'
import { withAdminAuth } from '../../../../utils/adminAuth'
import { sanitizeString, sanitizeError } from '../../../../utils/security'

// Normaliza a chave PIX (remove +55 de telefone)
const normalizePixKey = (pixKey) => {
  if (!pixKey) return null
  // Se começa com +55, remove
  if (pixKey.startsWith('+55')) {
    return pixKey.substring(3)
  }
  return pixKey
}

// Validação da chave PIX
const pixKeySchema = z.object({
  pix_key: z.string()
    .min(5, 'Chave PIX muito curta')
    .max(140, 'Chave PIX muito longa')
    .refine((val) => {
      // Aceita CPF (11 dígitos)
      if (/^\d{11}$/.test(val)) return true
      // Aceita telefone com 10 dígitos (fixo com DDD)
      if (/^\d{10}$/.test(val)) return true
      // Aceita CNPJ (14 dígitos)
      if (/^\d{14}$/.test(val)) return true
      // Aceita e-mail
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return true
      // Aceita telefone com +55
      if (/^\+55\d{10,11}$/.test(val)) return true
      // Aceita chave aleatória (32 caracteres)
      if (/^[a-zA-Z0-9-]{32,36}$/.test(val)) return true
      // Aceita formatos com máscara (CPF: xxx.xxx.xxx-xx, etc)
      const cleanVal = val.replace(/\D/g, '')
      if (cleanVal.length === 10 || cleanVal.length === 11 || cleanVal.length === 14) return true
      return false
    }, 'Chave PIX inválida. Use CPF, CNPJ, e-mail, telefone ou chave aleatória')
    .optional(),
  influencer_id: z.string().uuid('ID do influencer inválido'),
})

async function handler(req, res) {
  if (req.method !== 'PUT' && req.method !== 'POST') {
    res.setHeader('Allow', 'PUT, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Sanitizar inputs
    const sanitizedBody = {
      influencer_id: sanitizeString(req.body?.influencer_id || '', 36),
      pix_key: req.body?.pix_key ? sanitizeString(req.body.pix_key, 140).trim() : undefined,
    }

    const { influencer_id, pix_key } = pixKeySchema.parse(sanitizedBody)

    // Buscar influencer
    const influencer = await prisma.referrer.findUnique({
      where: { id: influencer_id },
    })

    if (!influencer) {
      return res.status(404).json({ error: 'Influencer não encontrado' })
    }

    // Verificar se é influencer
    if (influencer.tipo !== 'INFLUENCER') {
      return res.status(400).json({ error: 'Este referrer não é um influencer' })
    }

    // Normalizar chave PIX
    const normalizedPixKey = normalizePixKey(pix_key)

    // Atualizar chave PIX
    const updated = await prisma.referrer.update({
      where: { id: influencer_id },
      data: { pix_key: normalizedPixKey },
    })

    console.info('[Admin] Chave PIX atualizada:', {
      influencer_id: influencer.id,
      nome: influencer.nome,
      pix_key_masked: normalizedPixKey ? normalizedPixKey.substring(0, 4) + '***' : null,
      updatedBy: req.adminUser?.email,
    })

    return res.status(200).json({
      success: true,
      message: normalizedPixKey ? 'Chave PIX atualizada com sucesso!' : 'Chave PIX removida com sucesso!',
      influencer: {
        id: updated.id,
        nome: updated.nome,
        pix_key: updated.pix_key,
      },
    })
  } catch (error) {
    console.error('[Admin] Erro ao atualizar PIX:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: error.issues[0]?.message || 'Dados inválidos',
      })
    }

    const errorResponse = sanitizeError(error, process.env.NODE_ENV === 'production')
    return res.status(500).json(errorResponse)
  }
}

export default withAdminAuth(handler)

