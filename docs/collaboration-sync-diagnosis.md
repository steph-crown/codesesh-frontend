# Session code & language sync — factual diagnosis

This document traces **actual code paths** in this repo (frontend + `codesesh-api`) to explain why one user can see new code after paste + language change + Run while another still sees old content/language, and why **refresh can show stale data for both**.

## Data paths (two different persistence stories)

| What | How it reaches other clients | How it reaches PostgreSQL |
|------|------------------------------|---------------------------|
| **Editor buffer** | WebSocket `text_change` → server applies delta to in-memory `ActiveSession.content` → `broadcast_except` to peers | **Not** on every keystroke. Buffered events are flushed on a **2s interval** (`ws_service.rs` `spawn_flush_loop`) via `session_repo::apply_content_and_increment_events` |
| **Language** | WebSocket `language_change` → `handle_language_change` updates in-memory `ent.language` + **`session_repo::update_language` immediately** | **Immediate** DB write for `sessions.language` |

So **language** and **content** can diverge in the database by design: language is updated right away; content is updated on the **next flush** (up to ~2s lag, or longer if flush fails).

## Symptom: “Run uses my paste; the other user sees old code”

**Run** reads the **local Monaco buffer** (`EditorPanel.getCode()` → `editor.getValue()`). It does **not** read server state. So the acting user always runs what they see locally.

The other user only updates from:

1. WebSocket `text_change` messages (deltas), or  
2. `full_sync` on (re)connect.

If the server’s in-memory `content` is incomplete or old, peers and DB-backed loads will be wrong.

## Root cause A — only the first Monaco change is sent (verified bug)

**File:** `features/session/editor-panel.tsx` — `onDidChangeModelContent`:

```ts
const ch = e.changes[0];
// ...
sendTextChange(range, ch.text, docVersionRef.current);
```

Monaco’s `e.changes` is an **array**. A single user action (paste, some refactors, multi-cursor edits, or tooling) can produce **multiple** ranges in **one** event. **Only `changes[0]` is sent.** Subsequent edits in the same event are **never** transmitted.

Effects:

- Local `setLocalContent(editor.getValue())` still has the **full** document → Run works.  
- Server applies **only** the first delta → in-memory session content is **wrong**.  
- Other clients only receive that one delta → **wrong** merged view.  
- Flush persists **wrong** server buffer → **refresh** shows old/partial code.

This alone matches “I pasted and ran; collaborator still sees the old buffer” without requiring two simultaneous editors.

## Root cause B — server rejects edits on version mismatch (no recovery)

**File:** `codesesh-api/src/services/ws_service.rs` — `handle_text_change`:

```rust
if delta.version != ent.version {
    let err = ws_err("VERSION_MISMATCH", "Editor version out of sync");
    broadcast::send_to(&mut ent, user.id, &err).await;
    return;
}
```

The server requires the client’s `version` on each `text_change` to match **`ent.version`** (linear history). If two clients send edits based on the **same** version (concurrent typing), the **second** is **rejected**. The edit is **not** applied on the server; **no automatic merge** and **no full resync** is implemented.

**File:** `contexts/session-context.tsx` — `error` messages only `console.warn` in development; there is **no** “request full_sync / overwrite local state” path.

So concurrent collaboration can leave **server memory and DB** behind one client’s local editor.

## Root cause C — refresh reads DB; content flush lags language

On page load, the session is loaded from REST (DB). After a language change:

- `sessions.language` may already be updated (immediate `update_language`).  
- `sessions.content` may still reflect the **last flush** (up to ~2s behind, or wrong if A/B above dropped edits).

That explains **“sometimes old code, sometimes old language”** after refresh: different columns, different write timing, and possible partial/wrong content if deltas were dropped or rejected.

## Summary table

| Observation | Factual explanation |
|-------------|----------------------|
| Run shows new code; other user sees old | Run = local Monaco; others = WS deltas from server buffer; server buffer can be incomplete (A or B). |
| Sometimes wrong language, sometimes wrong code | Language persisted immediately; content on flush timer; independent failure modes. |
| Both users refresh → still old | REST returns **DB**; if flush hadn’t written latest **correct** content, or writes were wrong (A/B), both see stale data. |
| TS2393 / editor quirks | Separate issue (Monaco TS worker + sync); not required to explain server/client document drift. |

## Language switch desync (specific pattern)

`EditorPanel` used `defaultValue` from **`initialContent` (= `session.content` from the first REST response)** and **`key={language}`**, which **remounts** Monaco on every language change.

`session.content` in React props **does not update** when User 1 pastes (only `ctx.content` / WS state does). So on language change User 1’s editor remounted with **stale** text; `onDidChangeModelContent` could then **broadcast edits** that **replaced** the live server buffer with that stale snapshot — User 2 still had the paste until that point, then diverged.

**Fix:** Prefer **`content` (live `ctx.content`)** over `initialContent` for `defaultValue`, and **remove `key={language}`** so language changes update Monaco’s `language` / `path` without wiping the buffer via a full remount.

## Mitigations implemented (repo)

1. **All Monaco `e.changes` in one transaction** are sent as sequential `text_change` messages with matching version bumps (`editor-panel.tsx`).
2. **`request_full_sync`** client message → server sends `full_sync` to that client only → recovers from **`VERSION_MISMATCH`** (linear version conflicts).
3. **On `language_change`**, server also persists **current in-memory `content`** to the DB (`apply_content_and_increment_events` with `event_delta = 0`) so language + buffer don’t diverge on refresh.
4. **Flush loop** interval reduced (500ms) so DB catches up quickly between flushes.

**Not solved here (by design):** true simultaneous editing from two users without conflicts needs **OT/CRDT**; until then, one rejected edit triggers resync and may overwrite local divergent state with server truth.

## References (code)

- Frontend: `features/session/editor-panel.tsx` (multi-change send), `contexts/session-context.tsx` (`VERSION_MISMATCH` → `request_full_sync`).  
- API: `codesesh-api/src/services/ws_service.rs` (`handle_text_change`, `handle_request_full_sync`, `handle_language_change`, `spawn_flush_loop`).  
- DB: `codesesh-api/src/repositories/session_repo.rs` (`apply_content_and_increment_events`, `update_language`).
