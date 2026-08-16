# NagpurSetu

NagpurSetu is a responsive civic and emergency dashboard for Nagpur residents, combining rapid SOS access, municipal impact updates, sanitation grievance tracking, healthcare and transit information, and community ideas for Viksit Nagpur 2047.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/nagpursetu/src/App.tsx` — client-side routes, realistic Nagpur mock data, civic workflows, emergency actions, and modals
- `artifacts/nagpursetu/src/index.css` — NagpurSetu visual tokens, typography, texture, animation, and responsive styling
- `artifacts/api-server` — shared API service scaffold (not required by the current mock-data-first frontend)
- `lib/api-spec/openapi.yaml` — shared API contract source of truth for future server-backed features

## Architecture decisions

- The first build is intentionally client-side and mock-data-first so the hackathon demo remains fast, predictable, and usable without external services.
- Emergency actions use browser-native `tel:`, `sms:`, and geolocation capabilities where the device supports them; no local auth or credential handling is added.
- The shared shell keeps safety access and city navigation visible across desktop and mobile layouts.

## Product

- Overview dashboard with live NMC impact counters and active report snapshot
- One-touch emergency directory, broadcast SOS, silent SOS, Medical Emergency ID, and deterrent toggle
- Healthcare, blood bank, pharmacy, metro, and feeder shuttle directory
- Waste grievance submission with live ticket tracking and counter updates
- Viksit Nagpur 2047 idea board with resident voting and new idea submission
- English, Marathi, and Hindi navigation labels

## User preferences

No additional preferences recorded.

## Gotchas

- The NagpurSetu preview is a frontend-only demo; submitted grievances and idea votes are held in client state and reset on refresh.
- Run the artifact workflow rather than a root-level dev command so the preview receives its configured path and port.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
