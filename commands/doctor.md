---
name: doctor
description: Diagnose why the STH connector shows no tools, or fewer than expected.
---

Diagnose this member's STH connector access.

1. Discover the STH tools available in this host, using its tool-discovery
   mechanism if available. Report the names actually found; do not invent or
   call a tool just because the plugin documentation lists it.
2. Compare against the full set: `library_search`, `library_get`,
   `library_save`, `asset_search`, `asset_get`, `capabilities_get`.
3. Only if `capabilities_get` is present, call it once. It reads compatibility
   information without reading library entries. Report success or the actual
   error; a successful call confirms only that this read works.
4. Explain the observed state without treating visibility as proof of access:
   - **No tools at all** — authentication and access are unverified. The
     connector may be absent, disabled, disconnected, or restricted. Start with
     the host-specific steps in
     [the connection guide](../skills/sth-library/reference/connection.md).
   - **Read tools but no `library_save`** — saving is unavailable in this
     session; read-only scope or a host restriction may be the cause. Do not
     attempt a save through another route.
   - **All six** — the expected tools are visible; report the read check
     separately. Do not perform a test write or claim that saving is verified.
5. If the connector is connected and enabled but tools remain unavailable,
   direct the user to their STH organization owner to check active organization,
   membership, the MCP connector setting, `remote_mcp` capability and member
   access. Report which checks remain unverified rather than guessing the cause.

Do not attempt to fix permissions yourself and do not retry a failing tool in a
loop.
