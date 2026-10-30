// Optional interface sounds, off by default. Tones are synthesised with the
// Web Audio API, so there are no audio files to download. The AudioContext
// is created on the first sound, which always follows a click.

export type SoundKind = "tap" | "toggle" | "pour" | "serve" | "miss";

const STORAGE_KEY = "sound";
const CHANGE_EVENT = "sound:change";

let enabled: boolean | null = null;
let context: AudioContext | null = null;

export function getSoundEnabled(): boolean {
  if (enabled === null) {
    try {
      enabled = localStorage.getItem(STORAGE_KEY) === "on";
    } catch {
      enabled = false;
    }
  }
  return enabled;
}

export function setSoundEnabled(next: boolean) {
  enabled = next;
  try {
    localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
  } catch {
    // Storage blocked: the setting lasts for this page view.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
  if (next) playSound("toggle");
}

export function subscribeSound(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

const TONES: Record<SoundKind, { from: number; to: number; length: number }> = {
  tap: { from: 880, to: 620, length: 0.06 },
  toggle: { from: 520, to: 780, length: 0.12 },
  // Brew, the coffee mini game.
  pour: { from: 330, to: 260, length: 0.07 },
  serve: { from: 660, to: 1320, length: 0.2 },
  miss: { from: 240, to: 150, length: 0.18 },
};

/** A short, quiet blip. No-op when sound is off or Web Audio is missing. */
export function playSound(kind: SoundKind) {
  if (!getSoundEnabled() || typeof AudioContext === "undefined") return;
  context ??= new AudioContext();
  if (context.state === "suspended") void context.resume();

  const tone = TONES[kind];
  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(tone.from, now);
  oscillator.frequency.exponentialRampToValueAtTime(tone.to, now + tone.length);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.05, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + tone.length);

  oscillator.connect(gain).connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + tone.length + 0.02);
}
