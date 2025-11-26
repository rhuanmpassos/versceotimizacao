import axios from 'axios'

const normalizeBaseUrl = (url) => url.replace(/\/$/, '')

const baseURL = normalizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
)

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

const extractMessage = (error, fallback) => {
  if (error?.response?.data?.message) {
    return error.response.data.message
  }
  if (Array.isArray(error?.response?.data?.issues) && error.response.data.issues.length > 0) {
    return error.response.data.issues[0]?.message || fallback
  }
  return fallback
}

export default {
  async createLead(data) {
    try {
      return await apiClient.post('/leads', data)
    } catch (error) {
      error.message = extractMessage(error, 'Não foi possível enviar seus dados agora.')
      throw error
    }
  },
  async createReferrer(data) {
    try {
      return await apiClient.post('/referral/create', data)
    } catch (error) {
      error.message = extractMessage(error, 'Não foi possível gerar o link agora.')
      throw error
    }
  },
  async trackReferral(data) {
    try {
      return await apiClient.post('/referral/track', data)
    } catch (error) {
      error.message = extractMessage(error, 'Não foi possível registrar o clique.')
      throw error
    }
  },
}
