import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import api from '@/lib/api.js'
import { pick, money, getMensal } from '@/lib/planUtils.js'
import { Users, Plus, Crown, Layers } from 'lucide-react'

/**
 * Card de plano com:
 * - imagem centrada (object-contain)
 * - badge "Mais vendido"
 * - fallback para carregar nome/preço se vierem faltando da listagem
 * - classes extras (.plano-card, .plano-title, .plano-price) para CSS de dark-theme
 */
export default function PlanoCardPro({ plano, onSimular }) {
  const [filled, setFilled] = useState(plano)

  // Fallback: se a API de listagem vier sem nome ou sem valores, busca o plano individual
  useEffect(() => {
    const needsFetch =
      !plano?.nome || !Number.isFinite(getMensal(plano)) || getMensal(plano) <= 0

    if (!plano?.id || !needsFetch) return

    ;(async () => {
      try {
        const { data } = await api.get(`/api/v1/planos/${plano.id}`, {
          transformRequest: [
            (d, headers) => {
              try { delete headers.Authorization } catch {}
              return d
            },
          ],
        })
        setFilled((prev) => ({ ...prev, ...data }))
      } catch {
        // tenta sem header explicitamente
        try {
          const { data } = await api.get(`/api/v1/planos/${plano.id}`, {
            headers: { Authorization: '' },
          })
          setFilled((prev) => ({ ...prev, ...data }))
        } catch {
          // ignora – fica com o que já tem
        }
      }
    })()
  }, [plano])

  // Usa sempre o objeto "filled" (pode conter dados complementares)
  const nome = useMemo(() => pick(filled || {}, 'nome', 'name') || 'Plano', [filled])

  const foto = pick(filled || {}, 'foto')
  const img = (foto && String(foto).trim().length > 0)
    ? foto
    : 'https://images.unsplash.com/photo-1520975954732-35dd2229963a?q=80&w=1600&auto=format&fit=crop'

  const precoMensalRaw = getMensal(filled)
  const precoMensal = Number.isFinite(precoMensalRaw) ? precoMensalRaw : 0

  const numDepsIncl = Number(pick(filled || {}, 'numero_dependentes', 'numeroDependentes')) || 0
  const valorIncMensal =
    (Number(pick(filled || {}, 'valor_incremental', 'valorIncremental')) || 0) / 12
  const isBestSeller = Boolean(filled?.bestSeller)

  return (
    <article
      className="
        plano-card
        relative flex h-full flex-col overflow-hidden rounded-2xl
        border bg-white shadow-sm transition hover:shadow-md
        border-slate-200 dark:border-slate-700 dark:bg-slate-900
      "
    >
      {/* Badge “Mais vendido” */}
      {isBestSeller && (
        <div className="absolute left-3 top-3 z-10">
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-slate-900/90 text-white dark:bg-white/10 dark:text-white dark:ring-1 dark:ring-white/20 backdrop-blur">
            <Crown size={14} />
            Mais vendido
          </span>
        </div>
      )}

      {/* Imagem (sem cortes) */}
      <div className="h-40 w-full flex items-center justify-center bg-slate-50 dark:bg-slate-800/50">
        <img
          src={img}
          alt={nome}
          className="max-h-full max-w-full object-contain"
          loading="lazy"
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        {/* Título */}
        <div className="flex items-start gap-2">
          {isBestSeller ? (
            <Crown size={18} className="mt-0.5 text-slate-700 dark:text-slate-300" title="Mais vendido" />
          ) : (
            <Layers size={18} className="mt-0.5 text-slate-600 dark:text-slate-400" title="Plano" />
          )}
          <h3
            className="
              plano-title
              text-lg font-semibold tracking-tight
              text-slate-900 dark:text-slate-100 line-clamp-2
            "
          >
            {nome}
          </h3>
        </div>

        {/* Preço */}
        <div className="mt-1 flex items-baseline gap-1">
          <span
            className="
              plano-price
              text-xl font-extrabold
              text-slate-900 dark:text-white
            "
          >
            {precoMensal > 0 ? money(precoMensal) : '—'}
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400">/mês</span>
        </div>

        {/* Informações */}
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

        {/* Ações */}
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
            className="
              flex-1 inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300
              dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 dark:focus:ring-slate-600
            "
          >
            Simular
          </button>
        </div>
      </div>
    </article>
  )
}
