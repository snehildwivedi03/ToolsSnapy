/**
 * extension.ts
 *
 * VS Code extension entry point for Copy Paste Ranger.
 * Manages the extension lifecycle, status bar UI, clipboard command
 * interception via onWillExecuteCommand, and the reset administrative command.
 */
import * as vscode from "vscode";
import { CounterEngine } from "./counterEngine";
import { evaluateRank, getProgressHint } from "./rankEvaluator";
import { getTriggeredMilestone, showMemeMilestone } from "./memeView";

/** Kept module-level so deactivate() can dispose it without a closure. */
let statusBar: vscode.StatusBarItem | undefined;

export function activate(context: vscode.ExtensionContext): void {
  const engine = new CounterEngine(context.globalState);

  // ── Shame milestone tracking ──────────────────────────────────────────────
  const KEY_MILESTONES = "ctrlVChronicles.shownMilestones";
  const shownMilestones = new Set<number>(
    context.globalState.get<number[]>(KEY_MILESTONES, [])
  );

  // ── Status Bar ────────────────────────────────────────────────────────────
  statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBar.command = "ctrlVChronicles.resetStats";
  statusBar.show();
  context.subscriptions.push(statusBar);

  // ── Helper: monospace progress bar rendered in the tooltip ───────────────
  function buildProgressBar(current: number, next: number | null): string {
    if (next === null) { return "`▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓` MAX"; }
    const filled = Math.round(Math.min(current / next, 1) * 15);
    return `\`${"▓".repeat(filled)}${"░".repeat(15 - filled)}\` ${current}/${next}`;
  }

  function refreshStatusBar(): void {
    if (!statusBar) { return; }
    const { copyCount, pasteCount } = engine.getStats();
    const rank = evaluateRank(pasteCount);

    // Icon escalates with shame tier: edit → files → library → crown → warning → zap
    statusBar.text = `${rank.icon} [${rank.label}] C: ${copyCount} | P: ${pasteCount}`;

    // Background: Hall of Shame → warning orange, God Level → error red
    const rankBgMap: Partial<Record<string, string>> = {
      "Hall of Shame": "statusBarItem.warningBackground",
      "God Level":     "statusBarItem.errorBackground",
    };
    const bgKey = rankBgMap[rank.label];
    statusBar.backgroundColor = bgKey ? new vscode.ThemeColor(bgKey) : undefined;

    // Rich tooltip with progress bar
    const tip = new vscode.MarkdownString(
      `**Copy Paste Ranger**\n\n` +
      `$(clippy) Copies: **${copyCount}** &nbsp;·&nbsp; Pastes: **${pasteCount}**\n\n` +
      `**Rank:** ${rank.icon} ${rank.label}\n\n` +
      `${buildProgressBar(pasteCount, rank.nextThreshold)}\n\n` +
      `_${getProgressHint(rank)}_\n\n` +
      `---\n\n` +
      `_Click to reset all stats_`
    );
    tip.isTrusted = true;
    tip.supportThemeIcons = true;
    statusBar.tooltip = tip;
  }

  refreshStatusBar();

  // ── Clipboard Interception (keybinding wrappers) ────────────────────────
  // ctrl+c / ctrl+v are overridden in package.json (when: editorTextFocus).
  // Each wrapper delegates to the built-in action first, then tracks the hit.
  const copyCmd = vscode.commands.registerCommand(
    "ctrlVChronicles.interceptCopy",
    async () => {
      await vscode.commands.executeCommand("editor.action.clipboardCopyAction");
      engine.incrementCopies();
      refreshStatusBar();
    }
  );

  const pasteCmd = vscode.commands.registerCommand(
    "ctrlVChronicles.interceptPaste",
    async () => {
      await vscode.commands.executeCommand("editor.action.clipboardPasteAction");
      const { pasteCount } = engine.incrementPastes();
      refreshStatusBar();
      const meme = getTriggeredMilestone(pasteCount, shownMilestones);
      if (meme) {
        shownMilestones.add(meme.milestone);
        void context.globalState.update(KEY_MILESTONES, [...shownMilestones]);
        showMemeMilestone(context.extensionUri, meme);
      }
    }
  );
  context.subscriptions.push(copyCmd, pasteCmd);

  // ── Reset Command (ctrlVChronicles.resetStats) ────────────────────────────
  const resetCmd = vscode.commands.registerCommand(
    "ctrlVChronicles.resetStats",
    async () => {
      const answer = await vscode.window.showWarningMessage(
        "Reset all Copy Paste Ranger stats? This cannot be undone.",
        { modal: true },
        "Yes, Reset"
      );
      if (answer === "Yes, Reset") {
        engine.reset();
        shownMilestones.clear();
        void context.globalState.update(KEY_MILESTONES, []);
        refreshStatusBar();
        vscode.window.showInformationMessage(
          "Copy Paste Ranger: Stats have been reset. Starting fresh as Novice Scribe!"
        );
      }
    }
  );
  context.subscriptions.push(resetCmd);
}

export function deactivate(): void {
  // StatusBarItem is already in context.subscriptions, but disposing here
  // explicitly prevents any race conditions during rapid restarts.
  statusBar?.dispose();
  statusBar = undefined;
}
