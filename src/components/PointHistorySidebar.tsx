import { cn } from "@/lib/utils";
import { PointIcon } from "./PointIcon";

export interface PointEntry {
  value: number;
  type: 'score' | 'gamjeom';
  timestamp: number;
  isDouble?: boolean;
  /** True when this +1 was awarded because the opponent committed a gam-jeom
   *  (so it shows the falta icon, not a soco). */
  fromGamjeom?: boolean;
}

interface PointHistorySidebarProps {
  side: 'chung' | 'hong';
  history: PointEntry[];
}

export const PointHistorySidebar = ({ side, history }: PointHistorySidebarProps) => {
  const isChung = side === 'chung';
  const lastFive = history.slice(-5).reverse();

  return (
    <div className={cn(
      "absolute top-1/2 -translate-y-1/2 flex flex-col gap-2",
      isChung ? "left-2 md:left-4" : "right-2 md:right-4"
    )}>
      {lastFive.map((entry, index) => (
        <div
          key={entry.timestamp}
          className={cn(
            "flex items-center justify-center rounded-xl overflow-hidden bg-white",
            "shadow-lg ring-1 ring-black/10 transition-all",
            "w-10 h-10 md:w-12 md:h-12",
            index === 0 && "animate-pulse-once"
          )}
          style={{
            opacity: 1 - (index * 0.15),
            transform: `scale(${1 - (index * 0.05)})`
          }}
        >
          <PointIcon
            side={side}
            value={entry.value}
            type={entry.type}
            isDouble={entry.isDouble}
            fromGamjeom={entry.fromGamjeom}
            className="w-full h-full p-1"
          />
        </div>
      ))}
    </div>
  );
};
