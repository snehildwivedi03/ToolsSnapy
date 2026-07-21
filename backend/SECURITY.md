# ToolSnapy Backend — Security & Cloudflare Deployment

This document covers (1) the security audit of the backend, (2) the hardening that
was applied, (3) the environment variables you must set in production, and
(4) step-by-step Cloudflare (`cloudflared` Tunnel + R2) setup for securely exposing
the API and storing the temporary share files.

---

## 1. Audit summary

The backend was reviewed end-to-end (Instant Share, URL shortener, text tools,
middleware, upload handling, archive inspection). Overall the code was already in
good shape — magic-byte validation, zip-bomb inspection, path sanitisation,
per-route rate limiting, Helmet CSP and an SSRF guard were all present.

The following issues were found and **fixed** in this pass:

| # | Severity | Area | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | **High** | Instant Share | Stored XSS: uploaded `.svg` / disguised files could be served **inline** from the API origin and execute script in a victim's session. | `downloadFile` now serves only an allow-list of safe types (`png/jpg/jpeg/webp/gif/pdf`) inline; everything else is force-downloaded. All downloads now send `X-Content-Type-Options: nosniff`, `Content-Security-Policy: default-src 'none'; sandbox`, and `X-Frame-Options: DENY`. |
| 2 | **High** | Error handling | The global error handler returned raw `err.message` to clients, leaking internal paths / stack detail; Multer errors surfaced as generic 500s. | Errors are now logged server-side only; clients get a generic `Internal server error` in production. Multer errors return a safe `400`. |
| 3 | **Medium** | Instant Share | Path traversal relied solely on the stored file-list match. | Added defense-in-depth: the resolved path is re-checked to be contained inside the share's own `files/` directory before any disk access. |
| 4 | **Medium** | URL shortener | SSRF/redirect guard did not catch numeric-encoded IPs (`http://2130706433`, `0x7f.0.0.1`, octal). | `isUrlSafe` now rejects pure-decimal, hex and octal host encodings. |
| 5 | **Medium** | Global | No app-wide rate limit backstop; CORS/CSP silently fell back to wildcard `*`. | Added a global limiter (300 req/min/IP, tunable via `GLOBAL_RATE_LIMIT`), removed the `*` fallback in the CSP `connect-src`, and log a warning when `CLIENT_ORIGIN` is unset in production. |

### Verified-safe (already correct, left as-is)
- **Share codes** use `crypto.randomBytes` over a 32-char alphabet (no modulo bias, ~1.07×10⁹ space).
- **Zip-bomb protection** inspects archive metadata only (no decompression), rejecting nested archives, huge declared sizes and abusive ratios.
- **Upload validation** enforces an extension allow-list, blocks executables by extension **and** magic bytes (MZ/ELF), and verifies image/PDF headers.
- **Filenames** are sanitised (traversal, hidden-file and length protection) before touching disk.
- **Rate limiting**: uploads 10/hr, receive 30/min, shorten 30/hr, text 60/min per IP.
- **Helmet** ships a strict CSP, HSTS (prod), `noSniff`, frameguard `deny`, and hides `X-Powered-By`.

### Remaining recommendation (design-level, not a code bug)
- **Upload memory pressure**: Multer uses `memoryStorage`, so large uploads are
  buffered in RAM (up to the 500 MB / 100-file limits). This is bounded by the
  rate limiters, but for extra safety cap the request size **at the edge**
  (Cloudflare — see §4) and/or move temp storage to R2. Steps are below.

---

## 2. Required production environment variables

Create a `.env` (never commit it) with at least:

```bash
NODE_ENV=production

# Comma-separated list of allowed browser origins (NO trailing slash).
# Without this, CORS runs wide open and a warning is logged.
CLIENT_ORIGIN=https://toolsnapy.com,https://www.toolsnapy.com

# Number of proxy hops in front of the app. Cloudflare Tunnel = 1.
TRUST_PROXY=1

# Optional tuning
PORT=5000
GLOBAL_RATE_LIMIT=300           # req/min/IP backstop
CLEANUP_INTERVAL_MS=21600000    # temp-share sweep interval (6h default)
```

> `TRUST_PROXY` must match your real hop count. Behind a single Cloudflare
> Tunnel it is `1`. Setting it too high lets clients spoof `X-Forwarded-For`
> and bypass rate limiting; too low breaks real-IP detection.

---

## 3. Storage model of temp files

Shared files/text live under `backend/temp/share/<CODE>/` on the server's disk and
are swept automatically when they expire (`cleanup.service.ts`). You have two
supported ways to run this behind Cloudflare:

- **A — Cloudflare Tunnel (`cloudflared`)**: keep files on the server's local disk
  and expose the API through a tunnel (no open ports, no public IP). Simplest.
- **B — Cloudflare R2**: offload the temp files to Cloudflare's object storage so
  the app server stays stateless and disk can't fill up. Recommended if you run
  more than one instance or want durability.

---

## 4. Cloudflare setup — step by step

### A. Expose the backend securely with `cloudflared` (Cloudflare Tunnel)

This puts Cloudflare's edge (TLS, DDoS protection, WAF, rate limiting) in front of
the API without opening any inbound ports.

1. **Install `cloudflared`**
   - Windows: `winget install --id Cloudflare.cloudflared`
   - macOS: `brew install cloudflared`
   - Linux (Debian/Ubuntu): download the `.deb` from Cloudflare and `sudo dpkg -i`.

2. **Authenticate** (opens a browser to pick your zone):
   ```bash
   cloudflared tunnel login
   ```

3. **Create a named tunnel** (generates a credentials JSON + tunnel UUID):
   ```bash
   cloudflared tunnel create toolsnapy-api
   ```

4. **Route a hostname to the tunnel** (creates the DNS record for you):
   ```bash
   cloudflared tunnel route dns toolsnapy-api api.toolsnapy.com
   ```

5. **Create the config file** `~/.cloudflared/config.yml`:
   ```yaml
   tunnel: toolsnapy-api
   credentials-file: /home/<user>/.cloudflared/<TUNNEL-UUID>.json

   ingress:
     - hostname: api.toolsnapy.com
       service: http://localhost:5000
     - service: http_status:404
   ```

6. **Start the backend, then the tunnel:**
   ```bash
   npm run start          # in backend/  (listens on :5000)
   cloudflared tunnel run toolsnapy-api
   ```

7. **Run it as a service** so it survives reboots:
   ```bash
   sudo cloudflared service install     # Linux/macOS
   # Windows (elevated PowerShell):
   cloudflared service install
   ```

8. **Point the frontend** at `https://api.toolsnapy.com` and set
   `CLIENT_ORIGIN` to your site's origin(s).

#### Edge protections to enable in the Cloudflare dashboard
- **Security → WAF**: turn on the Managed Ruleset.
- **Security → Bots**: enable *Bot Fight Mode*.
- **Rules → Rate limiting**: add a rule, e.g. limit `/api/share/*` to
  ~20 requests/min per IP (belt-and-braces on top of the app limiters).
- **Rules → Page/Config rules**: set a **maximum upload size**. On paid plans this
  caps request body size at the edge (Free defaults to ~100 MB), which directly
  mitigates the in-memory upload pressure noted in §1.
- **SSL/TLS**: set the mode to **Full (strict)**.

### B. Store temp files in Cloudflare R2 (optional, recommended for scale)

R2 is S3-compatible object storage. This keeps the app server stateless.

1. **Create the bucket**
   - Dashboard → **R2** → *Create bucket* → name it e.g. `toolsnapy-temp`.

2. **Create an API token** (R2 → *Manage R2 API Tokens* → *Create*), scoped to
   **Object Read & Write** on that bucket. Save the Access Key ID and Secret.

3. **Enable a lifecycle rule** so objects auto-expire (matches the 24 h share TTL):
   - Bucket → **Settings → Object lifecycle rules** → *Add rule* → expire objects
     after 1 day. This is your safety net even if the app-side sweep is skipped.

4. **Add credentials to `.env`:**
   ```bash
   R2_ACCOUNT_ID=xxxxxxxxxxxxxxxx
   R2_ACCESS_KEY_ID=xxxxxxxxxxxxxxxx
   R2_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxx
   R2_BUCKET=toolsnapy-temp
   R2_ENDPOINT=https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com
   ```

5. **Install the S3 client** in `backend/`:
   ```bash
   npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
   ```

6. **Wire it up** — in the share services, replace the local `fs` writes/reads with
   R2 `PutObject`/`GetObject` (key = `<CODE>/files/<path>`), and hand recipients a
   **short-lived presigned URL** instead of streaming through the API. Keep all the
   existing validation (magic bytes, zip-bomb inspection, extension allow-list)
   **before** uploading to R2 — validate first, store second.

> Keep the bucket **private**. Never make it public; always serve via presigned
> URLs so links inherit the share's expiry.

---

## 5. Post-deploy checklist

- [ ] `NODE_ENV=production` and `CLIENT_ORIGIN` set (no CORS wildcard warning in logs).
- [ ] `TRUST_PROXY=1` (single Cloudflare hop) — verify rate limiting keys off real IPs.
- [ ] HTTPS enforced end-to-end; Cloudflare SSL mode = Full (strict).
- [ ] WAF managed ruleset + Bot Fight Mode enabled.
- [ ] Edge rate-limiting rule on `/api/share/*` and a max upload-size rule set.
- [ ] `/api/health` returns 200 through the tunnel hostname.
- [ ] Upload a `.svg` and confirm it downloads (never renders inline).
- [ ] Trigger an error and confirm the client sees only `Internal server error`.
