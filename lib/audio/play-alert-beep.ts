/** Alerta sonora: usa `public/sounds/new_order.wav` (fallback beep). */
const SOUND_URL = "/sounds/new_order.wav";

let sharedAudio: HTMLAudioElement | null = null;
let unlocked = false;

function getAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!sharedAudio) {
    sharedAudio = new Audio(SOUND_URL);
    sharedAudio.preload = "auto";
  }
  return sharedAudio;
}

/** Llamar tras un gesto del usuario (click) para desbloquear autoplay. */
export function unlockAlertAudio(): void {
  if (typeof window === "undefined" || unlocked) return;
  const audio = getAudio();
  if (!audio) return;
  const prev = audio.volume;
  audio.volume = 0.001;
  void audio
    .play()
    .then(() => {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = prev || 1;
      unlocked = true;
    })
    .catch(() => {
      audio.volume = prev || 1;
    });
}

function playOscillatorBeep(kind: "message" | "order"): void {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = kind === "order" ? 660 : 880;
    gain.gain.value = 0.09;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    window.setTimeout(() => {
      try {
        osc.stop();
        void ctx.close();
      } catch {
        /* ignore */
      }
    }, kind === "order" ? 320 : 160);
  } catch {
    /* ignore */
  }
}

export function playAlertBeep(kind: "message" | "order" = "message"): void {
  if (typeof window === "undefined") return;
  const audio = getAudio();
  if (!audio) {
    playOscillatorBeep(kind);
    return;
  }
  try {
    audio.pause();
    audio.currentTime = 0;
    audio.volume = 1;
    void audio.play().catch(() => {
      playOscillatorBeep(kind);
    });
  } catch {
    playOscillatorBeep(kind);
  }
}
