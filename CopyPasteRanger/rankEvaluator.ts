/**
 * rankEvaluator.ts
 *
 * Deterministic utility that maps a paste count to a human-readable rank
 * title and provides progress information toward the next tier.
 */

export interface RankInfo {
  /** Display label for the current rank. */
  readonly label: string;
  /** VS Code Codicon identifier used in the status bar (e.g. "$(crown)"). */
  readonly icon: string;
  /** Paste count at which the next rank unlocks, or null when at max rank. */
  readonly nextThreshold: number | null;
  /** The paste count used to derive this result. */
  readonly pasteCount: number;
}

/** Ordered rank table – thresholds are inclusive lower bounds. */
const RANKS: ReadonlyArray<{ threshold: number; label: string; icon: string }> = [
  { threshold: 0,    label: "Novice Scribe",           icon: "$(edit)" },
  { threshold: 50,   label: "Copy-Paste Apprentice",   icon: "$(files)" },
  { threshold: 100,  label: "StackOverflow Architect", icon: "$(library)" },
  { threshold: 500,  label: "Ctrl+V Grandmaster",      icon: "$(crown)" },
  { threshold: 1000, label: "Hall of Shame",           icon: "$(warning)" },
  { threshold: 2000, label: "God Level",               icon: "$(zap)" },
];

/**
 * Returns the rank and next-threshold information for a given paste count.
 *
 * @param pasteCount - Total number of paste actions recorded (>= 0).
 */
export function evaluateRank(pasteCount: number): RankInfo {
  let current = RANKS[0];

  for (const rank of RANKS) {
    if (pasteCount >= rank.threshold) {
      current = rank;
    }
  }

  const currentIndex = RANKS.indexOf(current);
  const next = RANKS[currentIndex + 1] ?? null;

  return {
    label: current.label,
    icon: current.icon,
    nextThreshold: next?.threshold ?? null,
    pasteCount,
  };
}

/**
 * Returns a human-readable hint about progress toward the next rank.
 *
 * @param info - RankInfo returned by {@link evaluateRank}.
 */
export function getProgressHint(info: RankInfo): string {
  if (info.nextThreshold === null) {
    return "Maximum rank achieved!";
  }
  const remaining = info.nextThreshold - info.pasteCount;
  return `${remaining} paste${remaining === 1 ? "" : "s"} to next rank`;
}
