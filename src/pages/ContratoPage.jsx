import { useState } from 'react'
import api from '@/lib/api.js'
import useAuth from '@/store/auth.js'
import { Link } from 'react-router-dom'

export default function ContratoPage() {
  const ensureClientToken = useAuth(s=>s.ensureClientToken)
  const [cpf, setCpf] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [dados, setDados] = useState(null)

  async function buscar(e) {
    e.preventDefault()
    setErro(''); setDados(null)
    if (!cpf) { setErro('Informe o CPF'); return }
    setLoading(true)
    try {
      await ensureClientToken()
      const { data } = await api.get(`/api/v1/contratos/cpf/${encodeURIComponent(cpf)}`)
      setDados(data)
    } catch (e) { console.error(e); setErro('Falha ao buscar contrato') }
    finally { setLoading(false) }
  }

  const contratos = Array.isArray(dados) ? dados : (dados?.contratos || (dados ? [dados] : []))

  return (
    <section className="section">
      <div className="container-max max-w-xl">
        <h2 className="text-2xl font-bold mb-4">Contrato por CPF</h2>
        <form onSubmit={buscar} className="card p-5 flex flex-col gap-3">
          <input className="input" placeholder="CPF (apenas números)" value={cpf} onChange={e=>setCpf(e.target.value.replace(/\D/g,''))} />
          <button className="btn-primary" disabled={loading}>{loading?'Buscando…':'Pesquisar'}</button>
          {erro && <p className="text-red-600 text-sm">{erro}</p>}
        </form>

        {contratos?.length > 0 && (
          <div className="grid gap-4 mt-6">
            {contratos.map((c, i) => (
              <div key={c.id || c.numeroContrato || i} className="card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Contrato {c.numeroContrato ?? c.id}</div>
                    <div className="text-slate-600 text-sm">Titular: {c.nome ?? c.titularNome ?? '-'}</div>
                  </div>
                  {c.atrasado && <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700">Em atraso</span>}
                </div>
                <div className="grid md:grid-cols-3 gap-4 mt-3 text-sm text-slate-700">
                  <div>Ativo: <strong>{String(c.contratoAtivo ?? c.ativo ?? false)}</strong></div>
                  <div>Parcelas em atraso: <strong>{c.parcelasEmAtraso ?? 0}</strong></div>
                  <div>Plano: <strong>{c.planoNome ?? '-'}</strong></div>
                </div>
                <div className="mt-3">
                  <Link className="btn-primary" to={`/contratos/${c.id || c.numeroContrato}/pagamentos`}>Ver parcelas</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
