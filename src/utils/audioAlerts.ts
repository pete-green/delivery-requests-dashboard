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

// New request alert - cheerful notification chime
export function playNewRequestAlert() {
  if (!audioContext || !audioEnabled) return;

  // Bright, pleasant ascending melody
  playBeep(523, 0.12, 0.4);  // C5
  setTimeout(() => playBeep(659, 0.12, 0.4), 120);  // E5
  setTimeout(() => playBeep(784, 0.12, 0.4), 240);  // G5
  setTimeout(() => playBeep(1047, 0.25, 0.45), 360);  // C6 - higher octave
}

// Age warning alert - urgent attention-grabbing siren
export function playAgeWarningAlert() {
  if (!audioContext || !audioEnabled) return;

  // Loud, urgent warning pattern with multiple tones
  // First burst
  playBeep(880, 0.15, 0.5);  // A5
  setTimeout(() => playBeep(659, 0.15, 0.5), 150);  // E5

  // Second burst (louder)
  setTimeout(() => playBeep(880, 0.15, 0.55), 350);
  setTimeout(() => playBeep(659, 0.15, 0.55), 500);

  // Third burst (loudest)
  setTimeout(() => playBeep(880, 0.2, 0.6), 700);
  setTimeout(() => playBeep(659, 0.2, 0.6), 900);

  // Final attention tone
  setTimeout(() => playBeep(440, 0.3, 0.5), 1150);  // Deep A4
}

export function isAudioEnabled() {
  return audioEnabled;
}
