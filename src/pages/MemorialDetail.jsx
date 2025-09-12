// src/pages/MemorialDetail.jsx
import { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { getMemorialById } from '@/lib/nalapide'
import {
  ArrowLeft,
  Eye,
  Heart,
  Calendar,
  MapPin,
  Clock3,
  Share2,
  QrCode,
  Copy,
  ExternalLink,
  MessageCircle,
  Facebook
} from 'lucide-react'

/* ====================== Utils ====================== */
function safeDate(d) {
  if (!d) return null
  const dt = new Date(d)
  const fixed = new Date(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate())
  return isNaN(fixed) ? null : fixed
}
function fmtDate(d) {
  const s = safeDate(d)
  return s ? s.toLocaleDateString('pt-BR') : '—'
}
function fmtHour(hhmmss) {
  if (!hhmmss) return null
  const [h, m] = String(hhmmss).split(':')
  if (!h || !m) return null
  return `${h?.padStart(2, '0')}:${m?.padStart(2, '0')}`
}
function calcAge(dtNasc, dtFim) {
  const n = safeDate(dtNasc)
  const f = safeDate(dtFim) || new Date()
  if (!n) return null
  let age = f.getFullYear() - n.getFullYear()
  const m = f.getMonth() - n.getMonth()
  if (m < 0 || (m === 0 && f.getDate() < n.getDate())) age--
  return age
}

/* Skeleton com contraste adequado */
function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-44 sm:h-52 w-full rounded-3xl bg-zinc-100 dark:bg-zinc-800" />
      <div className="-mt-10 sm:-mt-12 px-4 sm:px-8">
        <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-zinc-200 dark:bg-zinc-700 ring-4 ring-white dark:ring-zinc-900 mx-auto sm:mx-0" />
        <div className="mt-3 sm:mt-4 h-6 sm:h-7 w-56 sm:w-72 rounded bg-zinc-200 dark:bg-zinc-700 mx-auto sm:mx-0" />
        <div className="mt-2 h-4 w-40 sm:w-52 rounded bg-zinc-100 dark:bg-zinc-800 mx-auto sm:mx-0" />
      </div>
    </div>
  )
}

/* Chip "glass" com variações light/dark e acessibilidade */
function Chip({ children }) {
  return (
    <span
      className="
        inline-flex h-auto min-h-[1.9rem] max-w-full items-center gap-1
        rounded-full px-3 py-1 text-[11px] sm:text-xs font-medium leading-tight
        bg-white/85 ring-1 ring-zinc-200 text-zinc-800
        backdrop-blur
        dark:bg-zinc-800/70 dark:ring-zinc-700 dark:text-zinc-100
      "
    >
      <span className="break-words">{children}</span>
    </span>
  )
}

/* Cartão da Agenda com contraste */
function AgendaCard({ title, data, hora, local, icon: Icon }) {
  if (!data && !hora && !local) return null
  return (
    <div className="min-h-[112px] rounded-2xl border border-zinc-200/70 bg-white p-4 dark:bg-zinc-900 dark:border-zinc-700">
      <div className="flex items-center gap-2 text-sm sm:text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">
        <Icon className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
        {title}
      </div>
      {(data || hora) && (
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
          <Calendar className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          <span>{data || 'Data a definir'}</span>
          {hora && <span className="mx-1">•</span>}
          {hora && (
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-4 w-4 text-zinc-500 dark:text-zinc-400" /> {hora}
            </span>
          )}
        </p>
      )}
      {local && (
        <button
          type="button"
          onClick={() => openMaps(local)}
          className="mt-2 inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-400 hover:underline"
          title="Abrir no Google Maps"
        >
          <MapPin className="h-4 w-4" /> <span className="text-left">{local}</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
function openMaps(q) {
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
  window.open(url, '_blank')
}

/* ====================== Página ====================== */
export default function MemorialDetail() {
  const { slug } = useParams()
  const location = useLocation()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        setError('')
        setLoading(true)
        const d = await getMemorialById(slug)
        setData(d)
      } catch (e) {
        console.error(e)
        setError('Não foi possível carregar este memorial.')
      } finally {
        setLoading(false)
      }
    })()
  }, [slug])

  const urlAtual = useMemo(() => {
    const base = window?.location?.origin || ''
    return `${base}${location.pathname}`
  }, [location.pathname])

  if (loading) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-8 sm:py-10">
        <Link to="/memorial" className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-400 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <div className="mt-4 sm:mt-6">
          <Skeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-12 text-red-600 dark:text-red-400">
        {error}
      </div>
    )
  }

  if (!data) return null

  /* Dados */
  const nome = data?.nomeFalecido || data?.nome || 'Sem nome'
  const foto = data?.fotoUrl || data?.foto
  const capa = data?.fotoCapaUrl

  const nasc = fmtDate(data?.dtNascimento)
  const fale = fmtDate(data?.dtFalecimento)
  const horaFal = fmtHour(data?.horaFalecimento)
  const idade = calcAge(data?.dtNascimento, data?.dtFalecimento)

  const views = Number(data?.contadorAcessos ?? 0)
  const reacoes = Number(data?.numeroReacoes ?? 0)

  const velorioData = fmtDate(data?.dtVelorio)
  const velorioHora = fmtHour(data?.horaVelorio)
  const localVelorio = data?.localVelorio

  const cerimoniaData = fmtDate(data?.dtCerimonia)
  const cerimoniaHora = fmtHour(data?.horaCerimonia)
  const localCerimonia = data?.localCerimonia

  const sepData = fmtDate(data?.dtSepultamento)
  const sepHora = fmtHour(data?.horaSepultamento)
  const localSepultamento = data?.localSepultamento

  const localFalecimento = data?.localFalecimento
  const naturalidade = data?.naturalidade
  const epitafio = data?.epitafio
  const biografia = data?.biografia

  /* Compartilhar */
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(urlAtual)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {/* noop */}
  }
  const waText = encodeURIComponent(`Em memória de ${nome} (${nasc} — ${fale})\n\nAcesse o memorial: ${urlAtual}`)
  const shareWhats = `https://wa.me/?text=${waText}`
  const shareFb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlAtual)}`

  return (
    <div className="container mx-auto max-w-5xl px-3 sm:px-4 py-6 sm:py-10">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Link to="/memorial" className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-400 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>

        {/* Dock de ações */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white text-zinc-700 ring-1 ring-zinc-200 hover:ring-emerald-300 hover:text-emerald-700 transition
                       dark:bg-zinc-900 dark:text-zinc-200 dark:ring-zinc-700 dark:hover:ring-emerald-500"
            title="Copiar link"
          >
            <Copy className="h-5 w-5" />
          </button>
          <a
            href={shareWhats}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white text-green-600 ring-1 ring-zinc-200 hover:ring-green-300 transition
                       dark:bg-zinc-900 dark:text-green-400 dark:ring-zinc-700"
            title="Compartilhar no WhatsApp"
          >
            <MessageCircle className="h-5 w-5" />
          </a>
          <a
            href={shareFb}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white text-blue-600 ring-1 ring-zinc-200 hover:ring-blue-300 transition
                       dark:bg-zinc-900 dark:text-blue-400 dark:ring-zinc-700"
            title="Compartilhar no Facebook"
          >
            <Facebook className="h-5 w-5" />
          </a>
          <div className="hidden sm:flex items-center gap-2 ml-1 rounded-full bg-emerald-600 text-white px-3 py-2 dark:bg-emerald-500">
            <Share2 className="h-4 w-4" />
            <span className="text-sm">{copied ? 'Link copiado!' : 'Compartilhar'}</span>
          </div>
        </div>
      </div>

      {/* HERO – com variações de cor e overlay para leitura */}
      <section className="mt-4 sm:mt-6 rounded-3xl bg-white shadow ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:ring-zinc-700">
        <div className="relative rounded-3xl">
          {/* background recortado */}
          <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl">
            {capa ? (
              <img src={capa} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-emerald-400 to-emerald-700 dark:from-emerald-500 dark:to-emerald-800" />
            )}
            {/* overlay melhora contraste em ambos os temas */}
            <div className="absolute inset-0 bg-black/35 dark:bg-black/45" />
          </div>

          {/* Conteúdo */}
          <div className="px-4 sm:px-8 pt-5 pb-4 sm:pb-6">
            {/* avatar central no mobile */}
            <div className="flex sm:hidden justify-center -mt-14">
              {foto ? (
                <img
                  src={foto}
                  alt={nome}
                  className="h-24 w-24 rounded-full object-cover ring-4 ring-white dark:ring-zinc-900 shadow-xl"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-emerald-100 ring-4 ring-white dark:ring-zinc-900 shadow-xl flex items-center justify-center text-emerald-700 text-2xl font-semibold">
                  {nome.slice(0, 1)}
                </div>
              )}
            </div>

            <div className="grid grid-cols-12 gap-4 sm:gap-6">
              {/* avatar + nome desktop */}
              <div className="hidden sm:flex col-span-12 lg:col-span-8 items-end gap-4">
                {foto ? (
                  <img
                    src={foto}
                    alt={nome}
                    className="h-28 w-28 rounded-full object-cover ring-4 ring-white dark:ring-zinc-900 shadow-xl"
                  />
                ) : (
                  <div className="h-28 w-28 rounded-full bg-emerald-100 ring-4 ring-white dark:ring-zinc-900 shadow-xl flex items-center justify-center text-emerald-700 text-3xl font-semibold">
                    {nome.slice(0, 1)}
                  </div>
                )}
                <div className="pb-1 min-w-0 pr-2">
                  <h1 className="text-3xl font-semibold tracking-tight text-white break-words">{nome}</h1>
                </div>
              </div>

              {/* nome mobile */}
              <div className="sm:hidden col-span-12 text-center">
                <h1 className="text-[22px] leading-tight font-semibold tracking-tight text-white break-words">
                  {nome}
                </h1>
              </div>

              {/* chips – grid mobile / wrap desktop, com cores legíveis */}
              <div className="col-span-12">
                {/* linha 1 */}
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2">
                  <Chip>
                    <Calendar className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                    {nasc} — {fale}{horaFal ? ` • ${horaFal}` : ''}
                  </Chip>
                  {idade != null && <Chip>{idade} anos</Chip>}
                </div>

                {/* linha 2 */}
                <div className="mt-2 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2">
                  <Chip>
                    <Eye className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                    {views} visualiza{views === 1 ? 'ção' : 'ções'}
                  </Chip>

                  {reacoes > 0 && (
                    <Chip>
                      <Heart className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                      {reacoes} reações
                    </Chip>
                  )}

                  {naturalidade && (
                    <Chip>
                      <MapPin className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                      <span className="whitespace-normal break-words">
                        Natural de {naturalidade}
                      </span>
                    </Chip>
                  )}

                  {localFalecimento && (
                    <Chip>
                      <Clock3 className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                      <span className="whitespace-normal break-words">
                        Falecimento: {localFalecimento}
                      </span>
                    </Chip>
                  )}
                </div>
              </div>

              {/* respiro à direita em telas grandes */}
              <div className="hidden lg:block col-span-4" />
            </div>
          </div>
        </div>
      </section>

      {/* GRID PRINCIPAL */}
      <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-6 space-y-4">
            <div className="rounded-3xl bg-white ring-1 ring-zinc-200/70 p-4 sm:p-6 shadow
                            dark:bg-zinc-900 dark:ring-zinc-700">
              <h2 className="text-[15px] sm:text-lg font-semibold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Agenda & Locais
              </h2>

              <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
                <AgendaCard
                  title="Velório"
                  data={velorioData}
                  hora={velorioHora}
                  local={localVelorio}
                  icon={Clock3}
                />
                <AgendaCard
                  title="Cerimônia"
                  data={cerimoniaData}
                  hora={cerimoniaHora}
                  local={localCerimonia}
                  icon={Calendar}
                />
                <AgendaCard
                  title="Sepultamento"
                  data={sepData}
                  hora={sepHora}
                  local={localSepultamento}
                  icon={MapPin}
                />

                {data?.qrcodeUrl && (
                  <div className="rounded-2xl border border-zinc-200/70 bg-white p-4 dark:bg-zinc-900 dark:border-zinc-700">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <QrCode className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> QR do Memorial
                    </p>
                    <img
                      src={data.qrcodeUrl}
                      alt="QR do memorial"
                      className="mt-3 h-36 w-36 sm:h-40 sm:w-40 object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Conteúdo */}
        <main className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Biografia */}
          <section className="rounded-3xl bg-white ring-1 ring-zinc-200/70 p-4 sm:p-6 shadow dark:bg-zinc-900 dark:ring-zinc-700">
            <h2 className="text-[15px] sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100">Biografia</h2>
            {biografia ? (
              <div className="prose prose-zinc max-w-none mt-2 sm:mt-3 prose-p:text-zinc-800 dark:prose-invert">
                <p>{biografia}</p>
              </div>
            ) : (
              <p className="mt-2 sm:mt-3 text-zinc-600 dark:text-zinc-300">
                A família ainda não adicionou uma biografia. Assim que for disponibilizada,
                aparecerá aqui.
              </p>
            )}
            {epitafio && (
              <blockquote className="mt-3 sm:mt-4 rounded-2xl border border-zinc-200/70 bg-zinc-50 px-4 py-3 text-zinc-700 italic dark:bg-zinc-800/60 dark:text-zinc-200 dark:border-zinc-700">
                “{epitafio}”
              </blockquote>
            )}
          </section>

          {/* CTA homenagens */}
          <section className="rounded-3xl ring-1 ring-emerald-100 bg-gradient-to-r from-emerald-50 to-white p-4 sm:p-6 dark:from-zinc-800 dark:to-zinc-900 dark:ring-zinc-700">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 sm:gap-6 items-center">
              <div className="sm:col-span-3">
                <h3 className="text-[15px] sm:text-base font-semibold text-emerald-900 dark:text-emerald-300">
                  Homenagens & Reações
                </h3>
                <p className="text-sm text-emerald-800/80 dark:text-emerald-200/80 mt-1">
                  Deixe uma mensagem, acenda uma vela 🕯️ ou envie flores 🌹 para homenagear {nome}.
                </p>
              </div>
              <div className="sm:col-span-2 flex justify-stretch sm:justify-end gap-2">
                <button
                  type="button"
                  className="btn btn-primary w-full sm:w-auto
                             bg-emerald-600 hover:bg-emerald-700 text-white
                             dark:bg-emerald-500 dark:hover:bg-emerald-400"
                >
                  Enviar homenagem
                </button>
                <button
                  type="button"
                  className="btn w-full sm:w-auto
                             bg-white text-zinc-800 ring-1 ring-zinc-200 hover:bg-zinc-50
                             dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-700 dark:hover:bg-zinc-800"
                >
                  Ver reações ({reacoes})
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
