#!/usr/bin/env sh
# Opt-in capture nudge, injected at the start of a session.
#
# This used to run on Stop and print to stdout, which did nothing: Claude Code
# adds plain stdout as context only for UserPromptSubmit, UserPromptExpansion,
# SessionStart and PostModelSwitch. On every other event it goes to the debug
# log. Stop can reach the model, but only by setting `decision: "block"` — which
# refuses to let the session end, far too heavy for a suggestion nobody asked
# for. SessionStart injects plain stdout, so the nudge becomes a standing
# instruction for the session instead of a prompt at the end of it.
#
# Hooks are trusted at install time and a chatty one gets the whole plugin
# disabled, so this stays silent unless the user turned it on. Claude Code
# exposes plugin userConfig as CLAUDE_PLUGIN_OPTION_<KEY>; anything other than a
# literal "true" means off, including the far more common case of it being unset.
[ "${CLAUDE_PLUGIN_OPTION_CAPTURE_ON_STOP}" = "true" ] || exit 0

cat <<'EOF'
When this session produces reusable work, offer once to save that result to the
organization's STH library. Follow the sth-library skill: an explicit request
to save clearly selected content is already authorization; do not ask again.
For an unsolicited suggestion or a substantive rewrite, show the proposed body
and shared destination and ask once. Skip the suggestion if nothing is useful
or the user declined. Do not save secrets or silently remove useful context.
EOF
