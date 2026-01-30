import { cn } from "@/lib/utils";

interface RefereeDecisionModalProps {
  open: boolean;
  chungName: string;
  hongName: string;
  onDecision: (winner: 'chung' | 'hong') => void;
}

export const RefereeDecisionModal = ({
  open,
  chungName,
  hongName,
  onDecision,
}: RefereeDecisionModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-background border-4 border-muted rounded-2xl p-6 md:p-10 max-w-2xl w-full mx-4 scoreboard-shadow">
        <h2 className="text-2xl md:text-4xl font-bold text-center text-foreground mb-2">
          EMPATE!
        </h2>
        <p className="text-lg md:text-xl text-center text-muted-foreground mb-6 md:mb-8">
          Decisão dos Árbitros
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          <button
            onClick={() => onDecision('chung')}
            className={cn(
              "flex-1 py-6 md:py-10 px-6 rounded-xl",
              "bg-chung hover:bg-chung/80 text-white",
              "font-bold text-xl md:text-3xl uppercase",
              "transition-all duration-200 active:scale-95",
              "border-4 border-chung-dark",
              "flex flex-col items-center gap-2"
            )}
          >
            <span className="text-sm md:text-lg opacity-80">L2</span>
            <span>{chungName}</span>
            <span className="text-base md:text-xl font-normal">Vitória Azul</span>
          </button>

          <button
            onClick={() => onDecision('hong')}
            className={cn(
              "flex-1 py-6 md:py-10 px-6 rounded-xl",
              "bg-hong hover:bg-hong/80 text-white",
              "font-bold text-xl md:text-3xl uppercase",
              "transition-all duration-200 active:scale-95",
              "border-4 border-hong-dark",
              "flex flex-col items-center gap-2"
            )}
          >
            <span className="text-sm md:text-lg opacity-80">R2</span>
            <span>{hongName}</span>
            <span className="text-base md:text-xl font-normal">Vitória Vermelha</span>
          </button>
        </div>
      </div>
    </div>
  );
};
