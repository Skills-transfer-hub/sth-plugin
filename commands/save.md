---
name: save
description: Save selected work to the STH team library, using the authorization already given.
---

Save the selected work to the organization's STH library: $ARGUMENTS

Read and follow [sth-library](../skills/sth-library/SKILL.md), including its
authorization, duplicate, privacy and connection rules. Reply in the user's
language and use MCP directly; saving does not require the `sth` CLI.

- Use the argument or clearly selected/last visible result. If several items
  are plausible, ask one short question to identify which one.
- This command authorizes saving the clearly selected content to the shared
  STH library. Announce the title and destination, then proceed without another
  confirmation. Do not require the user to approve the same body twice.
- If you choose or substantively rewrite the content, show it to the user
  before writing and collect one confirmation, including any duplicate or
  destination choice. Never silently sanitize, summarize or broaden the scope.
- Only report success after the tool confirms it. Return the title, actual id
  and how to find it in STH. Do not invent a link or claim to upload attachments.
