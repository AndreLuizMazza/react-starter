// src/components/CookieBanner.jsx
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"

const STORAGE_KEY = "progem_cookie_consent"
const WHITE_HEX = "#ffffff"

function getCssVar(name) {
  try {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim().toLowerCase()
  } catch {
    return ""
  }
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [themeReady, setThemeReady] = useState(false)

  // Detecta quando o tema real estiver aplicado
  useEffect(() => {
    const check = () => {
      const v = getCssVar("--brand-primary")
      // considera "pronto" quando não for branco OU quando houver qualquer valor não-vazio diferente de branco
      setThemeReady(v && v !== WHITE_HEX)
    }
    check()

    // Observa mudanças (interval + evento opcional disparado pelo seu bootstrap)
    const id = setInterval(check, 300)
    const onApplied = () => setTimeout(check, 0)
    window.addEventListener("theme:applied", onApplied)
    window.addEventListener("tenant:theme-applied", onApplied)

    return () => {
      clearInterval(id)
      window.removeEventListener("theme:applied", onApplied)
      window.removeEventListener("tenant:theme-applied", onApplied)
    }
  }, [])

  // Exibe banner se ainda não houver consentimento salvo
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) setVisible(true)

    const onOpen = () => setVisible(true)
    window.addEventListener("open-cookie-banner", onOpen)
    return () => window.removeEventListener("open-cookie-banner", onOpen)
  }, [])

  const isRootWhite = useMemo(() => !themeReady, [themeReady])

  if (!visible) return null

  function saveConsent(status) {
    const payload = { status, ts: Date.now() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    setVisible(false)
    window.dispatchEvent(new CustomEvent("cookie-consent-changed", { detail: payload }))
  }

  return (
    <div className="fixed inset-x-0 bottom-6 flex justify-center z-50 px-4">
      <div className="w-full max-w-4xl bg-white border border-slate-200 shadow-lg rounded-xl p-4 md:p-5">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 text-sm text-slate-700">
            <p>
              Usamos cookies para melhorar sua experiência, medir o uso e personalizar conteúdo. Você pode aceitar todos,
              rejeitar os opcionais ou escolher suas preferências. Leia nossa{" "}
              <Link to="/politica-cookies" className="underline font-medium text-slate-800 hover:text-slate-900">
                Política de Cookies
              </Link>
              .
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => saveConsent("rejected")}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-100"
            >
              Rejeitar opcionais
            </button>

            {/* Botão primário com FALLBACK + skeleton enquanto o tema não carregou */}
            <button
              onClick={() => saveConsent("accepted")}
              className={`btn-primary min-w-[140px] ${isRootWhite ? "animate-pulse" : ""}`}
              style={{
                // fallback visível enquanto o tema ainda é branco
                backgroundColor: isRootWhite ? "#2563eb" : undefined, // blue-600
                color: isRootWhite ? "#ffffff" : undefined,
                boxShadow: isRootWhite ? "0 1px 2px rgba(0,0,0,.08)" : undefined,
              }}
              title="Aceitar todos os cookies"
            >
              Ok, Entendi!
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
