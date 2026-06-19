"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
/**
 * extension.ts
 *
 * VS Code extension entry point for Copy Paste Ranger.
 * Manages the extension lifecycle, status bar UI, clipboard command
 * interception via onWillExecuteCommand, and the reset administrative command.
 */
const vscode = __importStar(require("vscode"));
const counterEngine_1 = require("./counterEngine");
const rankEvaluator_1 = require("./rankEvaluator");
const memeView_1 = require("./memeView");
/** Kept module-level so deactivate() can dispose it without a closure. */
let statusBar;
function activate(context) {
    const engine = new counterEngine_1.CounterEngine(context.globalState);
    // ── Shame milestone tracking ──────────────────────────────────────────────
    const KEY_MILESTONES = "ctrlVChronicles.shownMilestones";
    const shownMilestones = new Set(context.globalState.get(KEY_MILESTONES, []));
    // ── Status Bar ────────────────────────────────────────────────────────────
    statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBar.command = "ctrlVChronicles.resetStats";
    statusBar.show();
    context.subscriptions.push(statusBar);
    // ── Helper: monospace progress bar rendered in the tooltip ───────────────
    function buildProgressBar(current, next) {
        if (next === null) {
            return "`▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓` MAX";
        }
        const filled = Math.round(Math.min(current / next, 1) * 15);
        return `\`${"▓".repeat(filled)}${"░".repeat(15 - filled)}\` ${current}/${next}`;
    }
    function refreshStatusBar() {
        if (!statusBar) {
            return;
        }
        const { copyCount, pasteCount } = engine.getStats();
        const rank = (0, rankEvaluator_1.evaluateRank)(pasteCount);
        // Icon escalates with shame tier: edit → files → library → crown → warning → zap
        statusBar.text = `${rank.icon} [${rank.label}] C: ${copyCount} | P: ${pasteCount}`;
        // Background: Hall of Shame → warning orange, God Level → error red
        const rankBgMap = {
            "Hall of Shame": "statusBarItem.warningBackground",
            "God Level": "statusBarItem.errorBackground",
        };
        const bgKey = rankBgMap[rank.label];
        statusBar.backgroundColor = bgKey ? new vscode.ThemeColor(bgKey) : undefined;
        // Rich tooltip with progress bar
        const tip = new vscode.MarkdownString(`**Copy Paste Ranger**\n\n` +
            `$(clippy) Copies: **${copyCount}** &nbsp;·&nbsp; Pastes: **${pasteCount}**\n\n` +
            `**Rank:** ${rank.icon} ${rank.label}\n\n` +
            `${buildProgressBar(pasteCount, rank.nextThreshold)}\n\n` +
            `_${(0, rankEvaluator_1.getProgressHint)(rank)}_\n\n` +
            `---\n\n` +
            `_Click to reset all stats_`);
        tip.isTrusted = true;
        tip.supportThemeIcons = true;
        statusBar.tooltip = tip;
    }
    refreshStatusBar();
    // ── Clipboard Interception (keybinding wrappers) ────────────────────────
    // ctrl+c / ctrl+v are overridden in package.json (when: editorTextFocus).
    // Each wrapper delegates to the built-in action first, then tracks the hit.
    const copyCmd = vscode.commands.registerCommand("ctrlVChronicles.interceptCopy", async () => {
        await vscode.commands.executeCommand("editor.action.clipboardCopyAction");
        engine.incrementCopies();
        refreshStatusBar();
    });
    const pasteCmd = vscode.commands.registerCommand("ctrlVChronicles.interceptPaste", async () => {
        await vscode.commands.executeCommand("editor.action.clipboardPasteAction");
        const { pasteCount } = engine.incrementPastes();
        refreshStatusBar();
        const meme = (0, memeView_1.getTriggeredMilestone)(pasteCount, shownMilestones);
        if (meme) {
            shownMilestones.add(meme.milestone);
            void context.globalState.update(KEY_MILESTONES, [...shownMilestones]);
            (0, memeView_1.showMemeMilestone)(context.extensionUri, meme);
        }
    });
    context.subscriptions.push(copyCmd, pasteCmd);
    // ── Reset Command (ctrlVChronicles.resetStats) ────────────────────────────
    const resetCmd = vscode.commands.registerCommand("ctrlVChronicles.resetStats", async () => {
        const answer = await vscode.window.showWarningMessage("Reset all Copy Paste Ranger stats? This cannot be undone.", { modal: true }, "Yes, Reset");
        if (answer === "Yes, Reset") {
            engine.reset();
            shownMilestones.clear();
            void context.globalState.update(KEY_MILESTONES, []);
            refreshStatusBar();
            vscode.window.showInformationMessage("Copy Paste Ranger: Stats have been reset. Starting fresh as Novice Scribe!");
        }
    });
    context.subscriptions.push(resetCmd);
}
function deactivate() {
    // StatusBarItem is already in context.subscriptions, but disposing here
    // explicitly prevents any race conditions during rapid restarts.
    statusBar?.dispose();
    statusBar = undefined;
}
//# sourceMappingURL=extension.js.map