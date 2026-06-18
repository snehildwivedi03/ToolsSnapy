# About Copy Paste Ranger

## Overview

Copy Paste Ranger is a VS Code extension built in TypeScript that gamifies clipboard usage. It intercepts every copy and paste action made inside the editor, maintains persistent counters, and surfaces a ranked title and animated badge popup as the developer's paste count climbs through shame-themed milestones.

The extension was designed to be:
- **Zero-friction** — no configuration, activates on startup, invisible until you hit a milestone
- **Non-destructive** — keybinding wrappers execute the real clipboard action first, then record the hit
- **Persistent** — counters survive VS Code restarts through `ExtensionContext.globalState`

---

## Architecture

The codebase is split into four focused modules:

```
extension.ts       ← Entry point; wires everything together
counterEngine.ts   ← State: reads/writes copy+paste counts to globalState
rankEvaluator.ts   ← Pure function: paste count → rank title + progress info
memeView.ts        ← Side effect: badge WebviewPanel creation and HTML rendering
```

### `extension.ts`
Owns the extension lifecycle (`activate` / `deactivate`), creates the status bar item, registers the two keybinding wrapper commands (`interceptCopy`, `interceptPaste`) and the reset command, and coordinates the milestone check on every paste.

### `counterEngine.ts`
A plain class wrapping `vscode.Memento` (globalState). Exposes `incrementCopies()`, `incrementPastes()`, `reset()`, and `getStats()`. All mutations immediately persist to disk.

### `rankEvaluator.ts`
A stateless module. `evaluateRank(pasteCount)` walks a sorted rank table and returns the matching label, its VS Code Codicon identifier, the next threshold, and the raw paste count. `getProgressHint()` formats the remaining paste count into a human-readable string.

### `memeView.ts`
Holds the `MEME_MILESTONES` array, `getTriggeredMilestone()` (milestone detector), and `showMemeMilestone()` (Webview launcher). The webview HTML is built entirely in TypeScript — no external template engine — with CSS custom properties driven by the milestone's `accentColor` so each badge has a distinct color theme.

---

## How Clipboard Interception Works

VS Code does not expose a stable clipboard listener event. The extension uses **keybinding wrappers**:

1. `package.json` declares keybindings that override `Ctrl+C` / `Ctrl+V` (and `Cmd+C` / `Cmd+V` on macOS) when `editorTextFocus` is true.
2. The bound commands (`ctrlVChronicles.interceptCopy` / `interceptPaste`) call the original built-in action (`editor.action.clipboardCopyAction` / `clipboardPasteAction`) first via `executeCommand`, then increment the counter.
3. This means the clipboard always works exactly as expected — the extension only adds counting on top.

---

## Rank Progression

| Threshold | Label | Codicon | Status Bar BG |
|-----------|-------|---------|---------------|
| 0 | Novice Scribe | `$(edit)` | default |
| 50 | Copy-Paste Apprentice | `$(files)` | default |
| 100 | StackOverflow Architect | `$(library)` | default |
| 500 | Ctrl+V Grandmaster | `$(crown)` | default |
| 1 000 | Hall of Shame | `$(warning)` | `statusBarItem.warningBackground` (orange) |
| 2 000 | God Level | `$(zap)` | `statusBarItem.errorBackground` (red) |

---

## Badge Milestone System

Each milestone is a `MemeConfig` object:

```typescript
interface MemeConfig {
  milestone:      number;   // paste count trigger
  imageName:      string;   // PNG filename in images/memes/
  caption:        string;   // shame text shown below image
  shameLevel:     string;   // banner heading
  accentColor:    string;   // hex color for theming
  displaySeconds: number;   // auto-close delay
}
```

The webview panel:
- Slides in from the top (CSS spring animation)
- Displays the badge image full-width
- Shows the caption in the accent color
- Runs a shrinking countdown bar across the bottom using a pure CSS animation
- God Level additionally pulses with a golden glow animation (`godPulse` keyframe)
- Auto-closes after `displaySeconds` via a Node.js `setTimeout`

Each milestone is only shown **once per session** (tracked in `globalState` as an array of triggered milestone numbers). Resetting stats also clears the milestone history.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Language | TypeScript 5.x (strict mode, ES2022 target) |
| Runtime | VS Code Extension Host (Node.js) |
| UI | VS Code Status Bar API + WebviewPanel |
| Persistence | `vscode.ExtensionContext.globalState` (Memento) |
| Build | `tsc` (TypeScript compiler) |
| Webview styling | Inline CSS with CSS custom properties, keyframe animations |
| Images | User-supplied PNGs in `images/memes/` |

---

## Key VS Code APIs Used

| API | Purpose |
|-----|---------|
| `vscode.window.createStatusBarItem` | Bottom-right counter display |
| `vscode.commands.registerCommand` | Clipboard wrapper + reset commands |
| `vscode.window.createWebviewPanel` | Badge popup renderer |
| `vscode.ExtensionContext.globalState` | Persistent counter storage |
| `vscode.window.showWarningMessage` | Reset confirmation dialog |
| `vscode.ThemeColor` | Dynamic status bar background color |
| `vscode.MarkdownString` | Rich tooltip with Codicons |
