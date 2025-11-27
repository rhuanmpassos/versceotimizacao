import jwt from 'jsonwebtoken'
import { applyCors } from '../../../../utils/cors'
import { setSecurityHeaders } from '../../../../utils/security'

// JWT_SECRET deve ser configurado via variável de ambiente
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('[SECURITY] JWT_SECRET não configurado')
  }
  return secret
}

export default async function handler(req, res) {
  setSecurityHeaders(req, res)
  
  if (applyCors(req, res)) {
    return
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token não fornecido' })
    }

    const token = authHeader.split(' ')[1]
    
    const decoded = jwt.verify(token, getJwtSecret())
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' })
    }

    return res.status(200).json({
      valid: true,
      user: {
        email: decoded.email,
        role: decoded.role,
      },
    })
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' })
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' })
    }
    
    console.error('[Admin Auth] Erro na verificação:', error)
    return res.status(500).json({ error: 'Erro interno' })
  }
}

