import { useEffect, useState } from "react";
import AnalogClock from "./AnalogClock";
import { useNow } from "../useNow";
import {
  getDisplayParts,
  formatShortDate,
  getOffsetLabel,
  WORLD_ZONES,
} from "../timezones";
import c from "../Clock.module.css";

const STORAGE_KEY = "toolsnapy.worldclock.cities";
const DEFAULT_IDS = ["los-angeles", "new-york", "london", "kolkata", "tokyo", "sydney"];

function loadIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_IDS;
    const arr = JSON.parse(raw) as string[];
    return Array.isArray(arr) ? arr : DEFAULT_IDS;
  } catch {
    return DEFAULT_IDS;
  }
}

const WorldClockTab = () => {
  const now = useNow(1000);
  const [hour12, setHour12] = useState(false);
  const [ids, setIds] = useState<string[]>(loadIds);
  const [adding, setAdding] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      /* ignore quota / privacy-mode errors */
    }
  }, [ids]);

  const cities = ids
    .map((id) => WORLD_ZONES.find((z) => z.id === id))
    .filter((z): z is (typeof WORLD_ZONES)[number] => Boolean(z));

  const available = WORLD_ZONES.filter((z) => !ids.includes(z.id));

  const add = () => {
    if (adding && !ids.includes(adding)) setIds((prev) => [...prev, adding]);
    setAdding("");
  };
  const remove = (id: string) => setIds((prev) => prev.filter((x) => x !== id));

  return (
    <div className={c.worldWrap}>
      <div className={c.worldToolbar}>
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

        <div className={c.addRow}>
          <select
            className={c.select}
            value={adding}
            onChange={(e) => setAdding(e.target.value)}
            aria-label="Add a city"
            disabled={available.length === 0}
          >
            <option value="">
              {available.length === 0 ? "All cities added" : "Add a city…"}
            </option>
            {available.map((z) => (
              <option key={z.id} value={z.id}>
                {z.city}
              </option>
            ))}
          </select>
          <button className={`${c.btn} ${c.btnPrimary}`} onClick={add} disabled={!adding}>
            Add
          </button>
        </div>
      </div>

      {cities.length === 0 ? (
        <p className={c.emptyNote}>No cities yet — add one above to get started.</p>
      ) : (
        <div className={c.worldGrid}>
          {cities.map((z) => {
            const { hour, minute, second, ampm } = getDisplayParts(now, z.timeZone, hour12);
            return (
              <div key={z.id} className={c.worldCard}>
                <button
                  className={c.worldRemove}
                  onClick={() => remove(z.id)}
                  aria-label={`Remove ${z.city}`}
                  title="Remove"
                >
                  ×
                </button>
                <AnalogClock
                  date={now}
                  timeZone={z.timeZone}
                  size={116}
                  showNumbers={false}
                />
                <div className={c.worldCity}>{z.city}</div>
                <div className={c.worldTime}>
                  {hour}:{minute}
                  <span className={c.worldSeconds}>:{second}</span>
                  {hour12 && ampm && <span className={c.worldAmPm}> {ampm}</span>}
                </div>
                <div className={c.worldMeta}>
                  {formatShortDate(now, z.timeZone)} · {getOffsetLabel(now, z.timeZone)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WorldClockTab;
