// src/pages/ClubeBeneficios.jsx
// Nota: para o nome da empresa ficar sempre visível no tema escuro,
// adicione no seu theme.css:
// @media (prefers-color-scheme: dark){ .card .card-title{ color:#e7edf6 !important } }
// body.theme-dark .card .card-title, html.theme-dark .card .card-title{ color:#e7edf6 !important }

import { useEffect, useMemo, useRef, useState } from 'react'
import api from '@/lib/api.js'
import {
  MapPin, Phone, Mail, Percent, BadgePercent, Search, X, RotateCcw, ChevronLeft, ChevronRight,
} from 'lucide-react'

/* ========= Placeholder (SVG Base64) ========= */
const CLUB_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMTYwIiB2aWV3Qm94PSIwIDAgNDAwIDE2MCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIxNjAiIGZpbGw9IiNmMWY1ZjkiLz48Y2lyY2xlIGN4PSIyMDAiIGN5PSI4MCIgcj0iNDYiIGZpbGw9IiNlMmU4ZjAiLz48dGV4dCB4PSIyMDAiIHk9Ijg4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iSW50ZXIsU2Vnb2UgVUksQXJpYWwsIHNhbnMtc2VyaWZiIiBmb250LXNpemU9IjI4IiBmaWxsPSIjNDc1NTY5Ij4lPC90ZXh0Pjwvc3ZnPg=='

/* ========= Img com fallback (esconde em erro) ========= */
function ImgWithFallback({ src, alt, className }) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={(e) => { e.currentTarget.style.display = 'none' }}
    />
  )
}

/* ========= Utils ========= */
function fmtBeneficio(b) {
  if (Number(b?.porcentagem)) return `${Number(b.porcentagem).toLocaleString('pt-BR')}%`
  const v = Number(b?.valor || 0)
  return v > 0 ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'
}
function getEnderecoLinha(e = {}) {
  const partes = [
    e.logradouro, e.numero, e.bairro,
    e.cidade && e.uf ? `${e.cidade} - ${e.uf}` : e.cidade || e.uf,
    e.cep ? `CEP ${e.cep}` : ''
  ].filter(Boolean)
  return partes.join(', ')
}
function mapsLink(endereco = {}) {
  if (endereco.latitude && endereco.longitude) {
    return `https://www.google.com/maps?q=${endereco.latitude},${endereco.longitude}`
  }
  const q = encodeURIComponent(getEnderecoLinha(endereco))
  return `https://www.google.com/maps/search/?api=1&query=${q}`
}

/* ========= Chip de benefício (padronizado) ========= */
function BeneficioChip({ icon = <BadgePercent size={14} />, label, value, extraCount = 0 }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 dark:border-white/20 dark:bg-[#0f172a] dark:text-slate-200">
      <span className="shrink-0 text-slate-600 dark:text-slate-300">{icon}</span>
      <span className="truncate">{label} • <b>{value}</b></span>
      {extraCount > 0 && (
        <span className="ml-1 shrink-0 rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 ring-1 ring-slate-200 dark:bg-white/10 dark:text-slate-100 dark:ring-white/20">
          +{extraCount}
        </span>
      )}
    </div>
  )
}

/* ========= Card ========= */
function ParceiroCard({ p, onAbrir }) {
  const hasImg = p?.imagem && String(p.imagem).trim()
  const beneficios = Array.isArray(p?.beneficios) ? p.beneficios : []
  const principal = beneficios[0]
  const extraCount = Math.max(0, beneficios.length - 1)

  return (
    <article
      className="
        card relative flex h-full flex-col overflow-hidden rounded-2xl
        border border-slate-200 bg-white shadow-sm transition
        hover:-translate-y-[2px] hover:shadow-md
        dark:border-white/20 dark:bg-[#111827]
      "
    >
      {/* header com placeholder e dark-friendly */}
      <div
        className="
          h-40 w-full flex items-center justify-center
          bg-slate-50 dark:bg-[#0f172a]
        "
        style={{
          backgroundImage: `url(${CLUB_PLACEHOLDER})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'contain'
        }}
      >
        {hasImg ? (
          <ImgWithFallback
            src={p.imagem}
            alt={p?.nome || 'Parceiro'}
            className="max-h-full max-w-full object-contain"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {/* Título — a classe 'card-title' é usada pelo patch de tema escuro */}
        <h3 className="card-title text-base font-semibold leading-tight text-slate-900 dark:text-slate-100 line-clamp-2">
          {p?.nome}
        </h3>

        {/* Benefício principal + contador de extras */}
        {principal && (
          <div className="mt-2">
            <BeneficioChip
              label={principal.descricao}
              value={fmtBeneficio(principal)}
              extraCount={extraCount}
            />
          </div>
        )}

        <div className="mt-auto pt-4 flex gap-2">
          <button
            onClick={() => onAbrir(p)}
            className="flex-1 inline-flex items-center justify-center btn-primary text-sm"
          >
            Ver detalhes
          </button>
          <a
            href={mapsLink(p?.endereco)}
            target="_blank"
            rel="noreferrer"
            className="
              flex-1 inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300
              dark:bg-[#0f172a] dark:text-slate-100 dark:hover:bg-[#132036] dark:focus:ring-white/20
            "
          >
            Como chegar
          </a>
        </div>
      </div>
    </article>
  )
}

/* ========= Modal ========= */
function ParceiroModal({ parceiro, onClose }) {
  if (!parceiro) return null
  const contato = parceiro?.contatos || {}
  const endereco = parceiro?.endereco || {}
  const hasImg = parceiro?.imagem && String(parceiro.imagem).trim()

  const beneficios = Array.isArray(parceiro?.beneficios) ? parceiro.beneficios : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl dark:bg-[#111827] dark:text-slate-100">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">Detalhes do parceiro</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">{parceiro?.nome}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            aria-label="Fechar"
          >
            <X />
          </button>
        </div>

        <div className="mt-4 grid gap-6 md:grid-cols-3">
          <div
            className="rounded-2xl p-3 flex items-center justify-center bg-slate-50 dark:bg-[#0f172a]"
            style={{
              backgroundImage: `url(${CLUB_PLACEHOLDER})`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundSize: 'contain'
            }}
          >
            {hasImg ? (
              <ImgWithFallback
                src={parceiro.imagem}
                alt={parceiro?.nome}
                className="max-h-40 max-w-full object-contain"
              />
            ) : null}
          </div>

          <div className="md:col-span-2 grid gap-3">
            <h4 className="font-semibold">Benefícios</h4>

            <div className="grid gap-2 sm:grid-cols-2">
              {beneficios.length > 0 ? beneficios.map((b) => (
                <div key={b.id || `${b.descricao}-${b.porcentagem}-${b.valor}`} className="rounded-xl border p-3 text-sm flex items-start gap-2 dark:border-white/20">
                  <Percent size={16} className="mt-0.5 text-slate-700 dark:text-slate-200" />
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{b.descricao}</div>
                    <div className="text-slate-600 dark:text-slate-300">
                      Vantagem: <strong>{fmtBeneficio(b)}</strong>
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Este parceiro ainda não cadastrou benefícios detalhados.
                </p>
              )}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border p-3 text-sm dark:border-white/20">
                <h5 className="font-semibold mb-2">Contato</h5>
                {contato.telefone && (
                  <a className="flex items-center gap-2 text-slate-700 hover:underline dark:text-slate-200" href={`tel:${contato.telefone}`}>
                    <Phone size={16} /> {contato.telefone}
                  </a>
                )}
                {contato.celular && (
                  <a className="mt-1 flex items-center gap-2 text-slate-700 hover:underline dark:text-slate-200" href={`tel:${contato.celular}`}>
                    <Phone size={16} /> {contato.celular}
                  </a>
                )}
                {contato.email && (
                  <a
                    className="mt-1 break-all flex items-center gap-2 text-slate-700 hover:underline dark:text-slate-200"
                    href={contato.email.startsWith('http') ? contato.email : `mailto:${contato.email}`}
                  >
                    <Mail size={16} /> {contato.email}
                  </a>
                )}
              </div>

              <div className="rounded-xl border p-3 text-sm dark:border-white/20">
                <h5 className="font-semibold mb-2">Endereço</h5>
                <div className="text-slate-700 dark:text-slate-200">{getEnderecoLinha(endereco) || '—'}</div>
                <a
                  href={mapsLink(endereco)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-2 btn-primary"
                >
                  <MapPin size={16} /> Abrir no mapa
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-full border border-slate-300 px-4 py-2 dark:border-white/20"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

/* ========= Página ========= */
export default function ClubeBeneficios() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [items, setItems] = useState([])

  const [page, setPage] = useState(0)
  const [size, setSize] = useState(9)
  const [totalPages, setTotalPages] = useState(1)

  const [queryRaw, setQueryRaw] = useState('')
  const [cityRaw, setCityRaw] = useState('')
  const [query, setQuery] = useState('')
  const [cidade, setCidade] = useState('')
  const [detalhe, setDetalhe] = useState(null)

  const timers = useRef({})

  useEffect(() => {
    clearTimeout(timers.current.query)
    timers.current.query = setTimeout(() => setQuery(queryRaw), 250)
    return () => clearTimeout(timers.current.query)
  }, [queryRaw])

  useEffect(() => {
    clearTimeout(timers.current.city)
    timers.current.city = setTimeout(() => setCidade(cityRaw), 250)
    return () => clearTimeout(timers.current.city)
  }, [cityRaw])

  async function fetchData({ resetPage = false } = {}) {
    try {
      setError('')
      setLoading(true)

      const params = new URLSearchParams()
      params.set('page', String(resetPage ? 0 : page))
      params.set('size', String(size))
      const qs = params.toString() ? `?${params.toString()}` : ''

      const { data } = await api.get(`/api/v1/locais/parceiros${qs}`)

      if (Array.isArray(data)) {
        setItems(data)
        setTotalPages(1)
        if (resetPage) setPage(0)
      } else {
        const list = Array.isArray(data.content) ? data.content : []
        setItems(list)
        const tp = Number(data.totalPages || 1)
        setTotalPages(tp > 0 ? tp : 1)
        if (resetPage) setPage(0)
      }
    } catch (e) {
      console.error(e)
      const msg =
        e?.response?.data?.error ||
        e?.response?.statusText ||
        e?.message ||
        'Erro desconhecido'
      setError('Não foi possível carregar os parceiros: ' + msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size])

  const parceirosFiltrados = useMemo(() => {
    const q = query.trim().toLowerCase()
    const c = cidade.trim().toLowerCase()
    return items.filter((p) => {
      const nomeOK = !q || String(p?.nome || '').toLowerCase().includes(q)
      const cid = String(p?.endereco?.cidade || '').toLowerCase()
      const cidadeOK = !c || cid.includes(c)
      return nomeOK && cidadeOK
    })
  }, [items, query, cidade])

  function limparFiltros() {
    setQueryRaw(''); setCityRaw(''); setQuery(''); setCidade('')
    fetchData({ resetPage: true })
  }

  return (
    <section className="section">
      <div className="container-max">
        <div className="mb-6">
          <h1 className="text-3xl font-black tracking-tight">Clube de Benefícios</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-300">
            Parceiros com condições especiais para associados. Encontre descontos em saúde, exames, odontologia e mais.
          </p>
        </div>

        {/* Filtros */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative w-full md:max-w-sm">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className="input !pl-10"
              placeholder="Buscar por nome do parceiro"
              value={queryRaw}
              onChange={(e) => setQueryRaw(e.target.value)}
              aria-label="Buscar parceiro por nome"
            />
          </div>

          <input
            className="input md:max-w-xs"
            placeholder="Filtrar por cidade"
            value={cityRaw}
            onChange={(e) => setCityRaw(e.target.value)}
            aria-label="Filtrar por cidade"
          />

          <button
            onClick={limparFiltros}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 dark:border-white/20 dark:hover:bg-white/10"
            title="Limpar filtros"
          >
            <RotateCcw size={16} /> Limpar
          </button>

          <div className="grow" />
          <div className="text-sm text-slate-600 dark:text-slate-300">
            {parceirosFiltrados.length} parceiro(s) nesta página
          </div>
        </div>

        {/* Lista / estados */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-100 dark:bg-[#0f172a]" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-700/40 dark:bg-red-900/20 dark:text-red-200">
            {error}
            <div className="mt-3">
              <button onClick={() => fetchData()} className="btn-primary">Tentar de novo</button>
            </div>
          </div>
        )}

        {!loading && !error && parceirosFiltrados.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-600 dark:border-white/20 dark:bg-[#111827] dark:text-slate-200">
            Nenhum parceiro encontrado com os filtros atuais.
          </div>
        )}

        {!loading && !error && parceirosFiltrados.length > 0 && (
          <>
            <div className="grid gap-6 md:grid-cols-3">
              {parceirosFiltrados.map((p) => (
                <ParceiroCard key={p.id} p={p} onAbrir={setDetalhe} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  Página <strong>{page + 1}</strong> de <strong>{totalPages}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((pp) => Math.max(0, pp - 1))}
                    disabled={page <= 0}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-white/20"
                    aria-label="Página anterior"
                  >
                    <ChevronLeft size={16} /> Anterior
                  </button>
                  <button
                    onClick={() => setPage((pp) => Math.min(totalPages - 1, pp + 1))}
                    disabled={page >= totalPages - 1}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-white/20"
                    aria-label="Próxima página"
                  >
                    Próxima <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {detalhe && <ParceiroModal parceiro={detalhe} onClose={() => setDetalhe(null)} />}
    </section>
  )
}
