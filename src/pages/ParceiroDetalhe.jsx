// src/pages/ParceiroDetalhe.jsx
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import api from '@/lib/api'
import {
  MapPin, Phone, Mail, ArrowLeft, Percent, BadgePercent, Share2, ExternalLink,
} from 'lucide-react'

/* ========= Placeholder ========= */
const CLUB_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMTYwIiB2aWV3Qm94PSIwIDAgNDAwIDE2MCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIxNjAiIGZpbGw9IiNmMWY1ZjkiLz48Y2lyY2xlIGN4PSIyMDAiIGN5PSI4MCIgcj0iNDYiIGZpbGw9IiNlMmU4ZjAiLz48dGV4dCB4PSIyMDAiIHk9Ijg4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iSW50ZXIsU2Vnb2UgVUksQXJpYWwsIHNhbnMtc2VyaWZiIiBmb250LXNpemU9IjI4IiBmaWxsPSIjNDc1NTY5Ij4lPC90ZXh0Pjwvc3ZnPg=='

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
function wppLink(fone) {
  if (!fone) return null
  const num = String(fone).replace(/\D/g, '')
  return num ? `https://wa.me/${num}` : null
}
function domainUrl() {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}`
}

/* ========= Página ========= */
export default function ParceiroDetalhe() {
  const { id } = useParams()
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [parceiro, setParceiro] = useState(null)

  /* Carrega parceiro */
  useEffect(() => {
    let active = true
    async function run() {
      try {
        setError(''); setLoading(true)
        // Tenta o endpoint de detalhe
        const { data } = await api.get(`/api/v1/locais/parceiros/${id}`)
        if (active) setParceiro(data)
      } catch (e) {
        // Fallback: busca lista e filtra
        try {
          const res = await api.get(`/api/v1/locais/parceiros?size=999`)
          const all = Array.isArray(res.data) ? res.data : (res.data?.content || [])
          const found = all.find(p => String(p.id) === String(id))
          if (!found) throw new Error('Parceiro não encontrado')
          if (active) setParceiro(found)
        } catch (inner) {
          console.error(inner)
          const msg = e?.response?.data?.error || e?.message || 'Erro desconhecido'
          if (active) setError('Não foi possível carregar o parceiro: ' + msg)
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    run()
    return () => { active = false }
  }, [id])

  /* SEO básico: título da aba */
  useEffect(() => {
    if (parceiro?.nome) document.title = `${parceiro.nome} — Clube de Benefícios`
    return () => { document.title = 'Clube de Benefícios' }
  }, [parceiro?.nome])

  /* Normaliza galeria */
  const imagens = useMemo(() => {
    const unica = parceiro?.imagem && String(parceiro.imagem).trim() ? [parceiro.imagem] : []
    const galeria = Array.isArray(parceiro?.imagens) ? parceiro.imagens.filter(Boolean) : []
    return Array.from(new Set([...unica, ...galeria]))
  }, [parceiro])

  const beneficios = Array.isArray(parceiro?.beneficios) ? parceiro.beneficios : []
  const contato = parceiro?.contatos || {}
  const endereco = parceiro?.endereco || {}
  const cidadeUF = [endereco?.cidade, endereco?.uf].filter(Boolean).join(' - ')

  /* Compartilhamento */
  async function handleShare() {
    const url = `${domainUrl()}${location.pathname}`
    const title = parceiro?.nome || 'Parceiro'
    const text = `Conheça os benefícios para associados em ${title}`
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url })
      } else {
        await navigator.clipboard.writeText(url)
        alert('Link copiado!')
      }
    } catch (_) { /* usuário cancelou */ }
  }

  return (
    <section className="section">
      <div className="container-max">
        {/* Breadcrumb + voltar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <nav className="text-sm text-slate-500 dark:text-slate-400">
            <Link to="/beneficios" className="hover:underline">Clube de Benefícios</Link>
            <span className="mx-2">/</span>
            <span>{parceiro?.nome || 'Detalhe'}</span>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 dark:border-white/20 dark:hover:bg-white/10"
              title="Compartilhar"
            >
              <Share2 size={16} /> Compartilhar
            </button>
            <Link
              to="/beneficios"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 dark:border-white/20 dark:hover:bg-white/10"
            >
              <ArrowLeft size={16} /> Voltar
            </Link>
          </div>
        </div>

        {/* Estados */}
        {loading && (
          <div className="h-56 animate-pulse rounded-2xl bg-slate-100 dark:bg-[#0f172a]" />
        )}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-700/40 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Conteúdo */}
        {!loading && !error && parceiro && (
          <div className="rounded-2xl border border-slate-200 bg-white p-0 shadow-sm dark:border-white/20 dark:bg-[#111827]">
            {/* HERO */}
            <div
              className="relative w-full overflow-hidden rounded-t-2xl bg-slate-50 dark:bg-[#0f172a]"
              style={{
                backgroundImage: `url(${CLUB_PLACEHOLDER})`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundSize: 'contain'
              }}
            >
              <div className="aspect-video w-full flex items-center justify-center">
                {imagens.length > 0 ? (
                  <img
                    src={imagens[0]}
                    alt={parceiro?.nome}
                    className="max-h-full max-w-full object-contain"
                    loading="lazy"
                  />
                ) : (
                  <div className="text-sm text-slate-500 dark:text-slate-300">Sem imagem</div>
                )}
              </div>
            </div>

            {/* Header de título + action bar */}
            <div className="px-6 pb-6 pt-5 border-b border-slate-200 dark:border-white/10">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <h1 className="card-title text-2xl font-black tracking-tight">{parceiro?.nome}</h1>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    {cidadeUF && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-white/10">
                        {cidadeUF}
                      </span>
                    )}
                    {parceiro?.categoria && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-white/10">
                        {parceiro.categoria}
                      </span>
                    )}
                  </div>
                  {parceiro?.descricao && (
                    <p className="mt-2 text-slate-700 dark:text-slate-200">{parceiro.descricao}</p>
                  )}
                  {beneficios?.[0] && (
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-800 dark:border-white/20 dark:bg-[#0f172a] dark:text-slate-100">
                      <BadgePercent size={16} />
                      {beneficios[0].descricao} • <b>{fmtBeneficio(beneficios[0])}</b>
                    </div>
                  )}
                </div>

                {/* Barra de ações principal */}
                <div className="flex flex-wrap gap-2">
                  {contato?.telefone && (
                    <a href={`tel:${contato.telefone}`} className="btn-primary inline-flex items-center gap-2">
                      <Phone size={16} /> Ligar
                    </a>
                  )}
                  {wppLink(contato?.celular || contato?.telefone) && (
                    <a href={wppLink(contato.celular || contato.telefone)} target="_blank" rel="noreferrer"
                       className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:bg-[#0f172a] dark:text-slate-100 dark:hover:bg-[#132036] dark:focus:ring-white/20">
                      <Phone size={16} /> WhatsApp
                    </a>
                  )}
                  {contato?.email && (
                    <a href={contato.email.startsWith('http') ? contato.email : `mailto:${contato.email}`}
                       className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:bg-[#0f172a] dark:text-slate-100 dark:hover:bg-[#132036] dark:focus:ring-white/20">
                      <Mail size={16} /> E-mail
                    </a>
                  )}
                  <a href={mapsLink(endereco)} target="_blank" rel="noreferrer"
                     className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:bg-[#0f172a] dark:text-slate-100 dark:hover:bg-[#132036] dark:focus:ring-white/20">
                    <MapPin size={16} /> Mapa <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>

            {/* Corpo em colunas */}
            <div className="grid gap-6 p-6 md:grid-cols-3">
              {/* Coluna principal */}
              <div className="md:col-span-2">
                <h2 className="text-lg font-semibold mb-3">Benefícios para associados</h2>
                {beneficios.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {beneficios.map((b, idx) => (
                      <div
                        key={b.id || `${b.descricao}-${idx}`}
                        className="rounded-xl border p-3 text-sm flex items-start gap-2 dark:border-white/20"
                      >
                        <Percent size={16} className="mt-0.5 text-slate-700 dark:text-slate-200" />
                        <div className="flex-1">
                          <div className="font-medium text-slate-900 dark:text-slate-100">{b.descricao}</div>
                          <div className="text-slate-600 dark:text-slate-300">
                            Vantagem: <strong>{fmtBeneficio(b)}</strong>
                          </div>
                          {b.observacao && (
                            <div className="mt-1 text-slate-500 dark:text-slate-300">{b.observacao}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 p-4 text-slate-600 dark:border-white/20 dark:text-slate-300">
                    Este parceiro ainda não cadastrou benefícios detalhados.
                  </div>
                )}

                {/* Galeria extra (futuro) */}
                {imagens.length > 1 && (
                  <>
                    <h3 className="mt-8 text-lg font-semibold">Galeria</h3>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {imagens.slice(1).map((src, i) => (
                        <div key={i} className="w-32 h-24 overflow-hidden rounded-xl bg-slate-100 dark:bg-[#0f172a]">
                          <img src={src} alt={`Foto ${i + 2}`} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Sidebar sticky */}
              <aside className="self-start md:sticky md:top-6 space-y-6">
                <div className="rounded-xl border p-4 text-sm dark:border-white/20">
                  <h3 className="font-semibold mb-2">Contato</h3>
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
                    <a className="mt-1 break-all flex items-center gap-2 text-slate-700 hover:underline dark:text-slate-200" href={contato.email.startsWith('http') ? contato.email : `mailto:${contato.email}`}>
                      <Mail size={16} /> {contato.email}
                    </a>
                  )}
                </div>

                <div className="rounded-xl border p-4 text-sm dark:border-white/20">
                  <h3 className="font-semibold mb-2">Endereço</h3>
                  <div className="text-slate-700 dark:text-slate-200">{getEnderecoLinha(endereco) || '—'}</div>
                  <a
                    href={mapsLink(endereco)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-2 btn-primary"
                  >
                    <MapPin size={16} /> Abrir no mapa
                  </a>
                </div>
              </aside>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
