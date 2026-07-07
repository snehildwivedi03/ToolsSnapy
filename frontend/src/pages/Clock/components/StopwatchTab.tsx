import { useEffect, useRef, useState } from "react";
import c from "../Clock.module.css";

interface Lap {
  index: number;
  total: number;
  split: number;
}

function format(ms: number): { main: string; cs: string } {
  const totalCs = Math.floor(ms / 10);
  const cs = totalCs % 100;
  const totalSec = Math.floor(totalCs / 100);
  const s = totalSec % 60;
  const m = Math.floor(totalSec / 60) % 60;
  const h = Math.floor(totalSec / 3600);
  const pad = (n: number, w = 2) => String(n).padStart(w, "0");
  const main = h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  return { main, cs: pad(cs) };
}

const StopwatchTab = () => {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const startRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    startRef.current = performance.now() - elapsed;
    const tick = () => {
      setElapsed(performance.now() - startRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const reset = () => {
    setRunning(false);
    setElapsed(0);
    setLaps([]);
  };

  const lap = () => {
    setLaps((prev) => {
      const prevTotal = prev.length ? prev[prev.length - 1].total : 0;
      return [
        ...prev,
        { index: prev.length + 1, total: elapsed, split: elapsed - prevTotal },
      ];
    });
  };

  const { main, cs } = format(elapsed);
  const fastest = laps.length > 1 ? Math.min(...laps.map((l) => l.split)) : null;
  const slowest = laps.length > 1 ? Math.max(...laps.map((l) => l.split)) : null;

  return (
    <div className={c.centerCol}>
      <div className={c.bigDisplay}>
        {main}
        <span className={c.bigDisplayFraction}>.{cs}</span>
      </div>

      <div className={c.btnRow}>
        {!running ? (
          <button className={`${c.btn} ${c.btnPrimary}`} onClick={() => setRunning(true)}>
            {elapsed > 0 ? "Resume" : "Start"}
          </button>
        ) : (
          <button className={`${c.btn} ${c.btnPrimary}`} onClick={() => setRunning(false)}>
            Pause
          </button>
        )}
        <button
          className={`${c.btn} ${c.btnGhost}`}
          onClick={lap}
          disabled={!running}
        >
          Lap
        </button>
        <button
          className={`${c.btn} ${c.btnDanger}`}
          onClick={reset}
          disabled={elapsed === 0 && laps.length === 0}
        >
          Reset
        </button>
      </div>

      {laps.length > 0 && (
        <div className={c.lapList}>
          <div className={`${c.lapRow} ${c.lapHead}`}>
            <span>Lap</span>
            <span>Split</span>
            <span>Total</span>
          </div>
          {[...laps].reverse().map((l) => {
            const isFast = fastest !== null && l.split === fastest;
            const isSlow = slowest !== null && l.split === slowest;
            const cls = isFast ? c.lapFast : isSlow ? c.lapSlow : "";
            const s = format(l.split);
            const t = format(l.total);
            return (
              <div key={l.index} className={`${c.lapRow} ${cls}`}>
                <span>#{l.index}</span>
                <span>
                  {s.main}.{s.cs}
                </span>
                <span>
                  {t.main}.{t.cs}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StopwatchTab;
