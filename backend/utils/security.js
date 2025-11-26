/**
 * Security utilities and middleware
 */

// Rate limiting store (in-memory, use Redis in production)
const rateLimitStore = new Map()

/**
 * Rate limiting middleware
 * @param {Object} options - Rate limit options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.maxRequests - Maximum requests per window
 * @returns {Function} Middleware function
 */
export const rateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes default
    maxRequests = 100, // 100 requests default
  } = options

  return (req, res, next) => {
    const ip = extractIp(req)
    const key = `${ip}-${req.path}`
    const now = Date.now()

    // Clean old entries periodically
    if (rateLimitStore.size > 10000) {
      for (const [k, v] of rateLimitStore.entries()) {
        if (now - v.resetTime > windowMs) {
          rateLimitStore.delete(k)
        }
      }
    }

    const record = rateLimitStore.get(key)

    if (!record) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs,
      })
      return next ? next() : false
    }

    if (now > record.resetTime) {
      record.count = 1
      record.resetTime = now + windowMs
      return next ? next() : false
    }

    if (record.count >= maxRequests) {
      res.status(429).json({
        message: 'Muitas requisições. Por favor, tente novamente mais tarde.',
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      })
      return true
    }

    record.count++
    return next ? next() : false
  }
}

/**
 * Extract IP address from request
 */
export const extractIp = (req) => {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = req.headers['x-real-ip']
  if (typeof realIp === 'string' && realIp.length > 0) {
    return realIp.trim()
  }

  return req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown'
}

/**
 * Set security headers
 */
export const setSecurityHeaders = (req, res) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY')
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff')
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block')
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  
  // Content Security Policy (adjust based on your needs)
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Adjust for production
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
  ].join('; ')
  res.setHeader('Content-Security-Policy', csp)
  
  // Strict Transport Security (only in production with HTTPS)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
}

/**
 * Validate and sanitize string input
 */
export const sanitizeString = (str, maxLength = 500) => {
  if (typeof str !== 'string') return ''
  
  // Remove null bytes
  let sanitized = str.replace(/\0/g, '')
  
  // Trim whitespace
  sanitized = sanitized.trim()
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }
  
  return sanitized
}

/**
 * Validate WhatsApp number format
 */
export const validateWhatsApp = (whatsapp) => {
  if (!whatsapp || typeof whatsapp !== 'string') return false
  
  // Remove non-digits
  const digits = whatsapp.replace(/\D/g, '')
  
  // Brazilian format: 10-11 digits (with or without country code)
  // International: 7-15 digits
  if (digits.length < 7 || digits.length > 15) return false
  
  return true
}

/**
 * Validate UUID format
 */
export const validateUUID = (uuid) => {
  if (!uuid || typeof uuid !== 'string') return false
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Check payload size
 */
export const checkPayloadSize = (req, maxSize = 1024 * 10) => { // 10KB default
  const contentLength = parseInt(req.headers['content-length'] || '0', 10)
  return contentLength <= maxSize
}

/**
 * Sanitize error messages for production
 */
export const sanitizeError = (error, isProduction = false) => {
  if (!isProduction) {
    return {
      message: error.message,
      stack: error.stack,
    }
  }
  
  // In production, don't expose internal errors
  if (error instanceof z.ZodError) {
    return {
      message: 'Dados inválidos',
      issues: error.issues.map(issue => ({
        path: issue.path,
        message: issue.message,
      })),
    }
  }
  
  // Generic error message
  return {
    message: 'Ocorreu um erro. Por favor, tente novamente.',
  }
}

import { z } from 'zod'

