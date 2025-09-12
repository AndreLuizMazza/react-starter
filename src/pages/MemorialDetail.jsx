import { useEffect, useMemo, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { getMemorialById } from '@/lib/nalapide'
import BackButton from '@/components/BackButton'
import {
  Eye, Heart, Calendar, MapPin, Clock3, Share2, QrCode, Copy,
  ExternalLink, MessageCircle, Facebook
} from 'lucide-react'

/* ===== Alto contraste (persistido em localStorage) ===== */
const HC_KEY = 'prefersHighContrast'
function useHighContrast() {
  const [highContrast, setHighContrast] = useState(false)
  useEffect(() => {
    const saved = localStorage.getItem(HC_KEY) === '1'
    setHighContrast(saved)
    document.documentElement.classList.toggle('hc', saved)
  }, [])
  return { highContrast }
}

/* ===== Helpers de cor ===== */
function hexToHsl(hex) {
  let c = String(hex || '').replace('#', '')
  if (!c) return { h: 158, s: 72, l: 45 } // fallback emerald
  if (c.length === 3) c = c.split('').map(x => x + x).join('')
  const num = parseInt(c, 16)
  const r = (num >> 16) / 255, g = ((num >> 8) & 255) / 255, b = (num & 255) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2
  if (max === min) { h = s = 0 }
  else {
    const d = max - min
    s = l > .5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      default:  h = (r - g) / d + 4
    }
    h /= 6
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}
function clamp(n, a, b) { return Math.min(b, Math.max(a, n)) }
function setBrandVars(hex) {
  const root = document.documentElement
  const { h, s, l } = hexToHsl(hex)
  const l600 = clamp(l - 8, 0, 100)
  const l700 = clamp(l - 14, 0, 100)
  const l50  = clamp(l + 40, 0, 100)
  const l100 = clamp(l + 28, 0, 100)
  root.style.setProperty('--brand', `hsl(${h} ${s}% ${l}%)`)
  root.style.setProperty('--brand-600', `hsl(${h} ${s}% ${l600}%)`)
  root.style.setProperty('--brand-700', `hsl(${h} ${s}% ${l700}%)`)
  root.style.setProperty('--brand-50', `hsl(${h} ${s}% ${l50}%)`)
  root.style.setProperty('--brand-100', `hsl(${h} ${s}% ${l100}%)`)
  root.style.setProperty('--on-brand', `#ffffff`)
}

/* ====================== Datas ====================== */
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

/* Skeleton */
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

/* Chip */
function Chip({ children, hc }) {
  const base = hc
    ? 'bg-white text-black ring-black/40 dark:bg-black dark:text-white dark:ring-white/40'
    : 'bg-white/85 text-zinc-800 ring-zinc-200 dark:bg-zinc-800/70 dark:text-zinc-100 dark:ring-zinc-700'
  return (
    <span className={`inline-flex min-h-[1.9rem] max-w-full items-center gap-1 rounded-full px-3 py-1 text-[11px] sm:text-xs font-medium leading-tight backdrop-blur ${base}`}>
      <span className="break-words">{children}</span>
    </span>
  )
}

/* Agenda card */
function AgendaCard({ title, data, hora, local, icon: Icon, hc }) {
  const wrap = hc
    ? 'bg-white text-zinc-900 ring-1 ring-black/30 dark:bg-black dark:text-zinc-100 dark:ring-white/30'
    : 'bg-white text-zinc-900 ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-700'
  return (
    <div className={`min-h-[112px] rounded-2xl p-4 shadow-sm ${wrap}`}>
      <div className="flex items-center gap-2 text-sm sm:text-[15px] font-semibold">
        <Icon className="h-4.5 w-4.5 text-[color:var(--brand-700)] dark:text-[color:var(--brand-50)]" />
        {title}
      </div>
      {(data || hora) && (
        <p className="mt-2 text-sm flex items-center gap-1 text-zinc-700 dark:text-zinc-300">
          <Calendar className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          <span>{data || 'Data a definir'}</span>
          {hora && <span className="mx-1">•</span>}
          {hora && (
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-4 w-4 text-zinc-600 dark:text-zinc-400" /> {hora}
            </span>
          )}
        </p>
      )}
      {local && (
        <button
          type="button"
          onClick={() => openMaps(local)}
          className="mt-2 inline-flex items-center gap-2 text-[color:var(--brand-700)] hover:underline dark:text-[color:var(--brand-50)]"
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
  const { highContrast } = useHighContrast()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      try {
        setError(''); setLoading(true)
        const d = await getMemorialById(slug)
        setData(d)
      } catch (e) {
        console.error(e); setError('Não foi possível carregar este memorial.')
      } finally {
        setLoading(false)
      }
    })()
  }, [slug])

  // aplica a cor da empresa
  useEffect(() => {
    const cor =
      data?.empresa?.corPrimaria ||
      data?.empresa?.brandColor ||
      '#10B981'
    if (cor) setBrandVars(cor)
  }, [data?.empresa?.corPrimaria, data?.empresa?.brandColor])

  const urlAtual = useMemo(() => (window?.location?.origin || '') + location.pathname, [location.pathname])

  if (loading) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-8 sm:py-10">
        <BackButton to="/memorial" />
        <div className="mt-4 sm:mt-6"><Skeleton /></div>
      </div>
    )
  }
  if (error) return <div className="container mx-auto max-w-5xl px-4 py-12 text-red-600 dark:text-red-400">{error}</div>
  if (!data) return null

  /* Dados principais */
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

  async function copyLink() {
    try { await navigator.clipboard.writeText(urlAtual) } catch {}
  }
  const waText = encodeURIComponent(`Em memória de ${nome} (${nasc} — ${fale})\n\nAcesse o memorial: ${urlAtual}`)
  const shareWhats = `https://wa.me/?text=${waText}`
  const shareFb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlAtual)}`
  const heroOverlay = highContrast ? 'bg-black/55 dark:bg-black/65' : 'bg-black/35 dark:bg-black/45'

  return (
    <div className="container mx-auto max-w-5xl px-3 sm:px-4 py-6 sm:py-10">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <BackButton to="/memorial" />
        <div className="flex items-center gap-1 sm:gap-2">
          <button onClick={copyLink} title="Copiar link" className="btn-brand-ghost">
            <Copy className="h-5 w-5" />
          </button>
          <a href={shareWhats} target="_blank" rel="noreferrer" title="WhatsApp" className="btn-brand-ghost">
            <MessageCircle className="h-5 w-5" />
          </a>
          <a href={shareFb} target="_blank" rel="noreferrer" title="Facebook" className="btn-brand-ghost">
            <Facebook className="h-5 w-5" />
          </a>
          <button type="button" className="btn-brand hidden sm:inline-flex items-center gap-2 ml-1" title="Compartilhar">
            <Share2 className="h-4 w-4" />
            <span className="text-sm font-medium">Compartilhar</span>
          </button>
        </div>
      </div>

      {/* HERO */}
      <section className={`mt-4 sm:mt-6 rounded-3xl shadow ring-1 ${highContrast ? 'bg-white ring-black/30 dark:bg-black dark:ring-white/30' : 'bg-white ring-zinc-200/70 dark:bg-zinc-900 dark:ring-zinc-700'}`}>
        <div className="relative rounded-3xl">
          <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl">
            {capa
              ? <img src={capa} alt="" className="h-full w-full object-cover" />
              : <div className="h-full w-full bg-[color:var(--brand-600)]" />
            }
            <div className={`absolute inset-0 ${heroOverlay}`} />
          </div>

          <div className="px-4 sm:px-8 pt-5 pb-4 sm:pb-6">
            {/* avatar central mobile */}
            <div className="flex sm:hidden justify-center -mt-14">
              {foto
                ? <img src={foto} alt={nome} className="h-24 w-24 rounded-full object-cover ring-4 ring-white dark:ring-zinc-900 shadow-xl" />
                : <div className="h-24 w-24 rounded-full bg-[color:var(--brand-100)] ring-4 ring-white dark:ring-zinc-900 shadow-xl flex items-center justify-center text-[color:var(--brand-700)] text-2xl font-semibold">{nome.slice(0, 1)}</div>
              }
            </div>

            <div className="grid grid-cols-12 gap-4 sm:gap-6">
              {/* avatar + nome desktop */}
              <div className="hidden sm:flex col-span-12 lg:col-span-8 items-end gap-4">
                {foto
                  ? <img src={foto} alt={nome} className="h-28 w-28 rounded-full object-cover ring-4 ring-white dark:ring-zinc-900 shadow-xl" />
                  : <div className="h-28 w-28 rounded-full bg-[color:var(--brand-100)] ring-4 ring-white dark:ring-zinc-900 shadow-xl flex items-center justify-center text-[color:var(--brand-700)] text-3xl font-semibold">{nome.slice(0, 1)}</div>
                }
                <div className="pb-1 min-w-0 pr-2">
                  <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white break-words">
                    {nome}
                  </h1>
                </div>
              </div>

              {/* nome mobile */}
              <div className="sm:hidden col-span-12 text-center">
                <h1 className="text-[22px] leading-tight font-semibold tracking-tight text-zinc-900 dark:text-white break-words">
                  {nome}
                </h1>
              </div>

              {/* chips */}
              <div className="col-span-12">
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2">
                  <Chip hc={highContrast}>
                    <Calendar className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                    {nasc} — {fale}{horaFal ? ` • ${horaFal}` : ''}
                  </Chip>
                  {idade != null && <Chip hc={highContrast}>{idade} anos</Chip>}
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2">
                  <Chip hc={highContrast}>
                    <Eye className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                    {views} visualiza{views === 1 ? 'ção' : 'ções'}
                  </Chip>
                  {reacoes > 0 && (
                    <Chip hc={highContrast}>
                      <Heart className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                      {reacoes} reações
                    </Chip>
                  )}
                  {naturalidade && (
                    <Chip hc={highContrast}>
                      <MapPin className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                      <span className="whitespace-normal break-words">Natural de {naturalidade}</span>
                    </Chip>
                  )}
                  {localFalecimento && (
                    <Chip hc={highContrast}>
                      <Clock3 className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                      <span className="whitespace-normal break-words">Falecimento: {localFalecimento}</span>
                    </Chip>
                  )}
                </div>
              </div>

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
            <div className={`${highContrast ? 'bg-white ring-1 ring-black/30 dark:bg-black dark:ring-white/30' : 'bg-white ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:ring-zinc-700'} rounded-3xl p-4 sm:p-6 shadow`}>
              <h2 className="text-[15px] sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[color:var(--brand-700)] dark:text-[color:var(--brand-50)]" />
                Agenda & Locais
              </h2>

              <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
                <AgendaCard title="Velório" data={velorioData} hora={velorioHora} local={localVelorio} icon={Clock3} hc={highContrast} />
                <AgendaCard title="Cerimônia" data={cerimoniaData} hora={cerimoniaHora} local={localCerimonia} icon={Calendar} hc={highContrast} />
                <AgendaCard title="Sepultamento" data={sepData} hora={sepHora} local={localSepultamento} icon={MapPin} hc={highContrast} />

                {data?.qrcodeUrl && (
                  <div className={`${highContrast ? 'bg-white ring-1 ring-black/30 dark:bg-black dark:ring-white/30' : 'bg-white border border-zinc-200/70 dark:bg-zinc-900 dark:border-zinc-700'} rounded-2xl p-4`}>
                    <p className="text-sm font-medium flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                      <QrCode className="h-4 w-4 text-[color:var(--brand-700)] dark:text-[color:var(--brand-50)]" /> QR do Memorial
                    </p>
                    <img src={data.qrcodeUrl} alt="QR do memorial" className="mt-3 h-36 w-36 sm:h-40 sm:w-40 object-contain" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Conteúdo */}
        <main className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Biografia */}
          <section className={`${highContrast ? 'bg-white ring-1 ring-black/30 dark:bg-black dark:ring-white/30' : 'bg-white ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:ring-zinc-700'} rounded-3xl p-4 sm:p-6 shadow`}>
            <h2 className="text-[15px] sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100">Biografia</h2>
            {biografia ? (
              <div className="prose prose-zinc max-w-none mt-2 sm:mt-3 dark:prose-invert">
                <p>{biografia}</p>
              </div>
            ) : (
              <p className="mt-2 sm:mt-3 text-zinc-700 dark:text-zinc-300">
                A família ainda não adicionou uma biografia. Assim que for disponibilizada, aparecerá aqui.
              </p>
            )}
            {epitafio && (
              <blockquote className={`${highContrast ? 'bg-zinc-100 text-zinc-900 ring-1 ring-black/10 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-white/10' : 'bg-zinc-50 text-zinc-700 border border-zinc-200/70 dark:bg-zinc-800/60 dark:text-zinc-200 dark:border-zinc-700'} mt-3 sm:mt-4 rounded-2xl px-4 py-3 italic`}>
                “{epitafio}”
              </blockquote>
            )}
          </section>

          {/* CTA homenagens - sem "Ver reações" */}
          <section
            className="rounded-3xl p-4 sm:p-6 ring-1 ring-[color:var(--brand-100)]
                       bg-gradient-to-r from-[color:var(--brand-50)] to-white
                       dark:from-zinc-800 dark:to-zinc-900 dark:ring-zinc-700"
          >
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 sm:gap-6 items-center">
              <div className="sm:col-span-3">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-[color:var(--brand-700)] dark:text-[color:var(--brand-50)]" />
                  <h3 className="text-[15px] sm:text-base font-semibold text-[color:var(--brand-700)] dark:text-[color:var(--brand-50)]">
                    Homenagens & Reações
                  </h3>
                  {/* badge opcional de contagem (sem botão) */}
                  <span className="ml-1 cta-badge">{reacoes}</span>
                </div>
                <p className="text-[color:var(--brand-700)]/80 dark:text-[color:var(--brand-50)]/80 text-sm mt-1">
                  Deixe uma mensagem, acenda uma vela 🕯️ ou envie flores 🌹 para homenagear {nome}.
                </p>
              </div>

              {/* divisor sutil em telas médias/grandes */}
              <div className="sm:col-span-2 flex items-center sm:justify-end gap-2">
                <div className="hidden sm:block cta-divider" aria-hidden="true" />
                <button type="button" className="btn-brand w-full sm:w-auto">
                  Enviar homenagem
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
