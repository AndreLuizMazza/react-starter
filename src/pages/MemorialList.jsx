import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { listMemorial } from '@/lib/nalapide'
import {
  Search, Eye, Calendar, Cake, HeartCrack, Sun,
  RefreshCcw, Loader2, Info, Flower2, Sprout
} from 'lucide-react'
import { safeYmd, isSameDay, isSameMonthDay, addDays, fmtBR } from '@/lib/dateUtils'

/* ================= Utils ================= */
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
function byNome(a, b) {
  const na = (a.nomeFalecido || a.nome || '').toLowerCase()
  const nb = (b.nomeFalecido || b.nome || '').toLowerCase()
  return na.localeCompare(nb)
}

/* ================= Micro UI ================= */
function PillStat({ icon: Icon, label, value, tone = 'emerald' }) {
  const toneCls =
    tone === 'rose'
      ? 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-200 dark:ring-rose-700'
      : tone === 'sky'
      ? 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-900/30 dark:text-sky-200 dark:ring-sky-700'
      : tone === 'amber'
      ? 'bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-700'
      : 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-700'
  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ring-1 ${toneCls}`}>
      <Icon className="h-4 w-4" />
      <span className="tabular-nums font-semibold">{value}</span>
      <span className="opacity-80">{label}</span>
    </div>
  )
}

function ChipFilter({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm transition ring-1 ${
        active
          ? 'bg-emerald-600 text-white dark:bg-emerald-500'
          : 'text-zinc-700 dark:text-zinc-300 ring-zinc-200/70 dark:ring-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
      }`}
    >
      {children}
    </button>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-700 p-4 bg-white dark:bg-zinc-900 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-700 rounded" />
          <div className="h-3 w-1/3 bg-zinc-200 dark:bg-zinc-700 rounded" />
          <div className="h-3 w-1/4 bg-zinc-200 dark:bg-zinc-700 rounded" />
        </div>
      </div>
    </div>
  )
}

function MemorialCard({ it }) {
  const nome = it.nomeFalecido || it.nome || 'Sem nome'
  const nasc = fmtDate(it.dtNascimento)
  const fale = fmtDate(it.dtFalecimento)
  const views = Number(it.contadorAcessos ?? 0)

  return (
    <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-700 p-4 shadow-sm hover:shadow transition bg-white dark:bg-zinc-900">
      <div className="flex items-center gap-3">
        {it.fotoUrl ? (
          <img
            src={it.fotoUrl}
            alt={nome}
            className="h-14 w-14 rounded-full object-cover ring-2 ring-white dark:ring-zinc-900"
          />
        ) : (
          <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-200 ring-2 ring-white dark:ring-zinc-900 flex items-center justify-center font-semibold">
            {nome.slice(0, 1)}
          </div>
        )}

        <div className="min-w-0">
          <h3 className="font-semibold leading-tight truncate text-zinc-900 dark:text-zinc-100">{nome}</h3>
          <p className="text-sm truncate text-zinc-600 dark:text-zinc-400">{nasc} – {fale}</p>
          <p className="mt-0.5 text-xs flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
            <Eye className="h-3.5 w-3.5" />
            <span>{views} visualiza{views === 1 ? 'ção' : 'ções'}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

/* ================= Página ================= */
export default function MemorialList() {
  const [qp, setQp] = useSearchParams()
  const qInit = qp.get('q') || ''

  const [q, setQ] = useState(qInit)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('all')

  /* ---------- BUSCA (debounce + submit) ---------- */
  const debounceRef = useRef(null)
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      load()
    }, 450)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  async function load() {
    setLoading(true); setError('')
    try {
      // sem paginação por enquanto
      const data = await listMemorial({ q })
      const items = data?.items || data?.rows || data?.content || data || []
      setRows(Array.isArray(items) ? items : [])

      setQp(prev => {
        const n = new URLSearchParams(prev)
        q ? n.set('q', q) : n.delete('q')
        return n
      })
    } catch (e) {
      console.error('[MemorialList] load error', e)
      setError('Não foi possível carregar o memorial.')
    } finally {
      setLoading(false)
    }
  }

  // Submit manual (enter / botão)
  function handleSubmit(e) {
    e?.preventDefault?.()
    clearTimeout(debounceRef.current)
    load()
  }

  function handleClear() {
    setQ('')
    clearTimeout(debounceRef.current)
    load()
  }

  /* ---------- Destaques & Estatísticas (somente conjunto atual) ---------- */
  const today = new Date()
  const withDates = rows.map(it => ({ ...it, _nasc: safeYmd(it.dtNascimento), _fale: safeYmd(it.dtFalecimento) }))

  const falecidosHoje = withDates.filter(it => it._fale && isSameDay(it._fale, today)).sort(byNome)
  const aniversarioNasc = withDates.filter(it => it._nasc && isSameMonthDay(it._nasc, today)).sort(byNome)
  const aniversarioFal = withDates.filter(it => it._fale && isSameMonthDay(it._fale, today)).sort(byNome)
  const setimoDia = withDates.filter(it => it._fale && isSameDay(addDays(it._fale, 7), today)).sort(byNome)

  const stats = {
    hoje: falecidosHoje.length,
    nasc: aniversarioNasc.length,
    fal: aniversarioFal.length,
    setimo: setimoDia.length
  }

  // filtro por aba (sobre o conjunto carregado)
  const filteredRows =
    tab === 'today' ? falecidosHoje :
    tab === 'nasc'  ? aniversarioNasc :
    tab === 'fal'   ? aniversarioFal :
    tab === 'setimo'? setimoDia :
    rows

  const empty = !loading && filteredRows.length === 0

  return (
    <div className="container mx-auto max-w-6xl px-4 md:px-6 py-8">
      {/* ===== HERO / Cabeçalho ===== */}
      <div className="relative overflow-hidden rounded-3xl ring-1 ring-zinc-200/70 dark:ring-zinc-700 mb-6">
        {/* Glow / gradient suave */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(800px circle at 12% 20%, rgba(16,185,129,.12), transparent 40%), radial-gradient(700px circle at 90% 30%, rgba(14,165,233,.10), transparent 40%), linear-gradient(to right, rgba(255,255,255,.96), rgba(255,255,255,.96))'
          }}
        />
        <div className="px-4 md:px-6 pt-5 pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                <Flower2 className="h-5 w-5" />
                <span className="uppercase tracking-wide text-xs font-semibold">Memorial</span>
              </div>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                Memoriais Públicos
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                <Calendar className="inline h-4 w-4 mr-1 -mt-0.5" />
                Hoje é <strong>{fmtBR(new Date())}</strong>.
              </p>
            </div>

            {/* Busca 100% responsiva */}
            <form onSubmit={handleSubmit} className="w-full lg:w-[420px]">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
          
                  <input
                    className="input input-bordered w-full pl-10"
                    placeholder="Buscar por nome…"
                    value={q}
                    onChange={e => setQ(e.target.value)}
                  />
                  {q && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                      title="Limpar"
                    >
                      <RefreshCcw className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="btn btn-primary shrink-0"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                  Buscar
                </button>
              </div>
            </form>
          </div>

          {/* Estatísticas */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <PillStat icon={Sun}    label="Falecidos hoje"    value={stats.hoje}  tone="rose"    />
            <PillStat icon={Cake}   label="Aniv. nascimento"  value={stats.nasc}  tone="sky"     />
            <PillStat icon={HeartCrack} label="Aniv. falecimento" value={stats.fal}   tone="amber"   />
            <PillStat icon={Sprout} label="Sétimo dia"        value={stats.setimo}tone="emerald" />
          </div>

          {/* Barra inferior: filtros (sem paginação) */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ChipFilter active={tab==='all'}    onClick={() => setTab('all')}>Todos</ChipFilter>
              <ChipFilter active={tab==='today'}  onClick={() => setTab('today')}>Hoje</ChipFilter>
              <ChipFilter active={tab==='nasc'}   onClick={() => setTab('nasc')}>Nasc.</ChipFilter>
              <ChipFilter active={tab==='fal'}    onClick={() => setTab('fal')}>Falec.</ChipFilter>
              <ChipFilter active={tab==='setimo'} onClick={() => setTab('setimo')}>7º dia</ChipFilter>
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              Exibindo <strong>{filteredRows.length}</strong> resultados
            </div>
          </div>
        </div>
      </div>

      {/* ===== Destaques em “chips” ===== */}
      {(falecidosHoje.length || aniversarioNasc.length || aniversarioFal.length || setimoDia.length) > 0 && (
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {falecidosHoje.slice(0,1).map(it => {
            const nome = it.nomeFalecido || it.nome || 'Sem nome'
            return (
              <Link key={`h-${it.id||it.slug}`} to={`/memorial/${it.slug || it.id}`}>
                <div className="rounded-2xl p-3 ring-1 ring-rose-100 bg-gradient-to-br from-rose-50 to-white dark:from-rose-900/20 dark:to-zinc-900 dark:ring-zinc-700">
                  <div className="flex items-center gap-3">
                    <Sun className="h-5 w-5 text-rose-500" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{nome}</p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
                        Falecimento: {fmtDate(it.dtFalecimento)}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
          {aniversarioNasc.slice(0,1).map(it => {
            const nome = it.nomeFalecido || it.nome || 'Sem nome'
            return (
              <Link key={`n-${it.id||it.slug}`} to={`/memorial/${it.slug || it.id}`}>
                <div className="rounded-2xl p-3 ring-1 ring-sky-100 bg-gradient-to-br from-sky-50 to-white dark:from-sky-900/20 dark:to-zinc-900 dark:ring-zinc-700">
                  <div className="flex items-center gap-3">
                    <Cake className="h-5 w-5 text-sky-500" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{nome}</p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
                        Nascimento: {fmtDate(it.dtNascimento)}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
          {aniversarioFal.slice(0,1).map(it => {
            const nome = it.nomeFalecido || it.nome || 'Sem nome'
            return (
              <Link key={`f-${it.id||it.slug}`} to={`/memorial/${it.slug || it.id}`}>
                <div className="rounded-2xl p-3 ring-1 ring-amber-100 bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-zinc-900 dark:ring-zinc-700">
                  <div className="flex items-center gap-3">
                    <HeartCrack className="h-5 w-5 text-amber-600" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{nome}</p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
                        Falecimento: {fmtDate(it.dtFalecimento)}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
          {setimoDia.slice(0,1).map(it => {
            const nome = it.nomeFalecido || it.nome || 'Sem nome'
            const s7 = it._fale ? fmtDate(addDays(it._fale, 7)) : '—'
            return (
              <Link key={`s-${it.id||it.slug}`} to={`/memorial/${it.slug || it.id}`}>
                <div className="rounded-2xl p-3 ring-1 ring-emerald-100 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-zinc-900 dark:ring-zinc-700">
                  <div className="flex items-center gap-3">
                    <Sprout className="h-5 w-5 text-emerald-600" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{nome}</p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
                        7º dia: {s7}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* ===== Estados ===== */}
      {error && (
        <p className="text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
          <Info className="h-4 w-4" /> {error}
        </p>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!loading && empty && (
        <div className="text-center py-16">
          <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
            <Search className="h-6 w-6 text-emerald-700 dark:text-emerald-300" />
          </div>
          <h3 className="mt-4 text-lg font-medium">Nenhum memorial encontrado</h3>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Ajuste a busca ou altere os filtros.</p>
          <button className="btn mt-4" onClick={handleClear}>Limpar filtros</button>
        </div>
      )}

      {/* ===== Grid principal ===== */}
      {!loading && !empty && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRows.map((it) => (
              <Link key={it.id || it.slug} to={`/memorial/${it.slug || it.id}`}>
                <MemorialCard it={it} />
              </Link>
            ))}
          </div>

          {/* nota de escopo do filtro */}
          {tab !== 'all' && (
            <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              * Filtro aplicado apenas sobre os resultados carregados.
            </p>
          )}
        </>
      )}
    </div>
  )
}
