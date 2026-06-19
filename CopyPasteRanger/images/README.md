# Images

This folder holds all visual assets required by the Copy Paste Ranger extension.

## Required images

| File | Dimensions | Purpose |
|------|-----------|---------|
| `icon.png` | 128 × 128 px | Extension icon shown in the VS Code Marketplace and Extensions panel |

## Guidelines

- Use **PNG** format with a transparent background.
- The icon should visually represent the clipboard / copy-paste theme
  (e.g. a ranger character holding a clipboard, or a stylised Ctrl+V badge).
- Keep file size under 1 MB; aim for ≤ 50 KB for fast loading.

> Once you add `icon.png`, `package.json` is already configured to reference it
> via the `"icon": "images/icon.png"` field.
