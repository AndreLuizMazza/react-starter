// src/pages/RegisterPage.jsx
import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import useTenant from '@/store/tenant'
import useAuth from '@/store/auth'
import { registerUser } from '@/lib/authApi'

const initial = {
  nome: '',
  email: '',
  senha: '',
  cpf: '',
  celular: '',
  dataNascimento: '',
  aceiteTermos: false,
  aceitePrivacidade: false,
}

const onlyDigits = (s = '') => s.replace(/\D/g, '')

function isValidEmail(email = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())
}
function isValidCPF(cpf = '') {
  return onlyDigits(cpf).length === 11
}
function isStrongPassword(s = '') {
  return s.length >= 6
}

export default function RegisterPage() {
  const [form, setForm] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  useTenant() // carrega tenant (BFF injeta X-Progem-ID)
  const { setUser, setToken } = useAuth(s => ({ setUser: s.setUser, setToken: s.setToken }))

  function onChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  function validate() {
    if (!form.nome.trim()) return 'Informe seu nome completo.'
    if (!isValidEmail(form.email)) return 'Informe um e-mail válido.'
    if (!isValidCPF(form.cpf)) return 'Informe um CPF válido (11 dígitos).'
    if (!isStrongPassword(form.senha)) return 'A senha deve ter ao menos 6 caracteres.'
    if (!form.aceiteTermos || !form.aceitePrivacidade) {
      return 'É necessário aceitar os Termos e a Política de Privacidade.'
    }
    return ''
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    const msg = validate()
    if (msg) { setError(msg); return }
    try {
      setLoading(true)
      const data = await registerUser(form)

      // salva sessão e redireciona
      const token = data?.token ?? data?.accessToken ?? data?.access_token ?? data?.jwt ?? null
      setToken(token)
      setUser(data)

      const from = location.state?.from?.pathname || '/area'
      navigate(from, { replace: true })
    } catch (err) {
      console.error(err)
      // tenta extrair mensagem do backend
      const apiMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data ||
        'Não foi possível concluir o cadastro.'
      setError(typeof apiMsg === 'string' ? apiMsg : 'Não foi possível concluir o cadastro.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight mb-2">Criar conta</h1>
      <p className="text-slate-500 mb-8">
        Cadastre-se para gerenciar seus planos, dependentes e benefícios.
      </p>

      <form onSubmit={onSubmit} className="space-y-6 bg-white/70 dark:bg-slate-900/40 p-6 rounded-2xl shadow-card">
        {error && (
          <div className="rounded-lg border border-red-300/50 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Nome completo</label>
            <input
              name="nome" value={form.nome} onChange={onChange}
              className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2"
              placeholder="Maria Oliveira"
              autoComplete="name"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">E-mail</label>
            <input
              type="email" name="email" value={form.email} onChange={onChange}
              className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2"
              placeholder="maria@exemplo.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">CPF</label>
            <input
              name="cpf" value={form.cpf} onChange={onChange}
              className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2"
              placeholder="000.000.000-00"
              inputMode="numeric" maxLength={14}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Celular</label>
            <input
              name="celular" value={form.celular} onChange={onChange}
              className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2"
              placeholder="(00) 90000-0000"
              inputMode="tel"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Data de nascimento</label>
            <input
              type="date" name="dataNascimento" value={form.dataNascimento} onChange={onChange}
              className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Senha</label>
            <input
              type="password" name="senha" value={form.senha} onChange={onChange}
              className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2"
              placeholder="Crie uma senha forte"
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" name="aceiteTermos" checked={form.aceiteTermos} onChange={onChange}/>
            <span>Li e aceito os <a className="underline" href="/termos-uso" target="_blank" rel="noreferrer">Termos de Uso</a>.</span>
          </label>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" name="aceitePrivacidade" checked={form.aceitePrivacidade} onChange={onChange}/>
            <span>Concordo com a <a className="underline" href="/politica-privacidade" target="_blank" rel="noreferrer">Política de Privacidade</a>.</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 bg-emerald-900 text-white hover:opacity-95 disabled:opacity-60"
          >
            {loading ? 'Enviando...' : 'Criar conta'}
          </button>
          <Link to="/login" className="inline-flex items-center rounded-xl px-5 py-2.5 border">
            Já tenho conta
          </Link>
        </div>
      </form>
    </div>
  )
}
