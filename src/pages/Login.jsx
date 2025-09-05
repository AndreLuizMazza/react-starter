// src/pages/LoginPage.jsx
import { useState } from 'react'
import useAuth from '@/store/useAuth'

export default function LoginPage() {
  const login = useAuth(s => s.login)
  const [identificador, setIdent] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setErro(''); setLoading(true)
    try {
      await login(identificador, senha) // redireciona para /area dentro da store
    } catch (e) {
      console.error(e)
      setErro('Falha no login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="section">
      <div className="container-max max-w-md">
        <h1 className="text-2xl font-bold mb-4">Entrar</h1>
        <form onSubmit={onSubmit} className="card p-6 space-y-3">
          <input className="input" placeholder="E-mail ou CPF" value={identificador} onChange={e=>setIdent(e.target.value)} />
          <input className="input" placeholder="Senha" type="password" value={senha} onChange={e=>setSenha(e.target.value)} />
          {erro && <p className="text-red-600 text-sm">{erro}</p>}
          <button className="btn-primary" disabled={loading}>{loading?'Entrando…':'Entrar'}</button>
        </form>
      </div>
    </section>
  )
}
