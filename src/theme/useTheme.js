import { useEffect, useState } from 'react'

export const THEME_KEY = 'ui_theme' // 'system' | 'light' | 'dark'

function applyTheme(choice) {
  const html = document.documentElement
  const mql = window.matchMedia('(prefers-color-scheme: dark)')

  html.classList.remove('dark', 'theme-dark', 'theme-light')

  if (choice === 'dark') {
    html.classList.add('dark', 'theme-dark')
  } else if (choice === 'light') {
    html.classList.add('theme-light')
  } else {
    // system
    if (mql.matches) html.classList.add('dark', 'theme-dark')
  }
}

/** Hook controlando tema com persistência e aplicação no <html> */
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem(THEME_KEY) || 'system' } catch { return 'system' }
  })

  useEffect(() => {
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
