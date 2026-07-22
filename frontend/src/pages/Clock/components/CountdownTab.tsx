/**
 * ToolSnapy — Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { useMemo, useState } from "react";
import { useNow } from "../useNow";
import c from "../Clock.module.css";

function nextNewYear(): string {
  const y = new Date().getFullYear() + 1;
  return `${y}-01-01T00:00`;
}

const CountdownTab = () => {
  const now = useNow(1000);
  const [target, setTarget] = useState<string>(nextNewYear);
  const [label, setLabel] = useState("New Year");

  const targetMs = useMemo(() => {
    const t = new Date(target).getTime();
    return isNaN(t) ? null : t;
  }, [target]);

  const diff = targetMs === null ? 0 : targetMs - now.getTime();
  const passed = targetMs !== null && diff <= 0;
  const abs = Math.abs(diff);

  const days = Math.floor(abs / 86400000);
  const hours = Math.floor((abs % 86400000) / 3600000);
  const minutes = Math.floor((abs % 3600000) / 60000);
  const seconds = Math.floor((abs % 60000) / 1000);

  const units = [
    { value: days, label: "Days" },
    { value: hours, label: "Hours" },
    { value: minutes, label: "Minutes" },
    { value: seconds, label: "Seconds" },
  ];

  const setPreset = (iso: string, name: string) => {
    setTarget(iso);
    setLabel(name);
  };
  const plusHours = (h: number) => {
    const d = new Date(Date.now() + h * 3600000);
    const pad = (n: number) => String(n).padStart(2, "0");
    setTarget(
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
        d.getHours()
      )}:${pad(d.getMinutes())}`
    );
    setLabel(`${h}-hour countdown`);
  };

  return (
    <div className={c.splitView}>
      <div className={c.splitAside}>
        <div className={c.fieldStack}>
          <label className={c.fieldLabel} htmlFor="cd-name">
            Event name
          </label>
          <input
            id="cd-name"
            className={c.textInput}
            type="text"
            value={label}
            maxLength={40}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="What are you counting down to?"
          />
          <label className={c.fieldLabel} htmlFor="cd-target">
            Target date &amp; time
          </label>
          <input
            id="cd-target"
            className={c.textInput}
            type="datetime-local"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
        </div>

        <div className={c.presetRow}>
          <button className={`${c.btn} ${c.btnGhost}`} onClick={() => plusHours(1)}>
            +1 hour
          </button>
          <button className={`${c.btn} ${c.btnGhost}`} onClick={() => plusHours(24)}>
            +1 day
          </button>
          <button
            className={`${c.btn} ${c.btnGhost}`}
            onClick={() => setPreset(nextNewYear(), "New Year")}
          >
            New Year
          </button>
        </div>
      </div>

      <div className={c.splitMain}>
        {targetMs === null ? (
          <p className={c.emptyNote}>Pick a valid date to start the countdown.</p>
        ) : (
          <>
            <div className={c.cdTitle}>
              {passed ? `${label || "Event"} was` : `${label || "Counting down"} in`}
            </div>
            <div className={c.cdGrid}>
              {units.map((u) => (
                <div key={u.label} className={c.cdUnit}>
                  <span className={c.cdValue}>{String(u.value).padStart(2, "0")}</span>
                  <span className={c.cdLabel}>{u.label}</span>
                </div>
              ))}
            </div>
            {passed && <div className={c.cdPassed}>ago 🎉</div>}
          </>
        )}
      </div>
    </div>
  );
};

export default CountdownTab;
