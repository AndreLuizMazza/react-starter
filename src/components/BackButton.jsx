import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

/**
 * Botão padrão de "Voltar" para ser reutilizado em todas as páginas.
 * Ex.: <BackButton to="/memorial" />
 */
export default function BackButton({ to = '/', children = 'Voltar', className = '' }) {
  return (
    <Link
      to={to}
      className={`
        inline-flex items-center gap-2 rounded-full px-4 py-2
        border border-zinc-300 text-zinc-800 hover:bg-zinc-50
        dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800
        transition-colors ${className}
      `}
    >
      <ArrowLeft className="h-4 w-4" />
      {children}
    </Link>
  )
}
