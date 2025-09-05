// src/lib/clientToken.js
let _cached = null;
let _exp = 0; // epoch seconds

function _now() { return Math.floor(Date.now() / 1000); }

async function _fetchClientToken() {
  const r = await fetch('/auth/client-token', { method: 'POST' });
  const raw = await r.text();
  let data; try { data = JSON.parse(raw) } catch { data = { error: raw } }
  if (!r.ok) throw new Error(data?.error || 'Falha ao obter token do cliente');
  const token = data.access_token || data.accessToken;
  const expires = Number(data.expires_in || 300);
  _cached = token;
  _exp = _now() + Math.max(60, expires - 15); // margem de segurança
  return token;
}

/** Garante token de cliente válido (para endpoints públicos: planos, parceiros, etc.) */
export async function ensureClientToken() {
  if (_cached && _exp > _now()) return _cached;
  return _fetchClientToken();
}

/** Atalho que já devolve "Bearer ..." */
export async function getClientBearer() {
  const t = await ensureClientToken();
  return `Bearer ${t}`;
}

export default ensureClientToken;
