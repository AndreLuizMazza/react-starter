import { ChevronRight, Eye } from 'lucide-react'

function fmtDate(d) {
  if (!d) return '—'
  try {
    const dt = new Date(d)
    const fixed = new Date(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate())
    return fixed.toLocaleDateString('pt-BR')
  } catch {
    return '—'
  }
}

export default function MemorialCard({ item }) {
  const nome = item?.nomeFalecido || item?.nome || 'Sem nome'
  const foto = item?.fotoUrl || item?.foto
  const nasc = fmtDate(item?.dtNascimento)
  const fale = fmtDate(item?.dtFalecimento)
  const views = Number(item?.contadorAcessos ?? 0)

  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-white/90 dark:bg-zinc-900 ring-1 ring-zinc-200/70 dark:ring-zinc-700 shadow-sm hover:shadow-md transition-all"
    >
      {/* faixa sutil no topo */}
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500/70 via-emerald-400 to-emerald-600/80" />

      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-4">
          {foto ? (
            <img
              src={foto}
              alt={nome}
              className="h-14 w-14 rounded-full object-cover ring-2 ring-white dark:ring-zinc-900 shadow-sm"
            />
          ) : (
            <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-800 ring-2 ring-white dark:ring-zinc-900 shadow-sm flex items-center justify-center text-emerald-700 dark:text-emerald-200 font-semibold">
              {nome.slice(0, 1)}
            </div>
          )}

          <div className="min-w-0">
            <h3 className="font-semibold leading-tight truncate text-zinc-900 dark:text-zinc-100">
              {nome}
            </h3>

            {/* Datas */}
            <p className="text-xs sm:text-[13px] truncate text-zinc-600 dark:text-zinc-400">
              {nasc} – {fale}
            </p>

            {/* Visualizações */}
            <p className="mt-0.5 text-xs flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{views} visualiza{views === 1 ? 'ção' : 'ções'}</span>
            </p>
          </div>

          <ChevronRight className="ml-auto shrink-0 h-5 w-5 text-zinc-400 group-hover:text-emerald-600 transition-colors" />
        </div>
      </div>

      {/* brilho de hover */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background:
            'radial-gradient(600px circle at var(--x,80%) var(--y,20%), rgba(16,185,129,.10), transparent 40%)'
        }}
      />
    </div>
  )
}
