---
name: doctor
description: Diagnose why the STH connector shows no tools, or fewer than expected.
---

Diagnose this member's STH connector access.

1. List the tools you can actually see from the `sth` server. Report the names.
2. Compare against the full set: `library_search`, `library_get`,
   `library_save`, `asset_search`, `asset_get`, `capabilities_get`.
3. Call `capabilities_get` — it is the cheapest authenticated call and touches
   no organization data, so it separates "not authenticated" from "no access".
4. Report the most likely cause in plain words, without guessing beyond the
   evidence:
   - **No tools at all** — the connection is authenticated but unusable. That
     needs an active organization, a valid membership, the MCP connector enabled
     for that organization, and the `remote_mcp` capability. A blocked member
     also sees an empty toolbox.
   - **Read tools but no `library_save`** — the member's scope is read-only.
   - **All six** — access is fine; if something still fails, it is the call
     itself, not the permissions.
5. Point at the MCP settings page in the STH dashboard for anything an
   organization owner has to change.

Do not attempt to fix permissions yourself and do not retry a failing tool in a
loop.
