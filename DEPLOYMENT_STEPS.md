# ToolSnapy  Deployment Guide
> Stack: **Netlify** (frontend) · **Vercel** (backend API) · **Cloudflare** (DNS + CDN + DDoS) · **Hostinger** (domain registrar)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Push Code to GitHub](#2-push-code-to-github)
3. [Deploy Frontend to Netlify](#3-deploy-frontend-to-netlify)
4. [Deploy Backend to Vercel](#4-deploy-backend-to-vercel)
5. [Set Up Cloudflare (Free)](#5-set-up-cloudflare-free)
6. [Point Hostinger Domain to Cloudflare](#6-point-hostinger-domain-to-cloudflare)
7. [Add DNS Records in Cloudflare](#7-add-dns-records-in-cloudflare)
8. [Configure Cloudflare Caching Rules](#8-configure-cloudflare-caching-rules)
9. [Update Environment Variables](#9-update-environment-variables)
10. [Post-Deployment Checklist](#10-post-deployment-checklist)
11. [SEO Submission](#11-seo-submission)

---

## 1. Architecture Overview

```
                         YOUR USERS
                              │
                              ▼
                    ┌─────────────────┐
                    │   Cloudflare    │  ← DDoS shield, CDN, Free SSL,
                    │  (DNS + CDN)    │    caching, analytics
                    └────────┬────────┘
               ┌─────────────┴─────────────┐
               ▼                           ▼
    ┌─────────────────────┐   ┌──────────────────────────┐
    │      Netlify        │   │         Vercel           │
    │  toolsnapy.com      │   │  api.toolsnapy.com       │
    │  React + Vite SPA   │   │  Express + Node.js API   │
    │  (FREE tier)        │   │  (FREE tier)             │
    └─────────────────────┘   └──────────────────────────┘
```

**Why Cloudflare in the middle?**
- Global CDN  serves your static files from the nearest edge location
- Free DDoS protection and Web Application Firewall (WAF)
- Automatic HTTPS at the edge (no cert management)
- Cache rules  browser assets cached for 1 year, HTML never
- Free analytics without any tracking scripts
- Zero-downtime domain migration

---

## 2. Push Code to GitHub

```bash
cd "C:\Users\Crosslynx93\Desktop\My-Folder\ToolsSnapy"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/toolsnapy.git
git push -u origin main
```

For subsequent deployments, just run:
```bash
git add .
git commit -m "Your message"
git push
```
Both Netlify and Vercel auto-deploy on every push to `main`.

---

## 3. Deploy Frontend to Netlify

### Step 1  Sign up
1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **Sign up with GitHub**

### Step 2  Import project
1. Click **Add new site → Import an existing project**
2. Select your GitHub repository
3. Configure build settings:

| Setting | Value |
|---------|-------|
| Base directory | `frontend` |
| Build command | `npm run build` |
| Publish directory | `dist` |

### Step 3  Environment variables
In **Site settings → Environment variables**, add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://api.toolsnapy.com` (set after Step 7) |

### Step 4  Deploy
Click **Deploy site**. Your site is live at `xxx.netlify.app` in ~2 minutes.

> The `frontend/netlify.toml` file already in the repo handles SPA routing (`/*` → `index.html`) and sets aggressive caching headers for hashed assets (`/assets/*`).

---

## 4. Deploy Backend to Vercel

### Step 1  Sign up
1. Go to [vercel.com](https://vercel.com)
2. Click **Sign up with GitHub**

### Step 2  Import project
1. Click **Add New → Project**
2. Select your repository
3. Configure:

| Setting | Value |
|---------|-------|
| Root directory | `backend` |
| Framework | Other |
| Build command | *(leave blank  tsx handles it)* |
| Output directory | *(leave blank)* |

### Step 3  Environment variables
In **Settings → Environment Variables**, add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `CLIENT_ORIGIN` | `https://toolsnapy.com,https://www.toolsnapy.com` |
| `RATE_LIMIT_MAX` | `100` |
| `SHARE_EXPIRY_MS` | `900000` |
| `CLEANUP_INTERVAL_MS` | `21600000` |
| `TRUST_PROXY` | `1` |

### Step 4  Deploy
Click **Deploy**. Your API is live at `toolsnapy-api.vercel.app`.

> The `backend/vercel.json` in the repo routes all traffic to the Express server via `@vercel/node`.

> **Note on file storage**: Vercel serverless functions have an ephemeral `/tmp` filesystem (512 MB max, wiped between invocations). Instant Share files currently write to `backend/temp/share/`. This works for demos, but for production with real users, migrate file storage to **Cloudflare R2** or **AWS S3** using presigned upload URLs to avoid data loss between function cold starts.

---

## 5. Set Up Cloudflare (Free)

1. Go to [cloudflare.com](https://cloudflare.com) and create a free account
2. Click **Add a site**
3. Enter your domain: `toolsnapy.com`
4. Select the **Free** plan
5. Cloudflare scans your existing DNS records  review them (you can clear all and add fresh ones in Step 7)
6. Cloudflare gives you **two nameservers**, e.g.:
   ```
   vera.ns.cloudflare.com
   zod.ns.cloudflare.com
   ```
   Copy these  you need them in Step 6.

---

## 6. Point Hostinger Domain to Cloudflare

1. Log into [hpanel.hostinger.com](https://hpanel.hostinger.com)
2. Go to **Domains → Manage** next to your domain
3. Click **DNS / Nameservers** → **Change nameservers**
4. Replace Hostinger's default nameservers with the two Cloudflare nameservers from Step 5:
   ```
   vera.ns.cloudflare.com
   zod.ns.cloudflare.com
   ```
5. Save. Propagation takes **5–30 minutes** (can take up to 24 h in rare cases).

> After this, **all DNS is managed in Cloudflare**, not Hostinger. The domain is still registered at Hostinger (you pay renewal there), but DNS authority is fully with Cloudflare.

---

## 7. Add DNS Records in Cloudflare

Once Cloudflare shows your domain as **Active**, go to **DNS → Records** and add:

### Frontend (Netlify)

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| `CNAME` | `@` (root) | `your-site.netlify.app` | ☁️ Proxied |
| `CNAME` | `www` | `your-site.netlify.app` | ☁️ Proxied |

> Netlify also requires you to add the custom domain in **Site settings → Domain management → Add custom domain**. Add both `toolsnapy.com` and `www.toolsnapy.com`. Netlify auto-provisions SSL.

### Backend (Vercel)

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| `CNAME` | `api` | `cname.vercel-dns.com` | ☁️ Proxied |

> In Vercel, go to **Settings → Domains** and add `api.toolsnapy.com`. Vercel auto-provisions SSL.

### Email (keep Hostinger email if you have it)

If you use Hostinger email, add back the MX records Cloudflare scanned during setup  they should already be there. **Do not proxy MX records** (DNS-only, grey cloud).

---

## 8. Configure Cloudflare Caching Rules

In Cloudflare dashboard → **Caching → Cache Rules**, create:

**Rule 1  Cache hashed assets forever**
- Expression: `http.request.uri.path matches "^/assets/.*"`
- Cache TTL: `1 year`
- Browser TTL: `1 year`

**Rule 2  Never cache HTML**
- Expression: `http.request.uri.path eq "/"`
- Cache TTL: `Bypass`

**Other recommended settings:**

| Setting | Location | Value |
|---------|----------|-------|
| SSL/TLS mode | SSL/TLS → Overview | **Full (strict)** |
| Always Use HTTPS | SSL/TLS → Edge Certs | **On** |
| Auto Minify | Speed → Optimization | JS ✓ CSS ✓ HTML ✓ |
| Brotli | Speed → Optimization | **On** |
| Rocket Loader | Speed → Optimization | **Off** (breaks React) |
| Bot Fight Mode | Security → Bots | **On** |

---

## 9. Update Environment Variables

After completing Steps 3–7, update these:

**Netlify** (Site settings → Environment variables):
```
VITE_API_URL = https://api.toolsnapy.com
```
Trigger a redeploy: **Deploys → Trigger deploy → Deploy site**.

**Vercel** (Settings → Environment variables):
```
CLIENT_ORIGIN = https://toolsnapy.com,https://www.toolsnapy.com
```
Vercel redeploys automatically when you save env vars.

---

## 10. Post-Deployment Checklist

### URLs
- [ ] `https://toolsnapy.com` loads the site
- [ ] `https://www.toolsnapy.com` redirects to root
- [ ] `https://api.toolsnapy.com/api/health` returns `200 OK`

### Security
- [ ] HTTPS padlock on all URLs
- [ ] HTTP redirects to HTTPS automatically
- [ ] Opening DevTools → Network shows `CF-RAY` header (Cloudflare is proxying)
- [ ] No sensitive keys in browser console or source

### Performance (Lighthouse)
Run `https://pagespeed.web.dev` on your URL. Target:
- Performance ≥ 90
- Best Practices ≥ 95
- SEO ≥ 90

### Functionality
- [ ] All tool categories load
- [ ] PDF merge / split works
- [ ] Background remover loads the AI model
- [ ] Instant Share text + file round-trip
- [ ] Consent popup appears and locks scroll

---

## 11. SEO Submission

### Google Search Console
1. [search.google.com/search-console](https://search.google.com/search-console) → Add property
2. Verify via **DNS TXT record**  add it in Cloudflare DNS (Type: `TXT`, Name: `@`)
3. Submit sitemap: `https://toolsnapy.com/sitemap.xml`

### Bing Webmaster Tools
1. [bing.com/webmasters](https://www.bing.com/webmasters) → Import from Google (easiest)

### Google Analytics (optional)
1. [analytics.google.com](https://analytics.google.com) → Create property → Get `G-XXXXXXXXXX`
2. Add to Netlify env: `VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX`

---

## Cost Summary

| Service | Free Tier Limit | Notes |
|---------|----------------|-------|
| Netlify | 100 GB bandwidth / month | More than enough for a tools site |
| Vercel | 100 GB bandwidth / month | API-only, so very low usage |
| Cloudflare | Unlimited bandwidth | Always free for DNS + CDN |
| Hostinger domain | ~₹800–1,200 / year | Only renewal cost |
| **Total ongoing** | **~₹800 / year** | Domain renewal only |


---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Free Hosting Options](#free-hosting-options)
3. [Step-by-Step: Deploy Frontend to Vercel](#deploy-frontend-to-vercel)
4. [Step-by-Step: Deploy Backend to Render](#deploy-backend-to-render)
5. [Domain Name Guide](#domain-name-guide)
6. [Connect Custom Domain](#connect-custom-domain)
7. [Post-Deployment Checklist](#post-deployment-checklist)
8. [SEO Submission](#seo-submission)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     YOUR USERS                               │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              toolsnapy.com (Vercel/Netlify)                 │
│                     FRONTEND                                 │
│              React + Vite (Static Files)                     │
│                    FREE TIER                                 │
└─────────────────────────┬───────────────────────────────────┘
                          │ API calls
                          ▼
┌─────────────────────────────────────────────────────────────┐
│             api.toolsnapy.com (Render/Railway)              │
│                      BACKEND                                 │
│               Express + Node.js API                          │
│                    FREE TIER                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Free Hosting Options

### Frontend (Static Site)

| Platform                 | Free Tier                        | Best For           |
| ------------------------ | -------------------------------- | ------------------ |
| **Vercel** (Recommended) | 100GB bandwidth, unlimited sites | React/Next.js apps |
| Netlify                  | 100GB bandwidth, 300 build mins  | Static sites       |
| Cloudflare Pages         | Unlimited bandwidth              | Global CDN         |

### Backend (Node.js API)

| Platform                 | Free Tier       | Limitations                    |
| ------------------------ | --------------- | ------------------------------ |
| **Render** (Recommended) | 750 hours/month | Sleeps after 15 min inactivity |
| Railway                  | $5 credit/month | ~500 hours                     |
| Fly.io                   | 3 shared VMs    | 256MB RAM                      |

**Recommended Stack: Vercel (frontend) + Render (backend)**

---

## Deploy Frontend to Vercel

### Step 1: Prepare Your Code

1. Push your code to GitHub:

```bash
cd C:\Users\Crosslynx93\Desktop\My-Folder\ToolSnapy
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/toolsnapy.git
git push -u origin main
```

### Step 2: Sign Up for Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" → "Continue with GitHub"
3. Authorize Vercel

### Step 3: Import Project

1. Click "Add New..." → "Project"
2. Select your `toolsnapy` repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 4: Set Environment Variables

Click "Environment Variables" and add:

| Key               | Value                                                          |
| ----------------- | -------------------------------------------------------------- |
| `VITE_API_URL`    | `https://your-backend.onrender.com` (add after backend deploy) |
| `VITE_ENABLE_ADS` | `false`                                                        |
| `VITE_APP_NAME`   | `ToolSnapy`                                                    |

### Step 5: Deploy

1. Click "Deploy"
2. Wait 1-2 minutes
3. Your site is live at `your-project.vercel.app`

---

## Deploy Backend to Render

### Step 1: Sign Up for Render

1. Go to [render.com](https://render.com)
2. Click "Get Started" → "GitHub"
3. Authorize Render

### Step 2: Create Web Service

1. Click "New +" → "Web Service"
2. Connect your `toolsnapy` repository
3. Configure:
   - **Name**: `toolsnapy-api`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### Step 3: Set Environment Variables

Click "Environment" and add:

| Key                   | Value                              |
| --------------------- | ---------------------------------- |
| `NODE_ENV`            | `production`                       |
| `PORT`                | `10000`                            |
| `CLIENT_ORIGIN`       | `https://your-frontend.vercel.app` |
| `RATE_LIMIT_MAX`      | `100`                              |
| `SHARE_EXPIRY_MS`     | `900000`                           |
| `CLEANUP_INTERVAL_MS` | `21600000`                         |

### Step 4: Deploy

1. Click "Create Web Service"
2. Wait 3-5 minutes for build
3. Your API is live at `toolsnapy-api.onrender.com`

### Step 5: Update Frontend

Go back to Vercel and update:

- `VITE_API_URL` = `https://toolsnapy-api.onrender.com`

Redeploy frontend.

---

## Domain Name Guide

### Cheapest Domain Registrars (2024)

| Registrar      | .com Price/Year | Best Deal        |
| -------------- | --------------- | ---------------- |
| **Porkbun**    | $9.73           | Cheapest renewal |
| Namecheap      | $9.98           | Free WhoisGuard  |
| Cloudflare     | $9.77           | At-cost pricing  |
| Google Domains | $12             | Easy setup       |
| GoDaddy        | $12.99          | Avoid (upsells)  |

### Alternative TLDs (Even Cheaper)

| TLD       | Price/Year | Example          |
| --------- | ---------- | ---------------- |
| `.xyz`    | $1-2       | toolsnapy.xyz    |
| `.site`   | $1-3       | toolsnapy.site   |
| `.online` | $1-3       | toolsnapy.online |
| `.tech`   | $2-5       | toolsnapy.tech   |
| `.io`     | $30+       | Expensive, skip  |

**Recommendation**: Get `.com` from **Porkbun** (~$10/year)

### Step-by-Step: Buy Domain from Porkbun

1. Go to [porkbun.com](https://porkbun.com)
2. Search for `toolsnapy.com` (or your preferred name)
3. Add to cart → Checkout
4. Create account
5. Pay ($9.73 for first year)
6. Domain is yours!

---

## Connect Custom Domain

### Option A: Vercel + Custom Domain (Frontend)

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add `toolsnapy.com` and `www.toolsnapy.com`
4. Vercel shows DNS records to add

### Option B: Configure DNS at Porkbun

1. Log into Porkbun
2. Click "DNS" next to your domain
3. Delete existing records
4. Add these records:

**For Vercel:**
| Type | Host | Value |
|------|------|-------|
| A | @ | `76.76.21.21` |
| CNAME | www | `cname.vercel-dns.com` |

**For API subdomain (Render):**
| Type | Host | Value |
|------|------|-------|
| CNAME | api | `toolsnapy-api.onrender.com` |

5. Wait 5-30 minutes for DNS propagation

### Final URLs:

- Frontend: `https://toolsnapy.com`
- Backend API: `https://api.toolsnapy.com`

### Update Environment Variables

**Vercel (Frontend):**

```
VITE_API_URL=https://api.toolsnapy.com
```

**Render (Backend):**

```
CLIENT_ORIGIN=https://toolsnapy.com,https://www.toolsnapy.com
```

---

## Post-Deployment Checklist

### Security Verification

- [ ] HTTPS working (green padlock)
- [ ] HTTP redirects to HTTPS
- [ ] CORS only allows your domain
- [ ] Rate limiting active
- [ ] No sensitive data in browser console

### Functionality Test

- [ ] Homepage loads
- [ ] All tools work (test each category)
- [ ] File upload/download works
- [ ] Share feature works
- [ ] Mobile responsive

### Performance Test

- [ ] Run Lighthouse audit (aim for 90+ scores)
- [ ] Page loads under 3 seconds
- [ ] Images optimized

---

## SEO Submission

### 1. Google Search Console

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add property → Enter `toolsnapy.com`
3. Verify via DNS (add TXT record at Porkbun)
4. Submit sitemap: `https://toolsnapy.com/sitemap.xml`

### 2. Bing Webmaster Tools

1. Go to [bing.com/webmasters](https://www.bing.com/webmasters)
2. Import from Google Search Console (easiest)
3. Submit sitemap

### 3. Google Analytics (Optional)

1. Go to [analytics.google.com](https://analytics.google.com)
2. Create property for `toolsnapy.com`
3. Get Measurement ID (G-XXXXXXXXXX)
4. Add to Vercel env: `VITE_GA_MEASUREMENT_ID`

---

## Cost Summary

### Free Setup

| Item           | Cost         |
| -------------- | ------------ |
| Vercel Hosting | $0/month     |
| Render Backend | $0/month     |
| **Total**      | **$0/month** |

### With Custom Domain

| Item           | Cost             |
| -------------- | ---------------- |
| Vercel Hosting | $0/month         |
| Render Backend | $0/month         |
| Domain (.com)  | ~$10/year        |
| **Total**      | **~$0.83/month** |

---

## Troubleshooting

### Backend Sleeps (Render Free Tier)

Free Render instances sleep after 15 minutes of inactivity. First request after sleep takes ~30 seconds.

**Solutions:**

1. Accept the delay (it's free!)
2. Use a cron job to ping `/api/health` every 14 minutes
3. Upgrade to paid tier ($7/month)

### CORS Errors

If you see CORS errors:

1. Check `CLIENT_ORIGIN` in Render includes your frontend URL
2. Make sure URLs don't have trailing slashes
3. Redeploy backend

### Build Fails

1. Check build logs in Vercel/Render
2. Make sure `package.json` has correct scripts
3. Verify Node version compatibility

---

## Alternative: Deploy to Netlify

If you prefer Netlify:

1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Click "Add new site" → "Import an existing project"
4. Select your repo
5. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
6. Add environment variables
7. Deploy

---

## You're Live!

After following this guide:

- Your site: `https://toolsnapy.com`
- Your API: `https://api.toolsnapy.com`
- Monthly cost: **$0** (or ~$0.83 with domain)
- SEO: Submitted to Google & Bing

Congratulations on launching ToolSnapy!
