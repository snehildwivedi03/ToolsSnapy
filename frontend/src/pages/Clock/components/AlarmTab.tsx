import { useEffect, useRef, useState } from "react";
import { useNow } from "../useNow";
import { primeAudio } from "../sound";
import { ALARM_SOUNDS, playAlarmSound, stopAlarmSound } from "../alarmSounds";
import c from "../Clock.module.css";

interface Alarm {
  id: string;
  time: string; // "HH:MM"
  label: string;
  enabled: boolean;
}

const STORAGE_KEY = "toolsnapy.alarms";
const SOUND_KEY = "toolsnapy.alarm.sound";

function load(): Alarm[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as Alarm[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function loadSound(): string {
  try {
    return localStorage.getItem(SOUND_KEY) || "beep";
  } catch {
    return "beep";
  }
}

const AlarmTab = () => {
  const now = useNow(1000);
  const [alarms, setAlarms] = useState<Alarm[]>(load);
  const [newTime, setNewTime] = useState("07:00");
  const [newLabel, setNewLabel] = useState("");
  const [soundId, setSoundId] = useState<string>(loadSound);
  const [ringing, setRinging] = useState<Alarm | null>(null);
  const firedRef = useRef<string>(""); // "HH:MM" already handled this minute

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
    } catch {
      /* ignore */
    }
  }, [alarms]);

  useEffect(() => {
    try {
      localStorage.setItem(SOUND_KEY, soundId);
    } catch {
      /* ignore */
    }
  }, [soundId]);

  // Stop any playing tone when leaving the tab.
  useEffect(() => () => stopAlarmSound(), []);

  // Alarm matcher — fires once when the clock hits an enabled alarm's minute.
  useEffect(() => {
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const key = `${hh}:${mm}`;
    if (now.getSeconds() !== 0) {
      if (firedRef.current !== key) firedRef.current = "";
      return;
    }
    if (firedRef.current === key) return;
    const hit = alarms.find((a) => a.enabled && a.time === key);
    if (hit) {
      firedRef.current = key;
      setRinging(hit);
      playAlarmSound(soundId, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

  const add = () => {
    if (!/^\d{2}:\d{2}$/.test(newTime)) return;
    primeAudio();
    const alarm: Alarm = {
      id: `${Date.now()}`,
      time: newTime,
      label: newLabel.trim(),
      enabled: true,
    };
    setAlarms((prev) =>
      [...prev, alarm].sort((a, b) => a.time.localeCompare(b.time))
    );
    setNewLabel("");
  };

  const toggle = (id: string) =>
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  const remove = (id: string) =>
    setAlarms((prev) => prev.filter((a) => a.id !== id));

  const dismiss = () => {
    stopAlarmSound();
    setRinging(null);
  };

  const preview = () => {
    primeAudio();
    playAlarmSound(soundId, false);
  };

  const to12h = (t: string) => {
    const [H, M] = t.split(":").map(Number);
    const ap = H >= 12 ? "PM" : "AM";
    const h = H % 12 || 12;
    return `${h}:${String(M).padStart(2, "0")} ${ap}`;
  };

  return (
    <div className={c.splitView}>
      {ringing && (
        <div className={`${c.alarmBanner} ${c.splitFull}`} role="alert">
          <div>
            <strong>⏰ {to12h(ringing.time)}</strong>
            {ringing.label && <span> — {ringing.label}</span>}
          </div>
          <button className={`${c.btn} ${c.btnPrimary}`} onClick={dismiss}>
            Dismiss
          </button>
        </div>
      )}

      <div className={c.splitAside}>
        <div className={c.soundRow}>
          <label className={c.fieldLabel} htmlFor="alarm-sound">
            Alarm sound
          </label>
          <div className={c.soundControls}>
            <select
              id="alarm-sound"
              className={c.select}
              value={soundId}
              onChange={(e) => setSoundId(e.target.value)}
            >
              {ALARM_SOUNDS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <button
              className={`${c.btn} ${c.btnGhost}`}
              onClick={preview}
              type="button"
            >
              ▶ Preview
            </button>
          </div>
        </div>

        <div className={c.alarmAdd}>
          <input
            className={c.timeInput}
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            aria-label="Alarm time"
          />
          <input
            className={c.textInput}
            type="text"
            placeholder="Label (optional)"
            value={newLabel}
            maxLength={40}
            onChange={(e) => setNewLabel(e.target.value)}
            aria-label="Alarm label"
          />
          <button className={`${c.btn} ${c.btnPrimary}`} onClick={add}>
            Add alarm
          </button>
        </div>

        <p className={c.hintNote}>
          Alarms rely on this page staying open in your browser.
        </p>
      </div>

      <div className={c.splitMain}>
        {alarms.length === 0 ? (
          <p className={c.emptyNote}>
            No alarms set. Add one — keep this tab open for it to ring.
          </p>
        ) : (
          <div className={c.alarmList}>
            {alarms.map((a) => (
              <div
                key={a.id}
                className={`${c.alarmRow} ${!a.enabled ? c.alarmOff : ""}`}
              >
                <div className={c.alarmTime}>{to12h(a.time)}</div>
                <div className={c.alarmLabel}>{a.label || "Alarm"}</div>
                <label className={c.switch} title={a.enabled ? "Enabled" : "Disabled"}>
                  <input
                    type="checkbox"
                    checked={a.enabled}
                    onChange={() => toggle(a.id)}
                  />
                  <span className={c.switchSlider} />
                </label>
                <button
                  className={c.alarmDelete}
                  onClick={() => remove(a.id)}
                  aria-label="Delete alarm"
                  title="Delete"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlarmTab;
