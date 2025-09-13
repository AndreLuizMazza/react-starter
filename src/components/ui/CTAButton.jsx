import { usePrimaryColor } from "@/lib/themeColor";

/** Botão primário padronizado (acessível + micro-animação) */
export default function CTAButton({ children, onClick, as = "button", className = "", iconAfter = null }) {
  const { base, dark } = usePrimaryColor();
  const cls =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold text-white " +
    "shadow-md hover:shadow-lg hover:scale-[1.02] transition-transform focus:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-offset-2";
  const style = { backgroundImage: `linear-gradient(90deg, ${dark}, ${base})` };

  if (as === "a") {
    return (
      <a onClick={onClick} className={`${cls} ${className}`} style={style}>
        {children} {iconAfter}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={`${cls} ${className}`} style={style}>
      {children} {iconAfter}
    </button>
  );
}
