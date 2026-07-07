import { useMemo, useState } from "react";
import {
  WORLD_ZONES,
  localTimeZone,
  zonedWallToInstant,
  getDisplayParts,
  formatShortDate,
  getOffsetLabel,
} from "../timezones";
import c from "../Clock.module.css";

function nowLocalInput(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

const TimeZoneConverterTab = () => {
  const local = localTimeZone();
  const [when, setWhen] = useState<string>(nowLocalInput);
  const [sourceZone, setSourceZone] = useState<string>(
    WORLD_ZONES.find((z) => z.timeZone === local)?.timeZone ??
      WORLD_ZONES[0].timeZone
  );
  const [hour12, setHour12] = useState(false);

  const instant = useMemo(() => {
    const m = when.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (!m) return null;
    const [, y, mo, d, h, mi] = m.map(Number);
    return zonedWallToInstant(y, mo, d, h, mi, sourceZone);
  }, [when, sourceZone]);

  const sourceCity =
    WORLD_ZONES.find((z) => z.timeZone === sourceZone)?.city ?? sourceZone;

  return (
    <div className={c.splitView}>
      <div className={c.splitAside}>
        <div className={c.fieldStack}>
          <label className={c.fieldLabel} htmlFor="tz-when">
            Time to convert
          </label>
          <input
            id="tz-when"
            className={c.textInput}
            type="datetime-local"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
          />
          <label className={c.fieldLabel} htmlFor="tz-source">
            Source time zone
          </label>
          <div className={c.tzSourceRow}>
            <select
              id="tz-source"
              className={c.select}
              value={sourceZone}
              onChange={(e) => setSourceZone(e.target.value)}
            >
              {WORLD_ZONES.map((z) => (
                <option key={z.id} value={z.timeZone}>
                  {z.city}
                </option>
              ))}
            </select>
            <div className={c.toggleGroup} role="group" aria-label="Time format">
              <button
                className={`${c.toggleBtn} ${!hour12 ? c.toggleActive : ""}`}
                onClick={() => setHour12(false)}
              >
                24h
              </button>
              <button
                className={`${c.toggleBtn} ${hour12 ? c.toggleActive : ""}`}
                onClick={() => setHour12(true)}
              >
                12h
              </button>
            </div>
          </div>
        </div>
        <p className={c.hintNote}>
          Showing {sourceCity} time across every city in the list.
        </p>
      </div>

      <div className={c.splitMain}>
        {instant === null ? (
          <p className={c.emptyNote}>Pick a valid date and time to convert.</p>
        ) : (
          <div className={c.tzList}>
            {WORLD_ZONES.map((z) => {
              const { hour, minute, ampm } = getDisplayParts(
                instant,
                z.timeZone,
                hour12
              );
              const isSource = z.timeZone === sourceZone;
              return (
                <div
                  key={z.id}
                  className={`${c.tzRow} ${isSource ? c.tzRowActive : ""}`}
                >
                  <div className={c.tzCity}>
                    {z.city}
                    {isSource && <span className={c.tzTag}>source</span>}
                  </div>
                  <div className={c.tzTime}>
                    {hour}:{minute}
                    {hour12 && ampm && <span className={c.tzAmPm}> {ampm}</span>}
                  </div>
                  <div className={c.tzMeta}>
                    {formatShortDate(instant, z.timeZone)} ·{" "}
                    {getOffsetLabel(instant, z.timeZone)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeZoneConverterTab;
