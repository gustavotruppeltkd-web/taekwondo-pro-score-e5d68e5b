import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScoreboardSettings } from "@/hooks/useScoreboard";
import { User } from "lucide-react";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: ScoreboardSettings;
  onSave: (settings: Partial<ScoreboardSettings>) => void;
  onResetMatch: () => void;
}

export const SettingsDialog = ({
  open,
  onOpenChange,
  settings,
  onSave,
  onResetMatch,
}: SettingsDialogProps) => {
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    if (open) {
      setLocalSettings(settings);
    }
  }, [open, settings]);

  const handleSave = () => {
    onSave(localSettings);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl">Configurações</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Athlete Names */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4" />
              Atletas
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chungName" className="text-chung">Nome Chung (Azul)</Label>
                <Input
                  id="chungName"
                  type="text"
                  value={localSettings.chungName}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    chungName: e.target.value
                  }))}
                  className="bg-input border-border"
                  placeholder="Atleta Azul"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hongName" className="text-hong">Nome Hong (Vermelho)</Label>
                <Input
                  id="hongName"
                  type="text"
                  value={localSettings.hongName}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    hongName: e.target.value
                  }))}
                  className="bg-input border-border"
                  placeholder="Atleta Vermelho"
                />
              </div>
            </div>
          </div>

          {/* Timer Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Tempo
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roundTime">Tempo de Round (seg)</Label>
                <Input
                  id="roundTime"
                  type="number"
                  value={localSettings.roundTime}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    roundTime: parseInt(e.target.value) || 120
                  }))}
                  className="bg-input border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="restTime">Tempo de Descanso (seg)</Label>
                <Input
                  id="restTime"
                  type="number"
                  value={localSettings.restTime}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    restTime: parseInt(e.target.value) || 60
                  }))}
                  className="bg-input border-border"
                />
              </div>
            </div>
          </div>

          {/* Victory Conditions */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Condições de Vitória
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxScore">Gap de Pontos</Label>
                <Input
                  id="maxScore"
                  type="number"
                  value={localSettings.maxScore}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    maxScore: parseInt(e.target.value) || 15
                  }))}
                  className="bg-input border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxGamjeom">Limite de Faltas</Label>
                <Input
                  id="maxGamjeom"
                  type="number"
                  value={localSettings.maxGamjeom}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    maxGamjeom: parseInt(e.target.value) || 5
                  }))}
                  className="bg-input border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalRounds">Número de Rounds</Label>
              <Input
                id="totalRounds"
                type="number"
                min="1"
                max="5"
                value={localSettings.totalRounds}
                onChange={(e) => setLocalSettings(prev => ({
                  ...prev,
                  totalRounds: Math.min(5, Math.max(1, parseInt(e.target.value) || 3))
                }))}
                className="bg-input border-border"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                onResetMatch();
                onOpenChange(false);
              }}
              className="flex-1"
            >
              Reiniciar Luta
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
