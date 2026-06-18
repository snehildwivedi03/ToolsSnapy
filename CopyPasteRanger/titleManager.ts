export interface TitleInfo {
  label: string;
  nextThreshold: number | null;
  pasteCount: number;
}

const TITLES: { threshold: number; label: string }[] = [
  { threshold: 0,   label: "Novice Scribe" },
  { threshold: 50,  label: "Copy-Paste Apprentice" },
  { threshold: 100, label: "StackOverflow Architect" },
  { threshold: 500, label: "Ctrl+V Grandmaster" },
];

/**
 * Returns the badge title and next unlock threshold for a given paste count.
 */
export function getTitle(pasteCount: number): TitleInfo {
  let current = TITLES[0];

  for (const tier of TITLES) {
    if (pasteCount >= tier.threshold) {
      current = tier;
    }
  }

  const currentIndex = TITLES.indexOf(current);
  const next = TITLES[currentIndex + 1] ?? null;

  return {
    label: current.label,
    nextThreshold: next?.threshold ?? null,
    pasteCount,
  };
}

/**
 * Returns a progress hint toward the next title, e.g. "23 pastes to next rank".
 */
export function getProgressHint(info: TitleInfo): string {
  if (info.nextThreshold === null) {
    return "Maximum rank achieved!";
  }
  const remaining = info.nextThreshold - info.pasteCount;
  return `${remaining} paste${remaining === 1 ? "" : "s"} to next rank`;
}
