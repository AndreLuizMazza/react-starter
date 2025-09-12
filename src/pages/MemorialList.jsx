import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { listMemorial } from '@/lib/nalapide'
import { Search, RefreshCcw, Eye } from 'lucide-react'

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

export default function MemorialList() {
  const [qp, setQp] = useSearchParams()
  const qInit = qp.get('q') || ''
  const pInit = Number(qp.get('page') || 1)

  const [q, setQ] = useState(qInit)
  const [page, setPage] = useState(pInit)
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const perPage = 12
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / perPage)), [total])

  async function load() {
    setLoading(true); setError('')
    try {
      const data = await listMemorial({ q, page, perPage })
      const items = data?.items || data?.rows || data?.content || data || []
      const totalRemote = data?.total || data?.totalElements || items.length || 0
      setRows(Array.isArray(items) ? items : [])
      setTotal(Number(totalRemote) || 0)
      setQp(prev => {
        const n = new URLSearchParams(prev)
        q ? n.set('q', q) : n.delete('q')
        n.set('page', String(page))
        return n
      })
    } catch (e) {
      console.error('[MemorialList] load error', e)
      setError('Não foi possível carregar o memorial.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [page]) // eslint-disable-line

  function onSearch(e) {
    e.preventDefault()
    setPage(1)
    load()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Memoriais Públicos</h1>
        <form onSubmit={onSearch} className="flex items-center gap-2">
          <input
            className="input input-bordered w-72"
            placeholder="Buscar por nome…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">
            <Search className="size-4 mr-2" /> Buscar
          </button>
          <button className="btn" type="button" onClick={() => { setQ(''); setPage(1); load() }}>
            <RefreshCcw className="size-4 mr-2" /> Limpar
          </button>
        </form>
      </header>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p>Carregando…</p>}
      {!loading && rows.length === 0 && !error && (
        <p className="opacity-70">Nenhum registro encontrado.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rows.map((it) => {
          const nome = it.nomeFalecido || it.nome || 'Sem nome'
          const nasc = fmtDate(it.dtNascimento)
          const fale = fmtDate(it.dtFalecimento)
          const views = Number(it.contadorAcessos ?? 0)

          return (
            <Link key={it.id || it.slug} to={`/memorial/${it.slug || it.id}`}>
              <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-700 p-4 shadow-sm hover:shadow transition bg-white dark:bg-zinc-900">
                <div className="flex items-center gap-3">
                  {it.fotoUrl ? (
                    <img
                      src={it.fotoUrl}
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

                    <p className="text-sm truncate text-zinc-600 dark:text-zinc-400">
                      {nasc} – {fale}
                    </p>

                    <p className="mt-0.5 text-xs flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{views} visualiza{views === 1 ? 'ção' : 'ções'}</span>
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {rows.length > 0 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button className="btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Anterior</button>
          <span className="px-3">{page} / {totalPages}</span>
          <button className="btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Próxima</button>
        </div>
      )}
    </div>
  )
}
