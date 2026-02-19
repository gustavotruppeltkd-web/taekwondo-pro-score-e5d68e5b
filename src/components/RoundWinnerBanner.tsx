import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface RoundWinnerBannerProps {
  winner: 'chung' | 'hong' | null;
  winnerName: string;
  round: number;
<<<<<<< HEAD
  matchEnded?: boolean;
=======
>>>>>>> 4626dc2268bb028cf6484ed50806830590d046b8
  onDismiss: () => void;
}

export const RoundWinnerBanner = ({
  winner,
  winnerName,
  round,
<<<<<<< HEAD
  matchEnded,
=======
>>>>>>> 4626dc2268bb028cf6484ed50806830590d046b8
  onDismiss,
}: RoundWinnerBannerProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (winner) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [winner, onDismiss]);

  if (!winner) return null;

  return (
<<<<<<< HEAD
    <div
=======
    <div 
>>>>>>> 4626dc2268bb028cf6484ed50806830590d046b8
      className={cn(
        "fixed inset-0 z-40 flex items-center justify-center pointer-events-none",
        "transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0"
      )}
    >
<<<<<<< HEAD
      <div
=======
      <div 
>>>>>>> 4626dc2268bb028cf6484ed50806830590d046b8
        className={cn(
          "px-8 md:px-16 py-6 md:py-10 rounded-2xl",
          "border-4 scoreboard-shadow",
          "transform transition-transform duration-300",
          visible ? "scale-100" : "scale-90",
<<<<<<< HEAD
          winner === 'chung'
            ? "bg-chung border-chung-dark"
=======
          winner === 'chung' 
            ? "bg-chung border-chung-dark" 
>>>>>>> 4626dc2268bb028cf6484ed50806830590d046b8
            : "bg-hong border-hong-dark"
        )}
      >
        <p className="text-lg md:text-2xl text-white/80 text-center uppercase tracking-widest mb-2">
<<<<<<< HEAD
          {matchEnded ? "Vencedor da Luta" : `Vencedor do Round ${round}`}
=======
          Vencedor do Round {round}
>>>>>>> 4626dc2268bb028cf6484ed50806830590d046b8
        </p>
        <h2 className="text-3xl md:text-6xl font-bold text-white text-center uppercase">
          {winnerName}
        </h2>
      </div>
    </div>
  );
};
