import { cn } from "@/lib/utils";

import socoAzul from "@/assets/points/soco-azul.png";
import socoVermelho from "@/assets/points/soco-vermelho.png";
import coleteAzul from "@/assets/points/colete-azul.png";
import coleteVermelho from "@/assets/points/colete-vermelho.png";
import capaceteAzul from "@/assets/points/capacete-azul.png";
import capaceteVermelho from "@/assets/points/capacete-vermelho.png";
import giroColeteAzul from "@/assets/points/giro-colete-azul.png";
import giroColeteVermelho from "@/assets/points/giro-colete-vermelho.png";
import giroCapaceteAzul from "@/assets/points/giro-capacete-azul.png";
import giroCapaceteVermelho from "@/assets/points/giro-capacete-vermelho.png";
import faltaAzul from "@/assets/points/falta-azul.png";
import faltaVermelho from "@/assets/points/falta-vermelho.png";

/**
 * Picks the technique icon for a scoring/penalty history entry, using the
 * user-provided artwork. Colour follows the side (chung = azul, hong =
 * vermelho); the image maps to the point value / action:
 *   1 = soco, 2 = colete, 3 = capacete, doubled 2/3 = giro (spinning),
 *   gam-jeom = falta.
 */
interface PointIconProps {
  side: "chung" | "hong";
  value: number;
  type: "score" | "gamjeom";
  isDouble?: boolean;
  className?: string;
}

const ICONS = {
  chung: {
    soco: socoAzul,
    colete: coleteAzul,
    capacete: capaceteAzul,
    "giro-colete": giroColeteAzul,
    "giro-capacete": giroCapaceteAzul,
    falta: faltaAzul,
  },
  hong: {
    soco: socoVermelho,
    colete: coleteVermelho,
    capacete: capaceteVermelho,
    "giro-colete": giroColeteVermelho,
    "giro-capacete": giroCapaceteVermelho,
    falta: faltaVermelho,
  },
} as const;

const pickKey = (value: number, type: "score" | "gamjeom", isDouble?: boolean) => {
  if (type === "gamjeom") return "falta" as const;
  if (isDouble && value >= 3) return "giro-capacete" as const;
  if (isDouble && value === 2) return "giro-colete" as const;
  if (value >= 3) return "capacete" as const;
  if (value === 2) return "colete" as const;
  return "soco" as const;
};

export const PointIcon = ({ side, value, type, isDouble, className }: PointIconProps) => {
  const src = ICONS[side][pickKey(value, type, isDouble)];
  return <img src={src} alt="" draggable={false} className={cn("object-contain", className)} />;
};
