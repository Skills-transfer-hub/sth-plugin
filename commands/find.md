---
name: find
description: Search the team STH library and read back the item you pick.
---

Search the team's STH library for: $ARGUMENTS

1. Call `library_search` with the user's words as `query`. If they gave no
   argument, call it with no query to list what exists.
2. Show the matches as a short numbered list: kind, title, and provenance when
   present. Do not fetch bodies yet.
3. If exactly one match is clearly what they meant, say which one you are about
   to open and call `library_get` on it. Otherwise ask which one.
4. After reading it, say how you propose to use or adapt it before doing so.

If the search returns nothing, offer `asset_search` — the item may be a
deployable package rather than a library prompt.
