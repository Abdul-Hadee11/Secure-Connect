# ⚡ Quickstart — 5 Minutes to Live

## 1️⃣ Install
```bash
cd the directory of ur project
npm install
```

## 2️⃣ Firebase
- Create project at https://console.firebase.google.com
- Add a web app → copy the config object
- Enable **Firestore** (production mode) + **Storage**
- Paste rules from `firestore.rules` and `storage.rules`

## 3️⃣ Add config
```bash
cp .env.example .env
# Open .env and paste your 6 Firebase values
```

## 4️⃣ Run locally
```bash
npm run dev
```
→ http://localhost:5173 — password: **``**

## 5️⃣ Deploy to Vercel
```bash
npm i -g vercel
vercel
# Follow prompts, paste env variables when asked
vercel --prod
```

Done! Your portal is live. 🌷
