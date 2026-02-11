import { cn } from "@/lib/utils";

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
            "px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm font-bold",
            "backdrop-blur-sm shadow-lg transition-all",
            entry.value > 0 
              ? "bg-white/20 text-white border border-white/30" 
              : "bg-gamjeom/80 text-black border border-gamjeom",
            index === 0 && "animate-pulse-once"
          )}
          style={{ 
            opacity: 1 - (index * 0.15),
            transform: `scale(${1 - (index * 0.05)})`
          }}
        >
          {entry.value > 0 ? `+${entry.value}` : entry.value}
        </div>
      ))}
    </div>
  );
};
