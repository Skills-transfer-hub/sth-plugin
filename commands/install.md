---
name: install
description: Install a package from the team STH library into this project, through the sth CLI.
---

Install from the team's STH library into this project: $ARGUMENTS

Read and follow the install section of
[sth-transfer](../skills/sth-transfer/SKILL.md). The request authorizes
installing the package the user named. It does not authorize a lossy
conversion they have not accepted, `--force`, or handling their STH key.

1. Find the package with `asset_search` (`family: "package"`) and read it with
   `asset_get`. If several packages fit, ask which one.
2. State the verdict for this host before writing anything.
3. Run `sth install <folder/slug> --target <host> --dry-run`, then the real
   install, then `sth status --json`.
4. Report the installed paths, or the observed blocker and the one step left
   to the user (usually `sth login`). Never claim an install the CLI did not
   confirm.
