import { Link, NavLink } from 'react-router-dom'
import useAuth from '@/store/auth'
import useTenant from '@/store/tenant'

export default function Navbar(){
  const user = useAuth(s => s.user)
  const logout = useAuth(s => s.logout)
  const empresa = useTenant(s => s.empresa)

  const nome = empresa?.nomeFantasia || 'Progem Starter'
  const logo = empresa?.urlLogo

  return (
    <header className="w-full border-b bg-white sticky top-0 z-40">
      <div className="container-max flex items-center justify-between py-3 gap-4">
        {/* Só a logomarca (nome fica oculto para acessibilidade) */}
        <Link to="/" className="flex items-center h-8">
          {logo ? (
            <>
              <img
                src={logo}
                alt={nome}
                className="h-8 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
              <span className="sr-only">{nome}</span>
            </>
          ) : (
            <span className="text-lg font-semibold">Progem</span>
          )}
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <NavLink to="/planos" className="hover:underline">Planos</NavLink>
          <NavLink to="/beneficios" className="hover:underline">Benefícios</NavLink>
          <NavLink to="/contratos" className="hover:underline">Contratos</NavLink>
          <NavLink to="/area" className="hover:underline">Área</NavLink>
          {user ? (
            <button className="btn-primary" onClick={logout}>Sair</button>
          ) : (
            <Link to="/login" className="btn-primary">Login</Link>
          )}
        </nav>
      </div>
    </header>
  )
}
