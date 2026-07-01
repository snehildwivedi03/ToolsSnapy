# ToolSnapy Deployment Guide

Complete guide to deploy ToolSnapy for FREE and get it live with a custom domain.

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
