# AI Interviewer

An AI-powered technical interview platform. A candidate submits their GitHub (and LinkedIn) profile, and an AI interviewer conducts a real-time, voice-based technical interview over WebRTC using OpenAI's Realtime API — adapting its questions to the candidate's apparent experience level.

## How it works

1. Candidate submits their GitHub/LinkedIn URLs from the frontend form.
2. The backend scrapes the candidate's public GitHub repos for context and creates an `Interview` record in Postgres.
3. The frontend opens a WebRTC connection and streams microphone audio; OpenAI's Realtime API conducts the spoken interview using a system prompt tuned for CS/software engineering interviews (see [sideband.ts](apps/backend/src/external/sideband.ts)).
4. A companion WebSocket (`/transcript`) is intended to capture and persist the conversation transcript, feeding a scored result at the end.

## Architecture

Monorepo managed with [Turborepo](https://turborepo.dev/) and Bun workspaces.

```
apps/
  backend/    Express (REST) + Bun WebSocket server, Prisma/Postgres
  frontend/   Bun + React 19 + React Router + Tailwind + shadcn/ui
packages/
  eslint-config/       shared ESLint config
  typescript-config/   shared tsconfig bases
  ui/                  shared React component package
```

### Backend (`apps/backend`)

- Express app on port `3001`:
  - `POST /api/v1/pre-interview` — scrapes the candidate's GitHub repos and creates an `Interview` row.
  - `POST /api/v1/session/:interviewId` — exchanges SDP with OpenAI's Realtime API to start a voice session.
- Bun WebSocket server on port `8080`:
  - `/transcript` — intended to receive audio/transcript data per interview and relay it onward (currently a stub, see [Project status](#project-status)).
- Prisma models (`Interview`, `Message`, `ApiKeys`) backed by Postgres via `@prisma/adapter-pg`.

### Frontend (`apps/frontend`)

- Route flow: `/` (profile form) → `/interview/:id` (live voice interview) → `/result` (score/feedback).
- Captures microphone audio via `RTCPeerConnection` and plays back the model's voice response.

## Tech stack

- **Runtime/tooling:** Bun, TypeScript, Turborepo
- **Backend:** Express, Prisma ORM, PostgreSQL, `ws`, Zod, Axios
- **Frontend:** React 19, React Router 8, Tailwind CSS v4, shadcn/ui, sonner
- **AI/voice:** OpenAI Realtime API, Deepgram (transcription — integration in progress)

## Getting started

### Prerequisites

- [Bun](https://bun.com) >= 1.3.14
- PostgreSQL reachable at the `DATABASE_URL` you configure
- An OpenAI API key with Realtime API access
- A Deepgram API token (optional — not yet wired up)

### 1. Install dependencies

```bash
bun install
```

### 2. Configure environment

Create `apps/backend/.env`:

```
DATABASE_URL="postgres://postgres:postgres@localhost:5432/aiInterview"
OPENAI_API_KEY="sk-..."
DEEPGRAM_TOKEN="..."
```

This file is gitignored — never commit real keys.

### 3. Run database migrations

```bash
cd apps/backend
bunx prisma migrate deploy
```

### 4. Start the apps

From the repo root:

```bash
bun run dev
```

This runs every app's `dev` task via Turborepo — backend REST on `http://localhost:3001`, backend WebSocket on `ws://localhost:8080`, and the frontend dev server (see [apps/frontend/package.json](apps/frontend/package.json)).

## Scripts

Run from the repo root (fans out to all apps/packages via Turborepo):

| Command | Description |
|---|---|
| `bun run dev` | Start all apps in dev mode |
| `bun run build` | Build all apps/packages |
| `bun run lint` | Lint all apps/packages |
| `bun run check-types` | Typecheck all apps/packages |
| `bun run format` | Format `.ts`/`.tsx`/`.md` files with Prettier |

## Project status

This project is under active development. Known rough edges:

- **Transcript/Deepgram pipeline is disabled.** [transcript.ts](apps/backend/src/controllers/transcript.ts) has its forwarding logic commented out, and [deepgram.ts](apps/backend/src/external/deepgram.ts) is an empty stub.
- **SDP exchange between frontend and backend is commented out** in [Interview.tsx](apps/frontend/src/components/Interview.tsx) — the `/api/v1/session/:interviewId` call isn't currently wired up from the client.
- **Result page is a placeholder** ([Result.tsx](apps/frontend/src/components/Result.tsx)).
- **GitHub URL parsing doesn't validate malformed input yet** (see TODO in [index.ts](apps/backend/index.ts)).
- `httpConfig.ts` and `wsConfig.ts` in `apps/backend/src/config` are currently empty.
