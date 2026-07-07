/* Shared timezone helpers for the Clock & Calendar tool.
   Everything is powered by the native Intl API — no external packages. */

export interface TimeParts {
  hour: number;
  minute: number;
  second: number;
}

/** Get 24-hour clock parts for a date in a given IANA timezone (undefined = local). */
export function getTimeParts(date: Date, timeZone?: string): TimeParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);

  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? "0");
  let hour = get("hour");
  if (hour === 24) hour = 0; // some engines emit "24" for midnight
  return { hour, minute: get("minute"), second: get("second") };
}

/** Formatted clock parts (hour/minute/second/dayPeriod) honouring 12/24-hour. */
export function getDisplayParts(date: Date, timeZone: string | undefined, hour12: boolean) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);

  const val = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return {
    hour: val("hour").padStart(2, "0"),
    minute: val("minute").padStart(2, "0"),
    second: val("second").padStart(2, "0"),
    ampm: val("dayPeriod").toUpperCase(),
  };
}

/** Long, human-readable date, e.g. "Tuesday, 7 July 2026". */
export function formatLongDate(date: Date, timeZone?: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** Short date, e.g. "Tue, 7 Jul". */
export function formatShortDate(date: Date, timeZone?: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

/** GMT offset label for a timezone, e.g. "GMT+5:30". */
export function getOffsetLabel(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
  }).formatToParts(date);
  return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
}

/** Offset (in ms) of a timezone at a given instant: wallTime − UTC. */
export function getOffsetMs(timeZone: string, date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const map: Record<string, string> = {};
  parts.forEach((p) => (map[p.type] = p.value));
  const asUTC = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour) === 24 ? 0 : Number(map.hour),
    Number(map.minute),
    Number(map.second),
  );
  return asUTC - date.getTime();
}

/** Convert a naive wall-clock time (as typed) in a given zone to a UTC instant. */
export function zonedWallToInstant(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const offset = getOffsetMs(timeZone, new Date(guess));
  return new Date(guess - offset);
}

export interface CityZone {
  id: string;
  city: string;
  timeZone: string;
}

/** Curated list of major world cities for the World Clock. */
export const WORLD_ZONES: CityZone[] = [
  { id: "honolulu", city: "Honolulu", timeZone: "Pacific/Honolulu" },
  { id: "los-angeles", city: "Los Angeles", timeZone: "America/Los_Angeles" },
  { id: "denver", city: "Denver", timeZone: "America/Denver" },
  { id: "chicago", city: "Chicago", timeZone: "America/Chicago" },
  { id: "new-york", city: "New York", timeZone: "America/New_York" },
  { id: "toronto", city: "Toronto", timeZone: "America/Toronto" },
  { id: "sao-paulo", city: "São Paulo", timeZone: "America/Sao_Paulo" },
  { id: "london", city: "London", timeZone: "Europe/London" },
  { id: "paris", city: "Paris", timeZone: "Europe/Paris" },
  { id: "berlin", city: "Berlin", timeZone: "Europe/Berlin" },
  { id: "moscow", city: "Moscow", timeZone: "Europe/Moscow" },
  { id: "istanbul", city: "Istanbul", timeZone: "Europe/Istanbul" },
  { id: "dubai", city: "Dubai", timeZone: "Asia/Dubai" },
  { id: "karachi", city: "Karachi", timeZone: "Asia/Karachi" },
  { id: "kolkata", city: "Mumbai · Delhi", timeZone: "Asia/Kolkata" },
  { id: "dhaka", city: "Dhaka", timeZone: "Asia/Dhaka" },
  { id: "bangkok", city: "Bangkok", timeZone: "Asia/Bangkok" },
  { id: "singapore", city: "Singapore", timeZone: "Asia/Singapore" },
  { id: "hong-kong", city: "Hong Kong", timeZone: "Asia/Hong_Kong" },
  { id: "shanghai", city: "Shanghai", timeZone: "Asia/Shanghai" },
  { id: "tokyo", city: "Tokyo", timeZone: "Asia/Tokyo" },
  { id: "seoul", city: "Seoul", timeZone: "Asia/Seoul" },
  { id: "sydney", city: "Sydney", timeZone: "Australia/Sydney" },
  { id: "auckland", city: "Auckland", timeZone: "Pacific/Auckland" },
];

/** The visitor's own IANA timezone, e.g. "Asia/Kolkata". */
export function localTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
