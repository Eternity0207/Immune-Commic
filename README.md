# Immune Cinematic Comic (Vite + React)

Single-page cinematic comic experience built with React, Vite, Tailwind CSS, and Framer Motion.

## Stack

- Vite
- React
- Tailwind CSS
- Framer Motion

## Run locally

```bash
cd /home/mani/H4Ck5R/DC
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Current structure

- `src/App.jsx`: main stage flow (`intro -> characters -> story`) and panel navigation state
- `src/components/Hero.jsx`: intro hero section
- `src/components/Characters.jsx`: character selection scene
- `src/components/Story.jsx`: story scene wrapper and progress UI
- `src/components/Panel.jsx`: fullscreen panel renderer
- `public/assets/characters`: character images (`char1..char10`)
- `public/assets/panels`: story panels (`p1..p48`)
