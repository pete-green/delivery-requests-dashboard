// Audio alert system for delivery requests

let audioContext: AudioContext | null = null;
let audioEnabled = false;

// Initialize audio context (must be called after user interaction)
export function initializeAudio() {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  audioEnabled = true;
}

// Play a beep sound with specified frequency and duration
function playBeep(frequency: number, duration: number, volume: number = 0.3) {
  if (!audioContext || !audioEnabled) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

// New request alert - cheerful ascending tones
export function playNewRequestAlert() {
  if (!audioContext || !audioEnabled) return;

  playBeep(800, 0.15, 0.3);
  setTimeout(() => playBeep(1000, 0.15, 0.3), 150);
  setTimeout(() => playBeep(1200, 0.2, 0.3), 300);
}

// Age warning alert - urgent descending tones
export function playAgeWarningAlert() {
  if (!audioContext || !audioEnabled) return;

  playBeep(1200, 0.2, 0.4);
  setTimeout(() => playBeep(1000, 0.2, 0.4), 200);
  setTimeout(() => playBeep(800, 0.3, 0.4), 400);
}

export function isAudioEnabled() {
  return audioEnabled;
}
