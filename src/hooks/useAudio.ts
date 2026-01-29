// Web Audio API for generating beep sounds
const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

export interface AudioFiles {
  roundStart: string | null;
  roundEnd: string | null;
  tenSecondWarning: string | null;
}

export const playBeep = (frequency: number = 800, duration: number = 200, type: OscillatorType = 'sine') => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = type;
  
  gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration / 1000);
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
