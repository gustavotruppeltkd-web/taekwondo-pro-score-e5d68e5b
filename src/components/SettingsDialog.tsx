import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScoreboardSettings } from "@/hooks/useScoreboard";
import { Upload, Volume2, User } from "lucide-react";

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
  const [audioFiles, setAudioFiles] = useState({
    roundStart: null as File | null,
    roundEnd: null as File | null,
    tenSecondWarning: null as File | null,
  });

  useEffect(() => {
    if (open) {
      setLocalSettings(settings);
    }
  }, [open, settings]);

  const handleSave = () => {
    onSave(localSettings);
    onOpenChange(false);
  };

  const handleAudioUpload = (type: keyof typeof audioFiles, file: File | null) => {
    setAudioFiles(prev => ({ ...prev, [type]: file }));
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
<<<<<<< HEAD

=======
            
>>>>>>> 4626dc2268bb028cf6484ed50806830590d046b8
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chungName" className="text-chung">Nome Chung (Azul)</Label>
                <Input
                  id="chungName"
                  type="text"
                  value={localSettings.chungName}
<<<<<<< HEAD
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    chungName: e.target.value
=======
                  onChange={(e) => setLocalSettings(prev => ({ 
                    ...prev, 
                    chungName: e.target.value || 'Atleta Azul' 
>>>>>>> 4626dc2268bb028cf6484ed50806830590d046b8
                  }))}
                  className="bg-input border-border"
                  placeholder="Atleta Azul"
                />
              </div>
<<<<<<< HEAD

=======
              
>>>>>>> 4626dc2268bb028cf6484ed50806830590d046b8
              <div className="space-y-2">
                <Label htmlFor="hongName" className="text-hong">Nome Hong (Vermelho)</Label>
                <Input
                  id="hongName"
                  type="text"
                  value={localSettings.hongName}
<<<<<<< HEAD
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    hongName: e.target.value
=======
                  onChange={(e) => setLocalSettings(prev => ({ 
                    ...prev, 
                    hongName: e.target.value || 'Atleta Vermelho' 
>>>>>>> 4626dc2268bb028cf6484ed50806830590d046b8
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
<<<<<<< HEAD

=======
            
>>>>>>> 4626dc2268bb028cf6484ed50806830590d046b8
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roundTime">Tempo de Round (seg)</Label>
                <Input
                  id="roundTime"
                  type="number"
                  value={localSettings.roundTime}
<<<<<<< HEAD
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    roundTime: parseInt(e.target.value) || 120
=======
                  onChange={(e) => setLocalSettings(prev => ({ 
                    ...prev, 
                    roundTime: parseInt(e.target.value) || 120 
>>>>>>> 4626dc2268bb028cf6484ed50806830590d046b8
                  }))}
                  className="bg-input border-border"
                />
              </div>
<<<<<<< HEAD

=======
              
>>>>>>> 4626dc2268bb028cf6484ed50806830590d046b8
              <div className="space-y-2">
                <Label htmlFor="restTime">Tempo de Descanso (seg)</Label>
                <Input
                  id="restTime"
                  type="number"
                  value={localSettings.restTime}
<<<<<<< HEAD
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    restTime: parseInt(e.target.value) || 60
=======
                  onChange={(e) => setLocalSettings(prev => ({ 
                    ...prev, 
                    restTime: parseInt(e.target.value) || 60 
>>>>>>> 4626dc2268bb028cf6484ed50806830590d046b8
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
<<<<<<< HEAD

=======
            
>>>>>>> 4626dc2268bb028cf6484ed50806830590d046b8
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxScore">Gap de Pontos</Label>
                <Input
                  id="maxScore"
                  type="number"
                  value={localSettings.maxScore}
<<<<<<< HEAD
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    maxScore: parseInt(e.target.value) || 20
=======
                  onChange={(e) => setLocalSettings(prev => ({ 
                    ...prev, 
                    maxScore: parseInt(e.target.value) || 20 
>>>>>>> 4626dc2268bb028cf6484ed50806830590d046b8
                  }))}
                  className="bg-input border-border"
                />
              </div>
<<<<<<< HEAD

=======
              
>>>>>>> 4626dc2268bb028cf6484ed50806830590d046b8
              <div className="space-y-2">
                <Label htmlFor="maxGamjeom">Limite de Faltas</Label>
                <Input
                  id="maxGamjeom"
                  type="number"
                  value={localSettings.maxGamjeom}
<<<<<<< HEAD
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    maxGamjeom: parseInt(e.target.value) || 10
=======
                  onChange={(e) => setLocalSettings(prev => ({ 
                    ...prev, 
                    maxGamjeom: parseInt(e.target.value) || 10 
>>>>>>> 4626dc2268bb028cf6484ed50806830590d046b8
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
<<<<<<< HEAD
                onChange={(e) => setLocalSettings(prev => ({
                  ...prev,
=======
                onChange={(e) => setLocalSettings(prev => ({ 
                  ...prev, 
>>>>>>> 4626dc2268bb028cf6484ed50806830590d046b8
                  totalRounds: Math.min(5, Math.max(1, parseInt(e.target.value) || 3))
                }))}
                className="bg-input border-border"
              />
            </div>
          </div>

          {/* Audio Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Áudio
            </h3>
<<<<<<< HEAD

=======
            
>>>>>>> 4626dc2268bb028cf6484ed50806830590d046b8
            <div className="space-y-3">
              {[
                { key: 'roundStart', label: 'Início de Round' },
                { key: 'roundEnd', label: 'Fim de Round' },
                { key: 'tenSecondWarning', label: 'Alerta 10 Segundos' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => handleAudioUpload(
<<<<<<< HEAD
                        key as keyof typeof audioFiles,
=======
                        key as keyof typeof audioFiles, 
>>>>>>> 4626dc2268bb028cf6484ed50806830590d046b8
                        e.target.files?.[0] || null
                      )}
                    />
                    <span className={`text-xs ${audioFiles[key as keyof typeof audioFiles] ? 'text-timer' : 'text-muted-foreground'}`}>
                      {audioFiles[key as keyof typeof audioFiles]?.name || 'Beep padrão'}
                    </span>
                    <Upload className="w-4 h-4 text-muted-foreground" />
                  </label>
                </div>
              ))}
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
