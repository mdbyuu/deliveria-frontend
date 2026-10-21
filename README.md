# Deliveria frontend

Vue 3, Vite, and Pinia frontend for the **Logistics and Delivery Tracking PRD v1.1**. All screens use English and connect to the existing FastAPI service. This repository does not contain or modify the backend.

## Run

Use Node.js 24 (Node 22.12+ is supported).

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open <http://localhost:5173> for the public landing page, then choose **Sign in** or **Get started**. The default API is `https://wad05-deliveria-api.onrender.com/api/v1`. Override `VITE_API_BASE_URL` in `.env.local` for a different API. Vite environment variables are public build-time configuration; never put passwords or secrets in them.

Customer accounts can be created at `/register`. Use an admin-provisioned Courier or Admin account for the corresponding workspace. Credentials are not stored in the repository.

## Features

| PRD  | Frontend support                                                                                            |
| ---- | ----------------------------------------------------------------------------------------------------------- |
| FR01 | Customer registration, login/logout, role-aware routing, session expiry notice                              |
| FR02 | Validated request form, positive decimal weight, preserved failed input, tracking link after creation       |
| FR03 | Private details, contacts, package, assigned courier, chronological timestamped history, refresh            |
| FR04 | Customer history, exact tracking/status filters, server pagination, empty/loading/error states              |
| FR05 | Courier's assigned active/completed deliveries and contact details                                          |
| FR06 | Next-stage confirmation, pending-action protection, optimistic versions, refresh after conflicts            |
| FR07 | Admin monitoring, status/courier/unassigned filters, active courier assignment before pickup, audit history |
| FR08 | Courier creation, profile edits, activation/deactivation with server conflict messages                      |
| FR09 | Date-range shipment volume, zero dates, readable daily-count table, Asia/Jakarta boundaries                 |

The API remains responsible for identity, object access, transactions, allowed transitions, timestamps, and concurrency. UI guards are navigation aids, not authorization controls. No mock data or demo authentication is included in the application.

## Sessions

Tokens, users, and expiry are held **only in the Pinia store in memory**, matching the backend's documented policy. They are not persisted to localStorage, sessionStorage, URLs, or cookies. Old sessionStorage keys from the previous frontend are removed on startup.

- Full browser reload or closing the tab requires signing in again. Use the in-page **Refresh** controls to fetch current data without losing the session.
- The server's `expires_in` controls the expiry timer. Navigation and API requests also check expiry in case the browser throttles timers.
- Expiry or an authenticated 401 clears the session and returns to login with a message. Return paths are limited to the signed-in user's role.
- Sign out discards the client token. It does not revoke a previously issued JWT on the server.
- Protected requests use explicit bearer headers. Public login/registration do not receive a token. Vue escapes user content; no `v-html` is used.

## Checks

```bash
npm run check        # ESLint, 26 Vitest tests, production build
npm run test:watch
npm run format:check
npm run build
npm run preview
```

Tests run against isolated API stubs, never the production database. They exercise role/session behavior, validation, successful and failed submissions, pagination races, confirmation, assignment, status conflicts, and chart dates. GitHub Actions runs lint, tests, and the build on pushes and pull requests.

See [verification evidence](docs/verification.md) and the [screenshot user guide](docs/user-guide.md).

## Architecture

```text
src/
  components/    Shared workspace shell, forms, feedback, dialogs, badges, pagination
  composables/   Cancellable, paginated API lists
  lib/           Workflow, validation, error, and Jakarta date helpers
  router/        Role routes and navigation guards
  services/      Axios API client and paginated courier lookup
  stores/        Memory-only authentication
  views/         Login/register, shipments, creation, detail, couriers, admin overview
```

Responses follow the live OpenAPI contract: `current_status`, `version`, paginated `items/total/page/pages`, and `{error: {message, fields}}`. Weight responses remain decimal strings. Status/assignment mutations send `expected_version`; stale mutations are never retried automatically. Tracking-number filters use exact, case-insensitive API matching, not substring search. All displayed timestamps use Asia/Jakarta (WIB).

## Deployment

For Vercel, use build command `npm run build`, output directory `dist`, and set `VITE_API_BASE_URL` before building. `vercel.json` includes SPA rewrites and security headers. Its CSP permits the existing API origin and Google Fonts; if the API origin changes, update `connect-src` as well. Other static hosts need equivalent history fallback and headers. Serve over HTTPS and allow the deployed frontend's exact origin in the backend CORS configuration.

Google Fonts is optional; local sans-serif fallbacks keep the interface usable if fonts cannot load. The API timeout is 60 seconds to accommodate cold starts; requests display loading and retry states.

No frontend deployment was performed during this implementation. Firefox verification and the final group report/presentation remain project deliverables; see the verification notes for the checks actually performed.
