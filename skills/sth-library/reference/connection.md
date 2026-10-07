# Connect STH in the current host

Use the section for the current host. If it is unknown, ask which application
the user is using. Discover available STH tools before
attempting a call. No visible tools does not prove authentication succeeded.

## ChatGPT and Codex

Use the installed STH plugin's connection controls and the host's supported OAuth
flow. In a local Codex session, use a documented CLI connection flow only when it
addresses that installed server; inspect the available help instead of borrowing
Claude commands or changing a separate STH CLI account. A cloud session cannot
inspect the user's local CLI.

Preserve the pending task while the user completes any required sign-in or
consent. Never request passwords, tokens or callback secrets in chat. Signing
into the STH website alone does not reconnect an existing host connection.
When the task specifies an account or organization, verify that the plugin uses
that account and organization before a library call. Do not test a connection
against a different organization's data. Rediscover tools after reconnection
and resume the authorized task; request a native reconnect/reload only when the
host requires it and no supported tool can perform it.

## Claude chat and Cowork

1. Open **Customize > Connectors**, find **STH**, and choose **Connect**.
   Complete sign-in in the browser.
2. If STH is absent, add a custom connector named STH with the URL
   `https://mcp.skillsth.com/api/mcp`. Follow Claude's detected OAuth setup;
   never ask the user to paste a token in chat. On Team or Enterprise, an
   organization owner or authorized administrator may need to add it first.
3. In the conversation, use **+ > Connectors** to enable STH. Once the user has
   connected, rediscover tools and resume the original action. Do not send the
   user to a terminal for this setup.

These hosts use the same remote connector flow. See
[Claude's custom connector guide](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp).

## Local Claude Code: handle setup for the user

Keep the pending task and its selected content in the current conversation.
The plugin bundles a local Claude Code configuration for its remote STH server;
it does not require the user to add the same connector in Claude chat.

1. Discover STH tools first. If the needed tools are present, attempt the
   requested action. If they are absent or fail, inspect the connector with
   the local CLI instead of assuming an expired login. Use `claude mcp get`
   with the observed server name. This plugin's scoped name is `plugin:sth:sth`.
2. When the CLI child does not see a plugin loaded just for this session, pass
   `--plugin-dir` with the real plugin directory supplied by the invoking hook
   or resolved from this skill's location. For example, run `claude` with the
   arguments `--plugin-dir`, the actual directory, `mcp`, `get`,
   `plugin:sth:sth`. Quote paths correctly. Do not add another MCP configuration
   or substitute the `sth` CLI's separate credentials.
3. If the observed state requires authentication, check `claude mcp login
   --help` and run `claude mcp login` for that server, retaining `--plugin-dir`
   when needed. Use a terminal/background process the host can keep alive
   during the browser flow. Tell the user to complete the browser authorization
   that the command opens; never ask for passwords, tokens or callback secrets
   in chat. Do not make the user type a command you can execute yourself.
4. After login, inspect the status and rediscover session tools. CLI login
   success does not prove the current session has reconnected. If the host
   cannot refresh that connection through an available tool, ask for the single
   native step `/mcp` > the STH server > reconnect, then resume the pending task.
   Do not repeatedly log in or claim unavailable tools can already be called.

Only invoke OAuth for an authentication problem or an explicit connection
request. Network failures need their actual diagnostic; access denials need
the organization owner. Do not silently enable a deliberately disabled plugin,
change scopes or install software as part of recovery. A bare diagnosis request
does not authorize account changes, but a request to use or connect STH includes
the routine connection step above.

If the CLI reports **"Incompatible auth server: does not support dynamic client
registration"**, sign-in has not reached the user's account. Inspect the public
OAuth discovery metadata: a missing `registration_endpoint` and no
`client_id_metadata_document_supported` mean automatic client onboarding is
unavailable. Stop retrying login. The STH authentication administrator must
enable a supported client onboarding method (CIMD or DCR), or supply a real
pre-registered public OAuth client and its allowed redirect URI. Do not invent
a client ID, change production OAuth settings, or request broader access as a
workaround. This is a server configuration blocker, not a password problem.

On older Claude Code versions without `mcp login`, or if this host cannot keep
the login process alive, use `/mcp` to select STH and authenticate. Only for a
server identified as a **claude.ai connector** or a cloud session should you
route reconnection to **Customize > Connectors**. Do not confuse it with the
plugin's `plugin:sth:sth` server.

Sources: [CLI OAuth login](https://code.claude.com/docs/en/mcp#authenticate-from-the-command-line),
[plugin server names](https://code.claude.com/docs/en/mcp#plugin-provided-mcp-servers).

## Connected, but unavailable

Discover tools again after the user reconnects. Call `capabilities_get` only if
it is available. If the connector is enabled but tools are still missing, the
STH organization owner needs to check active organization, membership, the MCP
connector setting, `remote_mcp` capability and member access. A missing
`library_save` means this session cannot save; do not work around it. Preserve
the user's prepared text in the conversation while access is resolved.

## What saving shares

STH saves text in the connected organization, accessible according to its
existing permissions. It does not grant access to another person or create a
public link. `library_save` accepts a title, body and provenance for a `prompt`
or `artifact`, and returns an item ID. It does not upload binary files, update
an existing entry, or provide a share URL. Never invent a link from an ID.
