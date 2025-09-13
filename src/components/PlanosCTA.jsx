import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import CTAButton from "@/components/ui/CTAButton";
import { usePrimaryColor } from "@/lib/themeColor";

export default function PlanosCTA({ onSeePlans }) {
  const { base, dark } = usePrimaryColor();

  return (
    <section
      id="planos-cta"
      className="relative isolate overflow-hidden py-16 md:py-20"
    >
      {/* Fundo sólido sutil */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{ backgroundColor: `${base}08` }}
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium shadow-sm ring-1 ring-black/5 dark:ring-white/10"
          style={{ backgroundColor: `${base}20`, color: dark }}
        >
          <Sparkles className="h-4 w-4" /> Planos exclusivos para você
        </div>

        <h2
          className="text-3xl sm:text-4xl font-extrabold tracking-tight"
          style={{ color: dark }}
        >
          Conheça os planos da nossa empresa
        </h2>

        <p className="max-w-2xl mx-auto text-lg text-slate-700 dark:text-slate-300">
          Soluções completas em <strong>assistência</strong> e{" "}
          <strong>benefícios</strong>. Escolha o plano ideal e tenha tranquilidade
          em todos os momentos.
        </p>

        {/* Benefícios rápidos */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3 text-left max-w-3xl mx-auto">
          {[
            "Cobertura para toda a família",
            "Clube de Benefícios incluso",
            "Adesão simples e rápida",
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 rounded-xl bg-white/80 dark:bg-slate-900/40 p-3 border border-slate-200/70 dark:border-slate-700/70 shadow-sm"
            >
              <CheckCircle2 className="h-5 w-5" style={{ color: base }} />
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>

        {/* CTA + reforço de segurança */}
        <div className="pt-6 space-y-2">
          <CTAButton
            onClick={onSeePlans}
            iconAfter={<ArrowRight size={16} />}
            style={{ backgroundColor: base, color: "#fff" }}
          >
            Ver planos agora
          </CTAButton>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sem fidelidade • Cancelamento a qualquer momento • Suporte humano
          </p>
        </div>
      </div>
    </section>
  );
}
