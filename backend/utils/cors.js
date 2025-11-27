/**
 * Resolve allowed CORS origins
 * SEMPRE valida contra lista de origens permitidas
 */
const resolveAllowedOrigin = (req) => {
  const origin = req.headers.origin
  
  // Construir lista de origens permitidas
  const allowedOrigins = new Set()
  
  if (process.env.CORS_ALLOWED_ORIGIN) {
    process.env.CORS_ALLOWED_ORIGIN.split(',').forEach(o => allowedOrigins.add(o.trim()))
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    allowedOrigins.add(process.env.NEXT_PUBLIC_SITE_URL)
  }
  if (process.env.REFERRAL_BASE_URL) {
    allowedOrigins.add(process.env.REFERRAL_BASE_URL)
  }
  
  // Em desenvolvimento, adicionar localhost
  if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.add('http://localhost:5173')
    allowedOrigins.add('http://localhost:3000')
    allowedOrigins.add('http://127.0.0.1:5173')
    allowedOrigins.add('http://127.0.0.1:3000')
  }
  
  // Se a origem está na lista permitida, retorna ela
  if (origin && allowedOrigins.has(origin)) {
    return origin
  }
  
  // Se não há origem mas temos origens permitidas, usar a primeira (para requests não-browser)
  if (!origin && allowedOrigins.size > 0) {
    // Retornar null para negar requests cross-origin sem header Origin
    return null
  }
  
  // Em desenvolvimento sem origem configurada, permite localhost
  if (process.env.NODE_ENV !== 'production' && origin?.includes('localhost')) {
    return origin
  }
  
  // Negar por padrão em produção
  return null
}

/**
 * Apply CORS headers with security best practices
 */
export const applyCors = (req, res) => {
  const origin = resolveAllowedOrigin(req)
  
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  res.setHeader('Access-Control-Max-Age', '86400')
  
  // Expose only necessary headers
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return true
  }

  return false
}


