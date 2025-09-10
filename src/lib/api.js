// src/lib/api.js
import axios from 'axios'

let tokenProvider = null
export function setAuthTokenProvider(fn) { tokenProvider = fn }

// usa a URL do BFF da env e remove barra(s) final(is); fallback local
const baseURL = (import.meta.env.VITE_BFF_BASE || 'http://localhost:8787').replace(/\/+$/, '')

const api = axios.create({
  baseURL,
  timeout: 20000,
  headers: { Accept: 'application/json' },
})

api.interceptors.request.use((cfg) => {
  const token = tokenProvider?.()
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  try {
    const dev = localStorage.getItem('x_device_id')
    if (dev) cfg.headers['X-Device-ID'] = dev
  } catch {}
  return cfg
})

const refreshEndpoint = '/api/v1/app/auth/refresh'

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const { response, config } = error || {}
    if (!response) return Promise.reject(error)
    const status = response.status
    if (
      ![401, 403].includes(status) ||
      config?.url?.includes(refreshEndpoint) ||
      config._retry
    ) {
      return Promise.reject(error)
    }
    config._retry = true
    try {
      const { default: useAuth } = await import('@/store/auth')
      const token = await useAuth.getState().refreshToken()
      if (token) config.headers.Authorization = `Bearer ${token}`
      return api(config)
    } catch (e) {
      const { default: useAuth } = await import('@/store/auth')
      useAuth.getState().logout()
      return Promise.reject(e)
    }
  }
)

export default api
