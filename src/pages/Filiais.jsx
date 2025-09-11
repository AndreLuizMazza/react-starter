// src/pages/Filiais.jsx
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '@/lib/api'
import {
  MapPin, Phone, Mail, Building2, RefreshCcw, Search,
} from 'lucide-react'

/* ====================== Utils ====================== */
const maskCnpj = (cnpj) => {
  if (!cnpj) return ''
  const d = cnpj.replace(/\D/g, '').padEnd(14, '0').slice(0, 14)
  return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}
const telHref = (t) => {
  if (!t) return undefined
  const digits = ('' + t).replace(/\D/g, '')
  return digits ? `tel:${digits}` : undefined
}
const mapsHref = (e) => {
  if (!e) return undefined
  const parts = [e.logradouro, e.numero, e.bairro, e.cidade, e.uf, e.cep].filter(Boolean)
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts.join(', '))}`
}

/* ====================== Skeleton ====================== */
function UnidadeSkeleton() {
  return (
    <div className="rounded-2xl border bg-white/60 dark:bg-slate-900/60 p-4 animate-pulse">
      <div className="flex flex-col items-center gap-3">
        <div className="h-20 w-44 md:h-24 md:w-56 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-5 w-60 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-5/6 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  )
}

/* ====================== Card ====================== */
function ActionPill({ href, children, label }) {
  if (!href) return null
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noreferrer' : undefined}
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      {children}
      <span className="sr-only">{label}</span>
    </a>
  )
}

function UnidadeCard({ u }) {
  const cor = u.corPrincipal || '#0ea5e9'
  const cor2 = u.corSecundaria || '#0369a1'
  const cityUf = [u?.endereco?.cidade, u?.endereco?.uf].filter(Boolean).join(' • ')

  return (
    <article
      className="group rounded-2xl border bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-md transition-all focus-within:ring-2 focus-within:ring-primary/40"
    >
      {/* Header: logo central + nome + cnpj */}
      <div className="p-6 border-b text-center">
        {u.urlLogo ? (
          <div className="mx-auto relative w-52 h-24 md:w-56 md:h-28">
            {/* Halo suave no fundo */}
            <div
              className="absolute -inset-1 rounded-2xl blur-lg opacity-40"
              style={{ background: `linear-gradient(135deg, ${cor}22, ${cor2}22)` }}
              aria-hidden
            />
            <div className="relative h-full w-full rounded-xl bg-white grid place-items-center shadow-sm">
              <img
                src={u.urlLogo}
                alt={u.nomeFantasia}
                className="max-h-full max-w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        ) : (
          <div
            className="mx-auto w-52 h-24 md:w-56 md:h-28 rounded-xl grid place-items-center text-white text-2xl font-bold shadow-sm"
            style={{ background: `linear-gradient(135deg, ${cor}, ${cor2})` }}
          >
            {String(u.nomeFantasia || 'U').slice(0, 1)}
          </div>
        )}

        <div className="mt-3 space-y-0.5">
          <h3 className="text-base md:text-lg font-semibold leading-snug whitespace-normal break-words">
            {u.nomeFantasia}
          </h3>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
            {maskCnpj(u.cnpj)}
          </p>

          {cityUf && (
            <div className="mt-1 inline-flex items-center gap-2">
              <span
                className="rounded-full px-2 py-0.5 text-[11px] bg-slate-50 dark:bg-slate-800 border text-slate-600 dark:text-slate-300"
                title={cityUf}
              >
                {cityUf}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Body: endereço + ações + contato */}
      <div className="p-4 grid gap-3">
        {/* Endereço */}
        <div className="flex items-start gap-2">
          <MapPin className="h-5 w-5 mt-0.5 text-slate-400" />
          <div className="text-sm leading-tight">
            <div className="font-medium">
              {u?.endereco?.logradouro && `${u.endereco.logradouro}, `}
              {u?.endereco?.numero}
            </div>
            <div className="text-slate-500">
              {[u?.endereco?.bairro, u?.endereco?.cidade, u?.endereco?.uf].filter(Boolean).join(' • ')}
            </div>
            {u?.endereco?.cep && (
              <div className="text-slate-400 text-xs">CEP {u.endereco.cep}</div>
            )}
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="flex flex-wrap items-center gap-2">
          <ActionPill href={telHref(u?.contato?.telefone)} label="Ligar">
            <Phone className="h-3.5 w-3.5" />
            {u?.contato?.telefone}
          </ActionPill>

          <ActionPill href={u?.contato?.email ? `mailto:${u.contato.email}` : undefined} label="E-mail">
            <Mail className="h-3.5 w-3.5" />
            {u?.contato?.email}
          </ActionPill>

          <ActionPill href={u?.endereco ? mapsHref(u.endereco) : undefined} label="Ver no mapa">
            <Building2 className="h-3.5 w-3.5" />
            Ver no mapa
          </ActionPill>
        </div>
      </div>

      {/* Barra inferior nas cores da unidade */}
      <div
        className="h-1.5 w-full"
        style={{ background: `linear-gradient(90deg, ${cor}, ${cor2})` }}
      />
    </article>
  )
}

/* ====================== Página ====================== */
export default function Filiais() {
  const [itens, setItens] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [uf, setUf] = useState('')

  async function carregar() {
    try {
      setLoading(true)
      setError('')
      const r = await api.get('/api/v1/unidades/all')
      const data = Array.isArray(r?.data) ? r.data : []
      setItens(
        data.sort((a, b) => (a?.nomeFantasia || '').localeCompare(b?.nomeFantasia || ''))
      )
    } catch (e) {
      console.error('Erro ao listar unidades', e)
      setError(e?.response?.data?.message || 'Falha ao carregar as unidades.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [])

  const ufs = useMemo(() =>
    Array.from(new Set(itens.map(i => i?.endereco?.uf).filter(Boolean))).sort()
  , [itens])

  // filtro responsivo com busca
  const filtrados = useMemo(() => {
    const query = q.trim().toLowerCase()
    return itens.filter(i => {
      const texto = [
        i?.nomeFantasia, i?.razaoSocial,
        i?.endereco?.cidade, i?.endereco?.bairro,
        i?.endereco?.logradouro, i?.cnpj,
      ].filter(Boolean).join(' ')?.toLowerCase()
      const okQ = !query || texto.includes(query)
      const okUf = !uf || i?.endereco?.uf === uf
      return okQ && okUf
    })
  }, [itens, q, uf])

  return (
    <section className="container-max px-4 py-6">
      {/* Título + ações */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Filiais & Unidades</h1>
          <p className="text-xs text-slate-500">
            {loading ? 'Carregando…' : `${filtrados.length} unidade${filtrados.length === 1 ? '' : 's'} encontrada${filtrados.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={carregar}
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
            title="Atualizar lista"
          >
            <RefreshCcw className="h-4 w-4" />
            Atualizar
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Voltar
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid gap-2 sm:grid-cols-3 mb-4">
        <div className="col-span-2">
          <label className="text-xs font-medium text-slate-500">Buscar</label>
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nome, cidade, bairro, CNPJ..."
              className="w-full pl-10 pr-3 py-2 rounded-xl border bg-white/70 dark:bg-slate-900/70"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">UF</label>
          <select
            value={uf}
            onChange={(e) => setUf(e.target.value)}
            className="w-full py-2 px-3 rounded-xl border bg-white/70 dark:bg-slate-900/70"
          >
            <option value="">Todas</option>
            {ufs.map(x => <option key={x} value={x}>{x}</option>)}
          </select>
        </div>
      </div>

      {/* Conteúdo */}
      {error && (
        <div className="mb-4 rounded-xl border bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200 p-3">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <UnidadeSkeleton key={i} />)}
        </div>
      ) : filtrados.length === 0 ? (
        <div className="rounded-2xl border bg-white dark:bg-slate-900 p-6 text-sm text-slate-600">
          Nenhuma unidade encontrada para os filtros atuais.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map(u => <UnidadeCard key={u.id} u={u} />)}
        </div>
      )}
    </section>
  )
}
