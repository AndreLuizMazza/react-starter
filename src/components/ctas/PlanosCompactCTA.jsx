import { Layers } from "lucide-react";
import CompactCTA from "./CompactCTA";

export default function PlanosCompactCTA({ onPrimary, onSecondary, className }) {
  return (
    <CompactCTA
      className={className}
      icon={Layers}
      eyebrow="Planos exclusivos"
      title="Conheça nossos planos"
      subtitle="Assistência e benefícios para você e sua família."
      bullets={[
        "Cobertura familiar",
        "Clube de Benefícios incluso",
        "Adesão simples e rápida",
      ]}
      primaryLabel="Ver planos"
      onPrimary={onPrimary}
      secondaryLabel="Simular agora"
      onSecondary={onSecondary}
    />
  );
}
