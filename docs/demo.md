# 20-second demo

The recording that goes at the top of the README. It must show a real session:
a real STH organization, real tool calls, nothing staged in an editor.

## Before recording

- Claude Code with this plugin installed, and the STH connector signed in to an
  organization that has MCP access.
- In that organization's library, a prompt titled **Revue de code — checklist
  équipe** whose body contains a distinctive house rule (for example: the PR
  title must cite its `LIN-####` ticket).
- A package `skills/revue-code` published to the organization's STH Cloud
  catalog, and `sth login` already done on the recording machine.
- A small repository with one staged diff to review.

## Script (three beats, about 7 seconds each)

1. **Reuse.** `@sth retrouve notre prompt de revue de code et applique-le à ce
   diff` — the review comes back with the team's house rule in it.
2. **Keep.** `@sth sauvegarde cette revue pour l'équipe` — the receipt shows the
   title and the id returned by STH.
3. **Deliver.** `/sth:install revue-code` — the `--dry-run` preview, then the
   installed path under `.claude/skills/`.

Cut the waiting time between beats, not the tool calls.

## Export

Record the terminal only (macOS: Cmd+Shift+5, selected area). Export a GIF or
MP4 under 5 MB, save it as `assets/demo.gif`, and put it under the README's
"Quick start" heading.
