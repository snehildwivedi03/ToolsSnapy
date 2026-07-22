/**
 * ToolSnapy — Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
/* Tiny Web-Audio beeper used by the Timer and Alarm tabs.
   No audio files needed — tones are synthesised on the fly. */

type AudioCtor = typeof AudioContext;
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (!ctx) {
      const Ctor: AudioCtor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: AudioCtor }).webkitAudioContext;
      ctx = new Ctor();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Play a short pleasant "ding" a number of times. */
export function beep(times = 1, frequency = 880): void {
  const audio = getCtx();
  if (!audio) return;
  let t = audio.currentTime;
  for (let i = 0; i < times; i++) {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.28, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(t);
    osc.stop(t + 0.36);
    t += 0.45;
  }
}

/** Unlock/warm up the audio context after a user gesture (needed by some browsers). */
export function primeAudio(): void {
  getCtx();
}
