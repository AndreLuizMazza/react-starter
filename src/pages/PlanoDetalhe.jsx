import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '@/lib/api.js'
import {
  pick,
  money,
  encontrarFaixaPorIdade,
  isIsento,
  getMensal,
} from '@/lib/planUtils.js'
import { Sparkles, CheckCircle2, ShieldCheck, Clock3 } from 'lucide-react'

export default function PlanoDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [plano, setPlano] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // simulador
  const [idadeTitular, setIdadeTitular] = useState(30)
  const [dependentes, setDependentes] = useState([])

  const simRef = useRef(null)
  const addLockRef = useRef(false)

  async function fetchPlano(planId) {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get(`/api/v1/planos/${planId}`, {
        transformRequest: [
          (d, headers) => {
            try { delete headers.Authorization } catch {}
            return d
          },
        ],
      })
      setPlano(data)
    } catch (e) {
      try {
        const { data } = await api.get(`/api/v1/planos/${planId}`, {
          headers: { Authorization: '' },
        })
        setPlano(data)
      } catch (err) {
        console.error(err)
        setError(`Falha ao carregar o plano (id: ${planId}).`)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchPlano(id)
  }, [id])

  // --------- Cálculos base ----------
  const baseMensal = getMensal(plano)
  const valorAdesao = Number(
    pick(plano || {}, 'valorAdesao', 'valor_adesao') || 0
  )
  const numDepsIncl = Number(
    pick(plano || {}, 'numeroDependentes', 'numero_dependentes') || 0
  )

  const valorIncrementalAnual = Number(
    pick(plano || {}, 'valorIncremental', 'valor_incremental') || 0
  )
  const valorIncrementalMensal = valorIncrementalAnual / 12

  const faixasDep = pick(plano || {}, 'faixasEtarias', 'faixas_etarias') || []
  const faixasTit =
    pick(plano || {}, 'faixasEtariasTitular', 'faixas_etarias_titular') || []
  const isencoes = pick(plano || {}, 'isencoes') || []
  const unidadeCarencia =
    pick(plano || {}, 'unidadeCarencia', 'unidade_carencia') || 'DIAS'
  const periodoCarencia =
    pick(plano || {}, 'periodoCarencia', 'periodo_carencia') || 0
  const parentescosAll = pick(plano || {}, 'parentescos') || [
    'CONJUGE',
    'FILHO',
    'PAI',
    'MAE',
  ]
  const parentescos = Array.isArray(parentescosAll)
    ? parentescosAll.filter((p) => String(p).toUpperCase() !== 'TITULAR')
    : ['FILHO']

  const faixaTit = useMemo(
    () => encontrarFaixaPorIdade(faixasTit, idadeTitular),
    [faixasTit, idadeTitular]
  )
  const custoTitularFaixa = Number(faixaTit?.valor || 0)
  const custoTitular = baseMensal + custoTitularFaixa

  const extrasCount = Math.max(0, dependentes.length - Number(numDepsIncl))
  const custoIncrementalExtras = extrasCount * valorIncrementalMensal

  const custosDependentes = dependentes.map((d) => {
    const faixa = encontrarFaixaPorIdade(faixasDep, Number(d.idade || 0))
    const isento = isIsento(isencoes, Number(d.idade || 0), d.parentesco)
    const valorFaixa = isento ? 0 : Number(faixa?.valor || 0)
    return { ...d, valorFaixa, isento, faixa }
  })
  const somaFaixasDep = custosDependentes.reduce((acc, d) => acc + d.valorFaixa, 0)

  const totalMensal = custoTitular + somaFaixasDep + custoIncrementalExtras
  const totalAnual = totalMensal * 12

  function addDependente() {
    if (addLockRef.current) return
    addLockRef.current = true
    setDependentes((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        parentesco: parentescos[0] || 'FILHO',
        idade: 0,
      },
    ])
    setTimeout(() => (addLockRef.current = false), 250)
  }
  function updDependente(i, patch) {
    setDependentes((prev) => {
      const copy = prev.slice()
      copy[i] = { ...copy[i], ...patch }
      return copy
    })
  }
  function delDependente(i) {
    setDependentes((prev) => {
      const copy = prev.slice()
      copy.splice(i, 1)
      return copy
    })
  }
  const scrollToSim = () =>
    simRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  if (loading) {
    return (
      <section className="section">
        <div className="container-max">
          <div className="h-80 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="section">
        <div className="container-max">
          <p className="text-red-600 dark:text-red-400 mb-3">{error}</p>
          <button
            onClick={() => fetchPlano(id)}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-100"
          >
            Tentar de novo
          </button>
        </div>
      </section>
    )
  }

  if (!plano) return null

  const foto = pick(plano, 'foto')
  const img =
    foto && String(foto).trim().length > 0
      ? foto
      : 'https://images.unsplash.com/photo-1520975954732-35dd2229963a?q=80&w=1600&auto=format&fit=crop'

  return (
    <section className="section">
      <div className="container-max">
        {/* voltar */}
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-600 dark:text-slate-100"
          >
            ← Voltar
          </button>
        </div>

        {/* HERO */}
        <div className="grid gap-8 md:grid-cols-[1.2fr,1fr]">
          {/* imagem sem cortes */}
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/40">
            <div className="h-72 w-full p-4 flex items-center justify-center">
              <img
                src={img}
                alt={plano.nome}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <h1 className="text-3xl font-extrabold tracking-tight">
              {plano.nome}
            </h1>

            <p className="mt-2 text-lg text-slate-700 dark:text-slate-200">
              {money(baseMensal)}{' '}
              <span className="text-sm text-slate-500 dark:text-slate-400">
                /mês (base)
              </span>
            </p>

            <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
              <div>
                <span className="text-slate-500 dark:text-slate-400">
                  Dependentes incluídos:{' '}
                </span>
                <strong>{numDepsIncl}</strong>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">
                  + por dependente:{' '}
                </span>
                <strong>{money(valorIncrementalMensal)}</strong>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">
                  Carência:{' '}
                </span>
                <strong>
                  {periodoCarencia} {unidadeCarencia}
                </strong>
              </div>
            </div>

            {/* CTA topo */}
            <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-4 dark:bg-sky-900/20 dark:border-sky-800/40">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-sky-600/90 p-2 text-white">
                  <Sparkles size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-slate-800 font-semibold dark:text-slate-100">
                    Simule o plano em segundos
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Informe a idade do titular e adicione dependentes para ver o
                    valor exato.
                  </p>
                </div>
                <button
                  onClick={scrollToSim}
                  className="rounded-full bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
                >
                  Simular agora
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck size={14} className="text-slate-700 dark:text-slate-200" />
                  Sem fidelidade
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock3 size={14} className="text-slate-700 dark:text-slate-200" />
                  Ativação rápida
                </span>
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 size={14} className="text-slate-700 dark:text-slate-200" />
                  Pagamento seguro
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SIMULADOR + RESUMO */}
        <div ref={simRef} className="mt-10 grid gap-6 md:grid-cols-3">
          {/* Simulador */}
          <div className="card md:col-span-2 p-6">
            <h3 className="mb-3 text-lg font-semibold">Simulador de contratação</h3>

            <div className="grid gap-5">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="label">Idade do titular</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    max="120"
                    value={idadeTitular}
                    onChange={(e) => setIdadeTitular(Number(e.target.value))}
                  />
                  {faixaTit && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Faixa do titular: {faixaTit.idadeMinima ?? faixaTit.idade_minima}
                      –{faixaTit.idadeMaxima ?? faixaTit.idade_maxima} • Adicional:{' '}
                      {money(faixaTit.valor)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="label">Adesão (uma vez)</label>
                  <input className="input" value={money(valorAdesao)} readOnly />
                </div>
                <div>
                  <label className="label">Carência</label>
                  <input
                    className="input"
                    value={`${periodoCarencia} ${unidadeCarencia}`}
                    readOnly
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Dependentes</h4>
                  <button className="btn-primary" type="button" onClick={addDependente}>
                    Adicionar dependente
                  </button>
                </div>

                <div className="mt-3 grid gap-3">
                  {dependentes.map((d, i) => {
                    const faixa = encontrarFaixaPorIdade(
                      faixasDep,
                      Number(d.idade || 0)
                    )
                    const isento = isIsento(
                      isencoes,
                      Number(d.idade || 0),
                      d.parentesco
                    )
                    const val = isento ? 0 : Number(faixa?.valor || 0)
                    return (
                      <div
                        key={d.id || i}
                        className="flex flex-col gap-3 rounded-xl border p-3 md:flex-row md:items-center dark:border-slate-700"
                      >
                        <div className="grid flex-1 gap-3 md:grid-cols-3">
                          <div>
                            <label className="label">Parentesco</label>
                            <select
                              className="input"
                              value={d.parentesco}
                              onChange={(e) =>
                                updDependente(i, { parentesco: e.target.value })
                              }
                            >
                              {parentescos.map((p) => (
                                <option key={p} value={p}>
                                  {p}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="label">Idade</label>
                            <input
                              className="input"
                              type="number"
                              min="0"
                              max="120"
                              value={d.idade}
                              onChange={(e) =>
                                updDependente(i, { idade: Number(e.target.value) })
                              }
                            />
                          </div>
                          <div>
                            <label className="label">Valor (faixa)</label>
                            <input className="input" value={money(val)} readOnly />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {isento && (
                            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                              Isento
                            </span>
                          )}
                          <button
                            type="button"
                            className="text-red-600 underline dark:text-red-400"
                            onClick={() => delDependente(i)}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* contadores */}
                <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  <div>
                    Dependentes informados: <strong>{dependentes.length}</strong> •
                    Incluídos sem custo: <strong>{numDepsIncl}</strong> • Excedentes:{' '}
                    <strong>{extrasCount}</strong>
                  </div>
                  {dependentes.length > 0 && (
                    <p className="mt-1 text-xs">
                      Excedentes são cobrados a{' '}
                      <strong>{money(valorIncrementalMensal)}</strong> por mês cada.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Resumo */}
          <div className="card p-6 md:sticky md:top-24">
            <h3 className="mb-3 text-lg font-semibold">Resumo</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Base mensal</span>
                <span>{money(baseMensal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Adicional do titular (faixa)</span>
                <span>{money(custoTitularFaixa)}</span>
              </div>
              <div className="flex justify-between">
                <span>Dependentes (faixas)</span>
                <span>{money(somaFaixasDep)}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  Excedentes ({extrasCount}) × {money(valorIncrementalMensal)}
                </span>
                <span>{money(custoIncrementalExtras)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Total mensal</span>
                <span>{money(totalMensal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total anual</span>
                <span>{money(totalAnual)}</span>
              </div>
              <div className="flex justify-between">
                <span>Adesão (uma vez)</span>
                <span>{money(valorAdesao)}</span>
              </div>
            </div>
            <button className="btn-primary mt-4 w-full">Contratar</button>
            <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
              Sem fidelidade • Ativação rápida • Atendimento humano
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
