# STH agent plugin

One package that is simultaneously a valid plugin for Claude Code, Codex,
Cursor, GitHub Copilot, VS Code, Kiro, Antigravity and Gemini CLI. It wires up
the STH remote MCP connector and ships the skills that tell an agent when to
reach for it.

**Status: skeleton.** The manifests below are in place and the connector is
live, but `skills/` is empty — installing this today gets you the MCP server and
nothing else. See [What is still missing](#what-is-still-missing).

## What it connects to

`https://mcp.skillsth.com/api/mcp` — a remote MCP server over Streamable HTTP,
authenticated with OAuth 2.1. The package carries **no token and no secret**:
each client negotiates its own login, and the Agent Plugins specification is
explicit that header values in `mcp.json` are visible package data, not a
portable secret mechanism.

Using the tools needs an active STH organization, a valid membership, the MCP
connector enabled for that organization, and the `remote_mcp` capability. A
member without those gets an empty toolbox rather than tools that fail on use.

## Install

| Client | Command |
| --- | --- |
| Claude Code | `/plugin marketplace add Skills-transfer-hub/sth-plugin` then `/plugin install sth@skillsth` |
| Codex | `codex plugin add` from this repository |
| Cursor | install from the Customize page, or from this git URL |
| Gemini CLI | `gemini extensions install https://github.com/Skills-transfer-hub/sth-plugin` |
| Antigravity | copy this directory into `.agents/plugins/` or `~/.gemini/config/plugins/` |
| Kimi | `kimi mcp add`, then copy `skills/` into `~/.agents/skills/` |

## Why there are five manifests

There is no single plugin format. **Agent Plugins 1.0** (OpenAI, Microsoft, AWS,
Cursor, Vercel) covers Codex, Cursor, Copilot, VS Code and Kiro. Anthropic and
Google each kept their own. None of the files collide, so one directory serves
all of them:

| File | Read by |
| --- | --- |
| `plugin.json` | Agent Plugins 1.0 clients **and** Antigravity |
| `mcp.json` | Agent Plugins 1.0 clients, Cursor |
| `mcp_config.json` | Antigravity |
| `.mcp.json` | Claude Code |
| `gemini-extension.json` | Gemini CLI |
| `.claude-plugin/` | Claude Code (manifest + marketplace) |
| `.cursor-plugin/plugin.json` | Cursor's richer native format |
| `.codex-plugin/plugin.json` | Codex's native format |
| `skills/` | **all of them** |

An Agent Plugins manifest is also a valid Antigravity manifest — Antigravity
requires only `name` at the root, which the specification already mandates — so
the two share one file. The three MCP files hold identical content under three
names.

This deviates from the specification on one point: it puts client-specific
files at their native paths rather than under reverse-domain directories
(`com.anthropic.claude-code/`). Those clients do not look in the namespaced
location, and conformant clients must ignore files they do not recognise.

## What is still missing

- `skills/sth-library/SKILL.md` — search before writing, save what proves itself
- `skills/sth-transfer/SKILL.md` + generated `reference/compatibility.md` — the
  six-target compatibility matrix
- `commands/` and `agents/` — Claude Code and Cursor only
- `hooks/hooks.json` — opt-in capture at the end of a session
- `.agents/plugins/marketplace.json` — the Codex repo marketplace. Deliberately
  absent: its schema is not documented publicly at the time of writing, and a
  guessed one is worse than none.
- Tool `title` and annotations (`readOnlyHint`, `destructiveHint`,
  `openWorldHint`) on the server side. Both the Anthropic and OpenAI directories
  reject submissions without them.

Manifests and the compatibility reference are **generated** from the STH
dashboard, where the tool list and the capabilities manifest already live. Do
not hand-edit them here.

## License

MIT — see [LICENSE](LICENSE).
