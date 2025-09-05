// src/pages/Home.jsx
import { Link } from 'react-router-dom'
import useTenant from '@/store/tenant'
import useAuth from '@/store/auth'
import { Apple, Play } from 'lucide-react'

/** Links das lojas (preencha no seu .env se quiser):
 *  VITE_ANDROID_URL="https://play.google.com/store/apps/details?id=..."
 *  VITE_IOS_URL="https://apps.apple.com/app/id0000000000"
 */
const ANDROID_URL = import.meta.env.VITE_ANDROID_URL || '#'
const IOS_URL = import.meta.env.VITE_IOS_URL || '#'

function Card({ title, desc, to, cta }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-slate-600">{desc}</p>
      <div className="mt-auto pt-4">
        <Link to={to} className="btn-primary inline-flex">{cta}</Link>
      </div>
    </article>
  )
}

export default function Home(){
  const empresa = useTenant(s => s.empresa)
  const nome = empresa?.nomeFantasia || 'Progem Starter'

  const user = useAuth(s => s.user)
  const estaLogado = Boolean(user)

  return (
    <section className="section">
      <div className="container-max">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black tracking-tight">Bem-vindo</h1>
          <p className="mt-2 text-slate-600">
            Empresa: <span className="font-semibold text-slate-900">{nome}</span>
          </p>
        </div>

        {/* Ações rápidas */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card
            title="Planos"
            desc="Veja planos, detalhes e simule preços."
            to="/planos"
            cta="Ver planos"
          />
          <Card
            title="Clube de Benefícios"
            desc="Parceiros com descontos e vantagens para associados."
            to="/beneficios"
            cta="Ver parceiros"
          />
          <Card
            title="Contratos por CPF"
            desc="Pesquise contratos e situação de cobrança."
            to="/contratos"
            cta="Pesquisar"
          />

          {/* Condicional: se logado mostra Área do Associado; caso contrário, Login */}
          {estaLogado ? (
            <Card
              title="Área do Associado"
              desc="Acesse seus contratos, dependentes e pagamentos."
              to="/area"
              cta="Abrir área"
            />
          ) : (
            <Card
              title="Login"
              desc="Acesse a área do usuário para ver seus dados."
              to="/login"
              cta="Entrar"
            />
          )}
        </div>

        {/* Baixe nosso aplicativo */}
        <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
          <div className="grid gap-6 md:grid-cols-3 items-center">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold tracking-tight">Baixe nosso aplicativo</h2>
              <p className="mt-2 text-slate-600">
                Tenha sua carteirinha digital, boletos, PIX e benefícios sempre à mão. Acompanhe seus contratos
                e receba notificações de vencimentos diretamente no celular.
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={ANDROID_URL}
                  target={ANDROID_URL === '#' ? undefined : '_blank'}
                  rel={ANDROID_URL === '#' ? undefined : 'noreferrer'}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Play size={16} /> Baixar para Android
                </a>
                <a
                  href={IOS_URL}
                  target={IOS_URL === '#' ? undefined : '_blank'}
                  rel={IOS_URL === '#' ? undefined : 'noreferrer'}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Apple size={16} /> Baixar para iOS
                </a>
              </div>

              {(ANDROID_URL === '#' || IOS_URL === '#') && (
                <p className="mt-2 text-xs text-slate-500">
                  * Links das lojas ainda não configurados. Defina <code>VITE_ANDROID_URL</code> e
                  <code> VITE_IOS_URL</code> no seu <code>.env</code>.
                </p>
              )}
            </div>

            {/* Bloco visual simples (sem imagens externas) */}
            <div className="rounded-xl bg-slate-50 p-6">
              <div className="h-48 rounded-lg bg-white shadow-inner border border-slate-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-sm font-semibold text-slate-700">App do Associado</div>
                  <div className="mt-1 text-xs text-slate-500">Carteirinha • Pagamentos • Benefícios</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
