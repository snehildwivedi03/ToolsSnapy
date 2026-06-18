# Testing Guide — Copy Paste Ranger

This document covers how to run, test, and debug the extension on **Windows**, **Linux**, and **macOS**.

---

## Prerequisites (all platforms)

| Requirement | Minimum version | Check |
|-------------|-----------------|-------|
| Node.js | 18.x | `node --version` |
| npm | 9.x | `npm --version` |
| VS Code | 1.85.0 | Help → About |
| TypeScript | installed via `npm install` | — |

---

## Step 1 — Install and Compile

### Windows (PowerShell)
```powershell
cd "C:\path\to\CopyPasteRanger"
npm install
npm run compile
```

### Linux / macOS (Terminal)
```bash
cd /path/to/CopyPasteRanger
npm install
npm run compile
```

If compilation succeeds, the `out/` folder is created with compiled `.js` files and source maps. No output means no errors.

---

## Step 2 — Open the Extension Folder in VS Code

The extension folder must be the **workspace root** for F5 debugging to work.

### Windows
```
File → Open Folder → select the CopyPasteRanger folder
```
Or from PowerShell:
```powershell
code "C:\path\to\CopyPasteRanger"
```

### Linux / macOS
```bash
code /path/to/CopyPasteRanger
```

---

## Step 3 — Launch the Extension Development Host

Press **F5** (or **Run → Start Debugging**).

- A second VS Code window opens with the title **\[Extension Development Host\]**
- The `npm run watch` task starts automatically and recompiles on every file save
- All testing is done in the **Extension Development Host** window

> If VS Code prompts "No build task found", select **npm: watch** from the list.

---

## Step 4 — Verify the Status Bar

In the Extension Development Host, look at the **bottom-right** of the window.

You should see:
```
$(edit) [Novice Scribe] C: 0 | P: 0
```

Hover it to see the tooltip with the progress bar.

---

## Feature Testing Checklist

### Copy counter
1. Open any file in the Extension Development Host
2. Select some text
3. Press `Ctrl+C` (Windows/Linux) or `Cmd+C` (macOS)
4. ✅ `C:` counter increments in the status bar

### Paste counter
1. Place the cursor in the editor
2. Press `Ctrl+V` (Windows/Linux) or `Cmd+V` (macOS)
3. ✅ `P:` counter increments in the status bar

### Tooltip
1. Hover the status bar item
2. ✅ Tooltip shows copies, pastes, current rank, monospace progress bar, and hint

### Reset command
1. Open Command Palette: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
2. Type `Copy Paste Ranger: Reset Stats`
3. ✅ A modal dialog appears asking for confirmation
4. Click **Yes, Reset**
5. ✅ Status bar resets to `C: 0 | P: 0`
6. Click anywhere without confirming
7. ✅ Counters remain unchanged

### Persistence across restarts
1. Copy and paste a few times to build up a count
2. Close the Extension Development Host window
3. Press **F5** again to reopen it
4. ✅ The counters retain their previous values

---

## Quick Milestone Testing

Badge popups normally trigger at 100 / 500 / 1 000 / 2 000 pastes. For quick testing, **temporarily lower the thresholds** in `memeView.ts`:

```typescript
// Temporary test values — restore before publishing
{ milestone: 3,  imageName: "segent100.png",  shameLevel: "SERGEANT",  ... },
{ milestone: 6,  imageName: "captain500.png", shameLevel: "CAPTAIN",   ... },
{ milestone: 9,  imageName: "cheif1000.png",  shameLevel: "CHIEF",     ... },
{ milestone: 12, imageName: "god2000.png",    shameLevel: "GOD LEVEL", ... },
```

Save the file (the watch task auto-recompiles). Then paste 3, 6, 9, and 12 times in the Extension Development Host to trigger each badge.

### Badge popup checklist
- ✅ Panel opens beside the editor
- ✅ Correct badge image is displayed
- ✅ Banner shows the correct shame level and paste count
- ✅ Caption text appears in the accent color
- ✅ Countdown bar drains from right to left
- ✅ Panel auto-closes after the configured seconds
- ✅ Same milestone does **not** appear again (persistence check)
- ✅ God Level panel has a pulsing golden glow

### Status bar color escalation
| Rank | Expected |
|------|----------|
| Below Hall of Shame | Default color |
| Hall of Shame (1 000+) | Orange background |
| God Level (2 000+) | Red background |

---

## Debugging

### View extension logs

In the **Extension Development Host**:
```
View → Output → (dropdown) → Extension Host
```

Any `console.log`, `console.error`, or unhandled exceptions appear here.

### Set a breakpoint

1. Open `extension.ts` in the **parent** VS Code window
2. Click in the gutter next to any line to set a breakpoint
3. The debugger maps through `.js.map` source maps automatically
4. Trigger the action in the Extension Development Host — execution pauses in the parent window

### Reload the extension after a code change (without F5)

In the Extension Development Host:
```
Ctrl+Shift+P → Developer: Reload Window
```

Or just save any `.ts` file — the watch task recompiles and the new code is ready after a window reload.

---

## Platform-Specific Notes

### Windows
- Use PowerShell or Command Prompt; both work
- `Ctrl+C` in the **terminal** is not intercepted — only `editorTextFocus` triggers counting
- If Windows Defender or antivirus flags the `.vsix` during packaging, add the project folder to exclusions

### Linux
- Ensure VS Code is installed as a `.deb`, `.rpm`, or snap package (not Flatpak, which can have keybinding issues)
- `xclip` or `xsel` is required for clipboard support on X11 headless environments, but is not needed for standard desktop testing
- The keyboard shortcut interceptor uses `ctrl+c` — same as Windows

### macOS
- The keybindings use `cmd+c` and `cmd+v` (defined in `package.json` under `"mac"`)
- Make sure the Extension Development Host window has focus when testing keyboard shortcuts
- Terminal clipboard shortcuts (`Ctrl+C` kill signal) are separate and will not interfere

---

## Common Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| Status bar item not visible | Extension didn't activate | Check Output → Extension Host for errors |
| Counter not incrementing | Editor does not have text focus | Click inside a text file, not the sidebar |
| Badge image not showing | PNG missing from `images/memes/` | Confirm file exists and filename matches `memeView.ts` |
| `Cannot find module 'vscode'` | `npm install` not run | Run `npm install` in the extension folder |
| `npm run compile` fails | TypeScript error | Read the error line number and fix the source |
| F5 opens wrong window | Wrong folder open in VS Code | Open `CopyPasteRanger/` as the workspace root |
