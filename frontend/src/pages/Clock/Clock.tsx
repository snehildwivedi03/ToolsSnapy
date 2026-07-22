/**
 * ToolSnapy — Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { useSearchParams } from "react-router-dom";
import ToolPageShell from "../../components/ToolPageShell/ToolPageShell";
import ClockTab from "./components/ClockTab";
import WorldClockTab from "./components/WorldClockTab";
import StopwatchTab from "./components/StopwatchTab";
import TimerTab from "./components/TimerTab";
import AlarmTab from "./components/AlarmTab";
import CalendarTab from "./components/CalendarTab";
import CountdownTab from "./components/CountdownTab";
import TimeZoneConverterTab from "./components/TimeZoneConverterTab";
import c from "./Clock.module.css";

type ToolId =
  | "clock"
  | "world"
  | "stopwatch"
  | "timer"
  | "alarm"
  | "calendar"
  | "countdown"
  | "timezone";

interface ToolDef {
  id: ToolId;
  title: string;
  description: string;
  accent: string;
}

const TOOLS: ToolDef[] = [
  { id: "clock", title: "Clock", description: "Live analog & digital clock with timezone support.", accent: "#6f4e37" },
  { id: "world", title: "World Clock", description: "Track the time across major cities worldwide.", accent: "#0891b2" },
  { id: "stopwatch", title: "Stopwatch", description: "Precise stopwatch with lap timing.", accent: "#dc2626" },
  { id: "timer", title: "Timer", description: "Countdown timer with presets and an alert.", accent: "#d97706" },
  { id: "alarm", title: "Alarm", description: "Set alarms with your choice of alert sound.", accent: "#7c3aed" },
  { id: "calendar", title: "Calendar", description: "Browse any month with a full calendar.", accent: "#059669" },
  { id: "countdown", title: "Countdown", description: "Count down to an event, date or deadline.", accent: "#db2777" },
  { id: "timezone", title: "Time Zone Converter", description: "Convert a time across different time zones.", accent: "#2563eb" },
];

const ClockIcon = (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 15.5 14" />
  </svg>
);

const renderTool = (id: ToolId) => {
  switch (id) {
    case "clock":
      return <ClockTab />;
    case "world":
      return <WorldClockTab />;
    case "stopwatch":
      return <StopwatchTab />;
    case "timer":
      return <TimerTab />;
    case "alarm":
      return <AlarmTab />;
    case "calendar":
      return <CalendarTab />;
    case "countdown":
      return <CountdownTab />;
    case "timezone":
      return <TimeZoneConverterTab />;
  }
};

const Clock = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const toolParam = searchParams.get("tool");
  const active = TOOLS.some((t) => t.id === toolParam)
    ? (toolParam as ToolId)
    : null;
  const activeTool = TOOLS.find((t) => t.id === active) ?? null;

  const openTool = (id: ToolId) => setSearchParams({ tool: id });
  const closeTool = () => setSearchParams({});

  return (
    <ToolPageShell
      backTo="/"
      backLabel={activeTool ? "Clock tools" : "Home"}
      onBack={activeTool ? closeTool : undefined}
      icon={ClockIcon}
      iconColor="#6F4E37"
      iconBg="#F3EBE3"
      title={activeTool ? activeTool.title : "Clock & Calendar"}
      description={
        activeTool
          ? activeTool.description
          : "A complete time toolkit — analog & digital clocks, world clock, stopwatch, timer, alarms, countdown, converter and a calendar."
      }
      hideRelated
    >
      {activeTool ? (
        <div className={c.panel}>{renderTool(activeTool.id)}</div>
      ) : (
        <div className={c.toolGrid}>
          {TOOLS.map((t) => (
            <button
              key={t.id}
              className={c.toolCard}
              style={{ ["--card-accent" as string]: t.accent }}
              onClick={() => openTool(t.id)}
            >
              <h3 className={c.toolCardTitle}>{t.title}</h3>
              <p className={c.toolCardDesc}>{t.description}</p>
              <span className={c.toolCardCta}>
                Open tool
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </button>
          ))}
        </div>
      )}
    </ToolPageShell>
  );
};

export default Clock;
