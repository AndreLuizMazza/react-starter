import { useEffect, useMemo, useState } from 'react'
import api from '@/lib/api.js'
import useAuth from '@/store/auth.js'
import PlanoCardPro from '@/components/PlanoCardPro.jsx'
import { getMensal } from '@/lib/planUtils.js'

/* ---------------- Simulador (PLANO SOMENTE MENSAL) ---------------- */
function SimuladorModal({ plano, onClose }) {
  if (!plano) return null
  const [deps, setDeps] = useState(0)

  // base mensal normalizada (usa valor_unitario OU valor_anual/12)
  const mensalBase = getMensal(plano)

  // incremental MENSAL = anual ÷ 12
  const incMensal =
    (Number(plano?.valor_incremental ?? plano?.valorIncremental ?? 0) || 0) / 12

  const incluidos =
    Number(plano?.numero_dependentes ?? plano?.numeroDependentes ?? 0)
  const extras = Math.max(0, deps - incluidos)
  const totalMensal = mensalBase + extras * incMensal

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">Simular contratação</h3>
            <p className="text-sm text-slate-600">{plano?.nome}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          <label className="text-sm">Quantidade de dependentes</label>
          <input
            type="number"
            min="0"
            max="20"
            value={deps}
            onChange={(e) => setDeps(Number(e.target.value))}
            className="input"
          />

          <div className="text-xs text-slate-500">
            Incluídos sem custo: {incluidos}. Custo extra <b>mensal</b> por
            dependente excedente:{' '}
            {incMensal.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
          </div>

          <div className="mt-2 rounded-xl bg-slate-50 p-4">
            <div className="text-sm text-slate-700">
              Base mensal:{' '}
              {mensalBase.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </div>
            <div className="text-sm text-slate-700">
              Dependentes extras: {extras} ×{' '}
              {incMensal.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </div>
            <div className="mt-2 text-lg font-semibold">
              Total mensal:{' '}
              {totalMensal.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full border border-slate-300 px-4 py-2"
          >
            Cancelar
          </button>
          <button className="rounded-full bg-sky-700 px-4 py-2 font-semibold text-white hover:bg-sky-800">
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---------------- Página Planos ---------------- */
export default function PlanosGrid() {
  const ensureClientToken = useAuth((s) => s.ensureClientToken)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [planos, setPlanos] = useState([])
  const [simPlano, setSimPlano] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        await ensureClientToken()
        setError('')
        let data
        try {
          const res = await api.get('/api/v1/planos?status=ATIVO')
          data = res.data
        } catch (e) {
          if (e?.response?.status === 404 || e?.code === 'ERR_NETWORK') {
            const res2 = await api.get('/api/planos?status=ATIVO')
            data = res2.data
          } else {
            throw e
          }
        }
        const list = Array.isArray(data) ? data : data?.content || []
        setPlanos(list)
      } catch (e) {
        console.error(e)
        const msg =
          e?.response?.data?.error ||
          e?.response?.statusText ||
          e?.message ||
          'Erro desconhecido'
        setError('Não foi possível carregar os planos: ' + msg)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // adiciona precoMensal normalizado
  const withMensal = useMemo(
    () => planos.map((p) => ({ ...p, precoMensal: getMensal(p) })),
    [planos]
  )

  // marca 2º mais caro como "Mais vendido"
  const marcados = useMemo(() => {
    if (!withMensal.length) return []
    const desc = [...withMensal].sort(
      (a, b) => (b.precoMensal || 0) - (a.precoMensal || 0)
    )
    const secondId = desc[1]?.id
    return withMensal.map((p) => ({ ...p, bestSeller: p.id === secondId }))
  }, [withMensal])

  // mostra barato -> caro
  const planosOrdenados = useMemo(
    () => [...marcados].sort((a, b) => (a.precoMensal || 0) - (b.precoMensal || 0)),
    [marcados]
  )

  return (
    <section className="section">
      <div className="container-max">
        <div className="mb-6">
          <h2 className="text-3xl font-black tracking-tight">Planos</h2>
          <p className="mt-1 text-slate-600">
            Escolha seu plano e conclua a contratação em minutos. Sem complicação.
          </p>
        </div>

        {loading && (
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        )}

        {!loading && error && <p className="text-red-600">{error}</p>}

        <div className="grid gap-6 md:grid-cols-3">
          {planosOrdenados.map((p) => (
            <PlanoCardPro key={p.id} plano={p} onSimular={setSimPlano} />
          ))}
        </div>
      </div>

      {simPlano && (
        <SimuladorModal plano={simPlano} onClose={() => setSimPlano(null)} />
      )}
    </section>
  )
}
