// server/nalapide-proxy.js
import express from 'express'

const router = express.Router()

// Lados servidor (.env) — NUNCA exponha no frontend
const API_BASE = (process.env.NALAPIDE_API_BASE || process.env.VITE_NALAPIDE_BASE || '').replace(/\/+$/, '')
const API_KEY  = process.env.NALAPIDE_API_KEY || process.env.VITE_NALAPIDE_API_KEY || ''

if (!API_BASE) console.warn('[NaLapide] NALAPIDE_API_BASE ausente. Configure no .env do BFF')
if (!API_KEY)  console.warn('[NaLapide] NALAPIDE_API_KEY ausente. Configure no .env do BFF (ex.: "Bearer xxx")')

// Log pequeno de boot
console.log('[NaLapide BFF] base=', API_BASE ? API_BASE : '(ausente)')

router.use((req, _res, next) => {
  req._query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''
  next()
})

function short(s, n = 60) {
  if (!s) return ''
  const str = String(s)
  return str.length > n ? str.slice(0, n) + '…' : str
}

// Encaminhador simples
async function forward(req, res, path) {
  try {
    if (!API_BASE) {
      return res.status(500).json({ error: 'NALAPIDE_BASE_MISSING', message: 'Configure NALAPIDE_API_BASE no .env (BFF)' })
    }
    if (!API_KEY) {
      return res.status(500).json({ error: 'NALAPIDE_KEY_MISSING', message: 'Configure NALAPIDE_API_KEY no .env (BFF)' })
    }

    const url = `${API_BASE}${path}${req._query || ''}`

    // multi-tenant opcional
    const tenant = req.headers['x-tenant-slug'] || req.query.tenant || req.body?.tenant

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': API_KEY,
      ...(tenant ? { 'x-tenant': tenant } : {})
    }

    const init = { method: req.method, headers }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      init.body = JSON.stringify(req.body || {})
    }

    console.log('[NaLapide BFF] →', req.method, url, '| tenant=', tenant || '-', '| auth=', short(API_KEY, 24))
    const r = await fetch(url, init)

    const ct = r.headers.get('content-type') || 'application/json'
    const txt = await r.text()
    console.log('[NaLapide BFF] ←', r.status, ct)

    res.status(r.status).type(ct).send(txt)
  } catch (err) {
    console.error('[NaLapide BFF] ERRO:', err)
    res.status(500).json({ error: 'BFF_NALAPIDE_ERROR', message: String(err?.message || err) })
  }
}

/** Rotas BFF -> NaLápide */
router.get('/memorial',                 (req, res) => forward(req, res, '/obitos'))
router.get('/memorial/:slug',           (req, res) => forward(req, res, `/obitos/${encodeURIComponent(req.params.slug)}`))
router.post('/memorial/:id/reactions',  (req, res) => forward(req, res, `/obitos/${encodeURIComponent(req.params.id)}/reacoes`))
router.post('/leads',                   (req, res) => forward(req, res, '/interacoes'))

export default router
