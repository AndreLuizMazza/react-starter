// src/lib/theme.js

function shade(hex, percent = -12) {
  const h = (hex || '').replace('#','')
  if (h.length !== 6) return hex
  const n = i => Math.min(255, Math.max(0, Math.round(parseInt(h.substr(i,2),16) * (100+percent)/100)))
  const hx = v => v.toString(16).padStart(2,'0')
  return `#${hx(n(0))}${hx(n(2))}${hx(n(4))}`
}

function toRgba(hex, alpha = 0.35) {
  const h = (hex || '').replace('#','')
  if (h.length !== 6) return `rgba(14,165,233,${alpha})`
  const r = parseInt(h.substr(0,2),16)
  const g = parseInt(h.substr(2,2),16)
  const b = parseInt(h.substr(4,2),16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Aplica o tema do tenant:
 * - define CSS variables em :root
 * - injeta <style id="app-theme"> com regras !important e alta especificidade
 *   cobrindo .btn-primary, .btn.btn-primary, a.btn-primary e button.btn-primary
 */
export function applyTheme({ primary, secondary } = {}) {
  const root = document.documentElement
  const p = primary || '#0EA5E9'
  const pHover = shade(p, -12)
  const pRing = toRgba(p, 0.35)

  // 1) CSS vars (fallback para quem usa var() direto)
  root.style.setProperty('--brand-primary', p)
  root.style.setProperty('--brand-primary-hover', pHover)
  root.style.setProperty('--brand-primary-ring', pRing)
  if (secondary) root.style.setProperty('--brand-secondary', secondary)

  // 2) CSS injetado (ganha de frameworks)
  const css = `
    :root .btn-primary,
    :root .btn.btn-primary,
    :root a.btn-primary,
    :root button.btn-primary { background-color:${p} !important; color:#fff !important; }
    :root .btn-primary:hover,
    :root .btn.btn-primary:hover,
    :root a.btn-primary:hover,
    :root button.btn-primary:hover { background-color:${pHover} !important; }
    :root .btn-primary:focus,
    :root .btn.btn-primary:focus,
    :root a.btn-primary:focus,
    :root button.btn-primary:focus { outline:0 !important; box-shadow:0 0 0 4px ${pRing} !important; }
    :root a.link-primary { color:${p} !important; }
  `.trim()

  let styleEl = document.getElementById('app-theme')
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = 'app-theme'
    document.head.appendChild(styleEl)
  }
  styleEl.textContent = css

  if (import.meta?.env?.DEV) {
    console.log('[theme] aplicado', p)
  }
}
