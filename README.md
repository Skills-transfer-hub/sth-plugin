# STH agent plugin

One package that is simultaneously a valid plugin for Claude Code, Codex,
Cursor, GitHub Copilot, VS Code, Kiro, Antigravity and Gemini CLI. It wires up
the STH remote MCP connector and ships the skills that tell an agent when to
reach for it.

Two skills, four commands, one curating sub-agent, one opt-in hook, and the
MCP connector — from a single directory, with a test suite that holds each
client's contract.

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

## Tests

```sh
npm test              # 93 checks, no dependencies
npm run check:reference
```

The suite is the claim that this package works in six clients, made
executable. One file per contract:

| File | Holds |
| --- | --- |
| `tests/package.test.mjs` | one identity across five manifests, three MCP files that agree, no credentials anywhere |
| `tests/agent-plugins.test.mjs` | Agent Plugins 1.0: closed field set, declared transports, skills discoverable at exactly one level |
| `tests/claude-code.test.mjs` | manifest pointers resolve, marketplace entry, hooks reach through `CLAUDE_PLUGIN_ROOT` and stay opt-in |
| `tests/native-formats.test.mjs` | Antigravity, Gemini CLI, Cursor, Codex, and Kimi's portability constraint |
| `tests/skills.test.mjs` | front matter, description quality, non-overlapping triggers, no tool named that the server does not expose |
| `tests/reference.test.mjs` | the compatibility file matches the generator; the matrix is internally coherent |
| `tests/install.test.mjs` | one case per install command in the table above |

`skills/sth-transfer/reference/compatibility.md` is **generated** by
`scripts/build-reference.mjs` from `data/sth-capabilities-v1.json`. Do not edit
it by hand — the test fails when it drifts.

## Known gaps

- `.agents/plugins/marketplace.json` — the Codex repo marketplace. Deliberately
  absent: its schema is not publicly documented at the time of writing, and a
  guessed one is worse than none.
- Tool `title` and annotations (`readOnlyHint`, `destructiveHint`,
  `openWorldHint`) live on the server, not here. Both the Anthropic and OpenAI
  directories reject submissions without them.
- The endpoint is hard-coded to production. Overriding it for a self-hosted STH
  needs `userConfig` on Claude Code, which is untested — an empty override
  would interpolate to an empty URL and break every install.

## License

MIT — see [LICENSE](LICENSE).
