import { CalendarDays, HeartHandshake, Sparkles } from 'lucide-react'

// tabs/“chips” de exemplo visual — sem alterar a chamada da API por enquanto.
// Se quiser filtrar por campos reais, basta propagar onChange para o MemorialList.
const presets = [
  { key: 'todos', label: 'Todos', icon: Sparkles },
  { key: 'nasc', label: 'Nascimento', icon: CalendarDays },
  { key: 'falec', label: 'Falecimento', icon: HeartHandshake },
  { key: 'setimo', label: '7º Dia', icon: CalendarDays },
]

export default function MemorialFilters({ value = 'todos', onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {presets.map(p => {
        const ActiveIcon = p.icon
        const active = value === p.key
        return (
          <button
            key={p.key}
            onClick={() => onChange?.(p.key)}
            className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition
              ${active
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'}`}
          >
            <ActiveIcon className={`h-4 w-4 ${active ? 'text-white' : 'text-emerald-600 group-hover:opacity-90'}`} />
            {p.label}
          </button>
        )
      })}
    </div>
  )
}
