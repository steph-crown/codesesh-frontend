/**
 * Short notification tone when someone pings you in a session.
 * Browsers may block audio until the user has interacted with the page (autoplay policy).
 */
let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof globalThis.window === "undefined") return null;
  const w = globalThis.window as typeof globalThis.window & {
    webkitAudioContext?: typeof AudioContext;
  };
  const Ctx = w.AudioContext ?? w.webkitAudioContext;
  if (!Ctx) return null;
  if (!sharedCtx) {
    sharedCtx = new Ctx();
  }
  return sharedCtx;
}

export function playPingSound(): void {
  try {
    const ctx = getCtx();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(660, t + 0.09);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  } catch {
    /* ignore: autoplay blocked or unsupported */
  }
}
