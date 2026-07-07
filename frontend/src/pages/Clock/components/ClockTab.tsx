import { useState } from "react";
import AnalogClock from "./AnalogClock";
import { useNow } from "../useNow";
import {
  getDisplayParts,
  formatLongDate,
  getOffsetLabel,
  WORLD_ZONES,
  localTimeZone,
} from "../timezones";
import c from "../Clock.module.css";

const ClockTab = () => {
  const now = useNow(1000);
  const [hour12, setHour12] = useState(false);
  const [zone, setZone] = useState("local");

  const timeZone = zone === "local" ? undefined : zone;
  const resolvedZone = zone === "local" ? localTimeZone() : zone;
  const { hour, minute, second, ampm } = getDisplayParts(now, timeZone, hour12);
  const dateStr = formatLongDate(now, timeZone);
  const offset = getOffsetLabel(now, resolvedZone);

  return (
    <div className={c.clockMain}>
      <div className={c.analogWrap}>
        <AnalogClock date={now} timeZone={timeZone} size={260} />
      </div>

      <div className={c.digitalWrap}>
        <div className={c.zoneBadge}>
          <span className={c.zoneDot} aria-hidden="true" />
          {resolvedZone.replace(/_/g, " ")} · {offset}
        </div>

        <div
          className={c.digitalTime}
          aria-live="polite"
          aria-label={`Current time ${hour}:${minute}:${second} ${ampm}`}
        >
          <span className={c.digit}>{hour}</span>
          <span className={c.colon}>:</span>
          <span className={c.digit}>{minute}</span>
          <span className={c.colon}>:</span>
          <span className={c.digit}>{second}</span>
          {hour12 && ampm && <span className={c.ampm}>{ampm}</span>}
        </div>

        <div className={c.dateLine}>{dateStr}</div>

        <div className={c.controlsRow}>
          <div className={c.toggleGroup} role="group" aria-label="Time format">
            <button
              className={`${c.toggleBtn} ${!hour12 ? c.toggleActive : ""}`}
              onClick={() => setHour12(false)}
            >
              24-hour
            </button>
            <button
              className={`${c.toggleBtn} ${hour12 ? c.toggleActive : ""}`}
              onClick={() => setHour12(true)}
            >
              12-hour
            </button>
          </div>

          <select
            className={c.select}
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            aria-label="Timezone"
          >
            <option value="local">Local time</option>
            {WORLD_ZONES.map((z) => (
              <option key={z.id} value={z.timeZone}>
                {z.city}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ClockTab;
