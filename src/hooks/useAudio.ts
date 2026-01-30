// Web Audio API for generating beep sounds
let audioContext: AudioContext | null = null;
let audioUnlocked = false;

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

export const unlockAudio = async (): Promise<boolean> => {
  try {
    const ctx = getAudioContext();
    
    // Resume if suspended (required by iOS/Safari)
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    
    // Play a silent sound to unlock audio on iOS
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Silent audio
    gainNode.gain.value = 0;
    oscillator.frequency.value = 200;
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
    
    audioUnlocked = true;
    return true;
  } catch (error) {
    console.error('Failed to unlock audio:', error);
    return false;
  }
};

export const isAudioUnlocked = (): boolean => audioUnlocked;

export interface AudioFiles {
  roundStart: string | null;
  roundEnd: string | null;
  tenSecondWarning: string | null;
}

export const playBeep = (frequency: number = 800, duration: number = 200, type: OscillatorType = 'sine') => {
  try {
    const ctx = getAudioContext();
    
    // Resume if suspended
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration / 1000);
  } catch (error) {
    console.error('Error playing beep:', error);
  }
};

export const playRoundStartBeep = () => {
  // Three ascending beeps
  playBeep(600, 150);
  setTimeout(() => playBeep(800, 150), 200);
  setTimeout(() => playBeep(1000, 300), 400);
};

export const playRoundEndBeep = () => {
  // Long low beep
  playBeep(400, 800, 'square');
};

export const playTenSecondWarning = () => {
  // Quick double beep
  playBeep(1200, 100);
  setTimeout(() => playBeep(1200, 100), 150);
};

export const playScoreBeep = () => {
  playBeep(1000, 80);
};

export const playFaultBeep = () => {
  playBeep(300, 300, 'sawtooth');
};

export const playCustomAudio = (audioUrl: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio(audioUrl);
    audio.onended = () => resolve();
    audio.onerror = () => reject();
    audio.play().catch(reject);
  });
};
