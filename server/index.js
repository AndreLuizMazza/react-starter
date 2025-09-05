// server/index.js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()
const app = express()
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

const PORT = process.env.PORT || 8787
const BASE = (process.env.PROGEM_BASE || 'http://localhost:8082').replace(/\/+$/, '')
const TENANT_ID = process.env.PROGEM_TENANT_ID
const OAUTH_SCOPE = process.env.OAUTH_SCOPE || 'read:parceiros read:planos read:contratos read:duplicatas read:dependentes read:unidades read:pessoas'
const OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID
const OAUTH_CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET

// Helpers
const b64 = (s) => Buffer.from(s).toString('base64')

function injectHeaders(headers = {}) {
  const h = { 'Accept': 'application/json', ...headers }
  if (TENANT_ID) h['X-Progem-ID'] = TENANT_ID
  return h
}

function injectHeadersFromReq(req, extra = {}) {
  const h = injectHeaders(extra)
  const dev = req.header('X-Device-ID') || req.header('x-device-id')
  if (dev) h['X-Device-ID'] = dev
  return h
}

async function readAsJsonOrText(r) {
  const raw = await r.text()
  try { return JSON.parse(raw) } catch { return raw }
}

// ===== OAuth2: Client Credentials (Basic + JSON body + X-Progem-ID) =====
async function fetchClientToken() {
  if (!OAUTH_CLIENT_ID || !OAUTH_CLIENT_SECRET) {
    throw new Error('OAUTH_CLIENT_ID/SECRET não configurados')
  }
  const url = `${BASE}/oauth2/token`
  const body = JSON.stringify({ grant_type: 'client_credentials', scope: OAUTH_SCOPE })
  const headers = injectHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Basic ${b64(`${OAUTH_CLIENT_ID}:${OAUTH_CLIENT_SECRET}`)}`
  })
  const r = await fetch(url, { method: 'POST', headers, body })
  const data = await readAsJsonOrText(r)
  console.log('BFF /oauth2/token -> status', r.status)
  if (!r.ok) {
    throw new Error(typeof data === 'string' ? data : (data?.error || 'Erro ao obter token'))
  }
  return data
}

let cachedToken = null
let cachedExp = 0
async function getClientToken() {
  const now = Math.floor(Date.now()/1000)
  if (cachedToken && cachedExp - now > 30) return cachedToken
  const data = await fetchClientToken()
  cachedToken = data.access_token || data.accessToken
  cachedExp = Math.floor(Date.now()/1000) + (data.expires_in || 300)
  return cachedToken
}

// ===== Public endpoint p/ frontend obter token de cliente =====
app.post('/auth/client-token', async (req, res) => {
  try {
    const data = await fetchClientToken()
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: 'Falha ao obter token do cliente', message: String(e) })
  }
})

// ===== Login de usuário =====
app.post('/api/v1/app/auth/login', async (req, res) => {
  try {
    const token = await getClientToken()
    const r = await fetch(`${BASE}/api/v1/app/auth/login`, {
      method: 'POST',
      headers: injectHeadersFromReq(req, { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }),
      body: JSON.stringify(req.body || {})
    })
    const data = await readAsJsonOrText(r)
    if (!r.ok) return res.status(r.status).json(data)
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: 'Falha no login', message: String(e) })
  }
})

// ===== Meu perfil (necessita Bearer do usuário) =====
app.get('/api/v1/app/me', async (req, res) => {
  try {
    const auth = req.headers.authorization // deve vir o Bearer do usuário logado
    const r = await fetch(`${BASE}/api/v1/app/me`, {
      headers: injectHeadersFromReq(req, { 'Authorization': auth })
    })
    const data = await readAsJsonOrText(r)
    console.log('BFF /api/v1/app/me -> status', r.status)
    if (!r.ok) return res.status(r.status).send(data)
    res.status(r.status).send(data)
  } catch (e) {
    res.status(500).json({ error: 'Falha ao buscar perfil', message: String(e) })
  }
})

// ===== Planos =====
app.get('/api/v1/planos', async (req, res) => {
  try {
    const auth = req.headers.authorization
    const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''
    const r = await fetch(`${BASE}/api/v1/planos${qs}`, { headers: injectHeadersFromReq(req, { 'Authorization': auth }) })
    const data = await readAsJsonOrText(r)
    console.log('BFF /api/v1/planos -> status', r.status)
    if (!r.ok) return res.status(r.status).json(data)
    res.json(data)
  } catch (e) { res.status(500).json({ error: 'Falha ao buscar planos', message: String(e) }) }
})

app.get('/api/v1/planos/:id', async (req, res) => {
  try {
    const auth = req.headers.authorization
    const r = await fetch(`${BASE}/api/v1/planos/${req.params.id}`, { headers: injectHeadersFromReq(req, { 'Authorization': auth }) })
    const data = await readAsJsonOrText(r)
    if (!r.ok) return res.status(r.status).json(data)
    res.json(data)
  } catch (e) { res.status(500).json({ error: 'Falha ao buscar plano', message: String(e) }) }
})

// ===== Contratos por CPF =====
app.get('/api/v1/contratos/cpf/:cpf', async (req, res) => {
  try {
    const auth = req.headers.authorization
    const url = `${BASE}/api/v1/contratos/cpf/${encodeURIComponent(req.params.cpf)}`
    console.log('[BFF] GET contratos por CPF →', {
      tenantEnv: TENANT_ID,
      headerTenant: req.header('X-Progem-ID') || req.header('x-progem-id') || null,
      url
    })
    const r = await fetch(url, { headers: injectHeadersFromReq(req, { 'Authorization': auth }) })
    let data; try { data = await r.json() } catch { data = await r.text() }
    console.log('[BFF] ← status', r.status, '| itens:', Array.isArray(data) ? data.length : (data?.content?.length ?? 'n/a'))
    if (!r.ok) return res.status(r.status).json(data)
    res.json(data)
  } catch (e) {
    console.error('[BFF] erro contratos CPF:', e)
    res.status(500).json({ error: 'Falha ao buscar contratos', message: String(e) })
  }
})

// ===== Débitos do contrato =====
app.get('/api/v1/contratos/:id/debitos', async (req, res) => {
  try {
    const auth = req.headers.authorization
    const url = `${BASE}/api/v1/contratos/${req.params.id}/debitos`
    const r = await fetch(url, { headers: injectHeadersFromReq(req, { 'Authorization': auth }) })
    const raw = await r.text(); let data; try { data = JSON.parse(raw) } catch { data = raw }
    if (!r.ok) return res.status(r.status).send(data)
    res.status(r.status).send(data)
  } catch (e) {
    res.status(500).json({ error: 'Falha ao buscar débitos', message: String(e) })
  }
})


// ===== Dependentes do contrato =====
app.get('/api/v1/contratos/:id/dependentes', async (req, res) => {
  try {
    const auth = req.headers.authorization
    const url = `${BASE}/api/v1/contratos/${req.params.id}/dependentes`
    const r = await fetch(url, { headers: injectHeadersFromReq(req, { 'Authorization': auth }) })
    const data = await readAsJsonOrText(r)
    console.log('BFF /api/v1/contratos/:id/dependentes ->', r.status, url)
    if (!r.ok) return res.status(r.status).send(data)
    res.status(r.status).send(data)
  } catch (e) {
    res.status(500).json({ error: 'Falha ao buscar dependentes', message: String(e) })
  }
})

// ===== Pagamentos / Parcelas do contrato (histórico) =====
app.get('/api/v1/contratos/:id/pagamentos', async (req, res) => {
  try {
    const auth = req.headers.authorization
    const url = `${BASE}/api/v1/contratos/${req.params.id}/pagamentos`
    const r = await fetch(url, { headers: injectHeadersFromReq(req, { 'Authorization': auth }) })
    const data = await readAsJsonOrText(r)
    if (!r.ok) return res.status(r.status).json(data)
    res.json(data)
  } catch (e) { res.status(500).json({ error: 'Falha ao buscar pagamentos', message: String(e) }) }
})

// ===== Pagamento do mês (parcela atual) =====
app.get('/api/v1/contratos/:id/pagamentos/mes', async (req, res) => {
  try {
    const auth = req.headers.authorization
    const url = `${BASE}/api/v1/contratos/${req.params.id}/pagamentos/mes`
    const r = await fetch(url, { headers: injectHeadersFromReq(req, { 'Authorization': auth }) })
    const data = await readAsJsonOrText(r)
    console.log('BFF /api/v1/contratos/:id/pagamentos/mes ->', r.status, url)
    if (!r.ok) return res.status(r.status).send(data)
    res.status(r.status).send(data)
  } catch (e) {
    res.status(500).json({ error: 'Falha ao buscar pagamento do mês', message: String(e) })
  }
})

// ===== Locais Parceiros (Clube de Benefícios) =====
app.get('/api/v1/locais/parceiros', async (req, res) => {
  try {
    const incomingAuth = req.headers.authorization;
    // se o cliente não mandou Authorization, usa o token de client credentials
    const bearer =
      incomingAuth && /^bearer\s+/i.test(incomingAuth)
        ? incomingAuth
        : `Bearer ${await getClientToken()}`;

    const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    const url = `${BASE}/api/v1/locais/parceiros${qs}`;

    const r = await fetch(url, {
      headers: injectHeadersFromReq(req, { Authorization: bearer }),
    });

    const data = await readAsJsonOrText(r)

    console.log('BFF GET /api/v1/locais/parceiros ->', r.status, url);

    // repassa status real da API (evita mascarar 401/403/404 como 500)
    if (!r.ok) return res.status(r.status).send(data);
    return res.status(r.status).send(data);
  } catch (e) {
    console.error('BFF /api/v1/locais/parceiros ERRO:', e);
    return res
      .status(500)
      .json({ error: 'Falha ao buscar locais parceiros', message: String(e) });
  }
});


// --- DEBUG: ver tenant atual e headers recebidos ---
app.get('/_debug/tenant', (req, res) => {
  const incoming = {
    'x-progem-id': req.header('X-Progem-ID') || req.header('x-progem-id') || null,
    'x-device-id': req.header('X-Device-ID') || req.header('x-device-id') || null,
    'authorization': (req.header('authorization') ? 'present' : 'missing')
  }
  console.log('[BFF][DEBUG] tenant(from .env)=', TENANT_ID, '| incoming=', incoming)
  res.json({ tenantId: TENANT_ID, base: BASE, incoming })
})


// ===== Empresa logada (unidade atual) =====
app.get('/api/v1/unidades/me', async (req, res) => {
  try {
    const incomingAuth = req.headers.authorization;
    const bearer =
      incomingAuth && /^bearer\s+/i.test(incomingAuth)
        ? incomingAuth
        : `Bearer ${await getClientToken()}`;

    const url = `${BASE}/api/v1/unidades/me`;
    const r = await fetch(url, { headers: injectHeadersFromReq(req, { Authorization: bearer }) });

    const raw = await r.text();
    let data; try { data = JSON.parse(raw); } catch { data = raw; }

    console.log('[BFF] GET /api/v1/unidades/me ->', r.status);
    if (!r.ok) return res.status(r.status).send(data);
    return res.status(r.status).send(data);
  } catch (e) {
    console.error('[BFF] /api/v1/unidades/me ERRO:', e);
    return res.status(500).json({ error: 'Falha ao buscar unidade atual', message: String(e) });
  }
});



// Health
app.get('/health', (_, res) => res.json({ ok: true }))

app.listen(PORT, () => { console.log(`API proxy on http://localhost:${PORT}`) })
