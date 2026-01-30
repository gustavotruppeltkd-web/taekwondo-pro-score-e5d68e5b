import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { unlockAudio, isAudioUnlocked } from "@/hooks/useAudio";

interface AudioUnlockButtonProps {
  onUnlock?: () => void;
}

export const AudioUnlockButton = ({ onUnlock }: AudioUnlockButtonProps) => {
  const [unlocked, setUnlocked] = useState(isAudioUnlocked());

  const handleUnlock = async () => {
    const success = await unlockAudio();
    if (success) {
      setUnlocked(true);
      onUnlock?.();
    }
  };

  if (unlocked) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 p-8">
        <VolumeX className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-2xl md:text-4xl font-bold text-foreground text-center">
          Ativar Som
        </h2>
        <p className="text-muted-foreground text-center max-w-md">
          Toque no botão abaixo para ativar os alertas sonoros do placar.
          Isso é necessário em dispositivos iOS/Safari.
        </p>
        <button
          onClick={handleUnlock}
          className={cn(
            "flex items-center gap-3 px-8 py-4 rounded-xl",
            "bg-primary hover:bg-primary/80 text-primary-foreground",
            "font-bold text-xl transition-all duration-200 active:scale-95"
          )}
        >
          <Volume2 className="w-6 h-6" />
          Iniciar com Som
        </button>
      </div>
    </div>
  );
};
