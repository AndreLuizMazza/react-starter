// Hook único para extrair a cor do tema (btn-primary) e gerar um tom mais escuro
import { useEffect, useMemo, useState } from "react";

export function usePrimaryColor() {
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

// ===== helpers =====
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
export function shade(color, deltaL = -0.16) {
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
