import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Handshake, Store, Truck, Megaphone, ShieldCheck, Sparkles } from "lucide-react";

/**
 * Seção CTA Premium: "Seja nosso parceiro"
 * - Mesmo visual, agora 100% theme-aware (sem cores hardcoded)
 * - As cores são derivadas do .btn-primary (base/dark), igual ao restante do site
 */
export default function ParceirosCTA({ onBecomePartner, whatsappHref = "#" }) {
  const { base, dark } = usePrimaryColor();

  return (
    <section id="parceiros" className="relative isolate overflow-hidden py-20 md:py-24">
      {/* Fundo com brilho suave usando a cor do cliente */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div
          className="absolute -top-24 -left-24 h-72 w-72 rounded-full opacity-15 blur-3xl"
          style={{ background: `radial-gradient(closest-side, ${base} 12%, transparent)` }}
        />
        <div
          className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full opacity-10 blur-3xl"
          style={{ background: `radial-gradient(closest-side, ${dark} 14%, transparent)` }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Texto principal */}
          <div className="space-y-8 md:space-y-10">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium shadow-sm ring-1 ring-black/5 dark:ring-white/10"
              style={{ backgroundColor: `${base}15`, color: dark }}
            >
              <Sparkles className="h-4 w-4" /> Benefícios exclusivos para quem se conecta
            </div>

            <h2
              className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(90deg, ${dark}, ${base})` }}
            >
              Seja nosso parceiro premium
            </h2>

            <p className="text-lg text-slate-700 dark:text-slate-300 max-w-prose">
              Ofereça <strong>condições especiais</strong> para nossos associados e receba em troca{" "}
              <em>indicações qualificadas</em>, <em>visibilidade</em> e <em>novos clientes</em>. Uma
              rede de confiança que valoriza prestadores de serviço e lojistas de qualidade.
            </p>

            {/* Benefícios */}
            <ul className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: Store, text: "Divulgação para base ativa" },
                { icon: Megaphone, text: "Indicações e campanhas exclusivas" },
                { icon: ShieldCheck, text: "Parceria transparente, sem custo fixo" },
                { icon: Truck, text: "Fluxo constante de novos clientes" },
              ].map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex items-center gap-3 rounded-xl bg-white/70 dark:bg-slate-900/40 shadow-sm p-3 border border-slate-200/70 dark:border-slate-700/70"
                >
                  <Icon className="h-5 w-5" style={{ color: base }} />
                  <span className="text-sm sm:text-base">{text}</span>
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-3">
              <button
                type="button"
                onClick={onBecomePartner}
                className="px-6 py-3 text-base font-semibold rounded-full text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-transform"
                style={{ backgroundImage: `linear-gradient(90deg, ${dark}, ${base})` }}
              >
                Quero ser parceiro(a)
              </button>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 text-base font-semibold rounded-full border transition-colors"
                style={{ borderColor: base, color: dark, backgroundColor: "transparent" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${base}12`)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                Falar com o time
              </a>
            </div>

            {/* Tags de segmentos */}
            <div className="pt-4">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Segmentos que buscamos</p>
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
                  style={{ backgroundColor: `${base}15`, color: dark }}
                >
                  <Handshake className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-base font-semibold">Rede de Benefícios Premium</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Empresas selecionadas e verificadas</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {["Exposição em campanhas digitais", "Destaque no Clube de Benefícios", "Eventos e ativações exclusivas"].map(
                  (item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-xl border border-slate-200/70 dark:border-slate-700/70 p-3 bg-white/70 dark:bg-slate-900/40"
                    >
                      <CheckCircle2 className="h-5 w-5" style={{ color: base }} />
                      <p className="text-sm">{item}</p>
                    </div>
                  )
                )}
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

/* === Util: mesma técnica da Home para extrair a cor do .btn-primary === */
function usePrimaryColor() {
  const [base, setBase] = useState("#ff5a1f"); // fallback seguro
  useEffect(() => {
    const el = document.createElement("button");
    el.className = "btn-primary";
    el.style.cssText = "position:absolute;opacity:0;pointer-events:none;left:-9999px";
    document.body.appendChild(el);
    const cs = getComputedStyle(el);
    let color = cs.backgroundColor;
    const bg = cs.backgroundImage || "";
    const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*\d*\.?\d+)?\)/);
    if (m) color = m[0];
    document.body.removeChild(el);
    if (color && color !== "transparent") setBase(color);
  }, []);
  const dark = useMemo(() => shade(base, -0.16), [base]);
  return { base, dark };
}

function clamp(n, min = 0, max = 1) { return Math.min(max, Math.max(min, n)) }
function rgbToHsl(r, g, b) {
  r/=255; g/=255; b/=255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h, s, l = (max+min)/2;
  if (max===min) { h=s=0 }
  else {
    const d = max-min;
    s = l>0.5 ? d/(2-max-min) : d/(max+min);
    switch (max) { case r: h=(g-b)/d+(g<b?6:0); break; case g: h=(b-r)/d+2; break; case b: h=(r-g)/d+4; break }
    h/=6;
  }
  return [h, s, l];
}
function hslToRgb(h, s, l){
  let r,g,b;
  if (s===0){ r=g=b=l }
  else {
    const hue2rgb=(p,q,t)=>{ if(t<0) t+=1; if(t>1) t-=1; if(t<1/6) return p+(q-p)*6*t; if(t<1/2) return q; if(t<2/3) return p+(q-p)*(2/3-t)*6; return p }
    const q=l<0.5 ? l*(1+s) : l+s-l*s
    const p=2*l-q
    r=hue2rgb(p,q,h+1/3); g=hue2rgb(p,q,h); b=hue2rgb(p,q,h-1/3)
  }
  return [Math.round(r*255), Math.round(g*255), Math.round(b*255)]
}
function shade(color, deltaL = -0.16) {
  let r=0,g=0,b=0;
  if (color.startsWith("#")) {
    const h = color.replace("#","");
    const x = h.length===3 ? h.split("").map(c=>c+c).join("") : h;
    r=parseInt(x.slice(0,2),16); g=parseInt(x.slice(2,4),16); b=parseInt(x.slice(4,6),16);
  } else {
    const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (m) { r=+m[1]; g=+m[2]; b=+m[3] }
  }
  let [h,s,l]=rgbToHsl(r,g,b);
  l = clamp(l + deltaL);
  const [nr,ng,nb] = hslToRgb(h,s,l);
  return `rgb(${nr}, ${ng}, ${nb})`;
}
