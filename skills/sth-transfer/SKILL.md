---
name: sth-transfer
description: >-
  Use when moving or converting an agent, command, instruction, rule, skill or
  workflow between AI coding tools — "port this skill to Codex", "does this rule
  work in Cursor", "make this a Copilot instruction", "where does this install",
  "will this survive the conversion". Reads the STH compatibility matrix first,
  so lossy and unsupported conversions are named instead of silently botched.
---

# Porting artifacts between AI coding tools

Six targets: `antigravity`, `claude`, `codex`, `copilot`, `cursor`, `gemini`.
Six artifact kinds: `agent`, `command`, `instruction`, `rule`, `skill`,
`workflow`. Thirty-six cells, one verdict each.

## Check the matrix before proposing anything

`capabilities_get(target?, kind?)` returns the cells plus the CLI version that
produced them. Call it first. The answer is data — it is not something to infer
from how two tools resemble each other, and the resemblance is exactly what
makes guessing feel safe.

| Level | What to do |
| --- | --- |
| `exact` | Convert. State the destination path. |
| `lossy` | Convert **and name what is lost**, before writing anything. |
| `native-only` | The artifact exists only in that tool's own format. Do not synthesise an equivalent. |
| `unsupported` | Say so. Do not improvise a lookalike. |

**The failure this skill exists to prevent:** producing a plausible-looking file
for a cell that is `unsupported`, which the user discovers only when the tool
ignores it. A refusal that names the cell is worth more than a file that looks
right.

## Reading a cell

Each cell carries `surface`, `destination`, `invocation`, `implemented`,
`maturity` and sometimes `minimum_version`. `destination` is where the file
goes; `invocation` is how it gets called once there. `implemented: false` means
the matrix knows the path but the CLI does not yet perform it — give the user
the manual steps instead of claiming `sth` will do it.

`reference/compatibility.md` in this skill holds the full table for offline
reading. `capabilities_get` stays authoritative: it reports the CLI actually
deployed for this organization, which may be ahead of the snapshot.

## Two facts worth knowing before you start

**`skill` is `exact` on all six targets.** An Agent Skill is the one artifact
that moves without loss anywhere. When a user asks how to share behaviour across
tools and the content could reasonably be a skill, that is almost always the
right shape to convert *to*.

**`workflow` is `native-only` or `unsupported` everywhere.** Workflows do not
port. Say it early rather than after an attempt.

## The CLI does the writing

Conversion on disk is `sth`'s job. It knows each target's detection markers,
dialects and native paths, and it will not write into a project that does not
look like that target. Propose the command; do not hand-roll the file layout
yourself, and do not invent a path the matrix did not give you.

If `sth` is not installed, say so and give the destination from the matrix so
the user can place the file themselves.
