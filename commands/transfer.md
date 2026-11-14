---
name: transfer
description: Port an artifact to another AI coding tool, checking the compatibility matrix first.
---

Port an artifact between AI coding tools: $ARGUMENTS

1. Identify the artifact kind (`agent`, `command`, `instruction`, `rule`,
   `skill`, `workflow`) and the target (`antigravity`, `claude`, `codex`,
   `copilot`, `cursor`, `gemini`). Ask if either is ambiguous.
2. Call `capabilities_get` for that cell. Do not proceed on memory.
3. Report the verdict before writing anything:
   - `exact` — convert, and name the destination path.
   - `lossy` — say what is lost first, then convert if the user still wants it.
   - `native-only` — explain; do not synthesise an equivalent.
   - `unsupported` — say so and stop. Do not produce a lookalike file.
4. If the cell is `implemented: false`, give the manual steps rather than
   claiming `sth` will perform the conversion.
5. In a host with local workspace access, inspect the `sth` CLI and its help,
   execute the supported conversion authorized by the user, and verify its
   output rather than stopping at a proposed command. Preserve existing files.
   Without local access or the required CLI, explain the actual limit and give
   the supported handoff from the transfer skill; never claim it was installed.
