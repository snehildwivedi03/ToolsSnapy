/**
 * ToolSnapy — Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { beep } from "./sound";

/* Free alarm tones sourced from Google's public sound library
   (actions.google.com/sounds) — no API key, free to use.
   These stream directly and don't require CORS for <audio> playback. */
export interface AlarmSound {
  id: string;
  label: string;
  url: string; // empty => synthesised beep
}

export const ALARM_SOUNDS: AlarmSound[] = [
  { id: "beep", label: "Classic Beep", url: "" },
  {
    id: "alarm-clock",
    label: "Alarm Clock",
    url: "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg",
  },
  {
    id: "digital",
    label: "Digital Watch",
    url: "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg",
  },
  {
    id: "bell",
    label: "Bell Ringing",
    url: "https://actions.google.com/sounds/v1/alarms/medium_bell_ringing_near.ogg",
  },
  {
    id: "bugle",
    label: "Bugle Tune",
    url: "https://actions.google.com/sounds/v1/alarms/bugle_tune.ogg",
  },
  {
    id: "mechanical",
    label: "Mechanical Clock",
    url: "https://actions.google.com/sounds/v1/alarms/mechanical_clock_ring.ogg",
  },
  {
    id: "winding",
    label: "Winding Watch",
    url: "https://actions.google.com/sounds/v1/alarms/winding_watch.ogg",
  },
];

export function getSound(id: string): AlarmSound {
  return ALARM_SOUNDS.find((s) => s.id === id) ?? ALARM_SOUNDS[0];
}

/** A single shared audio element so tones never overlap. */
let audioEl: HTMLAudioElement | null = null;

function getAudio(): HTMLAudioElement {
  if (!audioEl) audioEl = new Audio();
  return audioEl;
}

/** Play a sound once (preview) or looping (ringing). Falls back to beep. */
export function playAlarmSound(id: string, loop = false): void {
  const sound = getSound(id);
  stopAlarmSound();
  if (!sound.url) {
    beep(loop ? 4 : 2);
    return;
  }
  const el = getAudio();
  el.src = sound.url;
  el.loop = loop;
  el.currentTime = 0;
  el.play().catch(() => beep(loop ? 4 : 2));
}

export function stopAlarmSound(): void {
  if (audioEl) {
    audioEl.pause();
    audioEl.loop = false;
    audioEl.currentTime = 0;
  }
}
