# Deployment Guide  Copy Paste Ranger

This document covers how to package the extension as a `.vsix` file and publish it to the VS Code Marketplace on **Windows**, **Linux**, and **macOS**.

---

## Prerequisites

| Requirement | Version | Install |
|-------------|---------|---------|
| Node.js | 18.x+ | https://nodejs.org |
| npm | 9.x+ | bundled with Node.js |
| `@vscode/vsce` | latest | `npm install -g @vscode/vsce` |
| VS Code Marketplace account |  | https://marketplace.visualstudio.com |
| Azure DevOps Personal Access Token |  | see Step 3 |

---

## Step 1  Prepare `package.json`

Before packaging, make sure the following fields are filled in:

```jsonc
{
  "name":        "copy-paste-ranger",      // lowercase, no spaces
  "displayName": "Copy Paste Ranger",
  "description": "Tracks copy/paste actions with a military rank system.",
  "version":     "0.0.1",                  // bump on each release
  "publisher":   "YOUR-PUBLISHER-ID",      // must match your Marketplace account
  "icon":        "images/icon.png",        // 128×128 PNG, required for publishing
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR-USER/copy-paste-ranger"
  },
  "license": "MIT"
}
```

> The `icon` field is **required** for publishing. Place a 128×128 PNG at `images/icon.png` before running `vsce package`.

---

## Step 2  Add a `.vscodeignore`

Create `.vscodeignore` in the extension root to exclude dev files from the package:

```
.vscode/**
node_modules/**
out/maps/**
src/**
.gitignore
.eslintrc.json
*.map
tsconfig.json
TESTING.md
DEPLOYMENT.md
```

---

## Step 3  Create a Publisher and Personal Access Token

1. Go to [marketplace.visualstudio.com/manage](https://marketplace.visualstudio.com/manage)
2. Sign in with a Microsoft account
3. Click **Create publisher** and fill in your publisher ID
4. Go to [dev.azure.com](https://dev.azure.com) → User Settings → **Personal Access Tokens**
5. Click **New Token**:
   - Name: `vsce-publish`
   - Organization: **All accessible organizations**
   - Expiration: 90 days (or custom)
   - Scopes: **Marketplace → Manage**
6. Copy the token  you will only see it once

---

## Step 4  Log in with `vsce`

### Windows (PowerShell)
```powershell
vsce login YOUR-PUBLISHER-ID
# Paste your PAT when prompted
```

### Linux / macOS (Terminal)
```bash
vsce login YOUR-PUBLISHER-ID
# Paste your PAT when prompted
```

---

## Step 5  Build the `.vsix` Package

### Windows
```powershell
cd "C:\path\to\CopyPasteRanger"
npm run compile          # always compile before packaging
vsce package
```

### Linux / macOS
```bash
cd /path/to/CopyPasteRanger
npm run compile
vsce package
```

Output: `copy-paste-ranger-0.0.1.vsix` in the project root.

---

## Step 6  Test the Package Locally

Always install and verify the `.vsix` before publishing.

### Windows
```powershell
code --install-extension copy-paste-ranger-0.0.1.vsix
```
Or in VS Code: right-click the `.vsix` file in the Explorer panel → **Install Extension VSIX**.

### Linux / macOS
```bash
code --install-extension copy-paste-ranger-0.0.1.vsix
```

After installing:
1. Restart VS Code
2. Open any project
3. Verify the status bar item appears
4. Test copy/paste counting

To uninstall:
```bash
code --uninstall-extension YOUR-PUBLISHER-ID.copy-paste-ranger
```

---

## Step 7  Publish to the Marketplace

```bash
vsce publish
```

To publish a specific version bump in one command:

```bash
vsce publish patch   # 0.0.1 → 0.0.2
vsce publish minor   # 0.0.1 → 0.1.0
vsce publish major   # 0.0.1 → 1.0.0
```

Or publish a pre-built `.vsix`:
```bash
vsce publish --packagePath copy-paste-ranger-0.0.1.vsix
```

The extension will be live at:
```
https://marketplace.visualstudio.com/items?itemName=YOUR-PUBLISHER-ID.copy-paste-ranger
```

---

## Updating the Extension

1. Make your code changes
2. Bump `"version"` in `package.json`
3. Run `npm run compile`
4. Run `vsce publish patch` (or `minor` / `major`)

---

## Platform-Specific Notes

### Windows
- Run PowerShell as a normal user  administrator is not needed
- If `vsce` is not recognized after `npm install -g`, add npm's global bin to your `PATH`:
  ```powershell
  $env:PATH += ";$(npm config get prefix)"
  ```
- Windows Defender may scan the `.vsix` on creation  this is normal

### Linux
- If `vsce` is installed globally but not found, add the npm bin directory to PATH:
  ```bash
  export PATH="$PATH:$(npm config get prefix)/bin"
  ```
  Add this line to `~/.bashrc` or `~/.zshrc` to make it permanent
- On headless CI (GitHub Actions, GitLab CI), use:
  ```bash
  npx @vscode/vsce package
  npx @vscode/vsce publish --pat $VSCE_PAT
  ```

### macOS
- Same commands as Linux; use Terminal or iTerm2
- If using Homebrew Node.js, ensure the Homebrew bin directory is in your PATH:
  ```bash
  export PATH="/opt/homebrew/bin:$PATH"
  ```
- Gatekeeper does not block `.vsix` files since VS Code handles installation

---

## CI / CD Automation (GitHub Actions)

Create `.github/workflows/publish.yml`:

```yaml
name: Publish Extension

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Compile
        run: npm run compile

      - name: Publish to Marketplace
        run: npx @vscode/vsce publish --pat ${{ secrets.VSCE_PAT }}
```

Add your PAT as a GitHub Actions secret named `VSCE_PAT`.

Trigger a release by pushing a version tag:
```bash
git tag v0.1.0
git push origin v0.1.0
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Install vsce | `npm install -g @vscode/vsce` |
| Log in | `vsce login YOUR-PUBLISHER-ID` |
| Compile | `npm run compile` |
| Package | `vsce package` |
| Install locally | `code --install-extension *.vsix` |
| Publish | `vsce publish` |
| Publish patch | `vsce publish patch` |
| Unpublish | `vsce unpublish YOUR-PUBLISHER-ID.copy-paste-ranger` |
