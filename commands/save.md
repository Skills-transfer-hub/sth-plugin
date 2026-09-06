---
name: save
description: Save something produced in this session to the team STH library.
---

Save to the team's STH library: $ARGUMENTS

1. Decide what exactly is being saved. If the user did not name it, propose the
   most reusable artifact from this session and ask before continuing.
2. Call `library_search` on its subject first. If something close already
   exists, show it and ask whether to update that item instead of adding a
   near-duplicate.
3. Draft the entry and **show it to the user before writing**: `kind`
   (`prompt` or `artifact`), an imperative `title`, and the full `body`,
   stripped of anything specific to this repository or session.
4. Check the body for secrets, tokens, keys, customer names or personal data.
   If you find any, stop and say so — do not redact silently and save anyway.
5. On approval, call `library_save` with `source_tool` and `source_model` filled
   in.

Never call `library_save` without explicit approval of the exact body.
