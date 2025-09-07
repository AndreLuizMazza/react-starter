// src/components/Footer.jsx
import { Link } from "react-router-dom"
import useTenant from "@/store/tenant"

export default function Footer() {
  const empresa = useTenant(s => s.empresa)
  const nome = empresa?.nomeFantasia || "Progem Starter"
  const ano = new Date().getFullYear()

  return (
    <footer className="w-full border-t bg-white">
      <div className="container-max py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Logo + nome */}
        <div className="flex items-center gap-3">
          {empresa?.urlLogo ? (
            <img
              src={empresa.urlLogo}
              alt={nome}
              className="h-8 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          ) : null}
          
        </div>

        {/* Links institucionais */}
        <nav className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          <Link to="/politica-cookies" className="hover:underline">
            Política de Cookies
          </Link>
          <Link to="/politica-privacidade" className="hover:underline">
            Política de Privacidade
          </Link>
          <Link to="/termos-uso" className="hover:underline">
            Termos de Uso
          </Link>
        </nav>
      </div>

      {/* Copyright */}
      <div className="container-max pb-6 text-center text-xs text-muted-foreground">
        © {ano} {nome}. Todos os direitos reservados.
      </div>
    </footer>
  )
}
