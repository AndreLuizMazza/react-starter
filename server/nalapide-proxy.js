// server/nalapide-proxy.js
import express from 'express'

const router = express.Router()

// Lados servidor (.env) — NUNCA exponha no frontend
const API_BASE = (process.env.NALAPIDE_API_BASE || process.env.VITE_NALAPIDE_BASE || '').replace(/\/+$/, '')
const API_KEY  = process.env.NALAPIDE_API_KEY || process.env.VITE_NALAPIDE_API_KEY || ''

if (!API_BASE) console.warn('[NaLapide] NALAPIDE_API_BASE ausente. Configure no .env')
if (!API_KEY)  console.warn('[NaLapide] NALAPIDE_API_KEY ausente. Configure no .env (formato: "Bearer ...")')

// preserva a query original
router.use((req, _res, next) => {
  req._query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''
  next()
})

// Encaminhador simples (sem mapear ou adicionar parâmetros)
async function forward(req, res, path) {
  try {
    if (!API_BASE) return res.status(500).json({ error: 'NALAPIDE_BASE_MISSING', message: 'Configure NALAPIDE_API_BASE no .env' })
    if (!API_KEY)  return res.status(500).json({ error: 'NALAPIDE_KEY_MISSING',  message: 'Configure NALAPIDE_API_KEY no .env' })

    const url = `${API_BASE}${path}${req._query || ''}`

    // multi-tenant opcional (só repassa se vier)
    const tenant = req.headers['x-tenant-slug'] || req.query.tenant || req.body?.tenant

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': API_KEY, // ex.: "Bearer xxx"
      ...(tenant ? { 'x-tenant': tenant } : {})
      // se sua API usar 'x-api-key', adicione aqui também
    }

    const init = { method: req.method, headers }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      init.body = JSON.stringify(req.body || {})
    }

    const r = await fetch(url, init) // fetch global (Node 18+)
    const ct = r.headers.get('content-type') || 'application/json'
    const txt = await r.text()

    console.log('[NaLapide BFF]', req.method, url, '→', r.status)
    res.status(r.status).type(ct).send(txt)
  } catch (err) {
    console.error('[NaLapide BFF] ERRO:', err)
    res.status(500).json({ error: 'BFF_NALAPIDE_ERROR', message: String(err?.message || err) })
  }
}

/** Rotas BFF -> NaLápide (SEM filtros adicionados) */
router.get('/memorial',                 (req, res) => forward(req, res, '/obitos'))
router.get('/memorial/:slug',           (req, res) => forward(req, res, `/obitos/${encodeURIComponent(req.params.slug)}`))
router.post('/memorial/:id/reactions',  (req, res) => forward(req, res, `/obitos/${encodeURIComponent(req.params.id)}/reacoes`))
router.post('/leads',                   (req, res) => forward(req, res, '/interacoes'))

export default router
