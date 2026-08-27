# Hike Kings & Tours — Frontend

This is the **frontend-only** deployment package for Hike Kings & Tours 2.0. It is a React + Vite single-page application intended for a GitHub repository and Netlify. The backend API is deployed separately.

## Requirements

Use **Node.js 20 or newer**. The backend API must already be deployed and reachable over HTTPS for login, bookings, store checkout, community features, admin features, and other database-backed functions to work.

## Run locally

```bash
npm install
npm run dev
```

Set `VITE_API_BASE_URL` in `.env` to the backend API origin. Leave it blank only when the API is served from the same origin as the frontend.

## Build locally

```bash
npm run check
npm run build
npm run preview
```

The production files are generated in `dist/`.

## Netlify deployment

Create a new site in Netlify and connect the GitHub repository containing this package. Use these settings:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Publish directory | `dist` |
| Node version | `20` or newer |
|

In **Netlify → Site configuration → Environment variables**, add:

| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | The deployed backend origin, such as `https://api.example.com` |
| `VITE_OAUTH_PORTAL_URL` | Your Manus OAuth portal URL |
| `VITE_APP_ID` | The Manus OAuth application ID |
| `VITE_PAYSTACK_PUBLIC_KEY` | Paystack public key only, such as `pk_live_...` |
| `VITE_FRONTEND_FORGE_API_URL` | Optional Manus frontend proxy URL |
| `VITE_FRONTEND_FORGE_API_KEY` | Optional frontend proxy credential if your map feature requires it |
|

Trigger a deploy after saving the variables. The included `netlify.toml` configures the build and rewrites all SPA routes to `index.html`, so routes such as `/admin`, `/trips`, `/cities`, and `/dashboard` continue to work after refresh.

## GitHub upload

Create an empty GitHub repository, extract this package into it, then run:

```bash
git init
git add .
git commit -m "Add Hike Kings and Tours frontend"
git branch -M main
git remote add origin https://github.com/YOUR-ACCOUNT/YOUR-REPOSITORY.git
git push -u origin main
```

Alternatively, use GitHub's **Add file → Upload files** interface to upload the extracted files. Do not upload local environment files or secrets to GitHub; configure the required variables in Netlify instead.

## Backend connection and OAuth

The frontend now uses `VITE_API_BASE_URL` for tRPC calls and for the OAuth callback URL. For example, if `VITE_API_BASE_URL=https://api.example.com`, login uses:

```text
https://api.example.com/api/oauth/callback
```

On the backend, set `CORS_ORIGINS` to the exact Netlify site origin and set `OAUTH_SUCCESS_REDIRECT_URL` to the Netlify site URL. Both sites must use HTTPS. The backend must allow credentials because authentication uses an HTTP-only session cookie.

## Payments

Only the Paystack **public** key belongs in the frontend. Never put `PAYSTACK_SECRET_KEY` or another secret credential in this repository or in a `VITE_*` variable. Payment verification and secret-key operations belong on the backend.
