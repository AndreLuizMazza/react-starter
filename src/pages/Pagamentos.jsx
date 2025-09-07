// src/pages/Pagamentos.jsx
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '@/lib/api.js'

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
function fmtValor(v) {
  const n = Number(v ?? 0)
  return BRL.format(isFinite(n) ? n : 0)
}
function fmtData(d) {
  if (!d) return '—'
  // aceita "YYYY-MM-DD", "YYYY-MM-DDTHH:mm:ss", Date, etc.
  try {
    const date = typeof d === 'string' && d.length <= 10 ? new Date(`${d}T00:00:00`) : new Date(d)
    return isNaN(date) ? String(d) : date.toLocaleDateString('pt-BR')
  } catch {
    return String(d)
  }
}

export default function Pagamentos() {
  const { id } = useParams()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      setLoading(true)
      setError('')
      try {
        // ✅ sem ensureClientToken — o BFF deve fazer fallback do token de cliente
        const { data } = await api.get(`/api/v1/contratos/${id}/pagamentos`)
        const list = Array.isArray(data) ? data : (data?.content || [])
        setItems(list)
      } catch (e) {
        console.error(e)
        const msg =
          e?.response?.data?.error ||
          e?.response?.statusText ||
          e?.message ||
          'Erro desconhecido'
        setError('Falha ao carregar pagamentos: ' + msg)
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  return (
    <section className="section">
      <div className="container-max">
        <h2 className="text-2xl font-bold">Pagamentos do Contrato {id}</h2>

        {loading && <p className="mt-4">Carregando…</p>}
        {!loading && error && <p className="mt-4 text-red-600">{error}</p>}

        {!loading && !error && items.length === 0 && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-slate-700">
            Nenhuma parcela encontrada para este contrato.
          </div>
        )}

        <div className="grid gap-3 mt-4">
          {items.map((p, idx) => {
            const numero = p.numeroDuplicata ?? p.numero ?? idx + 1
            const status = p.status ?? p.situacao ?? '—'
            const venc = fmtData(p.dataVencimento ?? p.vencimento)
            const receb = fmtData(p.dataRecebimento)
            const valor = fmtValor(p.valorParcela ?? p.valor)
            const valorRec = fmtValor(p.valorRecebido)

            return (
              <div key={p.id || `${numero}-${venc}-${idx}`} className="card p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">
                    Parcela {numero} • {status}
                  </p>
                  {String(status).toUpperCase().includes('ATRAS') && (
                    <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700">
                      Em atraso
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-600 mt-1">
                  Venc.: <strong>{venc}</strong> • Receb.: <strong>{receb}</strong>
                </p>
                <p className="text-sm mt-1">
                  Valor: <strong>{valor}</strong> • Recebido: <strong>{valorRec}</strong>
                </p>

                {(p.linkPagamento || p.urlBoleto) && (
                  <div className="text-sm mt-2 flex gap-3">
                    {p.linkPagamento && (
                      <a className="underline" href={p.linkPagamento} target="_blank" rel="noreferrer">
                        Link de pagamento
                      </a>
                    )}
                    {p.urlBoleto && (
                      <a className="underline" href={p.urlBoleto} target="_blank" rel="noreferrer">
                        Boleto
                      </a>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
