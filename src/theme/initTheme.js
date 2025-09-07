// src/theme/initTheme.js
const THEME_KEY = 'ui_theme' // valores: 'system' | 'light' | 'dark'

;(function initTheme() {
  try {
    // Se preferir, leia aqui também o tema do SO para "system"
    const choice = localStorage.getItem(THEME_KEY) // null -> 'system'
    if (!choice) return // 'system': não força nada, deixa o prefers-color-scheme agir

    const html = document.documentElement || null
    const body = document.body || null
    const targets = [html, body].filter(Boolean)

    for (const el of targets) {
      el.classList.remove('theme-dark', 'theme-light')
      if (choice === 'dark') el.classList.add('theme-dark')
      if (choice === 'light') el.classList.add('theme-light')
    }
  } catch (_) {
    // fail-safe: nunca impedir o app de montar
  }
})()
