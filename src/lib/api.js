import axios from 'axios'

let tokenProvider = null
export function setAuthTokenProvider(fn) { tokenProvider = fn }

// usa a URL do BFF e remove barra(s) final(is); fallback local
const baseURL = (import.meta.env.VITE_BFF_BASE || 'http://localhost:8787').replace(/\/+$/, '')

const api = axios.create({
  baseURL,
  timeout: 90000,
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

export default api
