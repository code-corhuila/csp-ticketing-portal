# csp-ticketing-portal

> ticketing bounded context: web UI (remote)

Part of the **Cinesync Platform** distributed system — team `cinesync-platform`, Group 1.
Governance and documentation live in [`csp-docs`](https://github.com/code-corhuila/csp-docs).

## Runbook

This portal is a **remote** of the shell (`csp-front`); the shell loads it at
`/booking/confirmation/:id`. It never calls `provideHttpClient()` — inside the shell
it uses the shell's HTTP client (ADR-022).

- **Run inside the shell (normal):** start the shell; it consumes this portal's `./routes`.
- **Run standalone (development only):** `npm start` → `http://localhost:4205`. Standalone
  uses the burned-in dataset, so no backend is needed.
- **Build:** `npm run build` → `dist/ticket`.
- **Tests:** `npm test -- --watch=false` (Vitest + jsdom via `@angular/build:unit-test`).

### Synthetic dataset (Cut 2)

`src/app/ticket/data/ticket.dataset.ts` holds the typed constant `TICKET_DATA`:
reservation ID, movie title, room, showtime, seat labels and QR payload. The UI reads it
through `TicketService.getTicket()`, so Cut 3 can swap that service to the Ticketing API
without touching the pages. The seat labels (`A1`, `A2`) are the ones the client picked
in the booking step — that is what keeps scenario 3 of HU-FE-TICKETING-001 valid while
the flow spans both portals.

The QR code is encoded client-side from `qrPayload` with the `qrcode-generator` package
(no external QR service).

## Styles

The ticket screen follows the ticket mockup (`csp-docs/12-ux-ui/mockup/index.html`,
HU-UI-002) with the design-system tokens (`csp-docs/12-ux-ui/design-system.md`,
HU-UI-001). The shell owns the CSS tokens (`csp-front/src/styles.css`); this portal
consumes them with `var()` where the design system defines them and never redefines
them. Mockup-specific values with no HU-UI-001 token (the card gradient, the QR
contrast) are documented as such. `src/index.html` mirrors the tokens for
standalone runs only — the shell never loads this portal's `index.html`.

Showtime renders in `en-US`/UTC by design while the data is synthetic. Once Cut 3 sources
`showtimeStartsAt` from the API, it must render venue-local time — a UTC-rendered local
showtime would show the wrong hour (tracked as a follow-up).

## Branching

Three permanent branches. **None of them accepts a direct commit** — you enter through a child
branch and leave through a Pull Request.

```
develop  <--PR--  feat/... fix/... chore/...
qa       <--PR--  qa/...
main     <--PR--  release/...  hotfix/...
```

Promotion happens **by re-application** (`git cherry-pick -x`), never by merging one permanent
branch into another: `merge develop -> qa` and `merge qa -> main` do not exist in this model.

`main` requires **1 approval from `ariel5253`**. On `develop` and `qa` the team sets its own review
rule.

Full policy: `00-governance/branching-policy.md` in `csp-docs`.