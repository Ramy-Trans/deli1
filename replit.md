# Workspace

## Sea Gull Restaurant App

A semi-production-ready premium restaurant ordering mobile app (Expo/React Native) with Express.js/PostgreSQL backend.

### Active Branch Admins
| Branch | Email | Password |
|--------|-------|----------|
| Fifth Settlement (id=3) | fifthsettlement@seagull.com | FifthSettlement@2025! |
| Sheikh Zayed (id=35) | sheikhzayed@seagull.com | SheikhZayed@2025! |
| Madinaty (id=38) | madinaty@seagull.com | Madinaty@2025! |
| Super Admin | admin@seagull.com | SeaGull@Admin2025! |

### Food Images
- 12 TOV images served from `/images/TOV-01.png` through `/images/TOV-12.png` via API server static files
- Products with real images: Sea Gel Soup (35), White Shrimp Tajine (62), Mix Seafood Tajine (67), Lobster (72), Jumbo Shrimp (111), Shrimp Rice (115), Sea Gel Rice (116), Seafood Pasta (117), Sea Gel Pasta (118), + all Meals category products

### Rider Location by Phone
- `POST /api/rider/update-location-by-phone` accepts `{ phone, lat, lng }` — looks up rider by phone, updates coordinates, emits WebSocket event

### Completed Features
- Full menu with category browsing, search, best sellers, featured items
- Favorites system (heart toggle on product cards, persisted via AsyncStorage)
- Cart, checkout, order placement
- Real-time order tracking via WebSocket + animated rider map
- Rider GPS dashboard at `API_URL/rider` (web page for delivery agents)
- Loyalty points system
- All settings screens fully functional:
  - Personal Information (edit name, email)
  - Saved Addresses (CRUD)
  - Favorites (shows saved dishes with add-to-cart)
  - Order History (links to orders tab)
  - Payment Methods (Cash on Delivery + Visa — no demo/hard-coded cards)
  - Promo Codes (fetched live from API `/api/coupons`, with clipboard copy support via expo-clipboard@8.0.8)
  - Language (English, Arabic, French, German — all fully functional with translations)
  - Notifications (push/email toggles)
  - Help Center (FAQ accordion by category)
  - Contact Us (Call, WhatsApp, Email + message form)
  - About Sea Gull (story, values, awards, social links)
  - Dark Mode toggle
- Egypt payment methods: Cash, Visa/Mastercard, Meeza, Fawry, Vodafone Cash, InstaPay
- Sign out properly redirects to auth screen (useEffect in profile + router.replace)
- Delete Account: full flow (DELETE /api/users/me + profile button with confirmation)
- i18n: LanguageContext with full EN/AR/FR/DE translations applied app-wide
- Contact screen: Call & WhatsApp both show +20 12 00157302

### Admin Panel (Sea Gull Admin)
- React web app at `/admin/`
- Login with email + password: `admin@seagull.com` / `SeaGull@Admin2025!` (changeable via `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars)
- Dashboard: live stats (orders, riders, today's revenue) — all Lucide React icons, no emojis
- Orders page: view all orders with status filters, update status step-by-step, assign riders
- Riders page: create rider accounts (name, phone, vehicle, portal password), set/reset portal password, delete riders, change status
- All icons are Lucide React — no emoji anywhere in the admin UI
- Promos tab: full coupon CRUD (create, toggle active, delete) at `/admin/promo-codes` — uses `GET/POST/PATCH/DELETE /api/admin/coupons`

### Website (`/website/`)
- React/Vite app at `/website/`
- Dark navy/gold brand theme (matches mobile app)
- Pages: Home (hero slideshow, categories, featured products), Menu (search + category filter), My Orders, Order Detail (live status), Checkout (branch select, address, payment)
- Product `price` field (not `basePrice`) — fetched from `GET /api/products`
- Cart via `CartContext`, Auth via `AuthContext` (user_token / user_data in localStorage)
- `discountedPrice` field shown as strikethrough when available

### Rider Portal (`/rider`)
- Separate login page at `/admin/rider` accessible to delivery agents
- Rider logs in with their phone number + password set by admin
- Rider dashboard shows: available orders to accept, active order with status update buttons, completed orders
- Live GPS tracking via `navigator.geolocation.watchPosition()` — coordinates sent to `PATCH /api/rider/location`
- Admin can see rider GPS coordinates (as Google Maps link) in the order detail page
- Admin copies the rider portal URL from the Riders page header and shares with their agents
- Rider portal has a distinct green theme (vs admin's gold/blue)

### Rider API Routes (`/api/rider/...`)
- `POST /api/rider/login` — phone + password auth, returns rider token
- `GET /api/rider/me` — get rider info from token
- `GET /api/rider/orders` — available + assigned orders
- `POST /api/rider/orders/:id/accept` — claim an order (assigns rider, marks rider_assigned)
- `PATCH /api/rider/orders/:id/status` — update order status (picked_up → on_the_way → delivered)
- `PATCH /api/rider/location` — update GPS coordinates
- `PATCH /api/rider/status` — go online/offline

### What Needs to Be Added for Full Production
- Real menu data from the client (products, images, prices)
- Real delivery coordinates (real branch addresses)
- Payment gateway integration (Fawry, Vodafone Cash, InstaPay, Meeza)

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.
