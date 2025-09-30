# UB MSW Advising Planner – Pilot (Cloud-only)

This repo is ready for **Vercel** or **Netlify**. No local Node install required.

## Deploy on Vercel
1. Create a new GitHub repo and push these files.
2. Go to https://vercel.com → New Project → Import your repo.
3. Framework preset: **Vite**.
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy → you get a live URL.

## Deploy on Netlify
1. Create a new GitHub repo and push these files.
2. Go to https://app.netlify.com → Add new site → Import from Git.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy.

### Notes
- The app code is in `src/App.jsx`.
- No persistence (save/load) in this pilot.
- If build errors mention JSX, make sure Vercel/Netlify detected Vite/React. Re-select the preset if needed.
