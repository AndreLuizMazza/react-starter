import { Handshake } from "lucide-react";
import CompactCTA from "./CompactCTA";

export default function ParceirosCompactCTA({ onPrimary, onSecondary, className }) {
  return (
    <CompactCTA
      className={className}
      icon={Handshake}
      eyebrow="Rede de Benefícios"
      title="Seja nosso parceiro"
      subtitle="Ofereça condições especiais e receba indicações qualificadas."
      bullets={[
        "Sem custo fixo",
        "Campanhas exclusivas",
        "Visibilidade para a base ativa",
      ]}
      primaryLabel="Quero ser parceiro(a)"
      onPrimary={onPrimary}
      secondaryLabel="Falar com o time"
      onSecondary={onSecondary}
    />
  );
}
