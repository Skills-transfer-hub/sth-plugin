---
name: share
description: Make selected work available in the STH organization library or find an existing saved copy.
---

Share through the organization's STH library: $ARGUMENTS

Read and follow [sth-library](../skills/sth-library/SKILL.md), including its
authorization, duplicate, privacy and connection rules. Reply in the user's
language. Use MCP directly in chat, Cowork or Code; no terminal is needed.

- If this work was already saved successfully in this conversation, reuse its
  returned id and tell the user how organization members with access can find
  it. Do not create a second copy or claim to have changed permissions.
- Otherwise follow the skill's save flow for the clearly selected work.
  Announce the shared destination. This command is authorization for that
  destination; do not ask for the same permission again.
- If the user asks for a private copy, a public link, a specific recipient or
  another organization, explain that the current connector cannot do that.
  Do not save to the connected organization as a substitute without agreement.
- Return a confirmed receipt, not a promise. Do not invent URLs, send messages
  to teammates, claim notification, or represent saved text as an uploaded file.
