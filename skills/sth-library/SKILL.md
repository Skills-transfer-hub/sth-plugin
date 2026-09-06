---
name: sth-library
description: >-
  Use when the user asks for a prompt, agent, skill, rule, command or workflow
  the team may already have — "do we have a prompt for X", "find our cold email
  prompt", "reuse the code review prompt", "what's in the library" — and when
  something produced in this session is worth keeping for the team. Covers the
  STH library tools: library_search, library_get, library_save, asset_search,
  asset_get.
---

# The team STH library

STH is a shared library of reusable prompts and AI artifacts, reachable through
the `sth` MCP connector. Items belong to an organization, not to you: what you
read was written by a colleague, and what you save is something they will find.

## Search before you write

Before writing a prompt, agent, skill, rule or command from scratch, call
`library_search`. A near-match you adapt beats a fresh draft, because it carries
conventions the team already agreed on.

`library_search(query?, kind?)` — `kind` is `prompt` or `artifact`. It returns
summaries with ids and never returns bodies. Omit `query` to see what exists.

`library_get(id)` returns one item in full **and records it as reused**. That
event is the team's reuse metric, so call it when you intend to use the item —
not to survey what exists. Surveying is what the search results and the
connector's own index are for.

`asset_search(query?, family?, kind?)` widens the search beyond prompts to
deployable packages: `family: "package"` covers the artifact kinds `agent`,
`command`, `instruction`, `rule`, `skill` and `workflow`, while
`family: "library"` covers the same rows as `library_search`. Reach for it when
the user wants something *installable* rather than text to adapt.
`asset_get(id)` returns the body and, for packages, the per-tool compatibility
verdict — see the `sth-transfer` skill before acting on that.

## Save what proves itself

`library_save(kind, title, body, source_tool?, source_model?)`.

- **`kind`** — `prompt` for something a person or agent will paste or adapt;
  `artifact` for an output worth keeping, such as a spec, a review, or a
  generated document.
- **`title`** — imperative and specific. "Review a PR for security regressions",
  not "Security prompt". This is the line colleagues scan in search results, and
  a vague title is the same as not saving.
- **`body`** — the full text, self-contained. Strip what was specific to this
  repository or this session unless that specificity is the point.
- **`source_tool` / `source_model`** — always fill them. They feed attribution
  in the dashboard, and an item with no provenance is the one nobody trusts.

**Ask before saving. Never save silently.** Saving is a write to a shared space,
and the user is the one who knows whether their team wants it.

Search first when you are about to save: if a near-duplicate exists, propose
updating that item instead of adding a second one. A library people stop
trusting is usually a library with four versions of the same prompt.

## Do not save

- Anything containing a secret, token, key, password, customer name, or personal
  data — no matter how useful the surrounding prompt is.
- One-off answers that only made sense in this conversation.
- Content the user has not seen. Show them what you would save first.

## When a tool is missing

The toolbox is filtered by the member's permissions: a read-only member has no
`library_save`, and a member whose organization has not enabled the connector
has no tools at all. If a tool you need is absent, say so plainly and point at
the MCP settings in the STH dashboard. Do not work around it, and do not retry.
