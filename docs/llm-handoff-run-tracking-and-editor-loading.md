# LLM handoff: Run tracking + Monaco loading UI

Give this document to an LLM (or developer) to implement the following. **Do not assume prior context**—everything needed is below.

---

## Goal A: White “Loading…” in the code editor

### Problem

The Monaco editor from `@monaco-editor/react` shows a default loading placeholder (often “Loading…”) while the Monaco bundle loads. On the dark editor background (`#1E1E1E`), that text can be hard to read or wrong color.

### Solution

In [`features/session/editor-panel.tsx`](../features/session/editor-panel.tsx), the `<Editor>` component from `@monaco-editor/react` supports a **`loading`** prop (React node) for the loading state UI.

- Pass a small inline element with **white text**, e.g. `className="text-white text-sm"` (or equivalent Tailwind), so the placeholder is readable on dark background.
- Keep it minimal: text only or text + optional spinner; do not block editor behavior.

### Verification

- Open a session page; during initial Monaco load, the loading placeholder should appear in **white**.

---

## Goal B: Track code runs in Postgres (minimal rows, non-blocking)

### Business reason

Track who ran code and in which session, over time, to estimate OneCompiler usage and subscription needs. **Do not store source code or terminal output** in this table—only metadata— to save space and keep inserts fast.

### Recommended table: `code_runs`

| Column        | Type            | Notes |
|---------------|-----------------|--------|
| `id`          | `UUID` PK       | `gen_random_uuid()` default |
| `session_id`  | `UUID` NOT NULL | FK → `sessions(id)` ON DELETE CASCADE |
| `user_id`     | `UUID` NOT NULL | FK → `users(id)` ON DELETE CASCADE |
| `language`    | `session_language` NOT NULL | Reuse existing enum from migrations (see `sessions` table) |
| `created_at`  | `TIMESTAMPTZ` NOT NULL DEFAULT `now()` | For time-series / billing analytics |

**Indexes (suggested):**

- `(session_id, created_at)` for per-session history
- `(created_at)` for global counts over time
- Optional: `(user_id, created_at)` if you filter by user often

**Why not store `content` or stdout/stderr?**

- Not required for “how many runs / who / when / which language.”
- Large TEXT columns bloat the DB and slow inserts.
- If debugging is needed later, add a separate opt-in table or logging pipeline.

### Migration

- Add a new file under [`codesesh-api/migrations/`](../../codesesh-api/migrations/) (repo root sibling of `codesesh-frontend`) with a **timestamp prefix** matching existing style (e.g. `YYYYMMDDHHMMSS_create_code_runs.sql`).
- Ensure `session_language` enum in DB matches frontend languages (note: older migrations may list `erlang`; if the app removed Erlang, align enum usage with current `SessionLanguage` in Rust models—do not reference removed variants in new code).

---

## Backend (Rust): `POST /api/runs`

### Behavior

- **Body (JSON):** `{ "session_id": "<uuid>", "user_id": "<uuid>", "language": "<session_language string>" }`
- **Action:** `INSERT` one row into `code_runs`.
- **Response:** `201 Created` with minimal JSON (e.g. `{ "id": "<uuid>" }`) or empty body; errors return `4xx/5xx` with a short message.

### Validation

- Reject invalid UUIDs, unknown `language` values (must map to `SessionLanguage` / DB enum).
- Optionally verify `session_id` exists in `sessions` and `user_id` exists in `users` (simple `EXISTS` queries) to avoid orphan rows—trade-off: extra round-trips vs. strictness. **Minimum acceptable:** FK constraints on INSERT (DB will reject bad IDs).

### Implementation pattern (match repo)

- New repository module, e.g. [`codesesh-api/src/repositories/run_repo.rs`](../../codesesh-api/src/repositories/run_repo.rs), with `insert(pool, ...) -> Result<Uuid, sqlx::Error>` (or similar).
- Export in [`codesesh-api/src/repositories/mod.rs`](../../codesesh-api/src/repositories/mod.rs).
- Handler in [`codesesh-api/src/handlers/`](../../codesesh-api/src/handlers/) (new file or existing module—follow project conventions).
- Register route in [`codesesh-api/src/routes.rs`](../../codesesh-api/src/routes.rs) under the same `/api` prefix as other REST routes.
- Use existing `AppState` / `PgPool` pattern; follow existing error/response helpers in the codebase.

### Auth / abuse

- The original design assumed internal tracking from the **Next.js server** (trusted caller). If the endpoint is public, document that it could be spammed; optional follow-ups: shared secret header, rate limit, or only allow server-side IP. **For this task**, implement the endpoint as the rest of the public API does unless the codebase already has a pattern for internal keys.

---

## Frontend: Next.js run route — fire-and-forget to Rust

### File

[`app/api/run/route.ts`](../app/api/run/route.ts)

### Request body extension

Clients should send (in addition to existing `code` and `language`):

- `session_id` — string UUID of the session
- `user_id` — string UUID of the user running code

If either is missing, **still run code** (OneCompiler path unchanged); only skip the tracking `fetch` when IDs are absent.

### Non-blocking requirement (critical)

The tracking call **must not** delay the response to the client, whether OneCompiler succeeds, fails, or is slow.

**Pattern:**

1. Parse JSON as today.
2. Run OneCompiler and build the JSON response as today (main path).
3. **After** you have everything needed to return (or in parallel **before** `return`, but without awaiting in the critical path), start a **fire-and-forget** HTTP request to the Rust API:

   - Use `fetch(`${base}/api/runs`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id, user_id, language }) })`
   - **Do not `await`** this `fetch` in a way that blocks returning `NextResponse`.
   - Chain `.catch(() => {})` (or void the promise) so unhandled rejections do not crash the route handler.

**Base URL:**

- Use the same base as the rest of the app: `process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"` (see [`next.config.ts`](../next.config.ts) rewrites—server-side `fetch` may need the **direct** backend URL, not the browser-relative path).

### Order of operations (recommended)

- Option A: `void` fire-and-forget **before** awaiting OneCompiler (tracking runs in parallel with execution)—fastest overlap; tracking failure does not affect run.
- Option B: fire-and-forget **after** OneCompiler resolves but **without awaiting** the tracking `fetch`—tracking never affects latency of OneCompiler; slightly less parallel.

Either satisfies “never block the main run result.”

---

## Frontend: Caller of `/api/run`

### File to update

[`features/session/session-page.tsx`](../features/session/session-page.tsx) (or wherever `runCode` POSTs to `/api/run`).

### Change

- Include `session_id` (from route/context—likely `sessionId` or `ctx.sessionId`) and `user_id` (from user store) in the JSON body of the run request.

### Types

- Ensure request payload types (if any) include optional or required `session_id` / `user_id`.

---

## Documentation / env

- Update [`.env.example`](../.env.example) if a new server-only var is introduced (only if you add something beyond `NEXT_PUBLIC_API_URL`).
- Optionally add a short note in [`onecompiler-smoke-tests.md`](onecompiler-smoke-tests.md) that runs are logged when IDs are present.

---

## Verification checklist

1. **Editor:** Loading placeholder is white on dark background.
2. **Run:** Executing code still returns stdout/stderr/exitCode as before.
3. **DB:** After a run with valid `session_id` + `user_id`, a row appears in `code_runs` with correct `language` and `created_at`.
4. **Latency:** Artificially slow the Rust `/api/runs` endpoint (e.g. sleep)—the run API response time should **not** wait on that delay (fire-and-forget).
5. **Missing IDs:** Run without `session_id`/`user_id` still executes code; no crash; no insert (or skip insert).

---

## Files likely touched (reference)

| Area | Paths |
|------|--------|
| Monaco loading | `codesesh-frontend/features/session/editor-panel.tsx` |
| Run API + tracking | `codesesh-frontend/app/api/run/route.ts` |
| Run caller | `codesesh-frontend/features/session/session-page.tsx` |
| Migration | `codesesh-api/migrations/*_create_code_runs.sql` |
| Repo | `codesesh-api/src/repositories/run_repo.rs`, `mod.rs` |
| Handler + routes | `codesesh-api/src/handlers/*`, `codesesh-api/src/routes.rs` |
| Models / DTOs | `codesesh-api/src/models/*`, `codesesh-api/src/dto/*` if project uses them for request bodies |

Paths are relative to the monorepo root unless noted.

---

## Explicit non-goals

- Do not store full source code or terminal output in `code_runs` unless product requirements change.
- Do not `await` the tracking HTTP call in the Next.js route in a way that blocks the OneCompiler response.
- Do not remove or break OneCompiler error handling for missing API key or network errors.
