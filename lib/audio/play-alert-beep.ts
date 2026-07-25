/** Beep corto del navegador (sin assets). Requiere gesto previo del usuario en algunos browsers. */
export function playAlertBeep(kind: "message" | "order" = "message"): void {
  if (typeof window === "undefined") return;
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
