# web-tales-backend

REST API for the **Web Tales** blogging platform — user accounts with JWT auth,
stories, AI-generated summaries, and categories. Built on Express 5 + TypeScript
with Prisma + PostgreSQL and fully documented through Swagger UI at `/api-docs`.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Project layout](#project-layout)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Available scripts](#available-scripts)
- [API documentation](#api-documentation)
- [Authentication](#authentication)
- [API endpoints](#api-endpoints)
- [Request validation](#request-validation)
- [Error handling](#error-handling)
- [Database](#database)
- [Architecture](#architecture)
- [License](#license)

---

## Features

- **Email + password auth** with bcrypt hashing and signed JWT access tokens.
- **Email confirmation** flow on signup with single-use, time-limited tokens.
- **Two-step password change** — request a change, then confirm with a token
  emailed to the user. Rate-limited to prevent abuse.
- **Stories CRUD** with pagination, search, and category filtering.
- **AI-generated summaries** for stories — generated on demand and re-generatable
  via `?regenerate=true`. Rate-limited.
- **Categories** for tagging stories, exposed as a compact `CategoryRef`
  embedded inside stories for fast reads.
- **Role-based authorization** — `ADMIN` vs `USER`. Admin-only endpoints are
  clearly marked with a lock icon in the Swagger UI.
- **Soft-delete** on users via a `deletedAt` column.
- **Standardized error envelope** for every non-2xx response.
- **Interactive API documentation** at `/api-docs` powered by OpenAPI 3.0.3 and
  Swagger UI with the `Try it out` explorer.

---

## Tech stack

| Layer            | Choice                                          |
| ---------------- | ----------------------------------------------- |
| Runtime          | Node.js (ESM, `"type": "module"`)               |
| Framework        | Express 5                                       |
| Language         | TypeScript 6                                    |
| ORM              | Prisma 6 + `@prisma/adapter-pg`                 |
| Database         | PostgreSQL                                      |
| Auth             | `jsonwebtoken` (HS256) + `bcrypt`               |
| Validation       | `zod` via a custom `validateMiddleware`         |
| File uploads     | `multer`                                        |
| Rate limiting    | `express-rate-limit`                            |
| Email            | `nodemailer` (HTML templates in `src/templates`) |
| API docs         | `swagger-jsdoc` + `swagger-ui-express` + `js-yaml` |
| Lint / format    | ESLint 10 + Prettier 3 + Husky + lint-staged    |
| Test runner      | Jest                                            |

---

## Project layout

```text
.
├── api.http                  # Ready-to-run REST Client requests
├── prisma/
│   ├── schema.prisma         # User, Story, Category, ...
│   ├── seed.ts               # Seed script (npm run prisma:seed)
│   └── migrations/           # Versioned Prisma migrations
├── src/
│   ├── app.ts                # Express app composition (middlewares + routes)
│   ├── server.ts             # Bootstraps the HTTP listener
│   ├── config/
│   │   ├── env.ts            # Validated env loader
│   │   ├── email.ts          # Nodemailer transport
│   │   ├── prisma.ts         # Prisma client singleton
│   │   ├── swagger.ts        # Builds the OpenAPI spec from YAML fragments
│   │   ├── swagger-spec.ts   # Re-exports the spec for the docs route
│   │   └── openapi.json      # Generated OpenAPI 3.0.3 artifact (regenerated on `npm run swagger`)
│   ├── controllers/          # HTTP handlers — one file per resource
│   ├── services/             # Business logic
│   ├── repositories/         # Prisma data access
│   ├── routes/               # Express routers (one per resource)
│   ├── middleware/           # auth, authorize, validate, rate-limit, error
│   ├── schemas/              # Zod request schemas
│   ├── dtos/                 # Zod response schemas
│   ├── constants/            # Pagination, rate-limit, status-code, role enums
│   ├── types/                # Shared TypeScript types + Express augmentation
│   ├── utils/                # emailTokenGenerator, errorFormatters, ...
│   ├── templates/            # emailConfirmation.html, passwordChange.html, passwordChanged.html
│   ├── common/errors.ts      # AppError hierarchy (NotFoundError, UnauthorizedError, ...)
│   └── docs/                 # YAML fragments that compose the OpenAPI spec
│       ├── components/       # schemas / parameters / requestBodies / responses / security / tags
│       └── paths/            # One YAML file per resource (auth, users, profile, stories, ...)
└── package.json
```

---

## Quick start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables** — fill in real values for `DATABASE_URL`,
   `JWT_SECRET`, and the SMTP credentials. See
   [Environment variables](#environment-variables).

3. **Apply migrations and (optionally) seed**

   ```bash
   npx prisma migrate dev
   npm run prisma:seed   # if a seed script is configured
   ```

4. **Generate the OpenAPI spec** (also runs automatically before `npm start`)

   ```bash
   npm run swagger
   ```

5. **Run the dev server** with hot reload

   ```bash
   npm run dev
   ```

6. **Open the docs**

   Visit <http://localhost:3000/api-docs>.

   Or send raw requests from `api.http` using the VS Code
   [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension.

---

## Environment variables

All variables are validated by `src/config/env.ts` at boot.

| Variable           | Required | Description                                                                 |
| ------------------ | -------- | --------------------------------------------------------------------------- |
| `NODE_ENV`         | No       | `development` \| `production` \| `test`. Controls error-stack verbosity.   |
| `PORT`             | No       | HTTP port. Defaults to `3000`.                                             |
| `DATABASE_URL`     | **Yes**  | PostgreSQL connection string used by Prisma.                                |
| `DB_HOST`          | **Yes**  | Database host.                                                              |
| `DB_USER`          | **Yes**  | Database username.                                                          |
| `DB_PASSWORD`      | **Yes**  | Database password.                                                          |
| `DB_NAME`          | **Yes**  | Database name.                                                              |
| `DB_PORT`          | **Yes**  | Database port.                                                              |
| `JWT_SECRET`       | **Yes**  | HS256 secret used to sign access tokens.                                    |
| `JWT_EXPIRES_IN`   | No       | Token lifetime. Accepts any `ms`/`jsonwebtoken` duration (e.g. `30d`, `12h`). |
| `SMTP_HOST`        | **Yes**  | SMTP host for sending confirmation + password-change emails.                |
| `SMTP_PORT`        | **Yes**  | SMTP port.                                                                  |
| `SMTP_USER`        | **Yes**  | SMTP username.                                                              |
| `SMTP_PASSWORD`    | **Yes**  | SMTP password.                                                              |
| `EMAIL_FROM`       | No       | Default `From:` address.                                                    |
| `AI_API_KEY`       | **Yes**  | API key for the AI provider used by `/stories/:id/summary`.                 |
| `CLIENT_URL`       | No       | Public URL used in confirmation + password-change links.                   |

---

## Available scripts

| Script                | What it does                                                            |
| --------------------- | ----------------------------------------------------------------------- |
| `npm run dev`         | Starts the dev server with `tsx watch` (hot reload).                    |
| `npm run build`       | Type-checks and emits to `dist/`.                                       |
| `npm start`           | Runs `npm run swagger` then `node dist/server.js`.                      |
| `npm run typecheck`   | `tsc --noEmit` — type-checks without emitting.                          |
| `npm run lint`        | ESLint over the whole repo.                                             |
| `npm run lint:fix`    | ESLint with `--fix`.                                                    |
| `npm run format`      | Prettier write.                                                         |
| `npm run format:check`| Prettier check (used in CI).                                            |
| `npm run swagger`     | Regenerates `src/config/openapi.json` from the YAML fragments.          |
| `npm test`            | Runs the Jest suite (sequential via `--runInBand`).                     |

---

## API documentation

The full, always-up-to-date reference lives in the app itself:

> **<http://localhost:3000/api-docs>**

The spec is composed from `src/docs/**/*.yaml` fragments:

- `components/schemas.yaml` — 23 reusable schemas (User, Story, Category, every
  error envelope, …).
- `components/parameters.yaml` — 11 reusable path/query parameters.
- `components/requestBodies.yaml` — request bodies for every write endpoint.
- `components/responses.yaml` — standardized error responses with proper headers
  (e.g. `Retry-After` on `429`).
- `components/security.yaml` — the `bearerAuth` HTTP-bearer JWT security scheme.
- `components/tags.yaml` — top-level tag metadata shown in the Swagger UI.
- `paths/*.yaml` — one file per resource (auth, users, profile, stories,
  categories, health).

After editing any YAML fragment run `npm run swagger` to refresh
`src/config/openapi.json`. The UI picks up the regenerated JSON automatically.

---

## Authentication

1. `POST /auth/signup` → creates a user and **emails a confirmation token**.
2. `GET /auth/confirm-email/{token}` → marks the email as verified.
3. `POST /auth/login` → returns `{ token, user }`. Save the `token`.
4. Send the token on every protected request:

   ```http
   Authorization: Bearer <token>
   ```

The middleware chain on protected routes is:

```
request → validateMiddleware → authMiddleware → authorizeMiddleware → controller
```

- `validateMiddleware` — Zod-validates `body` / `params` / `query` and attaches
  the parsed result on `req.validated.*`.
- `authMiddleware` — verifies the JWT and loads the user onto `req.user`.
- `authorizeMiddleware` — enforces roles (e.g. `ADMIN` for `/users/*`).

Tokens expire per `JWT_EXPIRES_IN` (default: 30 days). When a token expires the
client receives `401 UNAUTHORIZED` and must re-authenticate via `/auth/login`.

---

## API endpoints

| Method | Path                                  | Auth          | Description                                  |
| ------ | ------------------------------------- | ------------- | -------------------------------------------- |
| GET    | `/health/`                            | none          | Liveness probe. Returns `200` if healthy, `503` otherwise. |
| POST   | `/auth/signup`                        | none          | Register a new user.                         |
| POST   | `/auth/login`                         | none          | Exchange credentials for a JWT.              |
| GET    | `/auth/confirm-email/{token}`         | none          | Confirm an email address from a signup token. |
| POST   | `/auth/resend-confirmation`           | none          | Re-send the signup confirmation email.       |
| GET    | `/users/`                             | JWT + ADMIN   | Paginated user list with filters.            |
| GET    | `/users/{userId}`                     | JWT + ADMIN   | Fetch a single user by id.                   |
| PATCH  | `/users/{userId}`                     | JWT + ADMIN   | Update any user.                             |
| DELETE | `/users/{userId}`                     | JWT + ADMIN   | Soft-delete a user.                          |
| GET    | `/users/profile`                      | JWT           | Fetch the currently authenticated user's profile. |
| PATCH  | `/users/profile`                      | JWT           | Update the authenticated user's profile.     |
| POST   | `/users/change-password`              | JWT + rate-limit | Start the password-change flow.          |
| POST   | `/users/confirm-password-change`      | JWT + rate-limit | Confirm a password change with emailed token. |
| POST   | `/stories/`                           | JWT           | Create a story (optionally attach categories). |
| GET    | `/stories/`                           | none          | Paginated list of stories.                   |
| GET    | `/stories/{storyId}`                  | none          | Fetch a single story.                        |
| PATCH  | `/stories/{storyId}`                  | JWT + ownership | Update a story.                           |
| DELETE | `/stories/{storyId}`                  | JWT + ownership | Delete a story.                           |
| POST   | `/stories/{storyId}/summary`          | JWT + rate-limit | Generate (or regenerate) the AI summary.  |
| POST   | `/categories/`                        | JWT + ADMIN   | Create a category.                           |
| GET    | `/categories/`                        | none          | List categories.                             |
| PATCH  | `/categories/{categoryId}`            | JWT + ADMIN   | Update a category.                           |
| DELETE | `/categories/{categoryId}`            | JWT + ADMIN   | Delete a category.                           |

Every endpoint is documented in Swagger UI with examples, request/response
schemas, and the full set of error codes.

---

## Request validation

All write endpoints accept a Zod schema in `src/schemas/`. The shared
`validateMiddleware` infers the source (`body`, `params`, or `query`) from the
schema and stores the parsed value on `req.validated`. Handlers should read:

```ts
req.validated.body    // POST/PUT/PATCH payloads
req.validated.params  // /:id style path params
req.validated.query   // ?foo=bar query string
```

A failed validation produces:

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      { "field": "body.email", "message": "Invalid email address", "code": "invalid_string" }
    ]
  }
}
```

with HTTP status `400`.

---

## Error handling

All non-2xx responses share the same envelope:

```json
{
  "success": false,
  "error": {
    "message": "User not found",
    "code": "NOT_FOUND",
    "details": { "userId": "8f3c…" }
  }
}
```

- `code` — a stable, machine-readable identifier (e.g. `UNAUTHORIZED`,
  `VALIDATION_ERROR`, `NOT_FOUND`, `CONFLICT`, `TOO_MANY_REQUESTS`,
  `AI_SERVICE_ERROR`, `INTERNAL_SERVER_ERROR`).
- `details` — present only when useful (validation issues, rate-limit metadata).
  For 5xx responses, `details` is omitted in production for safety.
- `stack` — appended only when `NODE_ENV=development`.

Errors are raised by throwing instances of `AppError` subclasses from
`src/common/errors.ts`. `errorMiddleware` translates them into the envelope.

---

## Database

Schema lives in `prisma/schema.prisma` and is the source of truth. To create a
new migration after a schema change:

```bash
npx prisma migrate dev --name <short-descriptive-name>
```

Generated migrations are stored under `prisma/migrations/`. To seed local
data, run `npx prisma db seed`.

Highlights of the model:

- `User` has `role (ADMIN | USER)`, `email`, `username`, `password` (bcrypt),
  `joinDate`, and a soft-delete `deletedAt`.
- `Story` belongs to a `User`, may carry many `Category` rows through an
  implicit many-to-many table, and stores the AI-generated `sumary` (spelled
  that way in the DTO — historical name).
- `EmailVerificationToken` stores hashed signup and password-change tokens.

---

## Architecture

```
HTTP request
   │
   ▼
app.use(express.json + cors + rate-limiters)
   │
   ▼
routes/index.ts         ── mounts /auth, /users, /stories, /categories, /api-docs, /health
   │
   ▼
validateMiddleware      ── Zod-validates body / params / query
   │
   ▼
authMiddleware          ── JWT verification → req.user
   │
   ▼
authorizeMiddleware     ── role checks (USER / ADMIN)
   │
   ▼
controllers             ── thin HTTP adapters, no business logic
   │
   ▼
services                ── business rules, transactions
   │
   ▼
repositories            ── Prisma queries only
   │
   ▼
database (PostgreSQL)
```

Each layer is unit-testable in isolation. Controllers never touch Prisma
directly; services never throw raw `Response` objects; repositories never
import `express`.

---

## License

ISC — see [`package.json`](./package.json).