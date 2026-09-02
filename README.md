# TaskFlow — Collaborative Task Manager

A real-time collaborative task manager built with the PERN stack (PostgreSQL,
Express, React, Node) in TypeScript. Kanban board + list views, JWT cookie auth,
and live updates over Socket.io.

> **Security note:** an earlier commit of `backend/prisma/schema.prisma` contained
> a live PostgreSQL connection string. **That database credential must be rotated.**
> All configuration now comes from environment variables.

## Features

- **Auth** — register / login / logout with an HttpOnly JWT cookie; rate-limited
  credential endpoints; passwords hashed with bcrypt (cost configurable).
- **Tasks** — create, edit, delete, assign; priority + status enums; overdue
  highlighting.
- **Board view** — drag-and-drop Kanban (keyboard accessible) with optimistic
  status updates.
- **List view** — debounced search, status / priority / sort filters kept in the
  URL, pagination.
- **Realtime** — authenticated Socket.io connection; task create / update /
  assign / delete events pushed to the people involved.
- **UX** — light / dark / system theme, loading skeletons, accessible dialogs,
  error boundary, route-level code-splitting.

## Tech stack

| | |
|---|---|
| Frontend | React 19 + Vite 7, TypeScript, Tailwind v4, TanStack Query, React Hook Form + Zod, dnd-kit, Socket.io client |
| Backend | Node 22, Express 5, TypeScript, Prisma 5 + PostgreSQL, Socket.io, Zod, pino, Sentry (optional) |
| Tooling | Jest + Supertest, ESLint, Docker, GitHub Actions |

Architecture: **Controller → Service → Repository**, with Zod DTOs for
validation. See `backend/src/`.

## Prerequisites

- Node.js 22+ (`.nvmrc`)
- Docker (for local PostgreSQL) — or your own PostgreSQL 14+

## Getting started

```bash
# 1. Start PostgreSQL (host port 5433)
docker compose up -d db

# 2. Backend
cd backend
cp .env.example .env                 # then set a real JWT_SECRET
npm install
npm run prisma:migrate               # apply migrations
npm run dev                          # http://localhost:5000

# 3. Frontend (new terminal)
cd frontend
cp .env.example .env                 # optional; defaults work
npm install
npm run dev                          # http://localhost:5173
```

### Run the whole stack in Docker

```bash
docker compose --profile full up --build
# web  → http://localhost:8080
# api  → http://localhost:5000
```

## Environment variables (backend)

| Var | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `JWT_SECRET` | yes | ≥ 32 chars — the server refuses to boot otherwise |
| `CLIENT_URL` | no | comma-separated allowed origins (default `http://localhost:5173`) |
| `PORT` | no | default `5000` |
| `JWT_EXPIRES_IN` | no | default `7d` |
| `BCRYPT_ROUNDS` | no | default `12` |
| `SENTRY_DSN` | no | enables error reporting when set |
| `LOG_LEVEL` | no | pino level, default `info` |

Frontend: `VITE_API_URL` (default `http://localhost:5000/api`), optional
`VITE_SOCKET_URL`.

## Scripts

**Backend:** `npm run dev` · `build` · `start` · `start:migrate` · `typecheck` ·
`test` · `prisma:migrate` · `prisma:deploy` · `prisma:studio`

**Frontend:** `npm run dev` · `build` · `typecheck` · `lint` · `preview`

## Tests

```bash
cd backend
docker compose up -d db
npm run prisma:deploy          # against a *_test database
DATABASE_URL=postgresql://taskflow:taskflow@localhost:5433/taskflow_test npm test
```

Unit specs run without a database; the Supertest integration suite needs one.
CI (`.github/workflows/ci.yml`) provisions a Postgres service automatically.

## API

| Method | Path | Notes |
|---|---|---|
| `POST` | `/api/auth/register` | rate limited |
| `POST` | `/api/auth/login` | rate limited |
| `POST` | `/api/auth/logout` | |
| `GET` | `/api/auth/me` | auth |
| `GET` | `/api/auth/users` | auth — assignee picker |
| `GET` | `/api/tasks` | auth — `status`, `priority`, `search`, `sortBy`, `order`, `page`, `limit`; returns `{ data: { tasks }, pagination }` |
| `POST` | `/api/tasks` | auth |
| `PATCH` | `/api/tasks/:id` | auth — creator or assignee |
| `DELETE` | `/api/tasks/:id` | auth — creator only |
| `GET` | `/health` | checks the database |

### Socket.io events (server → client)

`task_created` · `task_assigned` · `task_updated` · `task_deleted` (`{ id }`).
The connection is authenticated from the JWT cookie; the room is the verified
user id (no client-supplied ids).

## Deployment

- **Backend** (Render / Railway / Fly): build `npm run build`, start
  `npm run start:migrate`. Set `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`,
  `NODE_ENV=production`. The app sets `trust proxy` for correct secure cookies.
- **Frontend** (Vercel / Netlify / nginx): build `npm run build`, output `dist`,
  set `VITE_API_URL` (and `VITE_SOCKET_URL` if the socket origin differs).

## Not yet done (follow-ups)

- Shared Zod schema package (frontend still redefines a few schemas/types).
- Projects / teams, task comments & activity log, notifications centre.
- Field-level update permissions (an assignee can currently edit any field).
- Prettier + pre-commit hooks; frontend component tests.
