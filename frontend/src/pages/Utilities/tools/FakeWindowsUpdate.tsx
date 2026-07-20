import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import ToolPageShell from "../../../components/ToolPageShell/ToolPageShell";
import s from "../../../styles/calc.module.css";
import ls from "./FakeWindowsUpdate.module.css";
import dellLogo from "../../../assets/dell.png";
import hpLogo from "../../../assets/hp.png";

type ScreenKey = "windows" | "dell" | "lenovo" | "hp";

const SCREENS: { key: ScreenKey; label: string; blurb: string; color: string }[] = [
  { key: "windows", label: "Windows Update",  blurb: "Classic black “Working on updates” screen.",   color: "#0078d4" },
  { key: "dell",    label: "Dell Firmware",   blurb: "Dell “Updating your firmware” flash screen.", color: "#007db8" },
  { key: "lenovo",  label: "Lenovo Update",   blurb: "Lenovo red-logo system update screen.",       color: "#e2231a" },
  { key: "hp",      label: "HP BIOS Update",  blurb: "HP blue BIOS update progress screen.",        color: "#0096d6" },
];

const PRESETS = [5, 10, 15, 30, 60, 120];

const MIN_MINUTES = 1;
const MAX_MINUTES = 120;
const clampMinutes = (n: number) => Math.max(MIN_MINUTES, Math.min(MAX_MINUTES, Math.round(n)));

const formatDuration = (m: number) => {
  if (m < 60) return `${m} minute${m !== 1 ? "s" : ""}`;
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h} hour${h !== 1 ? "s" : ""}${min ? ` ${min} min` : ""}`;
};

const Icon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
    <path d="M7 9l2.5 2.5L7 14" />
  </svg>
);

const WarnTriangle = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const FakeWindowsUpdate = () => {
  const [screen,  setScreen]  = useState<ScreenKey>("windows");
  const [minutes, setMinutes] = useState(15);
  const [running, setRunning] = useState(false);
  const [percent, setPercent] = useState(0);

  const durationMs = minutes * 60_000;

  const stop = useCallback(() => {
    setRunning(false);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }, []);

  const start = async () => {
    setPercent(0);
    try { await document.documentElement.requestFullscreen?.(); } catch {/* ignore */}
    setRunning(true);
  };

  const selected = SCREENS.find((sc) => sc.key === screen)!;

  // Drive the progress + wire up exit handlers while the fake screen is showing.
  useEffect(() => {
    if (!running) return;
    const startedAt = Date.now();
    const id = window.setInterval(() => {
      const p = Math.min(100, ((Date.now() - startedAt) / durationMs) * 100);
      setPercent(p);
      if (p >= 100) window.clearInterval(id);
    }, 200);

    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") stop(); };
    const onFsChange = () => { if (!document.fullscreenElement) setRunning(false); };
    window.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFsChange);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.clearInterval(id);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFsChange);
      document.body.style.overflow = prevOverflow;
    };
  }, [running, durationMs, stop]);

  const pct = Math.floor(percent);

  const renderScreen = () => {
    switch (screen) {
      case "windows":
        return (
          <div className={ls.winScreen}>
            <div className={ls.winCenter}>
              <div className={ls.winSpinner}>
                <div className={ls.winDot} /><div className={ls.winDot} /><div className={ls.winDot} />
                <div className={ls.winDot} /><div className={ls.winDot} />
              </div>
              <div className={ls.winLine}>Working on updates {pct}%</div>
              <div className={ls.winLine}>Please keep your computer on.</div>
            </div>
            <div className={ls.winBottom}>Your computer may restart a few times.</div>
          </div>
        );

      case "dell":
        return (
          <div className={ls.dellScreen}>
            <div className={ls.dellCenter}>
              <img src={dellLogo} className={ls.dellLogo} alt="" />
              <div className={ls.dellTitle}>Updating your firmware</div>
              <div className={ls.dellWarn}><WarnTriangle /> Do not power down your system.</div>
            </div>
            <div className={ls.dellProgress}>
              <div className={ls.dellFlashLabel}>Flash Progress</div>
              <div className={ls.dellBar}><div className={ls.dellFill} style={{ width: `${pct}%` }} /></div>
              <div className={ls.dellPct}>{pct}%</div>
              <div className={ls.dellSuccess}>{pct >= 100 ? "Firmware update successful." : "\u00a0"}</div>
            </div>
          </div>
        );

      case "lenovo":
        return (
          <div className={ls.lenovoScreen}>
            <div className={ls.lenovoLogo}>Lenovo</div>
            <div className={ls.lenovoBar}><div className={ls.lenovoFill} style={{ width: `${pct}%` }} /></div>
            <div className={ls.lenovoPct}>{pct}%</div>
            <div className={ls.lenovoText}>Please wait while we install a system update</div>
          </div>
        );

      case "hp":
        return (
          <div className={ls.hpScreen}>
            <div className={ls.hpSidebar} />
            <img src={hpLogo} className={ls.hpLogo} alt="" />
            <div className={ls.hpBody}>
              <h1 className={ls.hpTitle}>HP BIOS Update</h1>
              <p className={ls.hpText}>The System BIOS is being updated. The update will take a few minutes to complete.</p>
              <p className={ls.hpWarn}>Do not shut down or remove external power from your computer during the process.</p>
              <p className={ls.hpStep}>Verifying new BIOS Image</p>
              <p className={ls.hpBlock}>Block {Math.floor((percent / 100) * 2048)} / 2048</p>
              <div className={ls.hpProgressRow}>
                <span className={ls.hpProgressLabel}>Progress {pct}%</span>
                <div className={ls.hpBar}><div className={ls.hpFill} style={{ width: `${pct}%` }} /></div>
              </div>
            </div>
            <div className={ls.hpPill}>
              <img src={hpLogo} className={ls.hpPillLogo} alt="" />
              support.hp.com
            </div>
          </div>
        );
    }
  };

  return (
    <ToolPageShell
      narrow
      backTo="/utilities"
      backLabel="Utilities"
      icon={<Icon />}
      iconColor="#2563eb"
      iconBg="#eff6ff"
      title="Fake Update Screen"
      description="Full-screen prank update screens — Windows, Dell, Lenovo and HP BIOS — with a timer from 5 minutes up to 2 hours. Press Esc to exit."
    >
      <div className={s.card}>
        <span className={s.cardTitle}>Choose a screen</span>
        <div className={ls.screenRow}>
          {SCREENS.map((sc) => (
            <button
              key={sc.key}
              type="button"
              className={`${ls.screenChip} ${screen === sc.key ? ls.screenChipActive : ""}`}
              style={screen === sc.key ? { borderColor: sc.color, boxShadow: `0 0 0 1px ${sc.color}` } : undefined}
              onClick={() => setScreen(sc.key)}
            >
              <span className={ls.screenDot} style={{ background: sc.color }} aria-hidden="true" />
              {sc.label}
            </button>
          ))}
        </div>
        <p className={ls.screenDesc}>{selected.blurb}</p>
      </div>

      <div className={s.card}>
        <span className={s.cardTitle}>Duration</span>
        <div className={ls.durationValue}>{formatDuration(minutes)}</div>

        <div className={ls.stepper}>
          <button
            type="button"
            className={ls.stepBtn}
            onClick={() => setMinutes((m) => clampMinutes(m - 5))}
            disabled={minutes <= MIN_MINUTES}
            aria-label="Decrease by 5 minutes"
          >
            −
          </button>
          <div className={ls.stepValue}>
            <input
              type="number"
              className={ls.stepInput}
              min={MIN_MINUTES}
              max={MAX_MINUTES}
              value={minutes}
              onChange={(e) => setMinutes(clampMinutes(Number(e.target.value) || MIN_MINUTES))}
              aria-label="Minutes"
            />
            <span className={ls.stepUnit}>min</span>
          </div>
          <button
            type="button"
            className={ls.stepBtn}
            onClick={() => setMinutes((m) => clampMinutes(m + 5))}
            disabled={minutes >= MAX_MINUTES}
            aria-label="Increase by 5 minutes"
          >
            +
          </button>
        </div>

        <input
          type="range"
          className={ls.slider}
          min={MIN_MINUTES}
          max={MAX_MINUTES}
          step={1}
          value={minutes}
          onChange={(e) => setMinutes(clampMinutes(Number(e.target.value)))}
        />

        <div className={ls.presetRow}>
          {PRESETS.map((m) => (
            <button
              key={m}
              type="button"
              className={`${ls.presetBtn} ${minutes === m ? ls.presetBtnActive : ""}`}
              onClick={() => setMinutes(m)}
            >
              {m < 60 ? `${m} min` : m === 60 ? "1 hour" : "2 hours"}
            </button>
          ))}
        </div>
      </div>

      <button className={s.primaryBtn} onClick={start}>
        Start full-screen
      </button>
      <p className={ls.hintText}>
        The screen opens in full screen. Press <kbd className={ls.kbd}>Esc</kbd> at any time to exit.
      </p>

      {running && createPortal(
        <div className={ls.overlay}>
          {renderScreen()}
          <button className={ls.exitBtn} onClick={stop} aria-label="Exit">Press Esc to exit</button>
        </div>,
        document.body,
      )}
    </ToolPageShell>
  );
};

export default FakeWindowsUpdate;
