# ToolSnapy — Deployment Guide

How to take ToolSnapy from local dev to production:

- **Frontend** → Vercel **or** Netlify (static SPA).
- **Backend** → a persistent Node host (Render / Railway / Fly.io) **or** Cloudflare
  Workers. The 500 MB file‑share feature does **not** fit Vercel/Netlify serverless
  functions (see [§4](#4-why-not-the-backend-on-vercelnetlify)).
- **File storage** → Cloudflare **R2** (cheapest object storage, no egress fees).
  Two integration methods are given — you never expose your own machine.

Every "change these files" item below is a concrete, copy‑pasteable checklist.
Deep Cloudflare security/tunnel steps live in [backend/SECURITY.md](backend/SECURITY.md);
this guide focuses on **what to deploy and which files to edit**.

---

## 0. One‑time prerequisites

| Thing | Where | Notes |
|-------|-------|-------|
| GitHub repo | github.com | Push this project; Vercel/Netlify deploy from it. |
| Domain (optional) | any registrar | e.g. `toolsnapy.com` + `api.toolsnapy.com`. |
| Cloudflare account | cloudflare.com | Free. Needed for R2 storage. |
| Node 20+ | local | Matches the build image on the hosts. |

---

## 1. Frontend → Vercel or Netlify

### Files you change

| File | Change | Status |
|------|--------|--------|
| [frontend/vercel.json](frontend/vercel.json) | SPA rewrite + asset caching (Vercel). | ✅ already added |
| [frontend/netlify.toml](frontend/netlify.toml) | SPA redirect + headers (Netlify). | ✅ already added |
| `frontend/.env` | Create from [.env.example](frontend/.env.example); set `VITE_API_URL`. | ⬜ you set |
| [frontend/src/services/textApi.ts](frontend/src/services/textApi.ts) | Use `VITE_API_URL` instead of the hardcoded `/api`. | ⬜ code fix |
| [frontend/index.html](frontend/index.html) | OG/Twitter tags (already host‑relative). | ✅ done |

### `frontend/.env` (production values)

```bash
# Point the SPA at your deployed backend (no trailing slash).
VITE_API_URL=https://api.toolsnapy.com

VITE_ENABLE_ADS=false
VITE_APP_NAME=ToolSnapy
VITE_CONTACT_EMAIL=support@toolsnapy.com
```

> `shareApi.ts` and `UrlShortener.tsx` already read `VITE_API_URL`.
> `textApi.ts` currently hardcodes `axios.create({ baseURL: "/api" })`, which only
> works via the Vite dev proxy — it is switched to `VITE_API_URL` so text tools
> also work in production.

### Deploy — Vercel

1. [vercel.com/new](https://vercel.com/new) → import the repo.
2. **Root Directory** = `frontend` (build command & output come from `vercel.json`).
3. Project → **Settings → Environment Variables** → add the `VITE_*` values above.
4. Deploy. You get `https://<name>.vercel.app` (attach your domain later).

### Deploy — Netlify

1. [app.netlify.com](https://app.netlify.com) → *Add new site → Import*.
2. `netlify.toml` already sets `base = "frontend"`, `command`, and `publish = dist`.
3. **Site settings → Environment variables** → add the `VITE_*` values.
4. Deploy.

> Set the same env vars in the dashboard **and** rebuild — Vite inlines `VITE_*`
> at build time, so changing them requires a redeploy.

---

## 2. Backend → persistent Node host (recommended)

Because uploads are large (up to 500 MB) and files live in a temp dir, the backend
needs a **long‑running process**, not a serverless function. Render / Railway / Fly.io
all have a usable free tier and deploy straight from GitHub.

### Files you change

| File | Change |
|------|--------|
| `backend/.env` | Create from [.env.example](backend/.env.example); set prod values below. |
| [backend/src/app.ts](backend/src/app.ts) | No edit — CORS already reads `CLIENT_ORIGIN`. |
| [backend/src/server.ts](backend/src/server.ts) | No edit — `PORT` already read from env. |
| Storage services (only for R2) | See [§3](#3-file-storage--cloudflare-r2). |

### `backend/.env` (production)

```bash
NODE_ENV=production
PORT=5000

# Comma‑separated allowed browser origins (NO trailing slash).
CLIENT_ORIGIN=https://toolsnapy.com,https://www.toolsnapy.com

# Proxy hops in front of the app (Render/Railway/Fly edge = 1).
TRUST_PROXY=1

GLOBAL_RATE_LIMIT=300
CLEANUP_INTERVAL_MS=21600000

# --- Cloudflare R2 (see §3) ---
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=toolsnapy-temp
R2_ENDPOINT=https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com
```

### Deploy (Render example)

1. [dashboard.render.com](https://dashboard.render.com) → *New → Web Service* → pick the repo.
2. **Root Directory** = `backend`.
3. **Build Command** = `npm install && npm run build`.
4. **Start Command** = `npm run start`.
5. Add the env vars above under **Environment**.
6. Deploy → note the URL (e.g. `https://toolsnapy-api.onrender.com`), then either
   set `VITE_API_URL` to it, or map `api.toolsnapy.com` to it and use that.

> Railway/Fly.io are equivalent — same root dir, build, start, and env vars.

---

## 3. File storage → Cloudflare R2

R2 is S3‑compatible object storage with a generous free tier and **zero egress
fees** — the cheapest safe way to store share files off your own machine. Uploads
never touch a disk you own. Two methods, pick one:

### Method A — R2 from the Node backend (S3 SDK) · simplest

Keep the current Express backend on a host (§2); swap the local `fs` reads/writes
for R2 calls. **Validate first (magic bytes, zip‑bomb, extension allow‑list), then
upload** — never store unvalidated bytes.

**Files you change:**

| File | Change |
|------|--------|
| `backend/package.json` | `npm i @aws-sdk/client-s3 @aws-sdk/s3-request-presigner` |
| **new** `backend/src/services/storage/r2.ts` | R2 client + `putObject`/`getObject`/`deleteObject`/`presignGet` helpers. |
| [backend/src/services/share/shareText.service.ts](backend/src/services/share/shareText.service.ts) | Write/read `metadata.json` to R2 (key `<CODE>/metadata.json`) instead of `SHARE_ROOT`. |
| [backend/src/services/share/shareFiles.service.ts](backend/src/services/share/shareFiles.service.ts) | Upload validated buffers to R2 (key `<CODE>/files/<name>`). |
| [backend/src/services/share/shareStats.service.ts](backend/src/services/share/shareStats.service.ts) | Store the stats JSON in R2 (or Cloudflare KV). |
| [backend/src/services/share/cleanup.service.ts](backend/src/services/share/cleanup.service.ts) | Replace disk sweep with an **R2 lifecycle rule** (auto‑expire objects after 1 day). |
| [backend/src/controllers/share.controller.ts](backend/src/controllers/share.controller.ts) | Return a short‑lived **presigned GET URL** instead of streaming the file through the API. |

**Cloudflare steps:** R2 → *Create bucket* `toolsnapy-temp` (keep it **private**) →
*Manage R2 API Tokens* → **Object Read & Write** token → copy Access Key/Secret into
`backend/.env` → **Settings → Object lifecycle** → expire objects after 1 day.

### Method B — Cloudflare Worker + R2 binding · no server at all

Run the share API on **Cloudflare Workers**, which bind R2 natively (no keys, no
egress, cheapest, nothing of yours exposed). Use this if you'd rather not run any
Node host.

**Files you add:**

| File | Purpose |
|------|---------|
| **new** `worker/wrangler.toml` | Worker config + R2 bucket binding (below). |
| **new** `worker/src/index.ts` | Port the `/api/share/*` handlers; use `env.BUCKET.put/get/delete`. |
| `frontend/.env` | Set `VITE_API_URL` to the Worker URL (e.g. `https://toolsnapy-share.<acct>.workers.dev`). |

```toml
# worker/wrangler.toml
name = "toolsnapy-share"
main = "src/index.ts"
compatibility_date = "2024-11-01"

[[r2_buckets]]
binding = "BUCKET"          # available as env.BUCKET in the Worker
bucket_name = "toolsnapy-temp"
```

Deploy: `npm i -g wrangler` → `wrangler login` → `wrangler deploy` (from `worker/`).
Keep the same validation logic (magic bytes, extension allow‑list, zip inspection)
before `env.BUCKET.put`.

> **Which to choose?** Method A = least code change (reuse Express). Method B =
> cheapest and fully serverless (no host to run or expose), but you port the share
> handlers to the Workers runtime. The text/calculator/image tools run entirely in
> the browser and need **no** backend either way.

---

## 4. Why not the backend on Vercel/Netlify?

You *can* wrap Express in a serverless function, but the **Instant Share** feature
uploads files up to 500 MB via `multer` `memoryStorage`. Serverless functions cap
the request body (**Vercel ≈ 4.5 MB**, **Netlify ≈ 6 MB**) and have short timeouts,
so large shares would fail. Use a persistent host (§2) or Workers with **direct R2
uploads via presigned URLs** (§3‑B) for the share feature. The browser‑only tools
(text, calculators, images, PDF, clock, utilities) work regardless.

---

## 5. Post‑deploy checklist

- [ ] Frontend loads at your domain; deep links (e.g. `/pdf`) don't 404 (SPA rewrite).
- [ ] `VITE_API_URL` points at the live backend; text tools + Instant Share work.
- [ ] Backend `NODE_ENV=production`, `CLIENT_ORIGIN` set (no CORS wildcard warning in logs).
- [ ] `TRUST_PROXY` matches the real hop count (1 behind a single edge).
- [ ] `GET /api/health` returns 200 through the public backend URL.
- [ ] R2 bucket is **private**; downloads use presigned URLs; lifecycle rule expires objects.
- [ ] Share‑preview image resolves: open `https://<domain>/og-image.png`, then run the
      [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) and *Scrape Again*.
- [ ] Upload a `.svg` and confirm it downloads (never renders inline) — see SECURITY.md.
