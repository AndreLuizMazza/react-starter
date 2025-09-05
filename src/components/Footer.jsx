export default function Footer() {
  return (
    <footer className="border-t border-slate-200">
      <div className="container-max py-8 text-sm text-slate-600 flex items-center justify-between">
        <p>© {new Date().getFullYear()} Progem Starter</p>
        <p>Feito com ❤️ React</p>
      </div>
    </footer>
  )
}
