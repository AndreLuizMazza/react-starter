import api from '@/lib/api'
import { getDeviceId } from '@/store/auth'

/** Converte "dd/MM/yyyy" -> "yyyy-MM-dd" */
function brToIsoDate(d) {
  if (!d) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d // já ISO (input type=date)
  const m = d.match(/^(\d{2})[\/.-](\d{2})[\/.-](\d{4})$/)
  if (!m) return null
  const [_, dd, mm, yyyy] = m
  return `${yyyy}-${mm}-${dd}`
}

/** Normaliza payload de cadastro */
export function normalizeRegisterPayload(raw) {
  const onlyDigits = (s = '') => s.replace(/\D/g, '')
  return {
    nome: (raw?.nome || '').trim(),
    email: (raw?.email || '').trim(),
    senha: raw?.senha || '',
    cpf: onlyDigits(raw?.cpf),
    celular: onlyDigits(raw?.celular),
    dataNascimento: brToIsoDate(raw?.dataNascimento) || null,
    aceiteTermos: !!raw?.aceiteTermos,
    aceitePrivacidade: !!raw?.aceitePrivacidade,
  }
}

/** Cadastro do usuário (BFF injeta X-Progem-ID + client token) */
export async function registerUser(rawPayload) {
  const payload = normalizeRegisterPayload(rawPayload)
  const { data } = await api.post('/api/v1/app/auth/register', payload, {
    headers: {
      'Content-Type': 'application/json',
      'X-Device-ID': getDeviceId(),
    },
  })
  // esperado: { token|accessToken|jwt, userId, nome, email, cpf, requiresVerification? }
  return data
}

/** Atualização de perfil (opcional) */
export async function patchMyProfile(payload) {
  const { data } = await api.patch('/api/v1/app/me', payload, {
    headers: {
      'Content-Type': 'application/json',
      'X-Device-ID': getDeviceId(),
    },
  })
  return data
}
