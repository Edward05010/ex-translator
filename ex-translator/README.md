# Ex Translator 💔

> Paste their confusing texts. Get brutally honest (and hilarious) AI translations.

---

## How to deploy in 5 minutes (free)

### Step 1 — Get your Anthropic API key
1. Go to https://console.anthropic.com
2. Sign up / log in
3. Click **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-...`)

---

### Step 2 — Put the project on GitHub
1. Go to https://github.com and create a free account if you don't have one
2. Click **New repository** → name it `ex-translator` → click **Create**
3. Upload all the files from this folder:
   - `vercel.json`
   - `api/translate.js`
   - `public/index.html`

---

### Step 3 — Deploy on Vercel (free)
1. Go to https://vercel.com and sign up with your GitHub account
2. Click **Add New Project**
3. Select your `ex-translator` GitHub repo
4. Click **Deploy** (no build settings needed)

---

### Step 4 — Add your API key (secret, safe)
1. In Vercel, go to your project → **Settings** → **Environment Variables**
2. Add a new variable:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** paste your `sk-ant-...` key
3. Click **Save**
4. Go to **Deployments** → click the three dots on the latest deploy → **Redeploy**

✅ Done! Your site is live. Share the Vercel URL with anyone.
Users get free translations — only YOU pay (fractions of a cent each).

---

## Project structure

```
ex-translator/
├── vercel.json          # Routing config
├── api/
│   └── translate.js     # Backend — holds your secret API key
└── public/
    └── index.html       # The website users see
```

## How it works (simply)

```
User types text
      ↓
Browser → POST /api/translate  (your server)
                ↓
         Server adds secret key → calls Anthropic API
                ↓
         Returns funny translation (no key ever reaches user)
```

## Cost estimate
- Each translation ≈ $0.001–$0.003
- 1,000 translations ≈ $1–3
- Vercel hosting: free
