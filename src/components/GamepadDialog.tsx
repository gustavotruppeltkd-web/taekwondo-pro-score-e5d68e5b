import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GamepadMapping, defaultMapping, useGamepadButtonListener } from "@/hooks/useGamepad";
import { Gamepad2, Check, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface GamepadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mapping: GamepadMapping;
  onSaveMapping: (mapping: GamepadMapping) => void;
  gamepadConnected: boolean;
  gamepadName: string | null;
}

const mappingLabels: Record<keyof GamepadMapping, { label: string; side: 'chung' | 'hong' | 'general' }> = {
  chungPlus1: { label: '+1 Ponto', side: 'chung' },
  chungPlus2: { label: '+2 Pontos', side: 'chung' },
  chungPlus3: { label: '+3 Pontos', side: 'chung' },
  chungGamjeom: { label: 'Gam-jeom', side: 'chung' },
  hongPlus1: { label: '+1 Ponto', side: 'hong' },
  hongPlus2: { label: '+2 Pontos', side: 'hong' },
  hongPlus3: { label: '+3 Pontos', side: 'hong' },
  hongGamjeom: { label: 'Gam-jeom', side: 'hong' },
  startPause: { label: 'Iniciar/Pausar', side: 'general' },
  resetRound: { label: 'Resetar Round', side: 'general' },
  subtractMode: { label: 'Modo Correção (-)', side: 'general' },
  decisionChung: { label: 'Decisão Azul (Empate)', side: 'general' },
  decisionHong: { label: 'Decisão Vermelho (Empate)', side: 'general' },
};

const buttonNames: Record<number, string> = {
  0: 'X / A',
  1: 'Círculo / B',
  2: 'Quadrado / X',
  3: 'Triângulo / Y',
  4: 'L1 / LB',
  5: 'R1 / RB',
  6: 'L2 / LT',
  7: 'R2 / RT',
  8: 'Share / Back',
  9: 'Options / Start',
  10: 'L3',
  11: 'R3',
  12: 'D-pad Up',
  13: 'D-pad Down',
  14: 'D-pad Left',
  15: 'D-pad Right',
  16: 'PS / Guide',
  17: 'Touchpad',
};

export const GamepadDialog = ({
  open,
  onOpenChange,
  mapping,
  onSaveMapping,
  gamepadConnected,
  gamepadName,
}: GamepadDialogProps) => {
  const [localMapping, setLocalMapping] = useState<GamepadMapping>(mapping);
  const [listeningFor, setListeningFor] = useState<keyof GamepadMapping | null>(null);

  const handleButtonPress = useCallback((buttonIndex: number) => {
    if (listeningFor) {
      setLocalMapping(prev => ({
        ...prev,
        [listeningFor]: buttonIndex,
      }));
      setListeningFor(null);
    }
  }, [listeningFor]);

  useGamepadButtonListener(open && listeningFor ? handleButtonPress : () => {});

  const handleSave = () => {
    onSaveMapping(localMapping);
    onOpenChange(false);
  };

  const handleReset = () => {
    setLocalMapping(defaultMapping);
  };

  const renderMappingButton = (key: keyof GamepadMapping) => {
    const { label, side } = mappingLabels[key];
    const buttonIndex = localMapping[key];
    const isListening = listeningFor === key;

    return (
      <button
        key={key}
        onClick={() => setListeningFor(isListening ? null : key)}
        className={cn(
          "flex items-center justify-between p-3 rounded-lg transition-all",
          "border-2",
          isListening 
            ? "border-primary bg-primary/10 animate-pulse" 
            : "border-border hover:border-muted-foreground",
          side === 'chung' && "hover:border-chung/50",
          side === 'hong' && "hover:border-hong/50"
        )}
      >
        <span className="text-sm font-medium">{label}</span>
        <span className={cn(
          "text-xs px-2 py-1 rounded",
          isListening 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted text-muted-foreground"
        )}>
          {isListening ? 'Pressione...' : buttonIndex !== null ? buttonNames[buttonIndex] || `Botão ${buttonIndex}` : 'Não mapeado'}
        </span>
      </button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl flex items-center gap-2">
            <Gamepad2 className="w-6 h-6" />
            Configurar Controle
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Connection Status */}
          <div className={cn(
            "flex items-center gap-3 p-3 rounded-lg",
            gamepadConnected ? "bg-timer/10 border border-timer/30" : "bg-muted"
          )}>
            <div className={cn(
              "w-3 h-3 rounded-full",
              gamepadConnected ? "bg-timer animate-pulse" : "bg-muted-foreground"
            )} />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {gamepadConnected ? 'Controle Conectado' : 'Nenhum controle detectado'}
              </p>
              {gamepadName && (
                <p className="text-xs text-muted-foreground truncate">{gamepadName}</p>
              )}
            </div>
          </div>

          {/* Chung Mappings */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-chung uppercase tracking-wider flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-chung" />
              Atleta Azul (Chung)
            </h3>
            <div className="grid gap-2">
              {(['chungPlus1', 'chungPlus2', 'chungPlus3', 'chungGamjeom'] as const).map(renderMappingButton)}
            </div>
          </div>

          {/* Hong Mappings */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-hong uppercase tracking-wider flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-hong" />
              Atleta Vermelho (Hong)
            </h3>
            <div className="grid gap-2">
              {(['hongPlus1', 'hongPlus2', 'hongPlus3', 'hongGamjeom'] as const).map(renderMappingButton)}
            </div>
          </div>

          {/* General Mappings */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Controles Gerais
            </h3>
            <div className="grid gap-2">
              {(['startPause', 'resetRound', 'subtractMode', 'decisionChung', 'decisionHong'] as const).map(renderMappingButton)}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Padrão
            </Button>
            <Button onClick={handleSave} className="flex-1 flex items-center gap-2">
              <Check className="w-4 h-4" />
              Salvar Mapeamento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
