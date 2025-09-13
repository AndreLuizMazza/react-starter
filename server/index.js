// server/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import nalapideProxy from './nalapide-proxy.js';

dotenv.config();

/**
 * ENV esperadas:
 * - PORT (opcional)
 * - NODE_ENV (production | development)
 * - PROGEM_BASE (ex: https://sandbox-api.progem.com.br)
 * - PROGEM_TENANT_ID (X-Progem-ID)
 * - OAUTH_SCOPE
 * - OAUTH_CLIENT_ID / OAUTH_CLIENT_SECRET
 * - CORS_ORIGINS (lista separada por vírgula)
 * - FRONTEND_URL (ex.: https://seuapp.vercel.app)
 * - NALAPIDE_API_BASE / NALAPIDE_API_KEY (só no backend)
 * - TRUST_PROXY (opcional: "1" na Vercel; vazio/0 em dev)
 */
const app = express();
app.use(express.json());

/* ===== Ambiente ===== */
const isProd = process.env.NODE_ENV === 'production';
const isVercel = !!process.env.VERCEL;

/* ===== Trust Proxy seguro
   - Em produção atrás de um proxy (Vercel): use TRUST_PROXY=1
   - Em desenvolvimento/local: deixe vazio (false)
*/
const TRUST_PROXY = (process.env.TRUST_PROXY || (isProd ? '1' : '0')).trim();
if (TRUST_PROXY === '0' || TRUST_PROXY === '' || TRUST_PROXY.toLowerCase() === 'false') {
  app.set('trust proxy', false);
} else if (/^\d+$/.test(TRUST_PROXY)) {
  app.set('trust proxy', parseInt(TRUST_PROXY, 10)); // ex.: 1
} else {
  app.set('trust proxy', TRUST_PROXY); // ex.: "loopback" ou "10.0.0.0/8"
}

const PORT = process.env.PORT || 8787;
const BASE = (process.env.PROGEM_BASE || 'http://localhost:8082').replace(/\/+$/, '');
const TENANT_ID = process.env.PROGEM_TENANT_ID || '';
const OAUTH_SCOPE =
  process.env.OAUTH_SCOPE ||
  'read:parceiros read:planos read:contratos read:duplicatas read:dependentes read:unidades read:pessoas';
const OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID || '';
const OAUTH_CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET || '';

/* ===== Segurança e compressão ===== */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(compression());

/* ====== CORS ====== */
function parseList(env) {
  return (env || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

const ALLOWLIST = [
  process.env.FRONTEND_URL,
  ...parseList(process.env.CORS_ORIGINS),
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean);

// permite subdomínios vercel.app, domínios whitelabel, etc.
const ALLOWLIST_REGEX = [/\.vercel\.app$/i, /\.awis\.com\.br$/i, /\.nalapide\.com$/i];

function isAllowedOrigin(origin) {
  if (!origin) return true; // server-to-server
  if (ALLOWLIST.includes(origin)) return true;
  return ALLOWLIST_REGEX.some((rx) => rx.test(origin));
}

const corsOptionsDelegate = (req, cb) => {
  const origin = req.headers.origin;
  const allowed = isAllowedOrigin(origin);

  if (!allowed && origin) {
    console.warn('[CORS] Bloqueado Origin:', origin, '| allowlist:', ALLOWLIST);
  }

  const opts = allowed
    ? {
        origin: true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Progem-ID', 'X-Device-ID'],
        exposedHeaders: ['Content-Length'],
        maxAge: 86400,
      }
    : { origin: false };

  cb(null, opts);
};

app.use((_, res, next) => {
  res.setHeader('Vary', 'Origin');
  next();
});
app.use(cors(corsOptionsDelegate));
app.options('*', cors(corsOptionsDelegate));

/* ===== Rate limit (seguro c/ trust proxy configurado acima) ===== */
const limiter = rateLimit({
  windowMs: 60_000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

/* ===== Monta o BFF do NaLápide ===== */
app.use('/bff/nalapide', nalapideProxy);

/* ===== Helpers ===== */
const b64 = (s) => Buffer.from(s).toString('base64');

function injectHeaders(headers = {}) {
  const h = { Accept: 'application/json', ...headers };
  if (TENANT_ID) h['X-Progem-ID'] = TENANT_ID;
  return h;
}

function injectHeadersFromReq(req, extra = {}) {
  const h = injectHeaders(extra);
  const dev = req.header('X-Device-ID') || req.header('x-device-id');
  if (dev) h['X-Device-ID'] = dev;
  return h;
}

async function readAsJsonOrText(r) {
  const raw = await r.text();
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

const maskCpf = (cpf) =>
  cpf ? cpf.toString().replace(/\D/g, '').replace(/^(\d{3})\d{5}(\d{3})$/, '$1*****$2') : cpf;

/* ===== OAuth2: Client Credentials ===== */
async function fetchClientToken() {
  if (!OAUTH_CLIENT_ID || !OAUTH_CLIENT_SECRET) {
    throw new Error('OAUTH_CLIENT_ID/SECRET não configurados');
  }
  const url = `${BASE}/oauth2/token`;
  const body = JSON.stringify({ grant_type: 'client_credentials', scope: OAUTH_SCOPE });
  const headers = injectHeaders({
    'Content-Type': 'application/json',
    Authorization: `Basic ${b64(`${OAUTH_CLIENT_ID}:${OAUTH_CLIENT_SECRET}`)}`,
  });
  const r = await fetch(url, { method: 'POST', headers, body });
  const data = await readAsJsonOrText(r);
  console.log('BFF /oauth2/token -> status', r.status);
  if (!r.ok) throw new Error(typeof data === 'string' ? data : data?.error || 'Erro ao obter token');
  return data;
}

/* ===== Cache de token com lock e retry 401 ===== */
let cachedToken = null;
let cachedExp = 0;
let inflightPromise = null;

async function getClientToken() {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedExp - now > 30) return cachedToken;

  if (!inflightPromise) {
    inflightPromise = (async () => {
      const data = await fetchClientToken();
      cachedToken = data.access_token || data.accessToken;
      cachedExp = Math.floor(Date.now() / 1000) + (data.expires_in || 300);
      inflightPromise = null;
      return cachedToken;
    })().catch((err) => {
      inflightPromise = null;
      throw err;
    });
  }
  return inflightPromise;
}

/* ===== Dedup/coalescing de requisições GET ===== */
const _inflightMap = new Map();
const _miniCache = new Map();

function _reqKey(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const auth = (options.headers && options.headers.Authorization) || '';
  const body = options.body ? String(options.body) : '';
  return `${method} ${url} | auth:${auth} | bodyhash:${body.length}`;
}

async function fetchDedup(url, options = {}, { dedupMs = 400, cacheMs = 0 } = {}) {
  const key = _reqKey(url, options);
  const now = Date.now();

  if (cacheMs > 0) {
    const c = _miniCache.get(key);
    if (c && now - c.ts < cacheMs) {
      return {
        ok: c.res.status >= 200 && c.res.status < 300,
        status: c.res.status,
        _cached: true,
        async text() {
          return c.res.body;
        },
        async json() {
          try {
            return JSON.parse(c.res.body);
          } catch {
            return c.res.body;
          }
        },
      };
    }
  }

  const inFlight = _inflightMap.get(key);
  if (inFlight && now - inFlight.ts < dedupMs) {
    return inFlight.promise;
  }

  const p = (async () => {
    const r = await fetch(url, options);
    const body = await r.text();
    const res = {
      ok: r.ok,
      status: r.status,
      async text() {
        return body;
      },
      async json() {
        try {
          return JSON.parse(body);
        } catch {
          return body;
        }
      },
    };
    if (cacheMs > 0 && r.ok) _miniCache.set(key, { ts: Date.now(), res: { status: r.status, body } });
    return res;
  })().finally(() => {
    setTimeout(() => {
      const current = _inflightMap.get(key);
      if (current && current.promise === p) _inflightMap.delete(key);
    }, dedupMs);
  });

  _inflightMap.set(key, { ts: now, promise: p });
  return p;
}

/** Combina client token + dedup + retry 401 (1x) */
async function fetchWithClientTokenDedupRetry(url, req, { dedupMs = 400, cacheMs = 0 } = {}) {
  const baseHeaders = injectHeadersFromReq(req);
  let token = await getClientToken();
  let r = await fetchDedup(url, { headers: { ...baseHeaders, Authorization: `Bearer ${token}` } }, { dedupMs, cacheMs });
  if (r.status === 401) {
    cachedToken = null;
    cachedExp = 0;
    token = await getClientToken();
    r = await fetchDedup(url, { headers: { ...baseHeaders, Authorization: `Bearer ${token}` } }, { dedupMs, cacheMs });
  }
  return r;
}

/* ===== /auth/client-token (somente DEV/LOCAL) ===== */
if (!isProd) {
  app.post('/auth/client-token', async (req, res) => {
    try {
      const data = await fetchClientToken();
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: 'Falha ao obter token do cliente', message: String(e) });
    }
  });
}

/* ===== Login de usuário ===== */
app.post('/api/v1/app/auth/login', async (req, res) => {
  try {
    const token = await getClientToken();
    const r = await fetch(`${BASE}/api/v1/app/auth/login`, {
      method: 'POST',
      headers: injectHeadersFromReq(req, { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }),
      body: JSON.stringify(req.body || {}),
    });
    const data = await readAsJsonOrText(r);
    if (!r.ok) return res.status(r.status).json(data);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Falha no login', message: String(e) });
  }
});

/* ===== Meu perfil (restrito) ===== */
app.get('/api/v1/app/me', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    const r = await fetch(`${BASE}/api/v1/app/me`, {
      headers: injectHeadersFromReq(req, { Authorization: auth }),
    });
    const data = await readAsJsonOrText(r);
    console.log('BFF /api/v1/app/me -> status', r.status);
    if (!r.ok) return res.status(r.status).send(data);
    res.status(r.status).send(data);
  } catch (e) {
    res.status(500).json({ error: 'Falha ao buscar perfil', message: String(e) });
  }
});

/* ===== Planos ===== */
app.get('/api/v1/planos', async (req, res) => {
  try {
    const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    const url = `${BASE}/api/v1/planos${qs}`;
    const r = await fetchWithClientTokenDedupRetry(url, req, { dedupMs: 400 });
    const data = await readAsJsonOrText(r);
    console.log('BFF /api/v1/planos ->', r.status, r._cached ? '(cached/dedup)' : '');
    if (!r.ok) return res.status(r.status).json(data);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Falha ao buscar planos', message: String(e) });
  }
});

app.get('/api/v1/planos/:id', async (req, res) => {
  try {
    const url = `${BASE}/api/v1/planos/${encodeURIComponent(req.params.id)}`;
    const r = await fetchWithClientTokenDedupRetry(url, req, { dedupMs: 400 });
    const data = await readAsJsonOrText(r);
    if (!r.ok) return res.status(r.status).json(data);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Falha ao buscar plano', message: String(e) });
  }
});

/* ===== Contratos por CPF ===== */
app.get('/api/v1/contratos/cpf/:cpf', async (req, res) => {
  try {
    const cpf = req.params.cpf;
    const url = `${BASE}/api/v1/contratos/cpf/${encodeURIComponent(cpf)}`;
    console.log('[BFF] GET contratos por CPF →', { url: url.replace(cpf, maskCpf(cpf)) });
    const r = await fetchWithClientTokenDedupRetry(url, req, { dedupMs: 400 });
    const data = await readAsJsonOrText(r);
    console.log('[BFF] ← status', r.status);
    if (!r.ok) return res.status(r.status).send(data);
    res.status(r.status).send(data);
  } catch (e) {
    console.error('[BFF] erro contratos CPF:', e);
    res.status(500).json({ error: 'Falha ao buscar contratos', message: String(e) });
  }
});

/* ===== Débitos do contrato ===== */
app.get('/api/v1/contratos/:id/debitos', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    const url = `${BASE}/api/v1/contratos/${req.params.id}/debitos`;
    const headers = injectHeadersFromReq(req, { Authorization: auth });
    const r = await fetchDedup(url, { headers }, { dedupMs: 400 });
    const data = await readAsJsonOrText(r);
    if (!r.ok) return res.status(r.status).send(data);
    res.status(r.status).send(data);
  } catch (e) {
    res.status(500).json({ error: 'Falha ao buscar débitos', message: String(e) });
  }
});

/* ===== Dependentes ===== */
app.get('/api/v1/contratos/:id/dependentes', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    const url = `${BASE}/api/v1/contratos/${req.params.id}/dependentes`;
    const headers = injectHeadersFromReq(req, { Authorization: auth });
    const r = await fetchDedup(url, { headers }, { dedupMs: 400 });
    const data = await readAsJsonOrText(r);
    console.log('BFF /api/v1/contratos/:id/dependentes ->', r.status, url, r._cached ? '(cached/dedup)' : '');
    if (!r.ok) return res.status(r.status).send(data);
    res.status(r.status).send(data);
  } catch (e) {
    res.status(500).json({ error: 'Falha ao buscar dependentes', message: String(e) });
  }
});

/* ===== Pagamentos ===== */
app.get('/api/v1/contratos/:id/pagamentos', async (req, res) => {
  try {
    const incomingAuth = req.headers.authorization;
    const headersBase = injectHeadersFromReq(req);
    let headers;

    if (incomingAuth && /^bearer\s+/i.test(incomingAuth)) {
      headers = { ...headersBase, Authorization: incomingAuth };
      const url = `${BASE}/api/v1/contratos/${req.params.id}/pagamentos`;
      const r = await fetchDedup(url, { headers }, { dedupMs: 400 });
      const data = await readAsJsonOrText(r);
      if (!r.ok) return res.status(r.status).send(data);
      return res.status(r.status).send(data);
    } else {
      const url = `${BASE}/api/v1/contratos/${req.params.id}/pagamentos`;
      const r = await fetchWithClientTokenDedupRetry(url, req, { dedupMs: 400 });
      const data = await readAsJsonOrText(r);
      if (!r.ok) return res.status(r.status).send(data);
      return res.status(r.status).send(data);
    }
  } catch (e) {
    res.status(500).json({ error: 'Falha ao buscar pagamentos', message: String(e) });
  }
});

/* ===== Pagamento do mês ===== */
app.get('/api/v1/contratos/:id/pagamentos/mes', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    const url = `${BASE}/api/v1/contratos/${req.params.id}/pagamentos/mes`;
    const headers = injectHeadersFromReq(req, { Authorization: auth });
    const r = await fetchDedup(url, { headers }, { dedupMs: 400 });
    const data = await readAsJsonOrText(r);
    console.log('BFF /api/v1/contratos/:id/pagamentos/mes ->', r.status, url, r._cached ? '(cached/dedup)' : '');
    if (!r.ok) return res.status(r.status).send(data);
    res.status(r.status).send(data);
  } catch (e) {
    res.status(500).json({ error: 'Falha ao buscar pagamento do mês', message: String(e) });
  }
});

/* ===== Locais Parceiros ===== */
app.get('/api/v1/locais/parceiros', async (req, res) => {
  try {
    const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    const url = `${BASE}/api/v1/locais/parceiros${qs}`;
    const r = await fetchWithClientTokenDedupRetry(url, req, { dedupMs: 400 });
    const data = await readAsJsonOrText(r);
    console.log('BFF GET /api/v1/locais/parceiros ->', r.status, url, r._cached ? '(cached/dedup)' : '');
    if (!r.ok) return res.status(r.status).send(data);
    return res.status(r.status).send(data);
  } catch (e) {
    console.error('BFF /api/v1/locais/parceiros ERRO:', e);
    return res.status(500).json({ error: 'Falha ao buscar locais parceiros', message: String(e) });
  }
});

/* ===== Empresa logada ===== */
app.get('/api/v1/unidades/me', async (req, res) => {
  try {
    const url = `${BASE}/api/v1/unidades/me`;
    const r = await fetchWithClientTokenDedupRetry(url, req, { dedupMs: 400 });
    const data = await readAsJsonOrText(r);
    console.log('[BFF] GET /api/v1/unidades/me ->', r.status, r._cached ? '(cached/dedup)' : '');
    if (!r.ok) return res.status(r.status).send(data);
    return res.status(r.status).send(data);
  } catch (e) {
    console.error('[BFF] /api/v1/unidades/me ERRO:', e);
    return res.status(500).json({ error: 'Falha ao buscar unidade atual', message: String(e) });
  }
});

/* ===== Unidades (todas) ===== */
app.get('/api/v1/unidades/all', async (req, res) => {
  try {
    const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    const url = `${BASE}/api/v1/unidades/all${qs}`;
    const r = await fetchWithClientTokenDedupRetry(url, req, { dedupMs: 400, cacheMs: 5_000 });
    const data = await readAsJsonOrText(r);

    console.log('[BFF] GET /api/v1/unidades/all ->', r.status, url, r._cached ? '(cached/dedup)' : '');
    if (!r.ok) return res.status(r.status).send(data);
    return res.status(r.status).send(data);
  } catch (e) {
    console.error('[BFF] /api/v1/unidades/all ERRO:', e);
    return res.status(500).json({ error: 'Falha ao buscar unidades', message: String(e) });
  }
});

/* ===== Cadastro app ===== */
app.post('/api/v1/app/auth/register', async (req, res) => {
  try {
    const clientToken = await getClientToken();
    const r = await fetch(`${BASE}/api/v1/app/auth/register`, {
      method: 'POST',
      headers: injectHeadersFromReq(req, {
        Authorization: `Bearer ${clientToken}`,
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(req.body || {}),
    });
    const data = await readAsJsonOrText(r);
    if (!r.ok) return res.status(r.status).send(data);
    res.status(201).send(data);
  } catch (e) {
    console.error('[BFF] register error', e);
    res.status(500).json({ error: 'Falha no cadastro', message: String(e) });
  }
});

/* ===== Atualização perfil app ===== */
app.patch('/api/v1/app/me', async (req, res) => {
  try {
    const r = await fetch(`${BASE}/api/v1/app/me`, {
      method: 'PATCH',
      headers: injectHeadersFromReq(req, {
        Authorization: req.headers.authorization || '',
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(req.body || {}),
    });
    const data = await readAsJsonOrText(r);
    if (!r.ok) return res.status(r.status).send(data);
    res.send(data);
  } catch (e) {
    console.error('[BFF] patch /me error', e);
    res.status(500).json({ error: 'Falha ao atualizar perfil', message: String(e) });
  }
});

/* ===== DEBUG / Health ===== */
app.get('/_debug/tenant', (req, res) => {
  const incoming = {
    'x-progem-id': req.header('X-Progem-ID') || req.header('x-progem-id') || null,
    'x-device-id': req.header('X-Device-ID') || req.header('x-device-id') || null,
    authorization: req.header('authorization') ? 'present' : 'missing',
  };
  console.log('[BFF][DEBUG] tenant(from .env)=', TENANT_ID, '| incoming=', incoming);
  res.json({ tenantId: TENANT_ID, base: BASE, incoming });
});

app.get('/health', (_, res) => res.json({ ok: true }));

/* ===== Execução local vs Vercel =====
   - Local/dev: sobe servidor na porta
   - Vercel: exporta o app (Serverless Function usa /api/index.js)
*/
if (!isVercel) {
  app.listen(PORT, () => {
    console.log(`API proxy on http://localhost:${PORT}`);
  });
}

export default app;
