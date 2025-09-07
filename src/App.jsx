// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'

import './styles/theme.css' // CSS do tema (caminho relativo)

import TenantBootstrapper from '@/components/TenantBootstrapper'

import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import PlanosGrid from './pages/PlanosGrid.jsx'
import PlanoDetalhe from './pages/PlanoDetalhe.jsx'
import ContratoPage from './pages/ContratoPage.jsx'
import PrivateRoute from './components/PrivateRoute'
import AreaUsuario from './pages/AreaUsuario.jsx'
import Pagamentos from './pages/Pagamentos.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ClubeBeneficios from './pages/ClubeBeneficios.jsx'
import PoliticaCookies from "@/pages/PoliticaCookies"
import PoliticaPrivacidade from "@/pages/PoliticaPrivacidade"
import TermosUso from "@/pages/TermosUso"

// importar o banner
import CookieBanner from '@/components/CookieBanner.jsx'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* carrega token + /unidades/me e aplica tema */}
      <TenantBootstrapper />

      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/planos" element={<PlanosGrid />} />
          <Route path="/planos/:id" element={<PlanoDetalhe />} />
          <Route path="/beneficios" element={<ClubeBeneficios />} />
          <Route path="/contratos" element={<ContratoPage />} />
          <Route path="/contratos/:id/pagamentos" element={<Pagamentos />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/criar-conta" element={<div className="section container-max">Tela de cadastro</div>} />
          <Route path="/recuperar-senha" element={<div className="section container-max">Recuperar senha</div>} />
          <Route path="/politica-cookies" element={<PoliticaCookies />} />
          <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
          <Route path="/termos-uso" element={<TermosUso />} />
          <Route
            path="/area"
            element={
              <PrivateRoute>
                <AreaUsuario />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Banner de cookies sempre ativo */}
      <CookieBanner />

      <Footer />
    </div>
  )
}
