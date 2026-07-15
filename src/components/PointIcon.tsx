import { cn } from "@/lib/utils";

/**
 * Renders the technique icon for a scoring/penalty history entry, based on the
 * point value: 1 = soco (punch), 2 = colete (body kick), 3 = capacete (head
 * kick). Doubled points (spinning techniques) keep the base icon and add a
 * small rotation badge in the corner. Gam-jeom (penalty) shows a fault flag.
 * Clean inline SVGs — no image assets, keeps the bundle light.
 */
interface PointIconProps {
  value: number;
  type: "score" | "gamjeom";
  isDouble?: boolean;
  className?: string;
}

const svg = "w-full h-full";

// Punch — a closed fist (knuckle block + thumb).
const Fist = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={svg} aria-hidden>
    <rect x="5.5" y="9" width="12" height="9.5" rx="2.6" />
    <rect x="7" y="6.4" width="2.3" height="4.2" rx="1.1" />
    <rect x="9.9" y="5.7" width="2.3" height="5" rx="1.1" />
    <rect x="12.8" y="6.4" width="2.3" height="4.2" rx="1.1" />
    <path d="M17 10.5c1.6-.4 3 .3 3 1.8s-1.2 2.3-3 2z" />
  </svg>
);

// Trunk protector (body kick) — a chest-guard shield.
const Vest = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={svg} aria-hidden>
    <path d="M12 2.5l7.5 2.2v6.1c0 4.8-3.2 8-7.5 9.7-4.3-1.7-7.5-4.9-7.5-9.7V4.7z" />
  </svg>
);

// Head guard (head kick) — a helmet with chin bar.
const Helmet = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={svg} aria-hidden>
    <path d="M12 3a7 7 0 0 0-7 7v2.5A1.5 1.5 0 0 0 6.5 14H8V9.8a4 4 0 0 1 8 0V14h1.5a1.5 1.5 0 0 0 1.5-1.5V10a7 7 0 0 0-7-7z" />
    <rect x="7.5" y="14.5" width="9" height="4" rx="1.4" />
  </svg>
);

const Fault = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={svg} aria-hidden>
    <path d="M5 3h2v18H5zM8 4h9l-2 3 2 3H8z" />
  </svg>
);

// Small rotation badge shown in the corner for spinning (doubled) techniques.
const SpinBadge = () => (
  <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-black/80 text-amber-300 flex items-center justify-center">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="w-2.5 h-2.5" aria-hidden>
      <path d="M20 11.5a8 8 0 1 1-2.3-5.3" />
      <path d="M20 3.5v4h-4" />
    </svg>
  </span>
);

export const PointIcon = ({ value, type, isDouble, className }: PointIconProps) => {
  const base =
    type === "gamjeom" ? <Fault /> : value >= 3 ? <Helmet /> : value === 2 ? <Vest /> : <Fist />;

  return (
    <span className={cn("relative inline-flex items-center justify-center", className)}>
      {base}
      {isDouble && <SpinBadge />}
    </span>
  );
};
