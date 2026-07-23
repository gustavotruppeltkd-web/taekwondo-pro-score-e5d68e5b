import { GamepadMapping } from "@/hooks/useGamepad";

/**
 * Per-controller button mappings, keyed by the gamepad's `id` (stable per
 * controller model). Persisted in localStorage so a remapped controller (e.g.
 * an iPega) is recognized automatically on the next connection, while
 * controllers without a saved mapping (PS4/Xbox) use the default layout.
 */
const STORAGE_KEY = "tks-gamepad-mappings-v1";

export type GamepadMappings = Record<string, GamepadMapping>;

export const loadGamepadMappings = (): GamepadMappings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

export const persistGamepadMappings = (mappings: GamepadMappings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
  } catch {
    /* storage unavailable / quota — mappings just won't persist */
  }
};
