/**
 * Sistema de tracking para correlacionar mesma pessoa
 * Usa cookies para persistir um ID único do visitante
 */

const TRACKING_COOKIE_NAME = 'vrs_tid'
const COOKIE_EXPIRY_DAYS = 365 // 1 ano

/**
 * Gera um ID único para tracking
 */
function generateTrackingId() {
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 15)
  const randomPart2 = Math.random().toString(36).substring(2, 15)
  return `${timestamp}-${randomPart}-${randomPart2}`
}

/**
 * Salva um cookie
 */
function setCookie(name, value, days) {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

/**
 * Lê um cookie
 */
function getCookie(name) {
  const nameEQ = name + '='
  const cookies = document.cookie.split(';')
  for (let cookie of cookies) {
    cookie = cookie.trim()
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length)
    }
  }
  return null
}

/**
 * Obtém ou cria o tracking ID do usuário
 * Persiste em cookie por 1 ano
 */
export function getTrackingId() {
  let trackingId = getCookie(TRACKING_COOKIE_NAME)
  
  if (!trackingId) {
    trackingId = generateTrackingId()
    setCookie(TRACKING_COOKIE_NAME, trackingId, COOKIE_EXPIRY_DAYS)
    console.info('[Tracking] Novo tracking ID criado:', trackingId)
  }
  
  return trackingId
}

/**
 * Obtém todos os dados de tracking do usuário
 */
export function getTrackingData() {
  return {
    tracking_id: getTrackingId(),
    screen_width: window.screen?.width || null,
    screen_height: window.screen?.height || null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
    language: navigator.language || null,
  }
}

export default {
  getTrackingId,
  getTrackingData,
}

