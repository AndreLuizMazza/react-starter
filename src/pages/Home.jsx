import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useTenant from '@/store/tenant'
import useAuth from '@/store/auth'
import {
  Layers,
  BadgePercent,
  Receipt,
  UserSquare2,
  Smartphone,
  Apple,
  ArrowRight,
  IdCard,
  QrCode,
  Gift,
  HelpCircle,
  ChevronDown,
} from 'lucide-react'

/* ===== helpers de cor (whitelabel a partir do btn-primary) ===== */
function clamp(n, min = 0, max = 1) { return Math.min(max, Math.max(min, n)) }
function rgbToHsl(r, g, b) {
  r/=255; g/=255; b/=255
  const max = Math.max(r,g,b), min = Math.min(r,g,b)
  let h, s, l = (max+min)/2
  if (max===min) { h=s=0 }
  else {
    const d = max-min
    s = l>0.5 ? d/(2-max-min) : d/(max+min)
    switch (max) {
      case r: h=(g-b)/d+(g<b?6:0); break
      case g: h=(b-r)/d+2; break
      case b: h=(r-g)/d+4; break
    }
    h/=6
  }
  return [h, s, l]
}
function hslToRgb(h, s, l){
  let r,g,b
  if (s===0){ r=g=b=l }
  else {
    const hue2rgb=(p,q,t)=>{ if(t<0) t+=1; if(t>1) t-=1; if(t<1/6) return p+(q-p)*6*t; if(t<1/2) return q; if(t<2/3) return p+(q-p)*(2/3-t)*6; return p }
    const q=l<0.5 ? l*(1+s) : l+s-l*s
    const p=2*l-q
    r=hue2rgb(p,q,h+1/3); g=hue2rgb(p,q,h); b=hue2rgb(p,q,h-1/3)
  }
  return [Math.round(r*255), Math.round(g*255), Math.round(b*255)]
}
function shade(color, deltaL = -0.16) {
  let r=0,g=0,b=0
  if (color.startsWith('#')) {
    const h = color.replace('#','')
    const x = h.length===3 ? h.split('').map(c=>c+c).join('') : h
    r=parseInt(x.slice(0,2),16); g=parseInt(x.slice(2,4),16); b=parseInt(x.slice(4,6),16)
  } else {
    const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (m) { r=+m[1]; g=+m[2]; b=+m[3] }
  }
  let [h,s,l]=rgbToHsl(r,g,b)
  l = clamp(l + deltaL)
  const [nr,ng,nb] = hslToRgb(h,s,l)
  return `rgb(${nr}, ${ng}, ${nb})`
}
function usePrimaryColor() {
  const [base, setBase] = useState('#ff5a1f') // fallback seguro
  useEffect(() => {
    const el = document.createElement('button')
    el.className = 'btn-primary'
    el.style.cssText = 'position:absolute;opacity:0;pointer-events:none;left:-9999px'
    document.body.appendChild(el)
    const cs = getComputedStyle(el)
    let color = cs.backgroundColor
    const bg = cs.backgroundImage || ''
    const m = bg.match(/rgba?\(\d+,\s*\d+,\s*\d+(?:,\s*\d*\.?\d+)?\)/)
    if (m) color = m[0]
    document.body.removeChild(el)
    if (color && color !== 'transparent') setBase(color)
  }, [])
  const dark = useMemo(() => shade(base, -0.16), [base])
  return { base, dark }
}

/* ===== UI ===== */
function IconBadge({ children }) {
  return (
    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-b from-sky-50 to-sky-100 text-sky-700 ring-1 ring-sky-100 shadow-sm transition-transform duration-200 group-hover:scale-105 group-hover:-translate-y-0.5">
      {children}
    </span>
  )
}

function FeatureCard({ icon, title, desc, to, cta, mounted, delay = 0 }) {
  const nav = useNavigate()
  function go() { nav(to) }
  function onKey(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go() }
  }
  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={`${title}. ${cta}`}
      onClick={go}
      onKeyDown={onKey}
      className={[
        'group card p-5 md:p-6 transition-all duration-500 will-change-transform cursor-pointer',
        'hover:-translate-y-[3px] hover:shadow-2xl hover:ring-1 hover:ring-slate-200 hover:bg-slate-50',
        'tilt',
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-300',
      ].join(' ')}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-3">
        <IconBadge>{icon}</IconBadge>
        <div>
          <h3 className="text-lg font-semibold leading-tight">{title}</h3>
          <p className="mt-1 text-sm text-slate-600">{desc}</p>
        </div>
      </div>
      <div className="pt-4">
        <span className="btn-primary inline-flex items-center gap-2 transition-transform duration-150 group-hover:translate-x-0.5">
          {cta} <ArrowRight size={16} />
        </span>
      </div>
    </div>
  )
}

/** Botão “fantasma” com gradiente apenas no hover (Android/iOS) */
function GradientGhostBtn({ href, icon, label, base, dark, mounted, delay = 0 }) {
  const [hover, setHover] = useState(false)
  const style = {
    ...(hover
      ? {
          backgroundImage: `linear-gradient(90deg, ${dark}, ${base})`,
          color: '#fff',
          borderColor: 'transparent',
          boxShadow: '0 6px 18px rgba(0,0,0,.08)',
        }
      : {}),
    transitionDelay: `${delay}ms`,
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={style}
      className={[
        'inline-flex items-center gap-2 rounded-full border px-4 py-2 font-medium transition-colors duration-500',
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
      ].join(' ')}
    >
      {icon} {label}
    </a>
  )
}

/* ===== pílulas de valor ===== */
function ValuePills() {
  return (
    <div className="mt-4 flex flex-wrap justify-center gap-2">
      <span className="value-pill inline-flex items-center gap-2 rounded-full bg-slate-100 text-slate-700 px-3 py-1.5 text-xs font-medium ring-1 ring-slate-200">
        <IdCard size={14}/> Carteirinha digital
      </span>
      <span className="value-pill inline-flex items-center gap-2 rounded-full bg-slate-100 text-slate-700 px-3 py-1.5 text-xs font-medium ring-1 ring-slate-200">
        <QrCode size={14}/> PIX & boletos
      </span>
      <span className="value-pill inline-flex items-center gap-2 rounded-full bg-slate-100 text-slate-700 px-3 py-1.5 text-xs font-medium ring-1 ring-slate-200">
        <Gift size={14}/> Clube de benefícios
      </span>
    </div>
  )
}

/* ====== FAQ ====== */
function FaqItem({ q, a, defaultOpen = false }) {
  return (
    <details className="faq-item group" open={defaultOpen}>
      <summary className="faq-summary">
        <span className="inline-flex items-center gap-2 font-semibold">
          <HelpCircle size={18} /> {q}
        </span>
        <ChevronDown size={18} className="chev" aria-hidden />
      </summary>
      <div className="faq-content">
        {a}
      </div>
    </details>
  )
}
function FaqSection({ base, dark, isLogged, areaDest }) {
  return (
    <section className="mt-8 card p-6 md:p-8">
      <h3 className="text-xl font-extrabold flex items-center gap-2">
        <HelpCircle /> Dúvidas frequentes
      </h3>

      <div className="mt-4 grid gap-3">
        <FaqItem
          q="Como acessar a Área do Associado?"
          a={
            <p className="text-sm text-slate-600">
              Clique em <Link className="underline" to={areaDest}>“Abrir área”</Link>.
              Se não tiver sessão ativa, você será direcionado para o login.
            </p>
          }
          defaultOpen
        />
        <FaqItem
          q="Esqueci minha senha. O que fazer?"
          a={
            <p className="text-sm text-slate-600">
              Acesse <Link to="/recuperar-senha" className="underline">Recuperar senha</Link> e
              siga as instruções enviadas ao seu e-mail/WhatsApp cadastrado.
            </p>
          }
        />
        <FaqItem
          q="Como ativar o app no celular?"
          a={
            <p className="text-sm text-slate-600">
              Abra a loja do seu aparelho e instale o app. Depois, entre com os mesmos dados do site.
              <span className="block mt-2">
                <a
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium hover:opacity-90"
                  href={import.meta.env.VITE_ANDROID_URL || '#'}
                  target="_blank"
                >
                  <Smartphone size={14}/> Android
                </a>
                <a
                  className="ml-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium hover:opacity-90"
                  href={import.meta.env.VITE_IOS_URL || '#'}
                  target="_blank"
                >
                  <Apple size={14}/> iOS
                </a>
              </span>
            </p>
          }
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Link to="/beneficios" className="rounded-full border px-4 py-2 text-sm font-medium">
          Ver parceiros
        </Link>
        <Link
          to={isLogged ? '/area' : '/login'}
          className="btn-primary rounded-full h-9 px-4 text-sm flex items-center"
        >
          Abrir área
        </Link>
      </div>
    </section>
  )
}

export default function Home() {
  const empresa = useTenant(s => s.empresa)
  const { isAuthenticated, token, user } = useAuth(s => ({
    isAuthenticated: s.isAuthenticated,
    token: s.token,
    user: s.user,
  }))
  const isLogged = isAuthenticated() || !!token || !!user
  const areaDest = isLogged ? '/area' : '/login'
  const ANDROID_URL = import.meta.env.VITE_ANDROID_URL || '#'
  const IOS_URL = import.meta.env.VITE_IOS_URL || '#'

  const { base, dark } = usePrimaryColor()

  // Fade-in global com stagger
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 10)
    return () => clearTimeout(t)
  }, [])

  return (
    <section className="section">
      <div className="container-max relative overflow-hidden">
        {/* blobs decorativos (motion-safe) */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="home-blob" style={{ background: `radial-gradient(30% 35% at 12% 10%, ${base}22, transparent 60%)` }} />
          <div className="home-blob delay-300" style={{ background: `radial-gradient(30% 35% at 88% -5%, ${dark}22, transparent 60%)` }} />
        </div>

        {/* HERO */}
        <header
          className={[
            'relative text-center mb-4 md:mb-6 transition-all duration-700',
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
          ].join(' ')}
        >
          <h1
            className="text-4xl md:text-5xl font-black tracking-tight"
            style={{
              backgroundImage: `linear-gradient(90deg, ${dark}, ${base})`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Bem-vindo
          </h1>
          <p className="mt-2 text-slate-600">
            Empresa: <span className="font-semibold">{empresa?.nomeFantasia || '—'}</span>
          </p>
          <ValuePills />
        </header>

        {/* FEATURES */}
        <div className="relative grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<Layers size={22} />}
            title="Planos"
            desc="Veja planos, detalhes e simule preços."
            to="/planos"
            cta="Ver planos"
            mounted={mounted}
            delay={60}
          />
          <FeatureCard
            icon={<BadgePercent size={22} />}
            title="Clube de Benefícios"
            desc="Parceiros com descontos e vantagens para associados."
            to="/beneficios"
            cta="Ver parceiros"
            mounted={mounted}
            delay={130}
          />
          <FeatureCard
            icon={<Receipt size={22} />}
            title="Segunda via do Boleto"
            desc="Consulte contratos e situação de cobrança sem senha."
            to="/contratos"
            cta="Pesquisar"
            mounted={mounted}
            delay={200}
          />
          <FeatureCard
            icon={<UserSquare2 size={22} />}
            title="Área do Associado"
            desc="Acesse contratos, dependentes e pagamentos."
            to={areaDest}
            cta="Abrir área"
            mounted={mounted}
            delay={270}
          />
        </div>

        {/* APP SECTION */}
        <div
          className={[
            'relative mt-8 card p-0 overflow-hidden transition-all duration-700',
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
          ].join(' ')}
          style={{ transitionDelay: '320ms' }}
        >
          <div className="grid md:grid-cols-2">
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-extrabold">Baixe nosso aplicativo</h2>
              <p className="mt-2 text-slate-600">
                Tenha carteirinha digital, boletos, PIX e benefícios sempre à mão. Acompanhe seus
                contratos e receba notificações de vencimentos no celular.
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <GradientGhostBtn
                  href={ANDROID_URL}
                  base={base}
                  dark={dark}
                  icon={<Smartphone size={18} />}
                  label="Baixar para Android"
                  mounted={mounted}
                  delay={380}
                />
                <GradientGhostBtn
                  href={IOS_URL}
                  base={base}
                  dark={dark}
                  icon={<Apple size={18} />}
                  label="Baixar para iOS"
                  mounted={mounted}
                  delay={450}
                />
              </div>

              {!import.meta.env.VITE_ANDROID_URL && !import.meta.env.VITE_IOS_URL && (
                <p className="mt-3 text-xs text-slate-500">
                  * Links das lojas ainda não configurados. Defina <code>VITE_ANDROID_URL</code> e{' '}
                  <code>VITE_IOS_URL</code> no seu <code>.env</code>.
                </p>
              )}
            </div>

            <div className="bg-slate-50 flex items-center justify-center p-8">
              <div className="rounded-2xl border bg-white/70 p-10 text-center shadow-sm">
                <div className="text-sm font-semibold text-slate-700">App do Associado</div>
                <div className="mt-1 text-xs text-slate-500">
                  Carteirinha • Pagamentos • Benefícios
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="faq-dark">
          <FaqSection base={base} dark={dark} isLogged={isLogged} areaDest={areaDest} />
        </div>
        

        
      </div>
    </section>
  )
}
