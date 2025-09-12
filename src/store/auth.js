import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api, { setAuthTokenProvider } from '@/lib/api'

/** Gera/recupera um identificador do dispositivo (auditoria/segurança) */
export function getDeviceId() {
  const k = 'x_device_id'
  let v = null
  try {
    v = localStorage.getItem(k)
    if (!v) {
      v = crypto.randomUUID()
      localStorage.setItem(k, v)
    }
  } catch {}
  return v
}

/** (Opcional) Verifica expiração se o token for JWT */
function isJwtExpiredSafe(token) {
  try {
    const [, payload] = token.split('.')
    if (!payload) return false
    const data = JSON.parse(atob(payload))
    if (!data?.exp) return false
    return Date.now() >= data.exp * 1000
  } catch { return false }
}

const useAuth = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      /** Login no BFF (credenciais: e-mail/cpf + senha) */
      login: async (identificador, senha) => {
        const { data } = await api.post(
          '/api/v1/app/auth/login',
          { identificador, senha },
          { headers: { 'X-Device-ID': getDeviceId() } }
        )
        const token = data?.token ?? data?.access_token ?? data?.jwt ?? null
        set({ user: data, token })
        return data
      },

      /** Logout */
      logout: () => set({ user: null, token: null }),

      /** Autenticação válida exige user + token (e não expirado) */
      isAuthenticated: () => {
        const { user, token } = get()
        if (!user || !token) return false
        if (isJwtExpiredSafe(token)) return false
        return true
      },

      /** Helpers */
      getToken: () => get().token,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
    }),
    {
      name: 'auth-store',
      partialize: (s) => ({ user: s.user, token: s.token }),
    }
  )
)

/** Fornece o bearer do usuário ao axios automaticamente */
setAuthTokenProvider(() => {
  const { token } = useAuth.getState()
  return token || null
})

export default useAuth
