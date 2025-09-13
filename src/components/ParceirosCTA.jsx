// src/components/ParceirosCTA.jsx
import {
  CheckCircle2,
  Handshake,
  Store,
  Truck,
  Megaphone,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import CTAButton from "@/components/ui/CTAButton";
import { usePrimaryColor } from "@/lib/themeColor";

export default function ParceirosCTA({ onBecomePartner, whatsappHref = "#" }) {
  const { base, dark } = usePrimaryColor();

  return (
    <section
      id="parceiros"
      className="relative isolate overflow-hidden py-20 md:py-24"
    >
      {/* Fundo sólido sutil (sem gradiente) */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{ backgroundColor: `${base}08` }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Texto principal */}
          <div className="space-y-8 md:space-y-10">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium shadow-sm ring-1 ring-black/5 dark:ring-white/10"
              style={{ backgroundColor: `${base}20`, color: dark }}
            >
              <Sparkles className="h-4 w-4" /> Benefícios exclusivos para quem se conecta
            </div>

            <h2
              className="text-4xl sm:text-5xl font-extrabold tracking-tight"
              style={{ color: dark }}
            >
              Seja nosso parceiro premium
            </h2>

            <p className="text-lg text-slate-700 dark:text-slate-300 max-w-prose">
              Ofereça <strong>condições especiais</strong> aos associados e receba{" "}
              <em>indicações qualificadas</em>, <em>visibilidade</em> e{" "}
              <em>novos clientes</em>. Parceria transparente e focada em resultado.
            </p>

            {/* Benefícios */}
            <ul className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: Store, text: "Divulgação para base ativa" },
                { icon: Megaphone, text: "Indicações e campanhas exclusivas" },
                { icon: ShieldCheck, text: "Sem custo fixo, paga quem vende" },
                { icon: Truck, text: "Fluxo constante de novos clientes" },
              ].map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex items-center gap-3 rounded-xl bg-white/80 dark:bg-slate-900/40 shadow-sm p-3 border border-slate-200/70 dark:border-slate-700/70"
                >
                  <Icon className="h-5 w-5" style={{ color: base }} />
                  <span className="text-sm sm:text-base">{text}</span>
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-3">
              <CTAButton onClick={onBecomePartner} iconAfter={<ArrowRight size={16} />} style={{ backgroundColor: base, color: "#fff" }}>
                Quero ser parceiro(a)
              </CTAButton>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold transition-colors"
                style={{
                  border: `1px solid ${base}`,
                  color: dark,
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = `${base}12`)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <MessageSquare size={16} /> Falar com o time
              </a>
            </div>

            {/* Tags */}
            <div className="pt-4">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Segmentos que buscamos
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  "Farmácias",
                  "Clínicas",
                  "Óticas",
                  "Mercados",
                  "Academias",
                  "Transporte",
                  "Serviços Domésticos",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs rounded-full px-3 py-1"
                    style={{
                      backgroundColor: `${base}1A`,
                      color: dark,
                      border: `1px solid ${base}33`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Card lateral */}
          <aside className="order-first lg:order-last">
            <div className="relative rounded-3xl border border-slate-200/70 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/50 p-8 shadow-xl">
              <div className="flex items-center gap-3">
                <div
                  className="h-12 w-12 rounded-2xl grid place-items-center"
                  style={{ backgroundColor: `${base}20`, color: dark }}
                >
                  <Handshake className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-base font-semibold">Rede de Benefícios Premium</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Empresas selecionadas e verificadas
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  "Exposição em campanhas digitais",
                  "Destaque no Clube de Benefícios",
                  "Eventos e ativações exclusivas",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-xl border border-slate-200/70 dark:border-slate-700/70 p-3 bg-white/80 dark:bg-slate-900/40"
                  >
                    <CheckCircle2 className="h-5 w-5" style={{ color: base }} />
                    <p className="text-sm">{item}</p>
                  </div>
                ))}
              </div>

              <div
                className="mt-6 rounded-2xl border border-dashed p-4 text-sm"
                style={{ borderColor: `${base}66` }}
              >
                <p className="font-semibold">Critérios para participação</p>
                <ul className="mt-2 list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
                  <li>Possuir CNPJ ativo</li>
                  <li>Oferecer desconto real aos associados</li>
                  <li>Manter qualidade de atendimento</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
