// src/boot/tenant.js
import api from '@/lib/api'
import useTenant from '@/store/tenant'
import { applyTheme } from '@/lib/theme'

// Desembrulha formatos possíveis: JSON direto, {data: ...} ou string JSON
function unwrap(resp) {
  try {
    if (resp == null) return null
    if (typeof resp === 'string') {
      try { return JSON.parse(resp) } catch { return null }
    }
    if (typeof resp === 'object') {
      // axios-like
      if ('data' in resp) {
        const v = resp.data
        if (typeof v === 'string') { try { return JSON.parse(v) } catch { return v } }
        return v
      }
      // fetch-like já em JSON
      return resp
    }
    return null
  } catch { return null }
}

export async function bootstrapTenant() {
  try {
    // 1) token do cliente (ignora erro)
    await api.post('/auth/client-token').catch(() => {})
    useTenant.getState().setClientTokenReady(true)

    // 2) empresa logada
    let raw = null
    try { raw = await api.get('/api/v1/unidades/me') } catch {}
    const empresa = unwrap(raw)

    if (empresa) useTenant.getState().setEmpresa(empresa)

    // 3) aplica tema (cores)
    applyTheme({
      primary: empresa?.corPrincipal,
      secondary: empresa?.corSecundaria,
    })

    if (import.meta?.env?.DEV) {
      console.log('[tenant]', {
        id: empresa?.id,
        nome: empresa?.nomeFantasia,
        cor: empresa?.corPrincipal
      })
    }
  } catch (e) {
    console.error('[bootstrapTenant] erro inesperado:', e)
  }
}
