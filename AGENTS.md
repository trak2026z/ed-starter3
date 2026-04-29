# RunwayBriefing — FIDS (Flight Information Display System)

## Tech Stack
- Next.js 16 (App Router), React 19, TypeScript 5 (strict)
- Zustand 5 for state management
- Tailwind CSS 4

## Code Style
- ES modules (import/export), never CommonJS (require)
- Path aliases: import from '@/types', '@/store', '@/lib', '@/components'
- Prefer const over let, never use var
- Destructure imports: import { Flight } from '@/types'

## Project Structure
- app/ — Next.js App Router pages and API routes
- app/api/flights/route.ts — REST API (GET, POST, PATCH, DELETE)
- components/fids/ — flight board UI components
- components/admin/ — admin panel components
- store/flightsStore.ts — Zustand store with filters and selectors
- types/index.ts — Flight, FlightStatus, Airline, Terminal types
- lib/flights.ts — server-side read/write to data/flights.json
- data/flights.json — mutable flight data
- data/flights.seed.json — seed data for reset

## Workflow
- Dev server: npm run dev
- Typecheck: npm run typecheck
- Lint: npm run lint

## Constraints
- Never modify data/flights.seed.json (seed data for reset)
- Do not install new dependencies without asking first
- API routes return NextResponse.json(), not raw Response
- All flight data mutations go through lib/flights.ts (readFlights/writeFlights)

## Architecture
- API routes in app/api/ handle HTTP (thin controllers)
- Business logic lives in lib/ (server-side only, uses fs)
- Client state in store/flightsStore.ts — single Zustand store
- Components are client ('use client') or server (default) — don't mix

## Spec / Handoff

- Keep `ai/spec.md` updated during multi-step work.
- Before running `/compact`, update `ai/spec.md`.
- After any meaningful code change, update `ai/spec.md` with:
  - current goal,
  - decisions made,
  - files changed,
  - tests run or still needed,
  - risks,
  - next step.
- Do not rely only on conversation history for architectural decisions.

## Codex Subagent Strategy

Use subagents to split analysis and implementation into isolated, focused tasks.

Available project agents:
- `reviewer-agent` — read-only review agent for correctness, security, validation, regressions, maintainability, and missing tests.
- `test-agent` — test-focused implementation agent. It may edit only test-related files and helpers.

Rules:
- Use `reviewer-agent` before risky changes, PR review, security-sensitive code, or production-impacting changes.
- Use `test-agent` after the implementation plan is clear, preferably after reviewer findings are known.
- Do not let multiple write-capable agents edit the same files in one run.
- Prefer read-only agents for exploration and review.
- Prefer Git Worktrees for parallel implementation.
- Every implementation flow should finish with: typecheck, lint, tests, and a summary of changed files.

Example prompt:
"Spawn reviewer-agent and test-agent as separate subagents. reviewer-agent should review the changed code read-only. test-agent should inspect existing tests and propose or add missing tests only in test files. Wait for both results and summarize merge-blocking risks."
