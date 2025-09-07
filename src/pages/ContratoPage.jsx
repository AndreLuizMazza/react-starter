// src/pages/ContratoPage.jsx
import { useState } from 'react'
import api from '@/lib/api.js'
import { Link } from 'react-router-dom'

function somenteNumeros(v = '') {
  return String(v).replace(/\D/g, '')
}

export default function ContratoPage() {
  const [cpf, setCpf] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [dados, setDados] = useState(null)

  async function buscar(e) {
    e.preventDefault()
    setErro('')
    setDados(null)

    const clean = somenteNumeros(cpf)
    if (!clean || clean.length !== 11) {
      setErro('Informe um CPF válido (11 dígitos).')
      return
    }

    setLoading(true)
    try {
      // ✅ sem ensureClientToken — o BFF faz fallback do token de cliente
      const { data } = await api.get(`/api/v1/contratos/cpf/${encodeURIComponent(clean)}`)
      setDados(data)
    } catch (e) {
      console.error(e)
      const msg =
        e?.response?.data?.error ||
        e?.response?.statusText ||
        e?.message ||
        'Erro desconhecido'
      setErro('Falha ao buscar contrato: ' + msg)
    } finally {
      setLoading(false)
    }
  }

  // normaliza retorno (array, page.content ou único objeto)
  const contratos = Array.isArray(dados)
    ? dados
    : (dados?.contratos ||
       dados?.content ||
       (dados ? [dados] : []))

  return (
    <section className="section">
      <div className="container-max max-w-xl">
        <h2 className="text-2xl font-bold mb-4">Contrato por CPF</h2>

        <form onSubmit={buscar} className="card p-5 flex flex-col gap-3">
          <input
            className="input"
            placeholder="CPF (apenas números)"
            inputMode="numeric"
            value={cpf}
            onChange={(e) => setCpf(somenteNumeros(e.target.value))}
            maxLength={11}
          />
          <button className="btn-primary" disabled={loading}>
            {loading ? 'Buscando…' : 'Pesquisar'}
          </button>
          {erro && <p className="text-red-600 text-sm">{erro}</p>}
        </form>

        {!loading && !erro && dados && contratos.length === 0 && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 text-slate-700">
            Nenhum contrato encontrado para este CPF.
          </div>
        )}

        {contratos?.length > 0 && (
          <div className="grid gap-4 mt-6">
            {contratos.map((c, i) => (
              <div key={c.id || c.numeroContrato || i} className="card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">
                      Contrato {c.numeroContrato ?? c.id ?? '—'}
                    </div>
                    <div className="text-slate-600 text-sm">
                      Titular: {c.nome ?? c.titularNome ?? '—'}
                    </div>
                  </div>
                  {(c.atrasado || c.emAtraso) && (
                    <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700">
                      Em atraso
                    </span>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-4 mt-3 text-sm text-slate-700">
                  <div>
                    Ativo:{' '}
                    <strong>
                      {String(c.contratoAtivo ?? c.ativo ?? false)}
                    </strong>
                  </div>
                  <div>
                    Parcelas em atraso:{' '}
                    <strong>{c.parcelasEmAtraso ?? c.qtdParcelasAtraso ?? 0}</strong>
                  </div>
                  <div>
                    Plano: <strong>{c.planoNome ?? c.plano?.nome ?? '—'}</strong>
                  </div>
                </div>

                <div className="mt-3">
                  <Link
                    className="btn-primary"
                    to={`/contratos/${c.id || c.numeroContrato}/pagamentos`}
                  >
                    Ver parcelas
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
