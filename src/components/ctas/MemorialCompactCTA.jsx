import { Flower2 } from "lucide-react";
import CompactCTA from "./CompactCTA";

export default function MemorialCompactCTA({ onPrimary, onSecondary, className }) {
  return (
    <CompactCTA
      className={className}
      icon={Flower2}
      eyebrow="Homenagens & lembranças"
      title="Visite o Memorial Online"
      subtitle="Acenda uma vela virtual e deixe sua mensagem de carinho."
      bullets={[
        "Flores e velas virtuais",
        "Mensagens de apoio",
        "Informações de cerimônias",
      ]}
      primaryLabel="Acessar Memorial"
      onPrimary={onPrimary}
      secondaryLabel="Saiba mais"
      onSecondary={onSecondary}
    />
  );
}
