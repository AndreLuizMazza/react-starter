// src/components/PlanoCardPro.jsx
import { Link } from 'react-router-dom'
import { pick, money, getMensal } from '@/lib/planUtils.js'
import { Users, Plus, Crown, Layers } from 'lucide-react'

export default function PlanoCardPro({ plano, onSimular }) {
  const foto = pick(plano, 'foto')
  const img = (foto && String(foto).trim().length > 0)
    ? foto
    : 'https://images.unsplash.com/photo-1520975954732-35dd2229963a?q=80&w=1600&auto=format&fit=crop'

  const precoMensal = getMensal(plano)
  const numDepsIncl = Number(pick(plano, 'numero_dependentes', 'numeroDependentes')) || 0
  const valorIncMensal = (Number(pick(plano, 'valor_incremental', 'valorIncremental')) || 0) / 12
  const isBestSeller = Boolean(plano?.bestSeller)

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Badge “Mais vendido” */}
      {isBestSeller && (
        <div className="absolute left-3 top-3 z-10">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/90 px-2.5 py-1 text-xs font-semibold text-white">
            <Crown size={14} />
            Mais vendido
          </span>
        </div>
      )}

      {/* Imagem sem cortes */}
      <div className="h-40 w-full bg-slate-50 flex items-center justify-center">
        <img src={img} alt={plano?.nome || 'Plano'} className="max-h-full max-w-full object-contain" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        {/* Título com ícone: Crown para bestSeller, Layers para os demais */}
        <div className="flex items-start gap-2">
          {isBestSeller ? (
            <Crown size={18} className="mt-0.5 text-slate-700" title="Mais vendido" />
          ) : (
            <Layers size={18} className="mt-0.5 text-slate-600" title="Plano" />
          )}
          <h3 className="text-lg font-semibold tracking-tight text-slate-900 line-clamp-2">
            {plano?.nome}
          </h3>
        </div>

        <p className="mt-1 text-xl font-bold text-slate-900">
          {money(precoMensal)} <span className="text-sm text-slate-500">/mês</span>
        </p>

        <div className="mt-3 space-y-1 text-sm text-slate-600">
          <div className="flex items-center gap-1">
            <Users size={16} />
            Inclui <strong>{numDepsIncl}</strong> dependente(s)
          </div>
          <div className="flex items-center gap-1">
            <Plus size={16} />
            dep. extra: {money(valorIncMensal)}
          </div>
        </div>

        {/* Ações */}
        <div className="mt-auto pt-4 flex gap-2">
          {/* Botão principal: usa tema do tenant (root branco até carregar) */}
          <Link
            to={`/planos/${plano?.id}`}
            className="flex-1 inline-flex items-center justify-center btn-primary text-sm"
          >
            Ver detalhes
          </Link>

          {/* Secundário neutro (não usa cor do tenant) */}
          <button
            onClick={() => onSimular?.(plano)}
            type="button"
            className="flex-1 inline-flex items-center justify-center rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            Simular
          </button>
        </div>
      </div>
    </article>
  )
}
