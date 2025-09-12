import { useState } from 'react'

export default function LeadCaptureDialog({ open, onClose, onSubmit }) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [whats, setWhats] = useState('')

  if (!open) return null

  async function handleSubmit(e) {
    e.preventDefault()
    await onSubmit({ nome, email, whatsapp: whats })
    setNome(''); setEmail(''); setWhats('')
  }

  return (
    <div className="fixed inset-0 bg-black/50 grid place-items-center z-50 p-3">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-5 border shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Receber atualizações</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input className="input input-bordered w-full" placeholder="Seu nome" value={nome} onChange={e=>setNome(e.target.value)} required />
          <input className="input input-bordered w-full" placeholder="Seu e-mail" value={email} onChange={e=>setEmail(e.target.value)} type="email" />
          <input className="input input-bordered w-full" placeholder="WhatsApp" value={whats} onChange={e=>setWhats(e.target.value)} />
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" className="btn" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Quero receber</button>
          </div>
        </form>
      </div>
    </div>
  )
}
