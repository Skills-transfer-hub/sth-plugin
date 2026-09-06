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
5. Propose the `sth` command rather than hand-writing the file layout.
