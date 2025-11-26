/**
 * Resolve allowed CORS origins
 * In production, only allow specific origins
 */
const resolveAllowedOrigin = (req) => {
  const origin = req.headers.origin
  
  // In production, validate against allowed origins
  if (process.env.NODE_ENV === 'production') {
    const allowedOrigins = []
    
    if (process.env.CORS_ALLOWED_ORIGIN) {
      allowedOrigins.push(...process.env.CORS_ALLOWED_ORIGIN.split(',').map(o => o.trim()))
    }
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      allowedOrigins.push(process.env.NEXT_PUBLIC_SITE_URL)
    }
    if (process.env.REFERRAL_BASE_URL) {
      allowedOrigins.push(process.env.REFERRAL_BASE_URL)
    }
    
    // If origin matches allowed list, return it
    if (origin && allowedOrigins.includes(origin)) {
      return origin
    }
    
    // If no origin header, deny (browser will send origin for CORS requests)
    return null
  }
  
  // In development, allow the requesting origin or localhost
  if (origin) {
    return origin
  }
  
  // Fallback for development
  return process.env.CORS_ALLOWED_ORIGIN || 
         process.env.NEXT_PUBLIC_SITE_URL || 
         process.env.REFERRAL_BASE_URL || 
         '*'
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
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
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


