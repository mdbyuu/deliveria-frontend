# Verification record

Initial workflow verified on **20 October 2026**, with final checks on **21 October 2026** against PRD v1.1 and the deployed FastAPI OpenAPI contract at `https://wad05-deliveria-api.onrender.com/openapi.json`.

## Automated checks

`npm run check` runs ESLint, Vitest, and the Vite production build. The suite has **26 passing tests** across three files:

- `domain.test.js`: next-stage rules; Jakarta midnight/leap-year ranges; inclusive range limits; deterministic timeline order; blank/phone/weight/password validation; safe error extraction.
- `auth.test.js`: memory-only session storage; idle and throttled-timer expiry; role/guest navigation; logout; bearer headers; protected 401 handling; ignoring late 401s from an old session.
- `views.test.js`: customer registration without a role field; creation success/failure and retained input; duplicate-submit protection; server filters/pagination; courier confirmation/version payloads and history; conflict refresh; delivered final state; revoked access; all courier-choice pages; admin assignment; blocked deactivation; zero-date reporting; overlapping list requests.

These are frontend component/contract tests with mocked API responses. They do not establish server authorization, transaction isolation, rollback, or performance guarantees. Those belong to the separately maintained backend test suite.

## Live browser workflow

Performed in the T3 collaborative Chromium browser at desktop widths and 360px mobile width, using the real deployed API. No backend source or schema changes were made.

1. Signed in as the supplied Customer and created a fictional shipment through the request form.
2. Confirmed an immediate Placed history entry and the generated tracking link.
3. Signed in as Admin; verified the new request appeared in active deliveries and Shipments created.
4. Assigned TesKurir while Placed. Status and the single history entry stayed unchanged; the assignment audit recorded the operation.
5. Attempted to deactivate the assigned courier; the API rejected it because unfinished work remained. The account stayed active.
6. Created `Frontend QA Courier`, edited its name to `Frontend QA Courier (demo)`, and successfully deactivated/reactivated it through courier management.
7. Reassigned the still-Placed shipment to the QA courier. The audit contained both assignments and the tracking history still had one stage.
8. Signed in as the QA courier. A deliberate API request to skip from Placed to Delivered returned **409**; status/history stayed unchanged.
9. Used the visible confirmation dialogs to record **Picked Up → In Transit → Delivered**, including the final update at 360px width. Delivered removed the next-stage action.
10. Signed back in as Customer. Exact tracking search found the completed delivery, and the detail page displayed all four timestamped stages in order.
11. Admin overview showed zero active deliveries, four delivered requests, and four shipments created in the selected 30-day range. Delivery completion did not reduce the creation-volume total.
12. Deactivated the temporary QA courier after delivery. The original TesKurir account remained active; shipment and audit history remain intact.

Test shipment:

- ID: `1bab1cc9-495b-4f07-b8b6-2ad076c6a6c8`
- Tracking: `DLV-0E75089A80C20F43B5E898D6`
- Final status: Delivered
- Description explicitly identifies fictional frontend verification; no physical delivery is intended.

The initial Courier password contained a typo, so the full workflow was verified using the dedicated QA account created through the admin UI. On 21 October, the user supplied the corrected password and sign-in as **TesKurir** succeeded. Its Delivered filter returned three completed assigned deliveries; the active list was empty. Mobile navigation opened, focused its first link, and closed correctly. No account passwords were committed. The temporary QA account is inactive and its generated credential was kept only in memory.

## Browser/UI checks and limits

- Login, customer history/detail, admin overview/assignment, and courier detail were exercised in the collaborative browser.
- Screenshots in `docs/screenshots` show the live customer history, complete timeline, admin overview, and courier management.
- Mobile login and shipment detail fit at 360px without horizontal document overflow. Courier confirmation and completion were used at that width. The chart scrolls within its own container for long ranges.
- New front-end production build passed locally; this does not claim a deployment or a deployed-frontend smoke test.
- The backend already has its own test suite; it was inspected for contracts, not rerun or modified here.
- Firefox, 1,000-shipment load testing, CI execution on GitHub, and verification of production hosting headers were not performed in this session.
