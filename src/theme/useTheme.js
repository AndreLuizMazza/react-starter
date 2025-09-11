// src/theme/useTheme.js
import { useEffect, useState } from 'react'

export const THEME_KEY = 'ui_theme' // 'system' | 'light' | 'dark'

function applyTheme(choice) {
  const html = document.documentElement || null
  const body = document.body || null
  const targets = [html, body].filter(Boolean)

  for (const el of targets) {
    el.classList.remove('theme-dark', 'theme-light')
    if (choice === 'dark') el.classList.add('theme-dark')
    if (choice === 'light') el.classList.add('theme-light')
  }
}

/** Hook controlando tema com persistência e aplicação no <body> */
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem(THEME_KEY) || 'system' } catch { return 'system' }
  })

  useEffect(() => {
    // aplica e persiste
    applyTheme(theme)
    try {
      if (theme === 'system') localStorage.removeItem(THEME_KEY)
      else localStorage.setItem(THEME_KEY, theme)
    } catch {}
  }, [theme])

  function cycle() {
    setTheme(t => (t === 'system' ? 'light' : t === 'light' ? 'dark' : 'system'))
  }

  return { theme, setTheme, cycle }
}
