# Immune Cinematic Comic (Vite + React)

Interactive comic experience built with React and Vite, including per-panel narration controls and quizzes.

## Stack

- Vite
- React
- Tailwind CSS
- Framer Motion
- `google-tts-api` (for narration fallback audio)

## Local Development

```bash
cd /home/mani/H4Ck5R/DC
npm install
npm run dev
```

`npm run dev` now runs everything needed, including the `/api/tts` endpoint via Vite middleware.

## Vercel Deployment

Push this repository to GitHub and import it in Vercel.

- Build command: `npm run build`
- Output directory: `dist`
- SPA fallback rewrites are handled in `vercel.json`

No extra backend process is required on Vercel.

## Netlify Deployment

If you deploy on Netlify instead, use the same build output.

- Build command: `npm run build`
- Publish directory: `dist`
- SPA fallback rewrites are handled in `netlify.toml`

## Build (Optional)

```bash
npm run build
npm run preview
```
