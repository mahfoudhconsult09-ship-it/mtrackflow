# TrackFlow

Lean MVP for WhatsApp-first order and delivery tracking for small online merchants.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

The current UI is connected to Supabase for authentication, orders, customers, settings, bulk imports, and public tracking.

## Supabase

1. Create a Supabase project.
2. Run `supabase-schema.sql` in the SQL editor.
3. Add the project URL and publishable key to `.env.local`.
4. Configure the same environment variables in Netlify before the first production deploy.

## Production

This project is intended to deploy as a Next.js application on Netlify.

## Build requirements
TrackFlow requires Node.js 22+ and npm. If `npm install` cannot resolve `registry.npmjs.org`, fix the machine/network DNS or use a different network before installing dependencies. Netlify can install dependencies during its build without using this local environment.

## Install TrackFlow as a phone app

TrackFlow now includes PWA support. After deploying it to HTTPS (for example Netlify), open the site on your phone and install it from the browser.

- Android/Chrome: open the site, then use the browser menu and choose **Install app** or **Add to Home screen**.
- iPhone/Safari: open the site, tap **Share**, then choose **Add to Home Screen**.

The app opens in standalone mode with its own TrackFlow icon. The service worker provides an offline fallback page, while live orders and Supabase data still require an internet connection.
