// src/components/Navbar.jsx
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import useAuth from '@/store/auth'
import useTenant from '@/store/tenant'
import ThemeToggle from './ThemeToggle.jsx'

export default function Navbar() {
  const { isAuthenticated, token, user } = useAuth(s => ({
    isAuthenticated: s.isAuthenticated,
    token: s.token,
    user: s.user,
  }))
  const empresa = useTenant(s => s.empresa)

  const nome = empresa?.nomeFantasia || 'Progem Starter'
  const logo = empresa?.urlLogo
  const isLogged = isAuthenticated() || !!token || !!user
  const areaDest = isLogged ? '/area' : '/login'

  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const linkClass = ({ isActive }) =>
    'relative pl-4 pr-3 py-2 flex items-center rounded-md transition-colors duration-150 ' +
    (isActive
      ? 'text-primary font-semibold bg-primary/5'
      : 'text-slate-600 hover:text-primary hover:bg-slate-50')

  const ActiveBar = ({ isActive }) =>
    isActive ? (
      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded bg-primary" />
    ) : null

  return (
    <header className="w-full border-b bg-white sticky top-0 z-40 shadow-sm">
      <div className="container-max flex items-center justify-between py-3 gap-4">
        {/* Logo */}
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
            <span className="text-lg font-semibold"></span>
          )}
        </Link>

        {/* Navegação desktop */}
        <nav className="hidden md:flex items-center gap-4 text-sm">
          <NavLink to="/" className={linkClass} end>
            {({ isActive }) => (
              <>
                <ActiveBar isActive={isActive} /> Home
              </>
            )}
          </NavLink>

          <NavLink to="/planos" className={linkClass}>
            {({ isActive }) => (
              <>
                <ActiveBar isActive={isActive} /> Planos
              </>
            )}
          </NavLink>

          <NavLink to="/beneficios" className={linkClass}>
            {({ isActive }) => (
              <>
                <ActiveBar isActive={isActive} /> Clube de Benefícios
              </>
            )}
          </NavLink>

          <NavLink to="/memorial" className={linkClass}>
            {({ isActive }) => (
              <>
                <ActiveBar isActive={isActive} /> Memorial
              </>
            )}
          </NavLink>

          {/* Área do associado (direciona conforme sessão) */}
          <NavLink to={areaDest} className={linkClass}>
            {({ isActive }) => (
              <>
                <ActiveBar isActive={isActive} /> Área do associado
              </>
            )}
          </NavLink>

          {/* Toggle de tema (desktop) */}
          <ThemeToggle className="ml-2 hidden md:inline-flex" />
        </nav>

        {/* Botão hambúrguer (mobile) */}
        <button
          className="md:hidden inline-flex items-center justify-center rounded-lg border px-3 py-2"
          aria-label="Abrir menu"
          aria-controls="mobile-menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(v => !v)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Menu mobile */}
      {mobileOpen && (
        <div id="mobile-menu" className="md:hidden border-t bg-white">
          <div className="container-max py-2 flex flex-col text-sm space-y-1">
            <NavLink to="/" className={linkClass} end>
              {({ isActive }) => (
                <>
                  <ActiveBar isActive={isActive} /> Home
                </>
              )}
            </NavLink>

            <NavLink to="/planos" className={linkClass}>
              {({ isActive }) => (
                <>
                  <ActiveBar isActive={isActive} /> Planos
                </>
              )}
            </NavLink>

            <NavLink to="/beneficios" className={linkClass}>
              {({ isActive }) => (
                <>
                  <ActiveBar isActive={isActive} /> Clube de Benefícios
                </>
              )}
            </NavLink>

            <NavLink to="/memorial" className={linkClass}>
              {({ isActive }) => (
                <>
                  <ActiveBar isActive={isActive} /> Memorial
                </>
              )}
            </NavLink>

            <NavLink to={areaDest} className={linkClass}>
              {({ isActive }) => (
                <>
                  <ActiveBar isActive={isActive} /> Área do associado
                </>
              )}
            </NavLink>

            {/* Toggle de tema no mobile */}
            <div className="border-t mt-2 pt-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
