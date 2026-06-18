"use strict";
/**
 * rankEvaluator.ts
 *
 * Deterministic utility that maps a paste count to a human-readable rank
 * title and provides progress information toward the next tier.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateRank = evaluateRank;
exports.getProgressHint = getProgressHint;
/** Ordered rank table – thresholds are inclusive lower bounds. */
const RANKS = [
    { threshold: 0, label: "Novice Scribe", icon: "$(edit)" },
    { threshold: 50, label: "Copy-Paste Apprentice", icon: "$(files)" },
    { threshold: 100, label: "StackOverflow Architect", icon: "$(library)" },
    { threshold: 500, label: "Ctrl+V Grandmaster", icon: "$(crown)" },
    { threshold: 1000, label: "Hall of Shame", icon: "$(warning)" },
    { threshold: 2000, label: "God Level", icon: "$(zap)" },
];
/**
 * Returns the rank and next-threshold information for a given paste count.
 *
 * @param pasteCount - Total number of paste actions recorded (>= 0).
 */
function evaluateRank(pasteCount) {
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
function getProgressHint(info) {
    if (info.nextThreshold === null) {
        return "Maximum rank achieved!";
    }
    const remaining = info.nextThreshold - info.pasteCount;
    return `${remaining} paste${remaining === 1 ? "" : "s"} to next rank`;
}
//# sourceMappingURL=rankEvaluator.js.map