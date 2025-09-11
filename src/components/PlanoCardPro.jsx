import { useEffect, useState, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '@/lib/api.js'
import { pick, money, getMensal } from '@/lib/planUtils.js'
import { Users, Plus, Crown, Layers } from 'lucide-react'

/* ========= Novo Placeholder (escudo com check refinado e simétrico) ========= */
const PLACEHOLDER_LIGHT = `data:image/svg+xml;utf8,` + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
  <path d="M24 4l16 9v11c0 11-7 20-16 20S8 35 8 24V13l16-9z"
    stroke="#64748b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M16 24l6 6 10-10"
    stroke="#64748b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`)

const PLACEHOLDER_DARK = `data:image/svg+xml;utf8,` + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
  <path d="M24 4l16 9v11c0 11-7 20-16 20S8 35 8 24V13l16-9z"
    stroke="#cbd5e1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M16 24l6 6 10-10"
    stroke="#cbd5e1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`)

// Decide o placeholder conforme o tema atual
function resolvePlaceholder() {
  try {
    const isDarkClass = document.documentElement.classList?.contains('dark')
    if (isDarkClass) return PLACEHOLDER_DARK
    const mql = window.matchMedia?.('(prefers-color-scheme: dark)')
    return mql?.matches ? PLACEHOLDER_DARK : PLACEHOLDER_LIGHT
  } catch {
    return PLACEHOLDER_LIGHT
  }
}

export default function PlanoCardPro({ plano, onSimular }) {
  const [filled, setFilled] = useState(plano)

  useEffect(() => {
    const needsFetch =
      !plano?.nome || !Number.isFinite(getMensal(plano)) || getMensal(plano) <= 0
    if (!plano?.id || !needsFetch) return
    ;(async () => {
      try {
        const { data } = await api.get(`/api/v1/planos/${plano.id}`, {
          transformRequest: [(d, headers) => { try { delete headers.Authorization } catch {} ; return d }],
        })
        setFilled(prev => ({ ...prev, ...data }))
      } catch {
        try {
          const { data } = await api.get(`/api/v1/planos/${plano.id}`, { headers: { Authorization: '' } })
          setFilled(prev => ({ ...prev, ...data }))
        } catch {}
      }
    })()
  }, [plano])

  const nome = useMemo(() => pick(filled || {}, 'nome', 'name') || 'Plano', [filled])

  const foto = pick(filled || {}, 'foto')
  const initialImg = (foto && String(foto).trim().length > 0) ? String(foto).trim() : resolvePlaceholder()

  const [imgSrc, setImgSrc] = useState(initialImg)
  const [imgLoaded, setImgLoaded] = useState(false)
  const imgRef = useRef(null)

  // Atualiza o src quando mudar a foto ou o tema
  useEffect(() => {
    setImgSrc((foto && String(foto).trim()) || resolvePlaceholder())
  }, [foto])

  // Sempre que o src mudar, reseta o fade e, num próximo tick, verifica se a imagem já está completa
  useEffect(() => {
    setImgLoaded(false)
    // Checagem para imagens vindas do cache após refresh
    const id = requestAnimationFrame(() => {
      const el = imgRef.current
      if (el && el.complete && el.naturalWidth > 0) {
        setImgLoaded(true)
      }
    })
    return () => cancelAnimationFrame(id)
  }, [imgSrc])

  // Reage a mudanças de tema (classe .dark) e preferências do SO
  useEffect(() => {
    const mql = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!mql) return
    const onChange = () => {
      setImgSrc(curr => (curr === PLACEHOLDER_LIGHT || curr === PLACEHOLDER_DARK) ? resolvePlaceholder() : curr)
    }
    try { mql.addEventListener('change', onChange) } catch { mql.addListener?.(onChange) }
    const mo = new MutationObserver(onChange)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => {
      try { mql.removeEventListener('change', onChange) } catch { mql.removeListener?.(onChange) }
      mo.disconnect()
    }
  }, [])

  const handleImgError = () => {
    const ph = resolvePlaceholder()
    if (imgSrc !== ph) setImgSrc(ph)
    else setImgLoaded(true) // evita ficar invisível em erro repetido
  }

  const precoMensalRaw = getMensal(filled)
  const precoMensal = Number.isFinite(precoMensalRaw) ? precoMensalRaw : 0

  const numDepsIncl = Number(pick(filled || {}, 'numero_dependentes', 'numeroDependentes')) || 0
  const valorIncMensal = (Number(pick(filled || {}, 'valor_incremental', 'valorIncremental')) || 0) / 12
  const isBestSeller = Boolean(filled?.bestSeller)

  return (
    <article className="plano-card relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md border-slate-200 dark:border-slate-700 dark:bg-slate-900">
      {isBestSeller && (
        <div className="absolute left-3 top-3 z-10">
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-slate-900/90 text-white dark:bg-white/10 dark:text-white dark:ring-1 dark:ring-white/20 backdrop-blur">
            <Crown size={14} />
            Mais vendido
          </span>
        </div>
      )}

      {/* Imagem com placeholder/fallback */}
      <div className="h-32 w-full flex items-center justify-center bg-slate-50 dark:bg-slate-800/50">
        <img
          ref={imgRef}
          src={imgSrc}
          alt={nome}
          decoding="async"
          className={`max-h-[80%] max-w-[80%] object-contain transition-opacity duration-300 ease-out ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={handleImgError}
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-2">
          {isBestSeller ? (
            <Crown size={18} className="mt-0.5 text-slate-700 dark:text-slate-300" title="Mais vendido" />
          ) : (
            <Layers size={18} className="mt-0.5 text-slate-600 dark:text-slate-400" title="Plano" />
          )}
          <h3 className="plano-title text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100 line-clamp-2">
            {nome}
          </h3>
        </div>

        <div className="mt-1 flex items-baseline gap-1">
          <span className="plano-price text-xl font-extrabold text-slate-900 dark:text-white">
            {precoMensal > 0 ? money(precoMensal) : '—'}
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400">/mês</span>
        </div>

        <div className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1">
            <Users size={16} className="text-slate-500 dark:text-slate-400" />
            Inclui <strong className="font-semibold">{numDepsIncl}</strong> dependente(s)
          </div>
          <div className="flex items-center gap-1">
            <Plus size={16} className="text-slate-500 dark:text-slate-400" />
            dep. extra: {money(valorIncMensal)}
          </div>
        </div>

        <div className="mt-auto pt-4 flex gap-2">
          <Link
            to={`/planos/${filled?.id ?? plano?.id}`}
            className="flex-1 inline-flex items-center justify-center btn-primary text-sm"
          >
            Ver detalhes
          </Link>
          <button
            type="button"
            onClick={() => onSimular?.(filled ?? plano)}
            className="flex-1 inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 dark:focus:ring-slate-600"
          >
            Simular
          </button>
        </div>
      </div>
    </article>
  )
}
