# PesZO — Agent Instructions

## Project Overview

PesZO is a financial life simulator — a serious game
in the EdTech space that teaches personal finance,
investing, accounting, and economics through
randomized scenarios and mathematically-grounded
consequences. No real money is involved.

## Tech Stack

Frontend: React + TypeScript + Vite + Tailwind CSS + shadcn/ui + TanStack Query + TanStack Table + Zustand + React Hook Form + Zod + Recharts + React Router v6 + Axios

Backend: Node.js + Express + TypeScript + Prisma + PostgreSQL + Redis + BullMQ + Winston + Argon2id + JWT + Zod

Simulation: Python + FastAPI

Hosting: Railway (backend) + Vercel (frontend)
CI/CD: GitHub Actions
Secrets: Doppler — never .env files
IaC: Terraform

## Project Structure

Two separate repos:
peszo-api/ — Express backend
peszo-web/ — React frontend

## Eight Core Modules

1. Auth
2. Player
3. Budget
4. Portfolio
5. Liabilities
6. Markets
7. Simulation
8. Quests

Build order (dependency-correct):
Auth → Player → Markets → Budget →
Liabilities → Portfolio → Simulation → Quests

## Architecture Rules — STRICT

### Modular Monolith Boundaries

RULE: Modules never touch each other's database
tables directly. Ever.

CORRECT:
budget.service.ts calls PlayerService
portfolio.service.ts calls MarketsService

WRONG — never do this:
budget.service.ts imports prisma and queries
the players table directly
portfolio.service.ts copies a markets query

### Backend Folder Structure Per Module

Every module has exactly these files:
[module].routes.ts — URL paths only
[module].controller.ts — request/response only
[module].service.ts — business logic + DB
[module].schema.ts — Zod validation schemas
[module].types.ts — TypeScript types
[module].test.ts — tests

### Error Handling

ALWAYS use next(error) in controllers.
NEVER try/catch and send response in a controller.
NEVER swallow errors silently.
AppError class is in src/utils/response.ts.
Use it for all known errors with a statusCode.

### Validation

ALL request bodies validated with Zod schema
before reaching the controller.
Schemas live in [module].schema.ts.
Use the validate middleware from
src/middleware/validate.middleware.ts.

### Authentication

JWT access token — 15 minute expiry.
JWT refresh token — 7 day expiry in httpOnly cookie.
Auth middleware lives in
src/middleware/auth.middleware.ts.
Apply to ALL routes except /auth/register
and /auth/login.

### Passwords

ALWAYS use Argon2id from src/utils/password.ts.
NEVER use bcrypt, MD5, SHA256, or any other
hashing algorithm.

### Secrets

NEVER hardcode secrets.
NEVER create .env files.
ALL secrets come from Doppler via environment
variables read in src/config/env.ts.
env.ts validates ALL env vars with Zod at startup.
If a required env var is missing — fail fast,
exit process, log which variable is missing.

### Logging

NEVER use console.log in production code.
ALWAYS use the Winston logger from src/lib/logger.ts.
ALL log output must be structured JSON.
EVERY log line must include requestId when
inside a request context.

### Database

ALL database calls happen in service layer only.
NEVER call Prisma from a controller or route file.
ALL Prisma calls must receive a context object
for cancellation support.
Log slow queries — anything over 100ms is a warning.

### API Responses

ALL responses use the successResponse helper
from src/utils/response.ts.
Response shape is always:
{ success: boolean, data: T, timestamp: string }
NEVER return raw Prisma objects directly.
Strip sensitive fields (password, tokens)
before returning.

## Frontend Rules — STRICT

### Design System

Carbon and gold design system. Never deviate.

Colors — use Tailwind tokens only, never raw hex:
bg-base #0C0A08 — page background
bg-surface1 #141210 — cards
bg-surface2 #1C1917 — elevated elements
text-primary #F5F0E8 — warm white
text-secondary #8C8680 — secondary text
text-muted #4C4844 — disabled
gold #C9A84C — ONE accent only

Typography — strictly enforced:
Space Grotesk — headings only (font-heading)
Inter — body and labels (font-body)
JetBrains Mono — ALL numbers, ALL percentages,
ALL peso amounts (font-mono)
NO EXCEPTIONS

Border radius:
0px — all data elements, metric cards, tables
4px — buttons, inputs, nav items (rounded-sm)
6px — quest cards, larger panels (rounded-md)

NEVER use:
Pure black #000000 anywhere
Blue or purple accents
Gradients
Box shadows (borders define elements)
Rounded corners beyond 6px on any element

### State Management

Server state (API data) → TanStack Query ONLY
Client state (UI behavior) → Zustand ONLY
NEVER mix these two.
NEVER put API response data in Zustand.
NEVER use useEffect to fetch data — use useQuery.

### Component Rules

Components either fetch OR display. Never both.
Container component — calls useQuery, passes data down.
Display component — receives props, renders only.
Design system components — pure UI, no data knowledge.

### Forms

React Hook Form + Zod resolver ALWAYS.
NEVER controlled inputs with useState for forms.
Zod schema in [module]/schemas/[name].schema.ts.

### API Calls

ALL API calls go through src/lib/axios.ts instance.
NEVER use fetch directly.
NEVER import axios and create a new instance.
ONE axios instance for the entire app.

### Component Primitives — Base UI

shadcn v4 (July 2026) defaults to Base UI as its headless
component primitive library, replacing Radix. This project
was initialized with shadcn v4's default (style: "base-nova"),
so Base UI is the active primitive.

Practical implication: every `shadcn add <component>` will
pull in `@base-ui/react/*` imports, not `@radix-ui/react-*`.

This was a tool default at init time, not a deliberate
project choice, but has been accepted going forward.
Base UI is stable (1.6.0+), actively maintained by the
same team that built Radix, and is now the recommended
default in shadcn's own docs.

If a future component needs Radix instead (e.g., a Radix-only
component not yet ported to Base UI), that requires either
reinitializing with `shadcn init -b radix` or manually
rewiring the component's imports. Flag this as a known
tradeoff, not a blocker. Both libraries coexist in
production — the only cost is two headless dependencies
for that one component.

### Advance Month

When player advances a month — invalidate ALL
TanStack Query caches immediately.
This is handled in src/hooks/useAdvanceMonth.ts.
NEVER manually refetch individual queries after
advancing a month.

## Naming Conventions

### Backend

Files: kebab-case (player-service.ts)
Classes: PascalCase (PlayerService)
Functions: camelCase (findPlayerById)
Constants: SCREAMING_SNAKE (MAX_RETRY_COUNT)
Errors: prefix Err (ErrPlayerNotFound)
Constructors: prefix New not applicable in TS

### Frontend

Components: PascalCase (MetricCard.tsx)
Hooks: prefix use (usePlayer.ts)
Stores: suffix Store (auth.store.ts)
API files: suffix api (player.api.ts)
Schema files: suffix schema (player.schema.ts)
Type files: suffix types (player.types.ts)

## Code Quality Rules

NEVER vibe code. Every line must be understood.
NEVER copy code without explaining what it does.
ALWAYS handle the error case — no silent failures.
ALWAYS add TypeScript types — no implicit any.
NEVER use // @ts-ignore or // @ts-expect-error
without a detailed comment explaining why.
ALWAYS validate inputs before processing.
NEVER trust client input.

### Comment Rules — Strict

Comments explain WHY, never WHAT.
The code already says what it does.
The comment explains the decision behind it.

WRONG — restating the code:
// loop through users
for (const user of users) {

// hash the password
const hashed = await hashPassword(password)

// return 404 if not found
if (!player) return res.status(404)

WRONG — AI filler with emojis:
// 🔒 protect this route
// ✅ validate input here
// 🚀 send response

WRONG — vague non-information:
// handle error
// important!
// TODO: fix this later

RIGHT — explains a non-obvious decision:
// Argon2id over bcrypt because it's memory-hard,
// making GPU-based attacks significantly more expensive
const hashed = await hashPassword(password)

// deliberately vague — never tell an attacker
// whether the email or password was wrong
throw new AppError('Invalid credentials', 401)

// 15 minute expiry forces frequent rotation
// without being disruptive to active sessions
const accessToken = jwt.sign(payload, secret, {
expiresIn: '15m'
})

// monthly tick only — not real-time — because
// PesZO teaches long-term investing behavior,
// not short-term trading reactions
await marketsService.tickAllAssets(simulationMonth)

// pgxpool over single connection because handlers
// run concurrently and a single connection would
// serialize all database requests under load
const pool = await pgxpool.connect(dsn)

Rules:

- No emojis in comments — ever, no exceptions
- No comments that restate what the code does
- Comment the WHY behind non-obvious decisions
- Comment security decisions and their reasoning
- Comment performance tradeoffs
- Comment business logic that isn't self-evident
- Exported functions get a JSDoc comment
  explaining what it does and its parameters
- One blank line before a comment block
- Never end a comment with an exclamation mark

## Git Rules

Commit message format:
feat(module): description
fix(module): description  
 chore(module): description
docs(module): description

Examples:
feat(auth): add refresh token rotation
fix(budget): correct monthly expense calculation
chore(prisma): add markets migration

NEVER commit:
node_modules
.env files
dist or build folders
Prisma migration lock conflicts

## Before Every Task

Before writing any code, confirm:

1. Which module does this belong to?
2. Is this logic controller-level or service-level?
3. Is the Zod schema defined?
4. Does this route need auth middleware?
5. Am I calling another module's service
   or its database directly?
6. What does this return on error?
7. Am I logging with Winston not console.log?
