import { useState, useCallback, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GamepadMapping, defaultMapping, useGamepadButtonListener, activeAxisInputs, AXIS_BUTTON_BASE, HAT_BUTTON_BASE } from "@/hooks/useGamepad";
import { Gamepad2, Check, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const HAT_ARROWS = ["↑", "→", "↓", "←"];

// Human-readable name for a mapped input — real button, decoded D-pad direction,
// or an analog axis direction (virtual buttons) used by non-standard controllers.
const inputName = (index: number): string => {
  if (index >= HAT_BUTTON_BASE) {
    return `Direcional ${HAT_ARROWS[(index - HAT_BUTTON_BASE) % 4]}`;
  }
  if (index >= AXIS_BUTTON_BASE) {
    const axis = Math.floor((index - AXIS_BUTTON_BASE) / 2);
    const positive = (index - AXIS_BUTTON_BASE) % 2 === 1;
    return `Eixo ${axis} ${positive ? "+" : "−"}`;
  }
  return buttonNames[index] || `Botão ${index}`;
};

interface GamepadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mappings: Record<string, GamepadMapping>;
  onSaveMapping: (gamepadId: string, mapping: GamepadMapping) => void;
  gamepadConnected: boolean;
  gamepadCount: number;
  gamepadName: string | null;
  gamepadNames: string[];
}

const mappingLabels: Record<keyof GamepadMapping, { label: string; side: 'chung' | 'hong' | 'general' }> = {
  chungPlus1: { label: '+1 Ponto', side: 'chung' },
  chungPlus2: { label: '+2 Pontos', side: 'chung' },
  chungPlus3: { label: '+3 Pontos', side: 'chung' },
  chungGamjeom: { label: 'Gam-jeom', side: 'chung' },
  chungDouble: { label: 'Dobro', side: 'chung' },
  hongPlus1: { label: '+1 Ponto', side: 'hong' },
  hongPlus2: { label: '+2 Pontos', side: 'hong' },
  hongPlus3: { label: '+3 Pontos', side: 'hong' },
  hongGamjeom: { label: 'Gam-jeom', side: 'hong' },
  hongDouble: { label: 'Dobro', side: 'hong' },
  startPause: { label: 'Iniciar/Pausar', side: 'general' },
  resetRound: { label: 'Resetar Round', side: 'general' },
  subtractMode: { label: 'Modo Correção (-)', side: 'general' },
  decisionChung: { label: 'Decisão Azul (Empate)', side: 'general' },
  decisionHong: { label: 'Decisão Vermelho (Empate)', side: 'general' },
  resetMatch: { label: 'Resetar Luta', side: 'general' },
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

interface PadSnapshot {
  index: number;
  id: string;
  mapping: string;
  buttons: number;
  axes: number;
  pressed: string[];
}

// Live view of what each connected controller reports — helps diagnose
// non-standard pads (iPega etc.): mapping type, button/axis counts, and which
// input fires when a button is pressed. Read-only; polls only while mounted.
const GamepadDiagnostics = () => {
  const [pads, setPads] = useState<PadSnapshot[]>([]);
  const hatAxesRef = useRef<Map<number, Set<number>>>(new Map());

  useEffect(() => {
    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      if (t - last > 120) {
        last = t;
        const list = navigator.getGamepads?.() ?? [];
        const snap: PadSnapshot[] = [];
        for (let i = 0; i < list.length; i++) {
          const g = list[i];
          if (!g) continue;
          if (!hatAxesRef.current.has(g.index)) hatAxesRef.current.set(g.index, new Set());
          const hatAxes = hatAxesRef.current.get(g.index)!;
          const btns = g.buttons.map((b, idx) => (b.pressed ? `B${idx}` : null)).filter(Boolean) as string[];
          const axisBtns = activeAxisInputs(g.axes, hatAxes).map((v) => {
            if (v >= HAT_BUTTON_BASE) return `Dir ${HAT_ARROWS[(v - HAT_BUTTON_BASE) % 4]}`;
            const axis = Math.floor((v - AXIS_BUTTON_BASE) / 2);
            const pos = (v - AXIS_BUTTON_BASE) % 2 === 1;
            return `Eixo${axis}${pos ? "+" : "−"}`;
          });
          snap.push({
            index: g.index,
            id: g.id,
            mapping: g.mapping || "",
            buttons: g.buttons.length,
            axes: g.axes.length,
            pressed: [...btns, ...axisBtns],
          });
        }
        setPads(snap);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (pads.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Diagnóstico</h3>
      {pads.map((p) => (
        <div key={p.index} className="rounded-lg border border-border p-3 space-y-1.5">
          <p className="text-xs font-medium truncate">{p.id}</p>
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className={cn("px-2 py-0.5 rounded-full", p.mapping === "standard" ? "bg-timer/20 text-timer" : "bg-amber-500/20 text-amber-500")}>
              {p.mapping === "standard" ? "padrão ✓" : "não-padrão ⚠"}
            </span>
            <span className="text-muted-foreground">{p.buttons} botões · {p.axes} eixos</span>
          </div>
          <div className="min-h-[22px] flex flex-wrap gap-1">
            {p.pressed.length === 0 ? (
              <span className="text-[11px] text-muted-foreground">Pressione um botão para ver o que ele aciona…</span>
            ) : (
              p.pressed.map((label) => (
                <span key={label} className="text-[11px] px-1.5 py-0.5 rounded bg-primary text-primary-foreground font-mono">
                  {label}
                </span>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export const GamepadDialog = ({
  open,
  onOpenChange,
  mappings,
  onSaveMapping,
  gamepadConnected,
  gamepadCount,
  gamepadName,
  gamepadNames,
}: GamepadDialogProps) => {
  // Which connected controller we're configuring (by id).
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [localMapping, setLocalMapping] = useState<GamepadMapping>(defaultMapping);
  const [listeningFor, setListeningFor] = useState<keyof GamepadMapping | null>(null);

  // Keep a valid selected controller while open.
  useEffect(() => {
    if (!open) return;
    setSelectedId((cur) => (cur && gamepadNames.includes(cur) ? cur : gamepadNames[0] ?? null));
  }, [open, gamepadNames]);

  // Load the selected controller's saved mapping (or default) into the editor.
  useEffect(() => {
    if (!open) return;
    setLocalMapping(selectedId ? mappings[selectedId] ?? defaultMapping : defaultMapping);
    setListeningFor(null);
  }, [open, selectedId, mappings]);

  const handleButtonPress = useCallback((buttonIndex: number) => {
    if (listeningFor) {
      setLocalMapping(prev => {
        const next: GamepadMapping = { ...prev, [listeningFor]: buttonIndex };
        // Avoid conflicts: this input can only drive one action, so clear it
        // from any other action that was using it.
        (Object.keys(next) as (keyof GamepadMapping)[]).forEach((k) => {
          if (k !== listeningFor && next[k] === buttonIndex) next[k] = null;
        });
        return next;
      });
      setListeningFor(null);
    }
  }, [listeningFor]);

  useGamepadButtonListener(open && listeningFor ? handleButtonPress : () => { });

  const handleSave = () => {
    if (!selectedId) return;
    onSaveMapping(selectedId, localMapping);
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
          {isListening ? 'Pressione...' : buttonIndex !== null ? inputName(buttonIndex) : 'Não mapeado'}
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
                {gamepadConnected
                  ? `${gamepadCount} Controle${gamepadCount > 1 ? 's' : ''} Conectado${gamepadCount > 1 ? 's' : ''}`
                  : 'Nenhum controle detectado'}
              </p>
              {gamepadNames.length > 0 && (
                <div className="space-y-0.5">
                  {gamepadNames.map((name, i) => (
                    <p key={i} className="text-xs text-muted-foreground truncate">
                      {i + 1}. {name}
                    </p>
                  ))}
                </div>
              )}
              {gamepadCount >= 2 && (
                <p className="text-xs text-timer mt-1 font-medium">
                  ✓ Modo consenso ativo (pontos precisam de 2 controles)
                </p>
              )}
            </div>
          </div>

          {/* Live diagnostics — shows what each controller reports */}
          <GamepadDiagnostics />

          {/* Which controller are we configuring? */}
          {gamepadNames.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Configurando controle
              </h3>
              {gamepadNames.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {gamepadNames.map((id, i) => (
                    <button
                      key={id}
                      onClick={() => setSelectedId(id)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs border-2 transition-all max-w-full truncate",
                        selectedId === id ? "border-primary bg-primary/10" : "border-border hover:border-muted-foreground"
                      )}
                    >
                      {i + 1}. {id}
                    </button>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground truncate">
                {selectedId}
                {selectedId && (mappings[selectedId] ? " · mapeamento salvo ✓" : " · usando padrão")}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-500">
              Conecte um controle para personalizar e salvar o mapeamento dele. Cada controle guarda o próprio mapeamento automaticamente.
            </div>
          )}

          {/* Chung Mappings */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-chung uppercase tracking-wider flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-chung" />
              Atleta Azul (Chung)
            </h3>
            <div className="grid gap-2">
              {(['chungPlus1', 'chungPlus2', 'chungPlus3', 'chungGamjeom', 'chungDouble'] as const).map(renderMappingButton)}
            </div>
          </div>

          {/* Hong Mappings */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-hong uppercase tracking-wider flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-hong" />
              Atleta Vermelho (Hong)
            </h3>
            <div className="grid gap-2">
              {(['hongPlus1', 'hongPlus2', 'hongPlus3', 'hongGamjeom', 'hongDouble'] as const).map(renderMappingButton)}
            </div>
          </div>

          {/* General Mappings */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Controles Gerais
            </h3>
            <div className="grid gap-2">
              {(['startPause', 'resetRound', 'resetMatch', 'subtractMode', 'decisionChung', 'decisionHong'] as const).map(renderMappingButton)}
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
            <Button onClick={handleSave} disabled={!selectedId} className="flex-1 flex items-center gap-2">
              <Check className="w-4 h-4" />
              Salvar Mapeamento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
