# STH for ChatGPT and Codex

This package connects Skills Transfer Hub's existing remote MCP server and
bundles five skills:

- **sth**: resolve an STH request from the current conversation.
- **sth-library**: find, reuse, and save approved prompts and AI artifacts.
- **sth-transfer**: check compatibility before moving an artifact between tools.
- **sth-doctor**: diagnose missing tools or a failed connection.
- **sth-curate**: review the library and propose cleanup without writing.

The light and dark icons reuse STH's official Buddy artwork. No API key or
access token is included. Each user connects to their STH account through OAuth
and needs access to an organization with the remote MCP connector enabled.

## Create a private account plugin

From the source repository, run `npm test`, `npm run check:reference`, and
`npm run build:openai`. The output is `dist/sth-openai-0.1.4.tar.gz`, containing
one `sth/` directory with the manifest, skills and references, MCP configuration,
Codex compatibility manifest, icons, and license.

Ask Plugin Creator in ChatGPT or Codex to create a private plugin from that
archive. Open its returned plugin link, install it, and complete the STH OAuth
connection. This saves a private plugin; public directory submission is a
separate operation.

## Test the local source in Codex

From the repository root:

```sh
codex plugin marketplace add .
codex plugin add sth@skillsth
```

The repository marketplace points to the source at `./`. To inspect discovery,
run `codex plugin list --marketplace skillsth --available --json`. The local
marketplace is for desktop/CLI testing; use an account plugin for ChatGPT web.

## Verify the connected plugin

In a fresh chat with the plugin enabled, ask:

1. "Find a prompt for code review in our STH library." Verify `library_search`
   returns a real result or an explicit empty result.
2. "Check whether a skill can be transferred to Codex." Verify
   `capabilities_get` if available. If absent, the bundled matrix is an offline
   reference, not a live server check.
3. "Diagnose my STH connection." Verify the answer distinguishes visible tools,
   successful calls, and missing permissions without guessing.

Reading via `library_get` records reuse. Use search for connectivity tests.
Do not save data merely to test authentication. Test saving only on a user
request with reviewed content, then verify the returned id.

ChatGPT can search and work with remote content. Local CLI conversion and
installation require a connected execution environment with the STH CLI and
access to the target project. Without it, return content and destination
instructions, and explicitly say installation has not been executed.

## Compatibility and validation limits

OpenAI presentation lives in `extensions.com.openai.interface`; its compatibility
copy is `.codex-plugin/plugin.json`. The export excludes other clients' commands,
agents, and shell hooks. Their useful workflows are included as skills, and
OpenAI hooks are explicitly empty so a source install does not discover the
Claude-specific optional hook.

Automated tests validate packaging and source contracts. They do not establish
OAuth login, account installation, real tool execution, or behavior in every
client. Those need the connected-host checks above.

Format references: [OpenAI plugin packaging](https://developers.openai.com/plugins/build/plugins)
and [adapting Claude plugins](https://developers.openai.com/plugins/guides/submit-claude-plugin).

## Public submission preparation

Run `npm run build:openai:public` to create a separate draft ZIP. This export
removes OpenAI hook declarations and includes the confirmed publisher, worldwide
availability, commerce explanation, and five positive/three negative review
cases. Its adjacent readiness JSON records missing materials; the draft is not
ready to submit while those gaps remain.

The verified website and contact URLs are included. Privacy and terms URLs are
withheld until the published text covers the actual cloud-library/MCP behavior.
The demo recording URL must point to a real, accessible recording. Reviewer
credentials and policy attestations belong in the secure Developer Portal,
never in this package.

See [the review cases and recording walkthrough](openai-review.md). Private
account creation and public review are separate: use the
[OpenAI Developer Portal](https://platform.openai.com/plugins) only after
preparation is complete. Public release follows approval.

## Current account release and logo check

The private account plugin `plugins_6ac3d9f43338819184bc78cf50b3a8ed` was updated
to version 0.1.2 on 2026-10-05. The update adds the contextual `sth` entry point,
aligns the local transfer workflow and scopes connection recovery to the current
host and intended organization. Remote readback verifies all changed files and
the five skills. The existing MCP configuration, audience, prompts and Buddy
assets were preserved. All 167 package tests and the reference check passed.

The ChatGPT website shows version 0.1.2 and five skills but still renders its generic document
icon after reload. This is an observed display limitation, not a successful
visual logo check. The reviewer account and sample organization are set up;
the STH dashboard confirms Alpha and an enabled MCP connector. The host's OAuth
connection still needs to be verified against that account before running review
cases. No public portal draft has been uploaded or submitted.

The official Codex app-server diagnostic on 2026-10-05 confirms that the remote
plugin is installed and enabled, but neither the global MCP inventory nor an
ephemeral diagnostic thread exposes its HTTP server. Both expose only the
separate legacy `sth` stdio server, with no plugin id or HTTP origin and OAuth
status `unsupported`. The effective plugin configuration has no explicit disable
flag. This does not establish a name collision or an invalid plugin manifest.
No OAuth login or library call was attempted with that unverified target. The
diagnostic processes were stopped; no persistent configuration was changed.
