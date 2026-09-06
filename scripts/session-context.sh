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
When this session produces something reusable — a prompt that worked, a rule, a
skill — offer to save it to the team STH library with library_save. Ask first,
show the exact body, and skip it entirely if nothing is worth a colleague's
time. Do not save secrets or anything specific to this repository.
EOF
