import s from "./ProgressBar.module.css";

type Tone = "purple" | "red" | "amber" | "green";

interface Props {
  /** 0–100 for a determinate bar. Omit (or pass undefined) for an indeterminate sweep. */
  value?: number;
  /** Optional text shown on the left of the bar. */
  label?: string;
  /** Colour theme. Defaults to the app accent (purple). */
  tone?: Tone;
}

const toneClass: Record<Tone, string> = {
  purple: s.tonePurple,
  red: s.toneRed,
  amber: s.toneAmber,
  green: s.toneGreen,
};

const ProgressBar = ({ value, label, tone = "purple" }: Props) => {
  const indeterminate = value === undefined || Number.isNaN(value);
  const pct = indeterminate ? 0 : Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className={`${s.wrap} ${toneClass[tone]}`}>
      {(label || !indeterminate) && (
        <div className={s.row}>
          {label && <span className={s.label}>{label}</span>}
          {!indeterminate && <span className={s.pct}>{pct}%</span>}
        </div>
      )}
      <div
        className={s.track}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={indeterminate ? undefined : pct}
        aria-label={label ?? "Progress"}
      >
        {indeterminate ? (
          <span className={s.indeterminate} aria-hidden="true" />
        ) : (
          <div className={s.fill} style={{ width: `${pct}%` }} />
        )}
      </div>
    </div>
  );
};

export default ProgressBar;
