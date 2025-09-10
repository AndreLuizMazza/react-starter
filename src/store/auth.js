// src/store/auth.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api, { setAuthTokenProvider } from '@/lib/api'

/**
 * Gera/recupera um identificador do dispositivo para auditoria e segurança.
 * É enviado no header X-Device-ID durante o login.
 */
function getDeviceId() {
  const k = 'x_device_id'
  let v = null
  try {
    v = localStorage.getItem(k)
    if (!v) {
      v = crypto.randomUUID()
      localStorage.setItem(k, v)
    }
  } catch {
    // se o localStorage não estiver disponível, ignora
  }
  return v
}

/**
 * Tipos de dados esperados do backend (documentação informal):
 * - `user`: payload retornado pelo login (nome, e-mail, claims etc.)
 * - `token` (opcional): bearer para endpoints que exigem autenticação de usuário
 *   Pode vir em `data.token`, `data.access_token` ou `data.jwt` — normalizamos abaixo.
 */

const useAuth = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refresh_token: null,

      /**
       * Realiza login no BFF do app.
       * Importante: o BFF já deve estar autenticado com o "client token" via interceptor.
       */
      login: async (identificador, senha) => {
        const { data } = await api.post(
          '/api/v1/app/auth/login',
          { identificador, senha },
          { headers: { 'X-Device-ID': getDeviceId() } }
        )

        // Normaliza token se existir no payload:
        const token = data?.token ?? data?.access_token ?? data?.jwt ?? null
        const refresh_token = data?.refresh_token ?? null

        set({ user: data, token, refresh_token })
        return data
      },

      /**
       * Limpa sessão local.
       */
      logout: () => {
        set({ user: null, token: null, refresh_token: null })
      },

      /**
       * Atualiza o token de acesso usando o refresh token.
       */
      refreshToken: async () => {
        const rt = get().refresh_token
        if (!rt) throw new Error('missing refresh token')
        try {
          const { data } = await api.post('/api/v1/app/auth/refresh', { refresh_token: rt })
          const token = data?.token ?? data?.access_token ?? data?.jwt ?? null
          const newRt = data?.refresh_token ?? rt
          set({ token, refresh_token: newRt })
          return token
        } catch (e) {
          get().logout()
          throw e
        }
      },

      /**
       * Helpers
       */
      isAuthenticated: () => {
        return !!get().user
      },
      getToken: () => {
        return get().token
      },
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setRefreshToken: (refresh_token) => set({ refresh_token }),
    }),
    {
      name: 'auth-store', // chave no localStorage
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refresh_token: state.refresh_token,
      }),
      // opcional: versionar e migrar, se necessário
      // version: 1,
      // migrate: async (persistedState, version) => persistedState,
    }
  )
)

/**
 * Fornece o Bearer do usuário ao axios quando houver token de usuário.
 * Mantém compatibilidade: para endpoints que usam apenas "client token", o interceptor do `api` já cuida.
 */
setAuthTokenProvider(() => {
  const { token } = useAuth.getState()
  return token || null
})

export default useAuth
