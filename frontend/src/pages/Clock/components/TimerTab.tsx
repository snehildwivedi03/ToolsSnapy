/**
 * ToolSnapy — Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { useEffect, useRef, useState } from "react";
import { beep, primeAudio } from "../sound";
import c from "../Clock.module.css";

const PRESETS = [
  { label: "1 min", secs: 60 },
  { label: "5 min", secs: 300 },
  { label: "10 min", secs: 600 },
  { label: "25 min", secs: 1500 },
];

const RADIUS = 130;
const CIRC = 2 * Math.PI * RADIUS;

function clampInt(v: string, max: number): number {
  const n = parseInt(v, 10);
  if (isNaN(n) || n < 0) return 0;
  return Math.min(n, max);
}

const TimerTab = () => {
  const [h, setH] = useState(0);
  const [m, setM] = useState(5);
  const [s, setS] = useState(0);
  const [remaining, setRemaining] = useState(0); // ms
  const [total, setTotal] = useState(0); // ms
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const endRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      const left = Math.max(0, endRef.current - performance.now());
      setRemaining(left);
      if (left <= 0) {
        setRunning(false);
        setDone(true);
        beep(3);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const startFrom = (ms: number) => {
    if (ms <= 0) return;
    primeAudio();
    setTotal(ms);
    setRemaining(ms);
    endRef.current = performance.now() + ms;
    setDone(false);
    setRunning(true);
  };

  const start = () => startFrom((h * 3600 + m * 60 + s) * 1000);

  const pause = () => {
    setRunning(false);
    endRef.current = performance.now() + remaining;
  };
  const resume = () => {
    primeAudio();
    endRef.current = performance.now() + remaining;
    setRunning(true);
  };
  const reset = () => {
    setRunning(false);
    setRemaining(0);
    setTotal(0);
    setDone(false);
  };

  const applyPreset = (secs: number) => {
    setH(Math.floor(secs / 3600));
    setM(Math.floor((secs % 3600) / 60));
    setS(secs % 60);
    startFrom(secs * 1000);
  };

  const active = running || remaining > 0 || done;
  const totalSecLeft = Math.ceil(remaining / 1000);
  const dh = Math.floor(totalSecLeft / 3600);
  const dm = Math.floor((totalSecLeft % 3600) / 60);
  const ds = totalSecLeft % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  const display = dh > 0 ? `${pad(dh)}:${pad(dm)}:${pad(ds)}` : `${pad(dm)}:${pad(ds)}`;
  const progress = total > 0 ? remaining / total : 0;
  const offset = CIRC * (1 - progress);

  return (
    <div className={c.centerCol}>
      {!active ? (
        <>
          <div className={c.timerInputs}>
            <label className={c.timerField}>
              <input
                className={c.timerInput}
                type="number"
                min={0}
                max={99}
                value={h}
                onChange={(e) => setH(clampInt(e.target.value, 99))}
              />
              <span>hours</span>
            </label>
            <span className={c.timerSep}>:</span>
            <label className={c.timerField}>
              <input
                className={c.timerInput}
                type="number"
                min={0}
                max={59}
                value={m}
                onChange={(e) => setM(clampInt(e.target.value, 59))}
              />
              <span>min</span>
            </label>
            <span className={c.timerSep}>:</span>
            <label className={c.timerField}>
              <input
                className={c.timerInput}
                type="number"
                min={0}
                max={59}
                value={s}
                onChange={(e) => setS(clampInt(e.target.value, 59))}
              />
              <span>sec</span>
            </label>
          </div>

          <div className={c.presetRow}>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                className={`${c.btn} ${c.btnGhost}`}
                onClick={() => applyPreset(p.secs)}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className={c.btnRow}>
            <button
              className={`${c.btn} ${c.btnPrimary}`}
              onClick={start}
              disabled={h === 0 && m === 0 && s === 0}
            >
              Start Timer
            </button>
          </div>
        </>
      ) : (
        <>
          <div className={c.ringWrap}>
            <svg viewBox="0 0 300 300" className={c.ring} width={300} height={300}>
              <circle cx="150" cy="150" r={RADIUS} className={c.ringBg} />
              <circle
                cx="150"
                cy="150"
                r={RADIUS}
                className={c.ringFg}
                strokeDasharray={CIRC}
                strokeDashoffset={offset}
              />
            </svg>
            <div className={`${c.ringLabel} ${done ? c.ringDone : ""}`}>
              {done ? (
                <span className={c.timeUp}>Time's up!</span>
              ) : (
                <span className={c.ringTime}>{display}</span>
              )}
            </div>
          </div>

          <div className={c.btnRow}>
            {done ? (
              <button className={`${c.btn} ${c.btnPrimary}`} onClick={reset}>
                Done
              </button>
            ) : running ? (
              <button className={`${c.btn} ${c.btnGhost}`} onClick={pause}>
                Pause
              </button>
            ) : (
              <button className={`${c.btn} ${c.btnPrimary}`} onClick={resume}>
                Resume
              </button>
            )}
            {!done && (
              <button className={`${c.btn} ${c.btnDanger}`} onClick={reset}>
                Cancel
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TimerTab;
