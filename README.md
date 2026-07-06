<p align="center">
  <h1 align="center"><span style="color:#F5F0E8">Pes</span><span style="color:#C9A84C">Z</span><span style="color:#F5F0E8">O</span></h1>
</p>

<p align="center">
  <strong>Financial illiteracy is the most expensive tax you will ever pay.</strong>
</p>

<p align="center">
  <a href="https://github.com/HarveyPunsalan/PesZO/blob/main/LICENSE"><img src="https://img.shields.io/github/license/HarveyPunsalan/PesZO?style=flat-square" alt="License"></a>
  <img src="https://img.shields.io/badge/TypeScript-5.4-blue?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Node.js-20_LTS-green?style=flat-square&logo=node.js" alt="Node.js">
</p>

---

## What is PesZO

PesZO is a financial life simulator - a serious game that teaches personal finance, investing, accounting, and economics through randomized real-world scenarios and mathematically-grounded consequences.

No real money. No fake money either. PesZO uses real financial formulas to calculate real outcomes. The scenarios are randomized so you cannot memorize answers. Every decision has weight. Every consequence is earned.

The name comes from "pestering" + "zero balance" - because financial illiteracy pesters you and keeps you at zero.

## Why This Exists

Financial literacy is not taught in Philippine schools. Not properly. Not in a way that sticks. PesZO exists because:

- 78% of Filipino workers live paycheck to paycheck
- Most financial education is either too abstract (textbooks) or too dangerous (real trading)
- Gamification works - but only when the game respects the player's intelligence
- Simulations let people fail safely and learn from consequences without losing real money

PesZO is not a course. It is a game that happens to teach you everything your school did not.

## Features

**Quest-Based Learning System**
Decisions teach real financial concepts through consequences, not lectures. Every quest is a scenario. Every outcome is calculated. You learn by living through the math.

**Living Fake Market**
Six assets that tick forward monthly with realistic price behavior. Cola Coca Co., NovaTech Industries, Meridian Foods, Sovereign Bond Fund, PesoCoin, and Cash. Prices move. Dividends pay. Inflation erodes. Markets crash. You adapt.

**Randomized Scenarios**
Outcomes calculated by real financial formulas. You cannot memorize the answer key. Every playthrough is different. Every decision matters.

**Production-Grade Architecture**
Modular monolith with strict module boundaries. Not a weekend project. Built for scale, maintainability, and the day this needs to serve thousands of concurrent students.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query, TanStack Table, Zustand, React Hook Form, Zod, Recharts, React Router v6 |
| **Backend** | Node.js, Express, TypeScript, Prisma, PostgreSQL, Redis, BullMQ, Winston, Argon2id, JWT |
| **Simulation Engine** | Python, FastAPI |
| **Infrastructure** | Railway, Vercel, Cloudflare, GitHub Actions, Terraform, Doppler |
| **Observability** | Grafana, Sentry, Winston Structured Logging |

## Architecture

PesZO is a modular monolith. One deployable unit. Strict module boundaries enforced at the code level. Modules never touch each other's database tables directly - they communicate through service interfaces only.

This is not microservices. This is a monolith that is disciplined enough to scale.

```
peszo-api/
  src/
    config/         -- Environment validation, database, Redis
    lib/            -- Logger, shared utilities
    middleware/      -- Auth, validation, error handling
    modules/
      auth/         -- Registration, login, JWT rotation
      player/       -- Player profile, progression
      markets/      -- Asset prices, market simulation
      budget/       -- Income, expenses, cash flow
      liabilities/  -- Debts, loans, payments
      portfolio/    -- Holdings, buy/sell transactions
      simulation/   -- Monthly tick, event generation
      quests/       -- Quests, achievements, rewards
    types/          -- Shared TypeScript types
    utils/          -- Response helpers, password hashing
```

## The 8 Modules

Build order follows dependency rules. Each module is built only after its dependencies are complete.

| # | Module | Purpose | Dependencies |
|---|--------|---------|--------------|
| 1 | **Auth** | Registration, login, JWT access/refresh rotation | None |
| 2 | **Player** | Profile management, player state | Auth |
| 3 | **Markets** | Asset pricing, market data, price history | None |
| 4 | **Budget** | Income tracking, expense categories, cash flow | Player |
| 5 | **Liabilities** | Debts, loans, minimum payments, interest | Player |
| 6 | **Portfolio** | Asset holdings, buy/sell transactions, gains | Player, Markets |
| 7 | **Simulation** | Monthly tick, event generation, world state | All above |
| 8 | **Quests** | Quest definitions, completion tracking, rewards | All above |

## Getting Started

**Prerequisites**

- Node.js 20 LTS
- PostgreSQL 15+
- Redis 7+
- pnpm (recommended) or npm

**Setup**

```bash
# Clone the repository
git clone https://github.com/HarveyPunsalan/PesZO.git
cd peszo

# Install dependencies
cd peszo-api && pnpm install
cd ../peszo-web && pnpm install

# Set up environment variables
cp peszo-api/.env.example peszo-api/.env
# Configure DATABASE_URL, REDIS_URL, JWT_SECRET, REFRESH_TOKEN_SECRET

# Generate Prisma client
cd peszo-api && pnpm prisma:generate

# Run database migrations
pnpm prisma:migrate

# Start the backend
pnpm dev

# In a separate terminal, start the frontend
cd peszo-web && pnpm dev
```

The API runs at `http://localhost:3000`. The frontend runs at `http://localhost:5173`.

## Project Status

**Active Development**

PesZO is currently in active development. The backend scaffolding is complete. Module-by-module implementation is underway.

- Graduation target: April 2027
- Current phase: Backend module implementation
- Architecture: Production-ready, not yet deployed

## Author

**Harvey Punsalan**

3rd Year BSIT Student, Philippines

Building financial literacy tools that actually work. Not another budgeting app. A game that teaches you how money works.

---

<p align="center">
  <span style="color:#F5F0E8">Pes</span><span style="color:#C9A84C">Z</span><span style="color:#F5F0E8">O</span> - Financial illiteracy ends here.
</p>
