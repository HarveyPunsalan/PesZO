# PesZO Backend Skill

Activate this skill for all backend work on the peszo-api project. This skill contains every specific decision already locked for PesZO. Never suggest alternatives to these decisions — they are final.

---

## Project Identity

PesZO is a financial life simulator — a serious game in the EdTech space. The backend is a modular monolith built with Express and TypeScript. It serves a React frontend and communicates with a Python FastAPI simulation engine.

---

## Tech Stack — Final, No Alternatives

- Runtime: Node.js
- Framework: Express + TypeScript
- Database: PostgreSQL via Prisma
- Cache: Redis via Upstash
- Queue: BullMQ
- Password hashing: Argon2id — never bcrypt, never SHA256, never MD5
- Validation: Zod — never Joi, never express-validator, never class-validator
- Logging: Winston — never Pino, never console.log
- Auth: JWT with refresh token rotation — never sessions, never cookies for access token
- Secrets: Doppler — never .env files, never hardcoded values
- HTTP client for simulation engine: Axios

---

## Eight Modules — Build in This Order

1. Auth
2. Player
3. Markets
4. Budget
5. Liabilities
6. Portfolio
7. Simulation
8. Quests

Each module depends on the ones before it. Never build out of this order.

---

## Folder Structure — Exact, Never Deviate

```
src/
  modules/
    auth/
      auth.routes.ts
      auth.controller.ts
      auth.service.ts
      auth.schema.ts
      auth.types.ts
      auth.test.ts
    player/
      player.routes.ts
      player.controller.ts
      player.service.ts
      player.schema.ts
      player.types.ts
      player.test.ts
    budget/
    portfolio/
    liabilities/
    markets/
    simulation/
    quests/
  middleware/
    auth.middleware.ts
    rate-limit.middleware.ts
    logger.middleware.ts
    error.middleware.ts
    validate.middleware.ts
    request-id.middleware.ts
  lib/
    prisma.ts
    redis.ts
    logger.ts
    bullmq.ts
    simulation-client.ts
  config/
    env.ts
    constants.ts
  types/
    express.d.ts
    index.ts
  utils/
    password.ts
    jwt.ts
    response.ts
    pagination.ts
    date.ts
  app.ts
  server.ts
```

Every module has exactly these five files: routes, controller, service, schema, types. Never add extra files inside a module without asking Harvey first.

---

## The Modular Monolith Rule — Most Important Rule

Modules never touch each other's database tables directly. Ever.

CORRECT — Budget module needs player data:
- budget.service.ts imports PlayerService
- calls playerService.findById(playerId)

WRONG — never do this:
- budget.service.ts imports prisma
- queries the players table directly

If a module needs data from another module it calls that module's service. Never reaches into the database layer of another module. This boundary is non-negotiable.

---

## Routes File Pattern

Routes files define URL paths only. No logic. No database calls. No conditions.

```typescript
import { Router } from 'express'
import { getPlayer, createPlayer } from './player.controller'
import { validate } from '../../middleware/validate.middleware'
import { authMiddleware } from '../../middleware/auth.middleware'
import { createPlayerSchema } from './player.schema'

const router = Router()

router.get('/:id', authMiddleware, getPlayer)
router.post('/', authMiddleware, validate(createPlayerSchema), createPlayer)

export default router
```

---

## Controller File Pattern

Controllers handle request and response only. No business logic. No Prisma calls. No conditions beyond checking if the service returned an error.

Always use next(error) — never try/catch and send a response yourself in a controller.

```typescript
import { Request, Response, NextFunction } from 'express'
import { findPlayerById, createNewPlayer } from './player.service'
import { CreatePlayerInput } from './player.types'

export async function getPlayer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const player = await findPlayerById(req.params.id)
    res.json(successResponse(player))
  } catch (error) {
    next(error)
  }
}

export async function createPlayer(
  req: Request<{}, {}, CreatePlayerInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const player = await createNewPlayer(req.body)
    res.status(201).json(successResponse(player))
  } catch (error) {
    next(error)
  }
}
```

---

## Service File Pattern

Services contain all business logic and all Prisma calls. This is the only layer that touches the database.

Use AppError for all known error cases. Never throw raw Error objects.

```typescript
import { prisma } from '../../lib/prisma'
import { AppError } from '../../utils/response'
import { CreatePlayerInput, Player } from './player.types'

export async function findPlayerById(id: string): Promise<Player> {
  const player = await prisma.player.findUnique({ where: { id } })

  if (!player) {
    throw new AppError('Player not found', 404)
  }

  return player
}

export async function createNewPlayer(input: CreatePlayerInput): Promise<Player> {
  const existing = await prisma.player.findUnique({
    where: { email: input.email }
  })

  if (existing) {
    throw new AppError('Email already registered', 409)
  }

  return prisma.player.create({ data: input })
}
```

---

## Schema File Pattern

Zod schemas validate every request body before it reaches the controller. The schema also exports the TypeScript type automatically — never define the same shape twice.

```typescript
import { z } from 'zod'

export const createPlayerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    monthlySalary: z.number().positive('Salary must be positive'),
    jobSituation: z.enum([
      'fresh_graduate',
      'employed',
      'freelancer',
      'business_owner'
    ]),
  })
})

export type CreatePlayerInput = z.infer<typeof createPlayerSchema>['body']
```

---

## Validation Middleware

Always use this middleware in routes files. Never validate manually inside a controller.

```typescript
import { Request, Response, NextFunction } from 'express'
import { AnyZodObject } from 'zod'

export function validate(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      next()
    } catch (error) {
      next(error)
    }
  }
}
```

---

## Error Handling

One global error handler in src/middleware/error.middleware.ts handles all errors. Every controller passes errors to next(error). Nothing else.

```typescript
import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { logger } from '../lib/logger'

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function errorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    })
  }

  if (error instanceof AppError) {
    logger.warn({
      requestId: req.requestId,
      error: error.message,
      statusCode: error.statusCode
    })
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
    })
  }

  logger.error({ requestId: req.requestId, error })
  return res.status(500).json({
    success: false,
    error: 'Internal server error',
  })
}
```

---

## Response Shape

Every successful response uses successResponse. Never return raw Prisma objects directly. Always strip sensitive fields like password before returning.

```typescript
export function successResponse<T>(data: T, message?: string) {
  return {
    success: true,
    message: message ?? 'Success',
    data,
    timestamp: new Date().toISOString(),
  }
}
```

---

## Authentication

Access token: 15 minute expiry — lives in memory on the frontend, sent as Bearer token.
Refresh token: 7 day expiry — lives in httpOnly cookie only, never accessible to JavaScript.

```typescript
import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'
import { AppError } from '../utils/response'

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('Missing token', 401))
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = verifyAccessToken(token)
    req.userId = payload.sub
    next()
  } catch {
    next(new AppError('Invalid or expired token', 401))
  }
}
```

Apply authMiddleware to every route except POST /auth/register and POST /auth/login.

---

## Password Hashing — Argon2id Only

Never use any other hashing algorithm. No exceptions.

```typescript
import argon2 from 'argon2'

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 2,
  })
}

export async function verifyPassword(
  plain: string,
  hashed: string
): Promise<boolean> {
  return argon2.verify(hashed, plain)
}
```

---

## Environment Variables

All environment variables validated with Zod at startup in src/config/env.ts. If any required variable is missing the server fails fast and logs exactly which variable is missing.

Never create .env files. All secrets come from Doppler.

```typescript
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  SIMULATION_ENGINE_URL: z.string().url(),
  SIMULATION_INTERNAL_KEY: z.string().min(16),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Missing or invalid environment variables:')
  console.error(parsed.error.format())
  process.exit(1)
}

export const env = parsed.data
```

---

## Logging — Winston Only

Never use console.log anywhere in the codebase. Always use the Winston logger from src/lib/logger.ts. All output must be structured JSON. Every log line inside a request context must include requestId.

```typescript
import winston from 'winston'
import { env } from '../config/env'

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
})
```

Correct usage:
```typescript
logger.info({ requestId: req.requestId, event: 'player_created', playerId: player.id })
logger.warn({ requestId: req.requestId, event: 'invalid_token' })
logger.error({ requestId: req.requestId, error, event: 'unexpected_error' })
```

Wrong — never do this:
```typescript
console.log('player created')
console.error(error)
```

---

## Request ID Middleware

Every request gets a unique ID attached. Every log line includes it. This is what makes debugging production issues possible.

```typescript
import { Request, Response, NextFunction } from 'express'
import { randomUUID } from 'crypto'

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.requestId = randomUUID()
  res.setHeader('X-Request-ID', req.requestId)
  next()
}
```

---

## Rate Limiting — Redis Backed

Two levels of rate limiting:
- Global: 100 requests per minute per IP on all routes
- Auth: 10 requests per minute per IP on /auth routes only

```typescript
import { Request, Response, NextFunction } from 'express'
import { redis } from '../lib/redis'
import { AppError } from '../utils/response'

export function rateLimit(maxRequests: number, windowSeconds: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `rate_limit:${req.ip}:${req.path}`
    const current = await redis.incr(key)

    if (current === 1) {
      await redis.expire(key, windowSeconds)
    }

    if (current > maxRequests) {
      return next(new AppError('Too many requests', 429))
    }

    next()
  }
}
```

---

## Prisma — Single Instance

One Prisma client for the entire app. Never instantiate PrismaClient more than once.

```typescript
import { PrismaClient } from '@prisma/client'
import { logger } from './logger'

const prisma = new PrismaClient()

prisma.$on('query' as never, (e: any) => {
  if (e.duration > 100) {
    logger.warn({
      event: 'slow_query',
      duration: e.duration,
      query: e.query,
    })
  }
})

export { prisma }
```

---

## Prisma Rules

Never call Prisma from a controller or route file. Only from service files.
Never use prisma db push on any environment — always use prisma migrate dev.
Never hand-edit a migration file that has already run.
Always run prisma generate after any schema change.
Always strip password field before returning user data.

---

## Simulation Engine Client

The Express backend communicates with the Python FastAPI simulation engine via HTTP. All calls go through this single client.

```typescript
import axios from 'axios'
import { env } from '../config/env'

export const simulationClient = axios.create({
  baseURL: env.SIMULATION_ENGINE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-Internal-Key': env.SIMULATION_INTERNAL_KEY,
  },
})
```

---

## App Setup Order

Middleware must be registered in this exact order in app.ts:

1. helmet() — security headers first
2. cors() — before any routes
3. express.json() — body parsing
4. requestIdMiddleware — before logger so every log has an ID
5. loggerMiddleware — after request ID
6. rateLimit(100, 60) — global rate limit
7. /health route — no auth required
8. /api/v1 routes — all feature routes
9. errorMiddleware — must be last, after all routes

---

## Graceful Shutdown

server.ts must handle SIGTERM and SIGINT. When Railway stops the container, finish in-flight requests before closing connections.

```typescript
async function shutdown(signal: string) {
  logger.info({ event: 'shutdown_initiated', signal })
  server.close(async () => {
    await prisma.$disconnect()
    await redis.quit()
    logger.info({ event: 'shutdown_complete' })
    process.exit(0)
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
```

---

## TypeScript Rules

Always use strict mode. Never use implicit any. Never use @ts-ignore without a detailed comment explaining exactly why. Always type function parameters and return values explicitly.

Extend Express Request type in src/types/express.d.ts:

```typescript
declare global {
  namespace Express {
    interface Request {
      userId?: string
      requestId: string
    }
  }
}
```

---

## Naming Conventions

Files: kebab-case — player.service.ts, auth.middleware.ts
Classes: PascalCase — PlayerService, AppError
Functions: camelCase — findPlayerById, hashPassword
Constants: SCREAMING_SNAKE_CASE — MAX_RETRY_COUNT
Errors: prefix with Err as variable names — ErrPlayerNotFound
Environment variables: SCREAMING_SNAKE_CASE — DATABASE_URL

---

## Comment Rules

Comments explain WHY, never WHAT. The code already says what it does.

Wrong — restating the code:
```typescript
// hash the password
const hashed = await hashPassword(password)

// return 404 if not found
if (!player) throw new AppError('Not found', 404)
```

Wrong — AI filler with emojis:
```typescript
// 🔒 protect this route
// ✅ validate input
```

Right — explains a non-obvious decision:
```typescript
// Argon2id over bcrypt because it is memory-hard,
// making GPU-based attacks significantly more expensive
const hashed = await hashPassword(password)

// deliberately vague — never tell an attacker
// whether the email or password was wrong
throw new AppError('Invalid credentials', 401)

// 15 minute expiry forces frequent rotation
// without being disruptive to active sessions
const accessToken = jwt.sign(payload, secret, { expiresIn: '15m' })
```

No emojis in comments. Ever. No exceptions.

---

## Git Commit Format

feat(module): description
fix(module): description
chore(module): description
docs(module): description

Examples:
feat(auth): add refresh token rotation
fix(budget): correct monthly expense calculation
chore(prisma): add markets migration

---

## Before Every Task

Before writing any code confirm these seven things:

1. Which module does this belong to?
2. Is this logic controller-level or service-level?
3. Is the Zod schema defined in the schema file?
4. Does this route need authMiddleware?
5. Am I calling another module through its service, not its database?
6. What does this return on error — am I using AppError?
7. Am I logging with Winston and including requestId?

---

## What to Never Do

- Never use console.log anywhere
- Never create .env files
- Never hardcode secrets or connection strings
- Never call Prisma from a controller or route file
- Never touch another module's database table directly
- Never use bcrypt, SHA256, or MD5 for passwords
- Never use Joi or class-validator — only Zod
- Never return raw Prisma objects — always strip sensitive fields
- Never use @ts-ignore without explaining why in a comment
- Never run prisma db push
- Never hand-edit a migration that already ran
- Never add emojis to comments or log messages
