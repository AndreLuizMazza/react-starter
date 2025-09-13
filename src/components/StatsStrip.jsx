import { Users2, Star, Store } from "lucide-react";
import { usePrimaryColor } from "@/lib/themeColor";

/** Faixa de prova social – reforça confiança e fidelização */
export default function StatsStrip({
  associados = "12k+",
  parceiros = "180+",
  avaliacao = "4.8/5",
}) {
  const { base } = usePrimaryColor();
  return (
    <section className="py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icon: Users2, label: "Associados ativos", value: associados },
            { icon: Store,  label: "Parceiros verificados", value: parceiros },
            { icon: Star,   label: "Avaliação média", value: avaliacao },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 rounded-2xl bg-white/80 dark:bg-slate-900/40 p-4 border border-slate-200/70 dark:border-slate-700/70 shadow-sm">
              <div className="h-10 w-10 grid place-items-center rounded-xl" style={{ backgroundColor: `${base}15` }}>
                <Icon className="h-5 w-5" style={{ color: base }} />
              </div>
              <div>
                <div className="text-lg font-extrabold">{value}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
