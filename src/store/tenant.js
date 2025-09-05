// src/store/tenant.js
import { create } from 'zustand'
const fallbackPrimary = '#0EA5E9'

const useTenant = create((set) => ({
  empresa: null,
  clientTokenReady: false,
  primary: fallbackPrimary,
  secondary: null,

  setEmpresa: (empresa) => set({
    empresa,
    primary: empresa?.corPrincipal || fallbackPrimary,
    secondary: empresa?.corSecundaria || null,
  }),

  setClientTokenReady: (ok) => set({ clientTokenReady: !!ok }),
}))

export default useTenant
