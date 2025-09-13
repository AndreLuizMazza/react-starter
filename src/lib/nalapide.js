// src/lib/nalapide.js
const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787'
const NALAPIDE_BASE = `${BASE}/bff/nalapide`

function qs(params = {}) {
  const u = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    u.set(k, String(v))
  })
  const s = u.toString()
  return s ? `?${s}` : ''
}

async function http(url, init) {
  const r = await fetch(url, { headers: { 'Accept': 'application/json' }, ...init })
  const ct = r.headers.get('content-type') || ''
  const body = ct.includes('application/json') ? await r.json() : await r.text()
  if (!r.ok) throw new Error(typeof body === 'string' ? body : (body?.message || 'Erro'))
  return body
}

export async function listMemorial({ q = '', page = 1, perPage = 12 } = {}) {
  const url = `${NALAPIDE_BASE}/memorial${qs({ q, page, perPage })}`
  return http(url)
}

export async function getMemorialById(idOrSlug) {
  return http(`${NALAPIDE_BASE}/memorial/${encodeURIComponent(idOrSlug)}`)
}
