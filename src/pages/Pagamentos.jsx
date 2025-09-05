import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '@/lib/api.js'
import useAuth from '@/store/auth.js'

export default function Pagamentos() {
  const { id } = useParams()
  const ensureClientToken = useAuth(s=>s.ensureClientToken)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setError('')
        await ensureClientToken()
        const { data } = await api.get(`/api/v1/contratos/${id}/pagamentos`)
        setItems(Array.isArray(data) ? data : (data?.content || []))
      } catch (e) {
        console.error(e); setError('Falha ao carregar pagamentos')
      } finally { setLoading(false) }
    })()
  }, [id])

  return (
    <section className="section">
      <div className="container-max">
        <h2 className="text-2xl font-bold">Pagamentos do Contrato {id}</h2>
        {loading && <p>Carregando…</p>}
        {error && <p className="text-red-600">{error}</p>}

        <div className="grid gap-3 mt-4">
          {items.map((p, idx) => (
            <div key={p.id || idx} className="card p-4">
              <p className="font-medium">Parcela {p.numeroDuplicata ?? p.numero ?? '—'} • {p.status}</p>
              <p className="text-sm text-slate-600">Venc.: {p.dataVencimento ?? p.vencimento ?? '-'} • Receb.: {p.dataRecebimento ?? '—'}</p>
              <p className="text-sm">Valor: R$ {(p.valorParcela ?? p.valor).toFixed ? (p.valorParcela ?? p.valor).toFixed(2) : Number(p.valorParcela ?? p.valor ?? 0).toFixed(2)} • Receb.: R$ {Number(p.valorRecebido ?? 0).toFixed(2)}</p>
              <div className="text-sm mt-2 flex gap-3">
                {p.linkPagamento && <a className="underline" href={p.linkPagamento} target="_blank">Link de pagamento</a>}
                {p.urlBoleto && <a className="underline" href={p.urlBoleto} target="_blank">Boleto</a>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
