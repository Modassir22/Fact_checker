# Deployment Guide — Fact Checker Platform

This guide outlines how to deploy the client on **Vercel** and the server on **Railway**.

---

## 💻 Server Deployment (Railway)

1. Sign in to [Railway](https://railway.app/).
2. Click **New Project** -> **Deploy from GitHub repo** -> Select `Modassir22/Fact_checker`.
3. Set the **Root Directory** or build command:
   - Railway will automatically read `server/package.json` if you link the directory.
   - Or configure the project variables to deploy the server folder:
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js`
     - Set the directory context to `/server` under settings.
4. Add the following **Environment Variables** under the Variables tab in Railway:
   - `PORT`: `5000` (Railway will assign this dynamically, Express handles it)
   - `GEMINI_API_KEY`: `AIzaSyDJNWOMN0b6R__FYZT_-zcn7IzYRy7I00g` (Or your active key)
   - `TAVILY_API_KEY`: `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`
5. Railway will deploy and provide a public URL, e.g. `https://fact-checker-production.up.railway.app`.

---

## 🎨 Client Deployment (Vercel)

1. Sign in to [Vercel](https://vercel.com/).
2. Click **Add New** -> **Project** -> Import the `Modassir22/Fact_checker` repository.
3. Configure the Project Settings:
   - **Framework Preset**: `Vite` (Vercel automatically detects this)
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add the following **Environment Variable**:
   - `VITE_BACKEND_URL`: `https://fact-checker-production.up.railway.app` (This must match your live Railway server URL!)
5. Click **Deploy**. Vercel will build the React client and host it on a public domain!
