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

// Interceptor para adicionar token nas requisições admin
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token && config.url?.startsWith('/admin')) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const extractMessage = (error, fallback) => {
  if (error?.response?.data?.error) {
    return error.response.data.error
  }
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
  async getReferralStats(token) {
    try {
      return await apiClient.get(`/referral/stats?token=${token}`)
    } catch (error) {
      error.message = extractMessage(error, 'Não foi possível carregar as estatísticas.')
      throw error
    }
  },

  // Admin APIs
  async adminLogin(data) {
    try {
      const response = await apiClient.post('/admin/auth/login', data)
      if (response.data?.token) {
        localStorage.setItem('admin_token', response.data.token)
      }
      return response
    } catch (error) {
      error.message = extractMessage(error, 'Credenciais inválidas.')
      throw error
    }
  },

  async adminVerify() {
    try {
      return await apiClient.get('/admin/auth/verify')
    } catch (error) {
      localStorage.removeItem('admin_token')
      error.message = extractMessage(error, 'Sessão inválida.')
      throw error
    }
  },

  adminLogout() {
    localStorage.removeItem('admin_token')
  },

  async adminListInfluencers() {
    try {
      return await apiClient.get('/admin/influencers/list')
    } catch (error) {
      error.message = extractMessage(error, 'Erro ao carregar influencers.')
      throw error
    }
  },

  async adminCreateInfluencer(data) {
    try {
      return await apiClient.post('/admin/influencers/create', data)
    } catch (error) {
      error.message = extractMessage(error, 'Erro ao criar influencer.')
      throw error
    }
  },

  async adminToggleInfluencer(id) {
    try {
      return await apiClient.post('/admin/influencers/toggle', { id })
    } catch (error) {
      error.message = extractMessage(error, 'Erro ao alterar status.')
      throw error
    }
  },

  async adminGetStats(slug) {
    try {
      return await apiClient.get(`/admin/influencers/stats?slug=${slug}`)
    } catch (error) {
      error.message = extractMessage(error, 'Erro ao carregar estatísticas.')
      throw error
    }
  },
}
