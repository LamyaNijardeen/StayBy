# StayBy — Frontend

React 19 + TypeScript single-page app for StayBy (traveler, owner and admin
interfaces). Built with Vite, Tailwind CSS v4, React Router, Leaflet and Lucide icons.

The full project description and backend setup are in the
[root README](../README.md).

## Run it

```
npm install
npm run dev        # http://localhost:5173
```

The backend address defaults to `http://localhost:8080`. To change it, create
`.env` in this folder (see `.env.example`):

```
VITE_API_URL=http://localhost:8080
```

Optional: `VITE_SUPPORT_EMAIL` turns on the contact form on the Contact page.
Never commit `.env` files.

## Build

```
npm run build      # outputs dist/
npm run preview    # serve the production build locally
```

## Folder guide

```
src/
├─ pages/        one file per page (traveler, owner/, admin/)
├─ components/   shared UI (navbar, footer, dialogs, hero, sections)
├─ services/     API calls to the backend
└─ config.ts     API address setting
```

## Photos on the landing page

The landing and login pages show optional background photos from
`public/hero/hero-1.jpg` … `hero-4.jpg`. If the files are missing, the pages
use plain colours instead.