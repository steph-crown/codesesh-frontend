# [FILL: Project Name] — Build Plan

<!-- INSTRUCTIONS:
  Sections 1–6: YOU fill in manually
  Sections 7–9: CURSOR generates, YOU curate/edit
  Sections 10–12: Pre-filled, adjust if needed
-->

## 1. PM Prompt (verbatim)

CodeSesh is a frontend-only Next.js app for a realtime collaborative coding experience, inspired by Replit and LeetCode. It talks to a separate Rust WebSocket backend that manages in-memory rooms/sessions but this project only implements the browser UI. Core features: create a session with a username, share a session URL, real‑time Monaco-based code editing with LWW conflict resolution, live user cursors and presence, a connection indicator with semantic colors, and simple language selection for syntax highlighting.

## 2. Clarifications Received

- **Primary user:** Developers who want to pair program, demo collaboration, or interview candidates.
- **Core job-to-be-done:** Let two or more people edit code together in a browser with a fast, smooth, Replit-like editor experience.
- **Out of scope:** Backend implementation, persistence beyond localStorage, auth, file systems, audio/video.
- **Data source:** Live WebSocket API from a Rust backend (rooms live in memory on the server); no direct database access from this app.
- **Auth required:** No — users pick a display name per session; there is no login.
- **Production or prototype:** MVP-quality demo with solid UX and code quality, but no hard scalability or multi-region requirements.
- **Similar product:** Replit and LeetCode coding UIs, but scoped to a single shared file per session.
- **Priority screens:** Landing page, session list, individual session editor surface with presence + connection state.
- **Tests expected:** Nice to have (component-level where easy); working, polished UI is the priority.
- **Other constraints:** Frontend only, built with Next.js App Router, shadcn/ui, Tailwind, Monaco; primary brand color is `#ff3c00` (orange) and font is Figtree.

## 3. What I Am Building

CodeSesh is a Next.js frontend for a realtime collaborative code editor. A developer lands on `/`, enters a username, and either creates a new coding session or joins an existing one via session ID. When they create a session, the app generates a unique session ID, stores it in localStorage, and redirects them to a session list at `/sessions` where they can see and re-open past sessions they own. From the session list, they open an individual session page (e.g. `/sessions/xk7p2`) that loads a dark, Replit-style editor shell with Monaco, a language selector, live cursors, a user presence panel, and a connection indicator wired to the WebSocket backend.

## 4. What I Am NOT Building (v1 scope)

- Backend / API server (Rust WebSocket server is a separate project).
- Persistent database storage for sessions or documents (server state is in memory only).
- Authentication, authorization, or multi-tenant account management.
- File management (only a single document per session).
- Audio/video chat, screen sharing, or voice features.
- Full operational transform or CRDT implementation (we use Last-Write-Wins).
- Payment, billing, or subscription management.

## 5. Tech Stack

| Tool                                                  | Why                                                                                     |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Next.js (App Router) + React 18 + TypeScript (strict) | File-system routing, good DX, easy deployment and SSR/ISR if needed                     |
| Tailwind CSS                                          | Utility-first styling, fast iteration on layout + dark theme                            |
| shadcn/ui                                             | Accessible, headless-ish UI components as a base for our custom dark, Replit-like shell |
| `next/font` with Figtree                              | First-class font loading, no FOUT, Figtree as the single brand typeface                 |
| Monaco editor (`@monaco-editor/react` or similar)     | Mature, familiar code editor surface with good TypeScript support                       |
| React Query                                           | For HTTP APIs and any non-WebSocket async data, with caching and loading states         |
| Lightweight WebSocket client utilities                | Encapsulate connection/reconnect logic and message typing                               |
| Zustand (optional)                                    | ONLY IF we need shared client-side state across features beyond React Query caches      |
| Vitest + React Testing Library                        | ONLY IF time allows — smoke tests around core flows (landing → session → editor)        |

## 6. Design Tokens

> Design system: Figtree type, orange (#ff3c00) primary, dark Replit-like editor shell, content-first layout with generous whitespace and rounded surfaces.

| Token                      | Value                                                 | Usage                                                                                           |
| -------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Font Family                | `Figtree` (via `next/font`)                           | Used everywhere, from landing to editor shell. No other fonts.                                  |
| Primary                    | `#ff3c00`                                             | Primary CTAs, active states, focus rings, key highlights.                                       |
| Background (Shell)         | Near-black (`#020617` / Tailwind slate-950)           | Editor shell main background.                                                                   |
| Surface (Shell)            | `#111827`                                             | Panels, header bars, sidebars around the editor.                                                |
| Background (Landing)       | `#F3F4F6`                                             | Landing page background only (non-dark).                                                        |
| Card Surface               | `#0B1120` (shell) / `#FFFFFF` (landing)               | Cards, modals, popovers, and elevated surfaces.                                                 |
| Text Primary (Dark)        | `#F9FAFB`                                             | Main text in dark shell.                                                                        |
| Text Primary (Light)       | `#0A0A0A`                                             | Main text on landing page/light surfaces.                                                       |
| Text Muted                 | `#9CA3AF` (dark) / `#6B7280` (light)                  | Secondary text, captions, labels.                                                               |
| Semantic Success           | `#16A34A` (green)                                     | Connection “connected” indicator, success toasts.                                               |
| Semantic Warning           | `#FACC15` (yellow)                                    | Connection “reconnecting” indicator, soft warnings.                                             |
| Semantic Error             | `#DC2626` (red)                                       | Connection “disconnected” indicator, errors.                                                    |
| Button Radius              | `9999px` (full)                                       | All primary/secondary buttons (filled + outline).                                               |
| Input Radius (single-line) | `9999px` (full)                                       | Text inputs, selects, chips.                                                                    |
| Surface Radius             | `0.75rem` (~12px)                                     | Textareas, cards, popovers, dropdown menus, modals.                                             |
| Outline Button             | `1.5px` border, transparent bg, text/border `#ff3c00` | Secondary CTAs; on hover, add subtle orange-tinted background while keeping text/border orange. |
| Shadow                     | `very subtle` only                                    | Prefer 1px borders over heavy shadows.                                                          |
| Sizing Unit                | `rem`                                                 | ALL sizes in rem. No px in code. (1rem = 16px base)                                             |
| Spacing Scale              | Tailwind default (rem)                                | 1rem between elements, 1.5rem+ between sections.                                                |
| Design Language            | Replit/LeetCode-inspired, editor-first                | Dark workspace, strong typographic hierarchy, clear panel separation.                           |
| Icons                      | Line-style (HugeIcons)                                | No filled icons; keep them minimal.                                                             |

### Pencil / Design Tool Instructions

When prompting a design tool to create screens, ALWAYS include these tokens:

```
App: CodeSesh — frontend for realtime collaborative code editor.
Framework: Next.js + Tailwind + shadcn/ui.
Primary color: #ff3c00 (orange).
Shell: dark theme (Replit-like), background near-black (#020617), surfaces #111827.
Landing page: light background #F3F4F6 with white cards.
Font: Figtree everywhere, medium/semibold headings, regular body.
Buttons: fully rounded (100% border-radius), solid orange primary; outline variant with 1.5px orange border, transparent background.
Textareas, cards, popovers, modals: 0.75rem (12px) border-radius.
All sizing in rem units; spacing is generous with clear breathing room.
Editor: Monaco-like code editor centered in a dark workspace with side/top panels similar to Replit.
Style: minimal, content-first, no heavy gradients, subtle shadows, strong typography and contrast.
```

## 7. Folder Structure

<!-- 🤖 CURSOR GENERATES THIS — you curate/adjust -->

```
src/
  app/                              # Pages — mirrors route structure
    [FILL: page]/page.tsx           # [FILL: description]
    [FILL: page]/page.tsx           # [FILL: description]
    layout.tsx                      # Shared layout with navigation
  features/                         # Feature modules
    [FILL: feature-name]/
      components/                   # UI components for this feature
      hooks/                        # Custom hooks for this feature
      types/                        # TypeScript types
      constants.ts                  # Mock data, magic strings, config values
    [FILL: feature-name]/
      components/
      hooks/
      types/
      constants.ts
  components/                       # Shared/global components (Navbar, Footer, etc.)
  lib/                              # Utilities, helpers
  routes/                           # Route configuration
wireframes/                         # Pencil design files
  feature-1.pen                     # [FILL: what this wireframe shows]
  feature-2.pen                     # [FILL: what this wireframe shows]
```

## 8. Pages

| #   | Page                       | Route                   | Description                                                                                                       |
| --- | -------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 1   | Landing                    | `/`                     | Light-mode marketing/entry page with username input, “Create Session” CTA, and “Join Session” by ID.              |
| 2   | Session List               | `/sessions`             | Dark shell list of all sessions created on this browser (from localStorage) with buttons to create a new session. |
| 3   | Session Editor             | `/sessions/[sessionId]` | Replit-like dark editor shell with Monaco, language selector, presence, cursors, and connection indicator.        |
| 4   | (Stretch) Marketing / Docs | `/about` or similar     | Optional static page explaining the architecture and tech stack.                                                  |

## 9. Features (Build Order)

> Build in this exact order. Each feature gets: design → code → audit.

### Feature 1: Landing Page & Session Creation

**Wireframe:** `wireframes/feature-1.pen`
**Acceptance Criteria:**

- [ ] Landing page at `/` with Figtree font, light theme, hero section, username input, “Create Session” and “Join Session” buttons.
- [ ] Creating a session generates a unique session ID, saves it (and metadata) to localStorage, and navigates appropriately.
- [ ] If a user with existing sessions visits `/`, they are redirected to `/sessions`.
- [ ] Layout is responsive (mobile → desktop) and accessible (labels, keyboard navigation).

### Feature 2: Session List

**Wireframe:** `wireframes/feature-2.pen`
**Acceptance Criteria:**

- [ ] `/sessions` displays all sessions stored in localStorage with name, ID, and last-opened time.
- [ ] User can click a session to navigate to `/sessions/[sessionId]`.
- [ ] “New Session” button creates a new session and updates the list without full reload.
- [ ] Uses dark shell theme, respects design tokens, and works on mobile/tablet/desktop.

### Feature 3: Session Editor Shell (Frontend Only)

**Wireframe:** `wireframes/feature-3.pen`
**Acceptance Criteria:**

- [ ] `/sessions/[sessionId]` renders a dark, Replit-like editor shell with Monaco as the main surface.
- [ ] Includes language selector (TypeScript, Rust, JavaScript, Python, Go) that updates Monaco syntax highlighting only.
- [ ] Shows user presence panel (list of active users) and placeholders for live cursors + connection indicator.
- [ ] Layout is fully responsive and keyboard accessible; no real WebSocket wiring required for this step if backend is not ready.

### Feature 4 (stretch): Realtime Wiring & Presence Polish

**Wireframe:** `wireframes/feature-4.pen`
**Acceptance Criteria:**

- [ ] WebSocket events (text_change, full_sync, cursor_move, user_join/leave, room_state, error) are wired to the UI.
- [ ] Live cursors render as colored vertical bars with the user’s name next to them.
- [ ] Connection indicator uses semantic colors (green/yellow/red) and auto-reconnect with exponential backoff is visible in the UI.
- [ ] Error states and reconnect flows are clearly communicated without being noisy.

## 10. Security Constraints

<!-- ✅ PRE-FILLED — adjust only if the PM specified something different -->

- Sanitize all user-generated content before rendering (prevent XSS)
- No sensitive data in localStorage — sessionStorage max
- Validate all URL params — never trust route state directly
- CSRF: include token in form submissions if connected to API
- No hardcoded secrets, API keys, or credentials in client code

## 11. Engineering Constraints

<!-- ✅ PRE-FILLED — adjust only if the PM specified something different -->

- One component per file. No God components.
- All magic strings/values in constants.ts per feature
- Named exports only (except page/route files)
- No console.log in committed code
- All interactive elements: ARIA labels + keyboard navigable
- Mobile-first responsive
- No dangerouslySetInnerHTML
- All lists/tables must handle: loading, error, empty, and populated states

## 12. Out-of-Scope (Cursor: do NOT build these)

- Backend / API server logic (including room/session management and persistence).
- Authentication, authorization, or user accounts.
- Multi-file or multi-tab editor support.
- Payments, billing, or monetization.
- Audio/video, calls, or screen-sharing.
- Full-blown OT/CRDT engine — we stick to LWW semantics described in the backend PRD.

---

**Cursor: Read this entire file before generating any code.**
**Follow the design tokens in Section 6 for ALL styling decisions (Figtree + #ff3c00, dark shell, specified radii).**
**Build features in the exact order listed in Section 9.**
**Ask me if anything is unclear before you start building.**
