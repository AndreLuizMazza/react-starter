const THEME_KEY = 'ui_theme' // 'system' | 'light' | 'dark'

;(function initTheme() {
  try {
    const html = document.documentElement
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const choice = localStorage.getItem(THEME_KEY) || 'system'

    const apply = (mode) => {
      // removemos marcas antigas e aplicamos padrão Tailwind (.dark no <html>)
      html.classList.remove('dark', 'theme-dark', 'theme-light')
      if (mode === 'dark') {
        html.classList.add('dark', 'theme-dark')
      } else if (mode === 'light') {
        html.classList.add('theme-light')
      } else {
        // system: segue o SO
        if (mql.matches) html.classList.add('dark', 'theme-dark')
      }
    }

    apply(choice)

    // se mudar o tema do SO e estiver em 'system', reflita isso
    mql.addEventListener?.('change', () => {
      const c = localStorage.getItem(THEME_KEY) || 'system'
      if (c === 'system') apply('system')
    })
  } catch {
    // fail-safe
  }
})()
