// src/components/PagamentoFacil.jsx
import { useMemo, useState } from 'react'

const fmtBRL = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v || 0))
// Formata "YYYY-MM-DD" -> "dd/MM/YYYY"
const fmtData = (s) => {
  if (!s) return '—'
  const [Y, M, D] = String(s).split('-')
  return `${D}/${M}/${Y}`
}

function Badge({ children, kind = 'neutral' }) {
  const map = {
    neutral: 'bg-slate-100 text-slate-700',
    success: 'bg-green-100 text-green-700',
    danger: 'bg-red-100 text-red-700',
    warn: 'bg-yellow-100 text-yellow-700',
    info: 'bg-blue-100 text-blue-700',
  }
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[kind]}`}>{children}</span>
}

/**
 * Props:
 * - parcelaFoco: objeto de pagamento (ABERTA) ou null
 * - proximas: array de pagamentos ABERTOS restantes (sem misturar)
 * - historico: array de pagamentos não-abertos
 * - isAtraso: (p) => boolean  // vindo do hook
 */
export default function PagamentoFacil({ parcelaFoco, proximas = [], historico = [], isAtraso = () => false }) {
  const [copied, setCopied] = useState(false)
  const foco = parcelaFoco
  const temFoco = Boolean(foco)
  const focoAtraso = temFoco && isAtraso(foco)

  const acoesFoco = useMemo(() => {
    if (!foco) return []
    const a = []
    if (foco.linkPagamento) a.push({ tipo: 'checkout', label: 'Pagar no checkout', href: foco.linkPagamento })
    if (foco.urlBoleto)    a.push({ tipo: 'boleto',   label: 'Abrir boleto',        href: foco.urlBoleto })
    if (foco.pixQrcode)    a.push({ tipo: 'pix',      label: 'Copiar código PIX',   copy: foco.pixQrcode })
    return a
  }, [foco])

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true); setTimeout(() => setCopied(false), 1800)
    } catch {
      const ta = document.createElement('textarea'); ta.value = text
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove()
      setCopied(true); setTimeout(() => setCopied(false), 1800)
    }
  }

  return (
    <div className="card p-5">
      <h3 className="text-lg font-semibold mb-2">Pagamento</h3>

      {!temFoco ? (
        <div className="p-4 rounded border bg-green-50 text-green-800">
          <p className="font-medium">Tudo em dia!</p>
          <p className="text-sm">Nenhuma parcela aberta no momento.</p>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-sm">Parcela</span>
                <span className="font-semibold">#{foco.numeroDuplicata || foco.numero}</span>
                {focoAtraso ? (
                  <Badge kind="danger">EM ATRASO</Badge>
                ) : (
                  <Badge kind="warn">ABERTA</Badge>
                )}
              </div>
              <div className="mt-1 text-2xl font-bold">{fmtBRL(foco.valorParcela)}</div>
              <div className="text-sm text-slate-600">Vencimento: {fmtData(foco.dataVencimento)}</div>
            </div>

            {foco.pixImage ? (
              <img
                src={foco.pixImage}
                alt="QR Code PIX"
                className="w-28 h-28 rounded border"
                referrerPolicy="no-referrer"
              />
            ) : null}
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {acoesFoco.map((a, i) =>
              a.href ? (
                <a key={i} href={a.href} target="_blank" rel="noreferrer" className="btn-primary text-center">
                  {a.label}
                </a>
              ) : (
                <button key={i} className="btn-secondary" onClick={() => copy(a.copy)}>
                  {copied ? 'Copiado!' : a.label}
                </button>
              )
            )}
          </div>

          {foco.pixQrcode ? (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-slate-600">Ver código PIX (copia e cola)</summary>
              <textarea readOnly value={foco.pixQrcode} className="mt-2 w-full rounded border p-2 text-xs bg-slate-50" rows={4} />
              <div className="mt-2">
                <button className="btn-secondary" onClick={() => copy(foco.pixQrcode)}>
                  {copied ? 'Copiado!' : 'Copiar código PIX'}
                </button>
              </div>
            </details>
          ) : null}
        </>
      )}

      {/* Próximas: somente ABERTAS restantes (não mistura e sem duplicar) */}
      {proximas.length > 0 && (
        <div className="mt-6">
          <p className="text-sm text-slate-600 mb-2">Próximas parcelas</p>
          <ul className="space-y-2">
            {proximas.map((p) => {
              const atrasada = isAtraso(p)
              return (
                <li key={p.id} className="flex items-center justify-between rounded border p-3">
                  <div>
                    <div className="font-medium">
                      #{p.numeroDuplicata || p.numero} • {fmtBRL(p.valorParcela)}{' '}
                      {atrasada ? <Badge kind="danger">EM ATRASO</Badge> : null}
                    </div>
                    <div className="text-xs text-slate-500">
                      Vencimento: {fmtData(p.dataVencimento)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {p.linkPagamento ? <a className="btn-light" target="_blank" rel="noreferrer" href={p.linkPagamento}>Checkout</a> : null}
                    {p.urlBoleto ? <a className="btn-light" target="_blank" rel="noreferrer" href={p.urlBoleto}>Boleto</a> : null}
                    {p.pixQrcode ? <button className="btn-light" onClick={() => copy(p.pixQrcode)}>{copied ? 'Copiado!' : 'PIX'}</button> : null}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Histórico (não-abertas) */}
      {historico.length > 0 && (
        <details className="mt-6">
          <summary className="cursor-pointer text-sm text-slate-600">Histórico de pagamentos</summary>
          <ul className="mt-3 divide-y rounded border">
            {historico.map((p) => (
              <li key={p.id} className="p-3 text-sm flex items-center justify-between">
                <div>
                  <div className="font-medium">#{p.numeroDuplicata || p.numero} • {fmtBRL(p.valorParcela)}</div>
                  <div className="text-xs text-slate-500">
                    Venc.: {fmtData(p.dataVencimento)}{p.dataRecebimento ? ` • Pago em ${fmtData(p.dataRecebimento)}` : ''}
                  </div>
                </div>
                <Badge kind={String(p.status).toUpperCase() === 'PAGA' ? 'success' : 'info'}>
                  {String(p.status || '').toUpperCase()}
                </Badge>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
