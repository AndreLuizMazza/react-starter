// src/store/auth.js
import api, { setAuthTokenProvider } from '@/lib/api'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

function getDeviceId() {
  const k = 'x_device_id'
  let v = localStorage.getItem(k)
  if (!v) { v = crypto.randomUUID(); localStorage.setItem(k, v) }
  return v
}

const useAuth = create(persist((set, get) => ({
  user: null,
  clientToken: null,
  clientExp: 0,

  /** Melhor token disponível para requisições (prioriza usuário) */
  getAuthToken: () => {
    const u = get().user
    if (u?.accessToken) return u.accessToken
    return get().clientToken
  },

  /** Garante token de CLIENTE para boot/endpoints públicos */
  ensureClientToken: async () => {
    const now = Math.floor(Date.now()/1000)
    const { clientToken, clientExp } = get()
    if (clientToken && clientExp - now > 30) return clientToken

    const res = await api.post('/auth/client-token')
    const data = res.data
    set({
      clientToken: data.access_token || data.accessToken,
      clientExp: now + (data.expires_in || 300)
    })
    return get().clientToken
  },

  /** LOGIN (apenas altera estado; quem chama redireciona com useNavigate) */
  login: async (identificador, senha) => {
    await get().ensureClientToken()
    const { data } = await api.post(
      '/api/v1/app/auth/login',
      { identificador, senha },
      { headers: { 'X-Device-ID': getDeviceId() } }
    )
    set({ user: data })
    return data
  },

  /** LOGOUT */
  logout: () => set({ user: null, clientToken: null, clientExp: 0 }),
}), {
  name: 'auth',
  storage: createJSONStorage(() => localStorage),
}))

/** Entrega o token atual para o interceptor do axios */
setAuthTokenProvider(() => useAuth.getState().getAuthToken())

export default useAuth
