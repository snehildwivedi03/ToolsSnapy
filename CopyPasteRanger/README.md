# Copy Paste Ranger

> A VS Code extension that tracks your copy/paste habits and promotes (or shames) you through a military rank system — complete with badge popups when you hit milestones.

![VS Code](https://img.shields.io/badge/VS%20Code-%5E1.85.0-blue?logo=visual-studio-code)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Version](https://img.shields.io/badge/version-0.0.1-green)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## What It Does

Copy Paste Ranger silently watches every `Ctrl+C` and `Ctrl+V` you make inside the editor. As your paste count climbs, your rank evolves and badge popups appear to remind you of your dependency on the clipboard.

---

## Features

- **Live status bar counter** — copies and pastes shown at a glance in the bottom-right corner
- **Escalating rank system** — 6 tiers from Novice Scribe to God Level
- **Animated badge popups** — slide-in panels with your badge image, a shame caption, and a countdown bar
- **Status bar color escalation** — turns orange at Hall of Shame, red at God Level
- **Persistent counters** — survives VS Code restarts via `globalState`
- **One-click reset** — with a confirmation dialog so you can't reset by accident

---

## Rank System

| Paste Count | Rank | Status Bar Icon |
|-------------|------|-----------------|
| 0 – 49 | Novice Scribe | `$(edit)` |
| 50 – 99 | Copy-Paste Apprentice | `$(files)` |
| 100 – 499 | StackOverflow Architect | `$(library)` |
| 500 – 999 | Ctrl+V Grandmaster | `$(crown)` |
| 1 000 – 1 999 | Hall of Shame | `$(warning)` + orange bar |
| 2 000+ | **God Level** | `$(zap)` + red bar |

---

## Badge Milestones

| Pastes | Badge | Image | Display |
|--------|-------|-------|---------|
| 100 | **Sergeant** | `segent100.png` | 8 s |
| 500 | **Captain** | `captain500.png` | 8 s |
| 1 000 | **Chief** | `cheif1000.png` | 10 s |
| 2 000 | **God Level** | `god2000.png` | 12 s + gold glow |

---

## Installation (Local Development)

```bash
# 1. Clone or open the folder
cd CopyPasteRanger

# 2. Install dependencies
npm install

# 3. Compile
npm run compile

# 4. Press F5 in VS Code to launch the Extension Development Host
```

---

## Usage

| Action | Result |
|--------|--------|
| `Ctrl+C` / `Cmd+C` in editor | Increments copy counter |
| `Ctrl+V` / `Cmd+V` in editor | Increments paste counter; triggers badge popup at milestones |
| Hover status bar item | Shows rank, progress bar, and hint |
| `Ctrl+Shift+P` → `Copy Paste Ranger: Reset Stats` | Resets all counters after confirmation |

---

## Project Structure

```
CopyPasteRanger/
├── extension.ts        # Activation, status bar, command registration
├── counterEngine.ts    # Persistent copy/paste counter (globalState)
├── rankEvaluator.ts    # Rank title + progress logic
├── memeView.ts         # Badge WebviewPanel renderer
├── package.json        # Extension manifest, keybindings, commands
├── tsconfig.json       # TypeScript config
├── images/
│   ├── icon.png        # Extension marketplace icon (add your own)
│   └── memes/          # Badge images
│       ├── segent100.png
│       ├── captain500.png
│       ├── cheif1000.png
│       └── god2000.png
├── ABOUT.md
├── TESTING.md
└── DEPLOYMENT.md
```

---

## Documentation

| Document | Contents |
|----------|----------|
| [ABOUT.md](ABOUT.md) | Architecture, design decisions, tech stack |
| [TESTING.md](TESTING.md) | How to test on Windows, Linux, and macOS |
| [DEPLOYMENT.md](DEPLOYMENT.md) | How to package and publish the extension |

---

## License

MIT
