import jwt from 'jsonwebtoken'
import { sendAdminNotification } from './discord'
import { extractIp, setSecurityHeaders, rateLimit } from './security'
import { applyCors } from './cors'

// JWT_SECRET deve ser configurado via variável de ambiente
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('[SECURITY] JWT_SECRET não configurado')
  }
  return secret
}

// Rate limiter agressivo para rotas admin
const adminRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  maxRequests: 60, // 60 requisições por minuto
})

// Rate limiter para tentativas de acesso não autenticado
const unauthRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 10, // 10 tentativas por 15 minutos
})

/**
 * Middleware para proteger rotas de API admin
 * @param {Function} handler - O handler da API
 * @returns {Function} Handler protegido
 */
export function withAdminAuth(handler) {
  return async (req, res) => {
    // Aplicar headers de segurança
    setSecurityHeaders(req, res)
    
    // Aplicar CORS primeiro (trata OPTIONS automaticamente)
    if (applyCors(req, res)) {
      return // OPTIONS já foi respondido
    }
    
    const ip = extractIp(req)
    
    // Verificar token JWT
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Rate limit para tentativas não autenticadas
      if (unauthRateLimit(req, res)) {
        return
      }
      
      console.warn('[Admin] Tentativa de acesso sem token:', { ip })
      
      return res.status(401).json({ 
        error: 'Não autenticado',
        message: 'Token de autenticação necessário.',
      })
    }

    const token = authHeader.split(' ')[1]
    
    try {
      const decoded = jwt.verify(token, getJwtSecret())
      
      if (decoded.role !== 'admin') {
        console.warn('[Admin] Token sem permissão de admin:', { email: decoded.email, ip })
        
        sendAdminNotification({
          type: 'unauthorized_access',
          email: decoded.email || 'N/A',
          provider: 'jwt',
          name: 'Role inválida',
        }).catch(() => {})
        
        return res.status(403).json({ 
          error: 'Não autorizado',
          message: 'Você não tem permissão para acessar esta área.',
        })
      }
      
      // Rate limit para usuários autenticados
      if (adminRateLimit(req, res)) {
        return
      }
      
      // Adicionar dados do admin ao request
      req.adminUser = {
        email: decoded.email,
        role: decoded.role,
      }
      
      // Executar handler original
      return handler(req, res)
      
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Token expirado',
          message: 'Sua sessão expirou. Faça login novamente.',
        })
      }
      
      if (error.name === 'JsonWebTokenError') {
        console.warn('[Admin] Token inválido:', { ip, error: error.message })
        
        return res.status(401).json({ 
          error: 'Token inválido',
          message: 'Token de autenticação inválido.',
        })
      }
      
      console.error('[Admin] Erro na autenticação:', error)
      return res.status(500).json({ error: 'Erro interno' })
    }
  }
}

/**
 * Valida um slug de influencer
 */
export function validateSlug(slug) {
  if (!slug || typeof slug !== 'string') {
    return { valid: false, error: 'Slug é obrigatório' }
  }
  
  const trimmed = slug.trim().toLowerCase()
  
  // Tamanho
  if (trimmed.length < 3) {
    return { valid: false, error: 'Slug deve ter pelo menos 3 caracteres' }
  }
  
  if (trimmed.length > 30) {
    return { valid: false, error: 'Slug deve ter no máximo 30 caracteres' }
  }
  
  // Formato: só letras, números, hífen e underscore
  const slugRegex = /^[a-z0-9_-]+$/
  if (!slugRegex.test(trimmed)) {
    return { valid: false, error: 'Slug só pode conter letras minúsculas, números, hífen e underscore' }
  }
  
  // Não pode começar ou terminar com hífen/underscore
  if (/^[-_]|[-_]$/.test(trimmed)) {
    return { valid: false, error: 'Slug não pode começar ou terminar com hífen ou underscore' }
  }
  
  // Slugs reservados
  const reserved = [
    'admin', 'api', 'referral', 'auth', 'login', 'logout',
    'dashboard', 'settings', 'profile', 'user', 'users',
    'static', 'public', 'assets', 'images', 'css', 'js',
    'null', 'undefined', 'true', 'false', 'test', 'demo',
  ]
  
  if (reserved.includes(trimmed)) {
    return { valid: false, error: 'Este slug é reservado e não pode ser usado' }
  }
  
  return { valid: true, slug: trimmed }
}
