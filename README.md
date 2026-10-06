# csp-ticketing-portal

> ticketing bounded context: web UI (remote)

Part of the **Cinesync Platform** distributed system — team `cinesync-platform`, Group 1.
Governance and documentation live in [`csp-docs`](https://github.com/code-corhuila/csp-docs).

## Runbook

This portal is a **remote** of the shell (`csp-front`); the shell loads it at
`/booking/confirmation/:id`. It never calls `provideHttpClient()` — inside the shell
it uses the shell's HTTP client (ADR-022).

- **Run inside the shell (normal):** start the shell; it consumes this portal's `./routes`.
- **Run standalone (development only):** `npm start` → `http://localhost:4201`. Standalone
  uses the burned-in dataset, so no backend is needed.
- **Build:** `npm run build` → `dist/ticket`.
- **Tests:** `npm test -- --watch=false` (Vitest + jsdom via `@angular/build:unit-test`).

### Synthetic dataset (Cut 2)

`src/app/ticket/data/ticket.dataset.ts` holds the typed constant `TICKET_DATA`:
reservation ID, movie title, room, showtime, seat labels and QR payload. The UI reads it
through `TicketService.getTicket()`, so Cut 3 can swap that service to the Ticketing API
without touching any page or spec contract. The seat labels (`A1`, `A2`) are the ones the
client picked in the booking step — that is what keeps scenario 3 of HU-FE-TICKETING-001
valid while the flow spans both portals.

The QR code is encoded client-side from `qrPayload` with the `qrcode-generator` package
(no external QR service).

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
