import { cn } from "@/lib/utils";
import { PointIcon } from "./PointIcon";

export interface PointEntry {
  value: number;
  type: 'score' | 'gamjeom';
  timestamp: number;
  isDouble?: boolean;
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
            "flex items-center justify-center rounded-lg p-1.5 md:p-2",
            "backdrop-blur-sm shadow-lg transition-all",
            entry.type === 'gamjeom'
              ? "bg-gamjeom/80 text-black border border-gamjeom"
              : entry.isDouble
                ? "bg-amber-400/90 text-black border border-amber-500"
                : "bg-white/20 text-white border border-white/30",
            index === 0 && "animate-pulse-once"
          )}
          style={{
            opacity: 1 - (index * 0.15),
            transform: `scale(${1 - (index * 0.05)})`
          }}
        >
          <PointIcon
            value={entry.value}
            type={entry.type}
            isDouble={entry.isDouble}
            className="w-5 h-5 md:w-6 md:h-6"
          />
        </div>
      ))}
    </div>
  );
};
