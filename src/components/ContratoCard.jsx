// src/components/ContratoCard.jsx
function Badge({ children, kind = 'neutral' }) {
  const map = {
    neutral: 'bg-slate-100 text-slate-700',
    success: 'bg-green-100 text-green-700',
    danger: 'bg-red-100 text-red-700',
    warn: 'bg-yellow-100 text-yellow-700',
    info: 'bg-blue-100 text-blue-700',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[kind]}`}>
      {children}
    </span>
  )
}

// "YYYY-MM-DD" -> "dd/MM/YYYY"
const fmtData = (s) => {
  if (!s) return '—'
  const [Y, M, D] = String(s).split('-')
  return `${D}/${M}/${Y}`
}

export default function ContratoCard({ contrato }) {
  if (!contrato) return null

  const numero = contrato.numeroContrato ?? contrato.id ?? contrato.contratoId
  const plano = contrato.nomePlano ?? contrato.plano?.nome ?? 'Plano'
  const ativo = contrato.contratoAtivo ?? (String(contrato.status).toUpperCase() === 'ATIVO')
  const efetivacao = contrato.dataEfetivacao ?? contrato.dataContrato ?? contrato.criadoEm ?? '—'
  const dia = contrato.diaD ?? contrato.diaVencimento ?? '—'
  const atrasos = Number(contrato.parcelasEmAtraso || 0)

  const unidade = contrato.unidade || {}
  const contatos = contrato.contatos || {}

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Contrato #{numero}</h3>
          <div className="mt-1 flex flex-wrap gap-2">
            <Badge kind={ativo ? 'success' : 'danger'}>{ativo ? 'ATIVO' : 'INATIVO'}</Badge>
            {atrasos > 0 ? <Badge kind="warn">Em atraso ({atrasos})</Badge> : null}
          </div>
        </div>
        {unidade?.nomeLogo ? (
          <img
            src={unidade.nomeLogo}
            alt={unidade.nomeFantasia || 'Unidade'}
            className="w-16 h-16 object-contain rounded"
            referrerPolicy="no-referrer"
          />
        ) : null}
      </div>

      <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-slate-500">Plano</dt>
          <dd className="font-medium">{plano}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Efetivação</dt>
          <dd className="font-medium">{fmtData(efetivacao)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Dia de vencimento</dt>
          <dd className="font-medium">{dia}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Titular</dt>
          <dd className="font-medium">{contrato.nomeTitular ?? contrato.nome ?? '—'}</dd>
        </div>
      </dl>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded border bg-slate-50">
          <p className="text-sm text-slate-500 mb-2">Unidade</p>
          <p className="font-medium">{unidade.nomeFantasia ?? '—'}</p>
          <p className="text-sm text-slate-600">
            {unidade.cidade ?? '—'} / {unidade.uf ?? '—'}
          </p>
          {unidade.cnpj ? <p className="text-xs text-slate-500 mt-1">CNPJ: {unidade.cnpj}</p> : null}
        </div>

        <div className="p-4 rounded border bg-slate-50">
          <p className="text-sm text-slate-500 mb-2">Contatos</p>
          <p className="text-sm"><span className="text-slate-500">E-mail:</span> {contatos.email || '—'}</p>
          <p className="text-sm"><span className="text-slate-500">Celular:</span> {contatos.celular || '—'}</p>
          {contatos.telefone ? (
            <p className="text-sm"><span className="text-slate-500">Telefone:</span> {contatos.telefone}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
