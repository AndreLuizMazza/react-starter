import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import useAuth from '@/store/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuth(s => s.login)

  const [identificador, setIdent] = useState('')
  const [senha, setSenha] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [lembrar, setLembrar] = useState(true)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const identValido = useMemo(() => identificador.trim().length >= 5, [identificador])
  const senhaValida = useMemo(() => senha.length >= 4, [senha])
  const formValido = identValido && senhaValida && !loading

  useEffect(() => { setErro('') }, [identificador, senha])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('login_ident')
      if (saved) setIdent(saved)
    } catch {}
  }, [])

  async function onSubmit(e) {
    e.preventDefault()
    if (!formValido) return
    setErro('')
    setLoading(true)

    try {
      await login(identificador.trim(), senha)

      if (lembrar) {
        try { localStorage.setItem('login_ident', identificador.trim()) } catch {}
      } else {
        try { localStorage.removeItem('login_ident') } catch {}
      }

      // ✅ pega a rota de origem se veio de PrivateRoute
      const from = location.state?.from?.pathname || '/area'
      navigate(from, { replace: true })
    } catch (err) {
      console.error(err)
      setErro('Falha no login. Verifique suas credenciais e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="section">
      <div className="container-max max-w-lg">
        {/* Cabeçalho */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Entrar</h1>
          <p className="text-slate-500 mt-1">
            Acesse sua conta para gerenciar planos, dependentes e benefícios.
          </p>
        </div>

        {/* Card */}
        <form onSubmit={onSubmit} noValidate className="card p-6 md:p-8 space-y-4 shadow-lg">
          {/* E-mail/CPF */}
          <div className="space-y-1">
            <label htmlFor="ident" className="font-medium text-slate-700">E-mail ou CPF</label>
            <input
              id="ident"
              className="input"
              placeholder="ex.: joao@email.com ou 000.000.000-00"
              autoComplete="username"
              value={identificador}
              onChange={(e) => setIdent(e.target.value)}
              aria-invalid={!identValido}
            />
          </div>

          {/* Senha + toggle */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="senha" className="font-medium text-slate-700">Senha</label>
              <Link to="/recuperar-senha" className="text-sm text-blue-700 hover:underline">
                Esqueci minha senha
              </Link>
            </div>
            <div className="relative">
              <input
                id="senha"
                className="input pr-12"
                placeholder="Sua senha"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                aria-invalid={!senhaValida}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute inset-y-0 right-0 px-3 text-slate-500 hover:text-slate-700 focus:outline-none"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Opções */}
          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300"
                checked={lembrar}
                onChange={(e) => setLembrar(e.target.checked)}
              />
              Lembrar de mim
            </label>

            <Link to="/criar-conta" className="text-sm font-medium text-blue-700 hover:underline">
              Criar conta
            </Link>
          </div>

          {/* Erro */}
          {erro && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
              {erro}
            </div>
          )}

          {/* CTA principal */}
          <button
            type="submit"
            className="btn-primary w-full h-11 text-base disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={!formValido}
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>

          {/* Ações secundárias */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/criar-conta"
              className="rounded-full border border-slate-200 h-11 flex items-center justify-center text-sm font-medium hover:bg-slate-50"
            >
              Cadastrar-se
            </Link>
            <Link
              to="/recuperar-senha"
              className="rounded-full border border-slate-200 h-11 flex items-center justify-center text-sm font-medium hover:bg-slate-50"
            >
              Recuperar senha
            </Link>
          </div>
        </form>

        <p className="text-xs text-slate-500 mt-4">
          Precisa de ajuda? Fale com o suporte da sua unidade.
        </p>
      </div>
    </section>
  )
}
