import { ArrowRight, Flower2, Heart, Sparkles, Landmark } from "lucide-react";
import CTAButton from "@/components/ui/CTAButton";
import { usePrimaryColor } from "@/lib/themeColor";

export default function MemorialCTA({ onVisitMemorial }) {
  const { base, dark } = usePrimaryColor();

  return (
    <section id="memorial-cta" className="relative isolate overflow-hidden py-16 md:py-20">
      {/* Fundo suave */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-10 -left-10 h-72 w-72 rounded-full opacity-15 blur-3xl"
             style={{ background: `radial-gradient(circle, ${base} 0%, transparent 70%)` }}/>
        <div className="absolute -bottom-10 -right-10 h-72 w-72 rounded-full opacity-10 blur-3xl"
             style={{ background: `radial-gradient(circle, ${dark} 0%, transparent 70%)` }}/>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium shadow-sm ring-1 ring-black/5 dark:ring-white/10"
             style={{ backgroundColor: `${base}15`, color: dark }}>
          <Sparkles className="h-4 w-4" /> Homenagens e lembranças
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight"
            style={{ color: dark }}>
          Visite nosso Memorial Online
        </h2>

        <p className="max-w-2xl mx-auto text-lg text-slate-700 dark:text-slate-300">
          Um espaço para <strong>homenagens</strong>, <em>lembranças</em> e <em>celebração da vida</em>.  
          Encontre informações das cerimônias, acenda uma vela virtual e deixe sua mensagem de carinho.
        </p>

        {/* Benefícios rápidos */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3 text-left max-w-3xl mx-auto">
          {[
            { icon: Flower2, text: "Flores e velas virtuais" },
            { icon: Heart,   text: "Mensagens de apoio e lembranças" },
            { icon: Landmark, text: "Informações de velórios e sepultamentos" },
          ].map(({ icon: Icon, text }) => (
            <div key={text}
                 className="flex items-center gap-2 rounded-xl bg-white/70 dark:bg-slate-900/40 p-3 border border-slate-200/70 dark:border-slate-700/70 shadow-sm">
              <Icon className="h-5 w-5" style={{ color: base }} />
              <span className="text-sm">{text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="pt-6">
          <CTAButton onClick={onVisitMemorial} iconAfter={<ArrowRight size={16} />}>
            Acessar o Memorial
          </CTAButton>
        </div>

        {/* Cartão visual */}
        <div className="pt-6">
          <div className="mx-auto max-w-xl rounded-3xl border border-slate-200/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/50 p-8 shadow-sm">
            <div className="flex items-center gap-2 justify-center text-slate-800 dark:text-slate-200">
              <Landmark className="h-6 w-6" style={{ color: base }} />
              <h3 className="text-base font-semibold">Homenagens eternas</h3>
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Preservando memórias e fortalecendo laços
            </p>

          </div>
        </div>
      </div>
    </section>
  );
}
