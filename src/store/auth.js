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

  getAuthToken: () => {
    const u = get().user
    if (u?.accessToken) return u.accessToken
    return get().clientToken
  },

  // helper pra usar no app inteiro
  isLogged: () => {
    const u = get().user
    return Boolean(u && (u.id || u.userId || u.cpf || u.email || u.accessToken))
  },

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

  login: async (identificador, senha) => {
    await get().ensureClientToken()
    const { data } = await api.post(
      '/api/v1/app/auth/login',
      { identificador, senha },
      { headers: { 'X-Device-ID': getDeviceId() } }
    )

    // normaliza para sempre ter accessToken no mesmo campo
    const accessToken = data?.access_token || data?.accessToken || data?.token || null
    const user = {
      accessToken,
      id: data?.id || data?.userId || null,
      cpf: data?.cpf || null,
      nome: data?.nome || data?.name || data?.usuario || null,
      email: data?.email || null,
    }
    set({ user })
    return user
  },

  logout: () => {
    // mantém o clientToken pra telas públicas funcionarem
    set({ user: null })
  },
}), {
  name: 'auth',
  storage: createJSONStorage(() => localStorage),

  // ✔️ migração: se vier user sem identificadores, zera
  version: 2,
  migrate: (state, version) => {
    if (!state) return state
    const u = state.user
    if (u && !(u.id || u.userId || u.cpf || u.email || u.accessToken)) {
      state.user = null
    }
    return state
  },

  // ✔️ sanitiza imediatamente após rehidratar
  onRehydrateStorage: () => (state) => {
    const u = state?.user
    if (u && !(u.id || u.userId || u.cpf || u.email || u.accessToken)) {
      state.user = null
    }
  },
}))

setAuthTokenProvider(() => useAuth.getState().getAuthToken())
export default useAuth
