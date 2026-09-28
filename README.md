# PetHotelGO — Frontend

Web app for managing a **pet hotel / pet boarding** business: clients
(owners) and their pets, a boarding calendar with capacity control,
reservations with per-stay pricing and discounts, stay history, vaccination
cards, and a settings screen for the boarding daily rates. Talks to a
companion Kotlin/Spring API ([`pethotelgo-backend`](../pethotelgo-backend)).

Ships as an installable **PWA**.

> This is a public, portfolio version of a private production repository.
> Infrastructure identifiers (real hosts, cloud storage credentials) have
> been removed or replaced with placeholders — everything else (code,
> config shape, build pipeline, docs) matches production.

## Stack

| | |
| --- | --- |
| Framework | **React 18** + **TypeScript** + **Vite** |
| Styling | **Tailwind CSS** + **shadcn/ui** (Radix UI primitives) |
| Server state | **TanStack Query v5** |
| Forms & validation | **react-hook-form** + **zod** |
| Animation | **framer-motion** |
| Routing | **react-router-dom** (`BrowserRouter`) |
| PWA / offline | **vite-plugin-pwa** (Workbox) |
| Dates | **date-fns** |
| Charts | **recharts** |
| Testing | **Vitest** + Testing Library (jsdom) |

`@` path alias resolves to `src/`.

## Architecture

### Authentication strategy

No third-party identity provider — auth is entirely against the backend's
JWT endpoints.

- `src/services/auth/authApi.ts` wraps
  `POST /auth/{login,register,logout,refresh}` and `GET /auth/me`.
- `AuthContext` persists `user` / `token` / `refreshToken` to
  `localStorage` (keys centralized in `src/services/core/config.ts`).
- `httpClient` (`src/services/core/httpClient.ts`) attaches
  `Authorization: Bearer <token>` to every request. On a `401` it calls
  `/auth/refresh` **once**, coalescing any other requests that 401
  concurrently so they wait on the same refresh instead of each firing their
  own, retries the original request with the rotated token, and only clears
  storage + redirects to `/auth` if the refresh itself fails.
- `ProtectedRoute` redirects unauthenticated users to `/auth`.

### Data layer

- `src/services/` — the HTTP boundary. `core/httpClient.ts` (fetch
  wrapper with the refresh logic above), `core/config.ts` (endpoints +
  constants), one sub-folder per resource (`auth/ owners/ pets/
  reservations/ stayHistory/ settings/`), all re-exported from
  `src/services/index.ts` for a single import surface.
- `src/hooks/useAPI.ts` — the TanStack Query layer (`useOwners`, `usePets`,
  `useReservations`, `useSettings`, mutations with cache invalidation).
- `HotelContext` (`src/contexts/HotelContext.tsx`) — a central store for
  owners / pets / reservations that layers optimistic local updates on top
  of background query refetches, so the UI reacts instantly while staying
  eventually consistent with the server.
- Contexts are deliberately split into three files each (`contexts.ts` — bare
  `createContext`, `*Context.tsx` — the provider, `use*Hook.ts` — the
  consumer hook) to keep Fast Refresh working and avoid circular imports
  between provider and consumer.

### Routes

| Path | Page |
| --- | --- |
| `/` or `/auth` | `AuthPage` (public) |
| `/dashboard` | `DashboardPage` |
| `/agendamentos` | `SchedulePage` |
| `/clientes` | `ClientsPage` |
| `/pets` | `PetsPage` |
| `/configuracoes` | `SettingsPage` |

### Domain notes

- Hotel capacity cap is a UI-level constant (`HotelContext`), mirroring the
  capacity check enforced server-side.
- **Daily boarding rate** is a global setting edited on `/configuracoes`.
  The backend's `GET/PUT /settings` is the single source of truth — the UI
  always reads it through `useDailyRate()` (`src/hooks/useDailyRate.ts`)
  instead of hardcoding a value. Consumers include the reservation form, the
  price simulator, and the day-details modal. A reservation may still carry
  a one-off `dailyRate` override.
- Pet attributes: `size` (`pequeno|medio|grande`), `sociability`
  (`baixa|media|alta`), `needsSeparateSpace`. Reservation status:
  `confirmed|pending|completed|cancelled`.
- Backend dates arrive as `dd/MM/yyyy`; parsed with `parseBrazilianDate`
  (`src/utils/dateUtils.ts`) rather than relying on the runtime's locale.

### PWA & caching strategy

Configured via `VitePWA` in `vite.config.ts`, `registerType: 'autoUpdate'`:

- Precaches the app shell; `navigateFallback` = `index.html` so client-side
  routes work after a hard refresh, with `/api/*` explicitly excluded from
  the fallback.
- Runtime caching: Google Fonts (`StaleWhileRevalidate`, 1-year TTL) and API
  `GET` requests except `/api/auth/*` (`NetworkFirst`, 5 s network timeout,
  1-day TTL) — the app degrades gracefully to cached data on a flaky
  connection instead of hard-failing.
- `src/utils/pwa.ts` exposes `clearApiCache()`, called on logout/401 so a
  new session never sees another user's cached responses.
- The service worker does not run under `npm run dev`, only in production
  builds.
- Icons are generated once from `public/favicon.ico` via `npm run icons`
  (`scripts/generate-pwa-icons.mjs`, needs macOS `sips` + `sharp`).

### Build pipeline notes

- Static hosts without SPA rewrite rules (e.g. object storage buckets) would
  404 on a hard refresh of a client-side route. A Vite plugin
  (`spaFallback` in `vite.config.ts`) copies `index.html` to `dist/404.html`
  at build time so the bucket's error document can serve it.
- `rollupOptions.manualChunks` splits independently-versioned vendor code
  (React, animation, forms, dates) into their own chunks, so a routine code
  change doesn't invalidate the whole bundle in the PWA's cache and the
  browser can fetch chunks in parallel.

## Local development

```bash
npm install
npm run dev        # http://localhost:3000  (expects the API on :8080)
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server (port 3000) |
| `npm run build` | Production build → `dist/` (+ `404.html`, service worker, manifest) |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (jsdom); tests live in `src/**/*.{test,spec}.{ts,tsx}` |
| `npm run icons` | Regenerate PWA / favicon images |

### API URL

`VITE_API_URL` is read in `src/services/core/config.ts` and **baked into
the bundle at build time**:

- `.env` (git-ignored, copy from `.env.example`) — local dev,
  `http://localhost:8080/api`.
- `.env.production` (committed, no secrets) — `/api`, a same-origin
  relative path for the reverse-proxy deployment described below.

## Deploy strategy (summary)

Production serves the built `dist/` from a private object-storage bucket
behind a **Cloudflare Worker** ([`cloudflare/worker.js`](cloudflare/worker.js))
acting as a single HTTPS edge: static assets are proxied straight from the
bucket, `/api/*` is forwarded to the backend container, and unknown
extensionless paths fall back to `index.html` for client-side routing. One
origin means no CORS and no mixed-content issues even though the backend
itself is plain HTTP behind the edge.

[`cloudflare/wrangler.toml`](cloudflare/wrangler.toml) shows the Worker
configuration shape; the real backend host and the bucket's
pre-authenticated-request URL are environment-specific secrets and are
**not** committed — they're supplied out of band before `wrangler deploy`.
[`scripts/deploy-oci.sh`](scripts/deploy-oci.sh) builds the app and uploads
`dist/` with cache headers tuned per asset type: hashed files under
`assets/` get a one-year immutable cache, everything else (`index.html`,
the service worker, the manifest) is `no-cache` so a deploy takes effect
immediately.

## License

No license file is included — all rights reserved by the author. Code is
shared here for portfolio/review purposes.
