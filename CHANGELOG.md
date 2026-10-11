Changelog

All notable changes of `csp-ticketing-portal` are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the versions follow
[Semantic Versioning](https://semver.org/). A release is a `release/<version>` branch cut from `main` and filled with the commits of `qa`,
re-applied with `git cherry-pick -x` (numerals 6.2.3, 10 and 11 of the course norm); it reaches `main` by pull request, never by merging `qa`,
and is tagged `v<version>` once it is merged.

## [Unreleased]

## [2.0.0] - 2026-10-11

MVP 2 (Cut 2). Story [#3](https://github.com/code-corhuila/csp-ticketing-portal/issues/3): the client sees the ticket confirmation
with the movie, room, showtime, selected seats, reservation ID and QR code. The portal runs as a federated remote of `csp-front`.

### Added

- Angular 21 + Native Federation project configuration and standalone runtime on port 4205. ([#2](https://github.com/code-corhuila/csp-ticketing-portal/pull/2), [#4](https://github.com/code-corhuila/csp-ticketing-portal/pull/4), [#6](https://github.com/code-corhuila/csp-ticketing-portal/pull/6))
- Synthetic ticket dataset and `TicketService` boundary with the reservation ID, movie title, room, showtime, seat labels and QR payload. ([#11](https://github.com/code-corhuila/csp-ticketing-portal/pull/11), [#22](https://github.com/code-corhuila/csp-ticketing-portal/pull/22))
- QR code component generated client-side with `qrcode-generator`, including overflow fallback and contrast-safe styling. ([#12](https://github.com/code-corhuila/csp-ticketing-portal/pull/12), [#23](https://github.com/code-corhuila/csp-ticketing-portal/pull/23))
- Ticket screen that renders the movie title, room, showtime, seat labels and reservation ID with the QR area and synthetic data note. ([#13](https://github.com/code-corhuila/csp-ticketing-portal/pull/13), [#17](https://github.com/code-corhuila/csp-ticketing-portal/pull/17), [#24](https://github.com/code-corhuila/csp-ticketing-portal/pull/24), [#25](https://github.com/code-corhuila/csp-ticketing-portal/pull/25))
- Remote name, exported route contract and development port aligned with the shell (`./routes`, `TICKETING_ROUTES`, port 4205). ([#9](https://github.com/code-corhuila/csp-ticketing-portal/pull/9), [#21](https://github.com/code-corhuila/csp-ticketing-portal/pull/21))
- Token mirror sync check to keep the portal token mirror aligned with the shell design tokens and strict CI mode. ([#27](https://github.com/code-corhuila/csp-ticketing-portal/pull/27), [#28](https://github.com/code-corhuila/csp-ticketing-portal/pull/28), [#29](https://github.com/code-corhuila/csp-ticketing-portal/pull/29))
- Multi-stage Docker build, nginx runtime, health endpoint, Docker Compose and CI `cors-check` job for remote deployment on port 4205. ([#30](https://github.com/code-corhuila/csp-ticketing-portal/pull/30), [#31](https://github.com/code-corhuila/csp-ticketing-portal/pull/31))
- Runtime CORS configuration rendered from `CORS_ALLOWED_ORIGIN_REGEX` and documented in the deployment runbook per ADR-026. ([#30](https://github.com/code-corhuila/csp-ticketing-portal/pull/30), [#31](https://github.com/code-corhuila/csp-ticketing-portal/pull/31), [csp-docs#107](https://github.com/code-corhuila/csp-docs/pull/107))

### Changed

- The ticket screen styling follows the design system tokens from HU-UI-001/002 and removes the hardcoded color values in favor of `var(--color-*)` and `var(--font-size-*)` tokens. ([#17](https://github.com/code-corhuila/csp-ticketing-portal/pull/17), [#25](https://github.com/code-corhuila/csp-ticketing-portal/pull/25))
- The shell route contract and local runtime configuration are aligned with the federated portal contract used by `csp-front`. ([#9](https://github.com/code-corhuila/csp-ticketing-portal/pull/9), [#21](https://github.com/code-corhuila/csp-ticketing-portal/pull/21))
- The token mirror validation and strict mode rules were tightened so CI fails when the shell tokens are missing or inconsistent. ([#27](https://github.com/code-corhuila/csp-ticketing-portal/pull/27), [#29](https://github.com/code-corhuila/csp-ticketing-portal/pull/29))
- The README documents the deployment runbook and standalone usage in the same format as the other portals. ([#30](https://github.com/code-corhuila/csp-ticketing-portal/pull/30), [#31](https://github.com/code-corhuila/csp-ticketing-portal/pull/31))

### Fixed

- The portal loads correctly from the shell in containerized deployments: nginx answers `Access-Control-Allow-Origin` for the configured remote origins and serves `remoteEntry.json` with `Cache-Control: no-store`. ([#30](https://github.com/code-corhuila/csp-ticketing-portal/pull/30), [#31](https://github.com/code-corhuila/csp-ticketing-portal/pull/31))
- Token sync checks were fixed for values containing colons, multi-root `:root` blocks and strict CI behavior. ([#27](https://github.com/code-corhuila/csp-ticketing-portal/pull/27), [#29](https://github.com/code-corhuila/csp-ticketing-portal/pull/29))
- CI now validates the image build, the missing-env failure and the allowed/blocked origin checks for the deployment rule. ([#19](https://github.com/code-corhuila/csp-ticketing-portal/pull/19), [#31](https://github.com/code-corhuila/csp-ticketing-portal/pull/31))

### Known limits

- The ticket details still use synthetic data; integration with the Ticketing API is pending. ([#3](https://github.com/code-corhuila/csp-ticketing-portal/issues/3), [#11](https://github.com/code-corhuila/csp-ticketing-portal/pull/11))
- Showtime uses UTC while the data is synthetic; the API version must render the venue-local time once it is wired in. ([#13](https://github.com/code-corhuila/csp-ticketing-portal/pull/13), [#24](https://github.com/code-corhuila/csp-ticketing-portal/pull/24))
- The CORS rule remains environment-driven and must be configured only by trusted deployment operators. ([#30](https://github.com/code-corhuila/csp-ticketing-portal/pull/30), [#31](https://github.com/code-corhuila/csp-ticketing-portal/pull/31))
- There are no integration or contract tests against the Ticketing API in this cut. ([#3](https://github.com/code-corhuila/csp-ticketing-portal/issues/3))

## [0.1.0] - 2026-10-05

### Added

- Governance files, the Angular 21 and Native Federation project configuration and the standalone runtime. ([#2](https://github.com/code-corhuila/csp-ticketing-portal/pull/2), [#4](https://github.com/code-corhuila/csp-ticketing-portal/pull/4))