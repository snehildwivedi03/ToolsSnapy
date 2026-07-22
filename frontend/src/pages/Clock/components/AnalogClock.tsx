/**
 * ToolSnapy  Free, private online tools. No installs, no signup.
 * https://toolsnapy.com
 *
 * © 2026 ToolSnapy. All rights reserved.
 */
import { getTimeParts } from "../timezones";
import c from "../Clock.module.css";

interface Props {
  date: Date;
  timeZone?: string;
  size?: number;
  showNumbers?: boolean;
  showSeconds?: boolean;
}

const RAD = Math.PI / 180;
const point = (angle: number, radius: number): [number, number] => [
  100 + radius * Math.sin(angle * RAD),
  100 - radius * Math.cos(angle * RAD),
];

/** Theme-aware analog clock face rendered as crisp SVG. */
const AnalogClock = ({
  date,
  timeZone,
  size = 240,
  showNumbers = true,
  showSeconds = true,
}: Props) => {
  const { hour, minute, second } = getTimeParts(date, timeZone);

  const secondAngle = second * 6;
  const minuteAngle = minute * 6 + second * 0.1;
  const hourAngle = (hour % 12) * 30 + minute * 0.5;

  return (
    <svg
      className={c.analog}
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label="Analog clock"
    >
      <circle cx="100" cy="100" r="98" className={c.analogFace} />

      {/* Tick marks */}
      {Array.from({ length: 60 }, (_, i) => {
        const isHour = i % 5 === 0;
        const [x1, y1] = point(i * 6, isHour ? 82 : 87);
        const [x2, y2] = point(i * 6, 92);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            className={isHour ? c.tickHour : c.tickMinute}
          />
        );
      })}

      {/* Hour numbers */}
      {showNumbers &&
        Array.from({ length: 12 }, (_, i) => {
          const n = i + 1;
          const [x, y] = point(n * 30, 68);
          return (
            <text
              key={n}
              x={x}
              y={y}
              className={c.analogNumber}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {n}
            </text>
          );
        })}

      {/* Hands */}
      <line
        x1="100"
        y1="112"
        x2="100"
        y2="52"
        className={c.handHour}
        transform={`rotate(${hourAngle} 100 100)`}
      />
      <line
        x1="100"
        y1="114"
        x2="100"
        y2="30"
        className={c.handMinute}
        transform={`rotate(${minuteAngle} 100 100)`}
      />
      {showSeconds && (
        <line
          x1="100"
          y1="120"
          x2="100"
          y2="22"
          className={c.handSecond}
          transform={`rotate(${secondAngle} 100 100)`}
        />
      )}
      <circle cx="100" cy="100" r="4.5" className={c.handCap} />
    </svg>
  );
};

export default AnalogClock;
