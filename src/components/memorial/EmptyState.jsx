import { Sprout } from 'lucide-react'

export default function EmptyState({ title = 'Nenhum registro', subtitle = 'Tente ajustar sua busca.' }) {
  return (
    <div className="mx-auto max-w-md text-center rounded-3xl border border-dashed border-zinc-300 p-10 bg-white/60">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
        <Sprout className="h-7 w-7 text-emerald-600" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 text-zinc-500">{subtitle}</p>
    </div>
  )
}
