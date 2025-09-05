// src/pages/ClubeBeneficios.jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import api from '@/lib/api.js'
import useAuth from '@/store/auth.js'
import {
  MapPin, Phone, Mail, Percent, BadgePercent, Search, X, RotateCcw, ChevronLeft, ChevronRight
} from 'lucide-react'

/* ========= Placeholder elegante (SVG embutido) ========= */
const CLUB_PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221600%22 height=%22800%22 viewBox=%220 0 1600 800%22%3E%3Cdefs%3E%3ClinearGradient id=%22g%22 x1=%220%22 y1=%220%22 x2=%221%22 y2=%221%22%3E%3Cstop offset=%220%25%22 stop-color=%22%23eef2ff%22/%3E%3Cstop offset=%22100%25%22 stop-color=%22%23e0f2fe%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%221600%22 height=%22800%22 fill=%22url(%23g)%22/%3E%3Ccircle cx=%22800%22 cy=%22400%22 r=%22340%22 fill=%22%23ffffff%22 opacity=%220.45%22/%3E%3Ctext x=%22800%22 y=%22460%22 text-anchor=%22middle%22 font-family=%22Inter,Segoe UI,Arial,sans-serif%22 font-size=%22320%22 fill=%22%231f2937%22%3E%25%3C/text%3E%3C/svg%3E'

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

/* ========= Card ========= */
function ParceiroCard({ p, onAbrir }) {
  const placeholder = CLUB_PLACEHOLDER
  const img = p?.imagem && String(p.imagem).trim() ? p.imagem : placeholder

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-[2px] hover:shadow-md">
      <div className="h-40 w-full bg-slate-50 flex items-center justify-center">
        <img
          src={img}
          alt={p?.nome || 'Parceiro'}
          className="max-h-full max-w-full object-contain"
          loading="lazy"
          onError={e => { e.currentTarget.src = placeholder }}
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold tracking-tight text-slate-900 line-clamp-2">{p?.nome}</h3>

        {Array.isArray(p?.beneficios) && p.beneficios.length > 0 && (
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
            <BadgePercent size={14} />
            {p.beneficios[0].descricao} • {fmtBeneficio(p.beneficios[0])}
          </div>
        )}

        <div className="mt-auto pt-4 flex gap-2">
          {/* BOTÃO TEMATIZADO */}
          <button
            onClick={() => onAbrir(p)}
            className="flex-1 inline-flex items-center justify-center btn-primary text-sm"
          >
            Ver detalhes
          </button>

          {/* Ação neutra */}
          <a
            href={mapsLink(p?.endereco)}
            target="_blank"
            rel="noreferrer"
            className="flex-1 inline-flex items-center justify-center rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
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
  const placeholder = CLUB_PLACEHOLDER
  const img = parceiro?.imagem && String(parceiro.imagem).trim() ? parceiro.imagem : placeholder
  const contato = parceiro?.contatos || {}
  const endereco = parceiro?.endereco || {}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">Detalhes do parceiro</h3>
            <p className="text-sm text-slate-600">{parceiro?.nome}</p>
          </div>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-900" aria-label="Fechar">
            <X />
          </button>
        </div>

        <div className="mt-4 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-3 flex items-center justify-center">
            <img
              src={img}
              alt={parceiro?.nome}
              className="max-h-40 max-w-full object-contain"
              onError={e => { e.currentTarget.src = placeholder }}
            />
          </div>

          <div className="md:col-span-2 grid gap-3">
            <h4 className="font-semibold">Benefícios</h4>
            <div className="grid sm:grid-cols-2 gap-2">
              {(parceiro?.beneficios || []).map(b => (
                <div key={b.id} className="rounded-xl border p-3 text-sm flex items-start gap-2">
                  <Percent size={16} className="mt-0.5 text-slate-700" />
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{b.descricao}</div>
                    <div className="text-slate-600">Vantagem: <strong>{fmtBeneficio(b)}</strong></div>
                  </div>
                </div>
              ))}
              {(!parceiro?.beneficios || parceiro.beneficios.length === 0) && (
                <p className="text-sm text-slate-600">Este parceiro ainda não cadastrou benefícios detalhados.</p>
              )}
            </div>

            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              <div className="rounded-xl border p-3 text-sm">
                <h5 className="font-semibold mb-2">Contato</h5>
                {contato.telefone && (
                  <a className="flex items-center gap-2 text-slate-700 hover:underline" href={`tel:${contato.telefone}`}>
                    <Phone size={16} /> {contato.telefone}
                  </a>
                )}
                {contato.celular && (
                  <a className="mt-1 flex items-center gap-2 text-slate-700 hover:underline" href={`tel:${contato.celular}`}>
                    <Phone size={16} /> {contato.celular}
                  </a>
                )}
                {contato.email && (
                  <a className="mt-1 break-all flex items-center gap-2 text-slate-700 hover:underline" href={contato.email.startsWith('http') ? contato.email : `mailto:${contato.email}`}>
                    <Mail size={16} /> {contato.email}
                  </a>
                )}
              </div>

              <div className="rounded-xl border p-3 text-sm">
                <h5 className="font-semibold mb-2">Endereço</h5>
                <div className="text-slate-700">{getEnderecoLinha(endereco) || '—'}</div>
                {/* BOTÃO TEMATIZADO */}
                <a
                  href={mapsLink(endereco)} target="_blank" rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-2 btn-primary"
                >
                  <MapPin size={16} /> Abrir no mapa
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="rounded-full border border-slate-300 px-4 py-2">Fechar</button>
        </div>
      </div>
    </div>
  )
}

/* ========= Página ========= */
export default function ClubeBeneficios() {
  const ensureClientToken = useAuth(s => s.ensureClientToken)

  // estado de dados
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [items, setItems] = useState([])

  // paginação
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(9)
  const [totalPages, setTotalPages] = useState(1)

  // filtros
  const [queryRaw, setQueryRaw] = useState('')
  const [cityRaw, setCityRaw] = useState('')
  const [query, setQuery] = useState('')
  const [cidade, setCidade] = useState('')
  const [detalhe, setDetalhe] = useState(null)

  // debounce
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
      await ensureClientToken()
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
      const msg = e?.response?.data?.error || e?.response?.statusText || e?.message || 'Erro desconhecido'
      setError('Não foi possível carregar os parceiros: ' + msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() /* eslint-disable-next-line */ }, [page, size])

  const parceirosFiltrados = useMemo(() => {
    const q = query.trim().toLowerCase()
    const c = cidade.trim().toLowerCase()
    return items.filter(p => {
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
          <p className="mt-1 text-slate-600">
            Parceiros com condições especiais para associados. Encontre descontos em saúde, exames, odontologia e mais.
          </p>
        </div>

        {/* Filtros */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative w-full md:max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Buscar por nome do parceiro"
              value={queryRaw}
              onChange={e => setQueryRaw(e.target.value)}
              aria-label="Buscar parceiro por nome"
            />
          </div>
          <input
            className="input md:max-w-xs"
            placeholder="Filtrar por cidade"
            value={cityRaw}
            onChange={e => setCityRaw(e.target.value)}
            aria-label="Filtrar por cidade"
          />
          <button
            onClick={limparFiltros}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
            title="Limpar filtros"
          >
            <RotateCcw size={16} /> Limpar
          </button>
          <div className="grow" />
          <div className="text-sm text-slate-600">
            {parceirosFiltrados.length} parceiro(s) nesta página
          </div>
        </div>

        {/* Lista / estados */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
            <div className="mt-3">
              {/* BOTÃO TEMATIZADO */}
              <button onClick={() => fetchData()} className="btn-primary">Tentar de novo</button>
            </div>
          </div>
        )}

        {!loading && !error && parceirosFiltrados.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-600">
            Nenhum parceiro encontrado com os filtros atuais.
          </div>
        )}

        {!loading && !error && parceirosFiltrados.length > 0 && (
          <>
            <div className="grid gap-6 md:grid-cols-3">
              {parceirosFiltrados.map(p => (
                <ParceiroCard key={p.id} p={p} onAbrir={setDetalhe} />
              ))}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Página <strong>{page + 1}</strong> de <strong>{totalPages}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page <= 0}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm disabled:opacity-50"
                    aria-label="Página anterior"
                  >
                    <ChevronLeft size={16} /> Anterior
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm disabled:opacity-50"
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
