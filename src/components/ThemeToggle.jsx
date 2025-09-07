// src/components/ThemeToggle.jsx
import { Monitor, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/theme/useTheme'

export default function ThemeToggle({ className = '' }) {
  const { theme, cycle } = useTheme()

  const label =
    theme === 'system' ? 'Tema: Sistema' : theme === 'light' ? 'Tema: Claro' : 'Tema: Escuro'

  const Icon = theme === 'system' ? Monitor : theme === 'light' ? Sun : Moon

  return (
    <button
      type="button"
      onClick={cycle}
      title={`${label} — clique para alternar`}
      aria-label={`${label} (alternar)`}
      className={[
        'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium',
        'text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300',
        'dark:text-slate-100 dark:border-white/20 dark:hover:bg-white/10',
        className,
      ].join(' ')}
    >
      <Icon size={16} />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{theme === 'system' ? 'Sistema' : theme === 'light' ? 'Claro' : 'Escuro'}</span>
    </button>
  )
}
