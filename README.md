# STH agent plugin

One package for Claude chat, Cowork and Claude Code, plus Codex, Cursor,
GitHub Copilot, VS Code, Kiro, Antigravity and Gemini CLI. It wires up the STH
remote MCP connector and ships the skills that tell an agent when to use it.

Five skills, five commands, one curating sub-agent, a Claude Code mention hook,
an opt-in capture reminder, and the MCP connector.

## Just address STH in Claude Code

Once this version of the plugin is loaded, type your request normally:

```text
@sth sauvegarde ça pour mon équipe
@sth utilise notre méthode de revue sur ce changement
@sth connecte-moi puis reprends la sauvegarde
```

You can also send just `@sth` when the preceding discussion already establishes
the task. Claude keeps that conversation context, chooses the STH workflow and
performs the authorized actions. If the intended action is unclear, it asks one
specific question. A mention by itself does not authorize uploading a transcript.

When a local plugin connection needs authentication, Claude inspects it and
launches the supported OAuth login. You complete browser authorization; Claude
then checks the connection and resumes the original task. A server-side OAuth
configuration failure still needs fixing before login can complete.

Implementation: a `UserPromptSubmit` hook recognizes the literal `@sth` token
and adds [the contextual workflow](skills/sth/SKILL.md) to the main conversation.
It requires **Node.js 20+ on PATH**, runs only for an explicit mention in prose,
and does not read transcripts or contact STH itself. Markdown blockquotes, code
examples, file paths and email addresses do not activate it. Hooks must be enabled. This does
not add a plugin chip to Claude's `@` autocomplete; send the literal text without
selecting an unrelated file. `/sth:sth` is the native skill alternative.

For a session using this checkout directly, launch `claude --plugin-dir .` from
the repository. Installed copies need updating/reloading to pick up changes.
The literal mention hook is specific to Claude Code; other hosts can use the
same skill and natural-language requests without relying on hooks.

Sources: [prompt hooks](https://code.claude.com/docs/en/hooks#userpromptsubmit),
[Claude Code OAuth login](https://code.claude.com/docs/en/mcp#authenticate-from-the-command-line).

## Save and share from Claude

Install STH, connect your STH account, then use normal language in chat,
Cowork or Claude Code:

- “Sauvegarde ce prompt dans STH pour mon équipe.”
- “Garde cette méthode pour qu'on puisse la réutiliser.”
- “Partage ce résultat dans la bibliothèque STH de mon équipe.”
- “Retrouve notre prompt de revue de code et utilise-le ici.”

Claude prepares a reusable text entry, checks for duplicates, and saves the
content you authorized. If the content or intended audience is unclear, it
asks one focused question. On success it reports the saved title and the
identifier returned by STH. You can also select a plugin skill with `/` or `+`.
The commands are `find`, `save`, `share`, `transfer` and `doctor`; `share`
uses the same organization library flow and reuses an existing save receipt
when the same item was already saved in this conversation.
Skills and commands work in all three Claude hosts; hooks and sub-agents run
only in Cowork and Claude Code. The library flow does not require either.
See [Claude's plugin guide](https://support.claude.com/en/articles/13837440-use-plugins-in-claude).

“Share with my team” means saving to the connected **STH organization**, where
members with access can find it. It does not send a message, invite a person,
create a public link, or share the Claude conversation. `library_save` accepts
text (`prompt` or `artifact`); it cannot upload a PDF, image or other binary
file. The connector currently has no update or sharing tool, and returns an
item ID rather than a share URL.

For chat and Cowork, open **Customize > Connectors > STH > Connect**, complete
sign-in, then enable STH in the conversation's **+ > Connectors** menu. If STH
is missing, follow the [connection guide](skills/sth-library/reference/connection.md).
In Claude Code, `@sth` handles connection diagnosis and supported login; `/mcp`
is the fallback for host operations the agent cannot perform itself.
Installing the plugin alone does not prove that the connection is ready.

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
| Claude chat / Cowork | **Customize > Plugins > Add > Add marketplace**, add `Skills-transfer-hub/sth-plugin`, then add STH |
| Claude Code | `/plugin marketplace add Skills-transfer-hub/sth-plugin` then `/plugin install sth@skillsth` |
| Codex | `codex plugin add` from this repository |
| Cursor | install from the Customize page, or from this git URL |
| Gemini CLI | `gemini extensions install https://github.com/Skills-transfer-hub/sth-plugin` |
| Antigravity | copy this directory into `.agents/plugins/` or `~/.gemini/config/plugins/` |
| Kimi | `kimi mcp add`, then copy `skills/` into `~/.agents/skills/` |

## Update an existing Claude Code installation

Version **0.1.3** adds the contextual `@sth` workflow and connection recovery.
For a GitHub marketplace installation, refresh the catalog and update STH:

```sh
claude plugin marketplace update skillsth
claude plugin update sth@skillsth
```

Restart Claude Code to load the updated plugin. The first OAuth authorization
still takes place in your browser; saved credentials are managed by Claude.
Local folder installations read from that folder instead of the public cache.

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
npm test              # package checks, no dependencies
npm run check:reference
```

The suite checks package structure and declared client contracts. It does not
prove OAuth, live STH access, or the full flow in each host. One file per contract:

| File | Holds |
| --- | --- |
| `tests/package.test.mjs` | one identity across five manifests, three MCP files that agree, no credentials anywhere |
| `tests/agent-plugins.test.mjs` | Agent Plugins 1.0: closed field set, declared transports, skills discoverable at exactly one level |
| `tests/claude-code.test.mjs` | manifest pointers resolve and do not duplicate a conventional path, marketplace entry, the hook runs on an event that reaches the model and stays opt-in |
| `tests/mention.test.mjs` | literal mention detection, exclusions, real hook execution, context delivery and failure behavior |
| `tests/portable-skills.test.mjs` | shared skill discovery, connection limits and protection against instructions in retrieved content |
| `tests/native-formats.test.mjs` | Antigravity, Gemini CLI, Cursor, Codex, and Kimi's portability constraint |
| `tests/skills.test.mjs` | front matter, description quality, non-overlapping triggers, no tool named that the server does not expose |
| `tests/reference.test.mjs` | the compatibility file matches the generator; the matrix is internally coherent |
| `tests/install.test.mjs` | one case per install command in the table above |
| `tests/identity.test.mjs` | the declared repository is the one this clone actually came from |

`skills/sth-transfer/reference/compatibility.md` is **generated** by
`scripts/build-reference.mjs` from `data/sth-capabilities-v1.json`. Do not edit
it by hand — the test fails when it drifts.

## Known gaps

**The Codex repo marketplace (`.agents/plugins/marketplace.json`) is omitted.**
Its location is documented, its schema is not, and a GitHub code search for the
path returns no public example to copy. A guessed schema fails later and
quietly, so the gap stays recorded rather than filled. Every other Codex install
path works without it.

**The endpoint is not configurable through the plugin.** Its MCP configuration
and connection guide use production. Library actions use tool names, so a
self-hosted STH connector can supply them. Configure your own server with:

```sh
claude mcp add --transport http sth https://your-host/api/mcp
```

Install the plugin for the skills, point `sth` at your own server, and the two
compose. Doing it through `userConfig` instead is still untested: the CLI
reports the raw `${user_config.…}` string rather than the resolved one, so how
an unset value interpolates at connect time is unknown, and an empty URL would
break every install. Two things were established: `description` is **required**
on a `userConfig` entry, and an unset optional one does not block the install.

## License

MIT — see [LICENSE](LICENSE).
