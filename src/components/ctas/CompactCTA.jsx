import { ArrowRight } from "lucide-react";
import { usePrimaryColor } from "@/lib/themeColor";

/**
 * Cartão CTA compacto e reutilizável
 * - Use os wrappers abaixo (Planos/Memorial/Parceiros) para instanciar com textos/ícones prontos
 */
export default function CompactCTA({
  icon: Icon,
  eyebrow,            // pequeno selo/topo
  title,              // título curto
  subtitle,           // 1 linha de apoio
  bullets = [],       // até 3 bullets curtos
  primaryLabel = "Saiba mais",
  onPrimary,          // callback do botão principal
  secondaryLabel,     // opcional
  onSecondary,        // opcional
  className = "",
}) {
  const { base, dark } = usePrimaryColor();

  return (
    <div className={`card p-5 sm:p-6 flex flex-col gap-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div
          className="h-11 w-11 grid place-items-center rounded-2xl"
          style={{ backgroundColor: `${base}15` }}
        >
          {Icon ? <Icon className="h-5 w-5" style={{ color: dark }} /> : null}
        </div>
        <div className="min-w-0">
          {eyebrow ? (
            <div
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-black/5"
              style={{ backgroundColor: `${base}12`, color: dark }}
            >
              {eyebrow}
            </div>
          ) : null}
          <h3 className="mt-2 text-lg font-extrabold leading-tight">{title}</h3>
          {subtitle ? (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{subtitle}</p>
          ) : null}
        </div>
      </div>

      {bullets?.length ? (
        <ul className="mt-1 grid gap-2">
          {bullets.slice(0, 3).map((b) => (
            <li key={b} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
              <span
                className="mt-1 h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: base }}
              />
              <span className="min-w-0">{b}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onPrimary}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-transform"
          style={{ backgroundImage: `linear-gradient(90deg, ${dark}, ${base})` }}
        >
          {primaryLabel} <ArrowRight size={14} />
        </button>

        {secondaryLabel ? (
          <button
            type="button"
            onClick={onSecondary}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold border transition-colors"
            style={{ borderColor: base, color: dark }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${base}12`)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            {secondaryLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
