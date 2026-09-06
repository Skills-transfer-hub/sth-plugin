#!/usr/bin/env sh
# Opt-in capture nudge, fired at the end of a session.
#
# Hooks are trusted at install time and a chatty one gets the whole plugin
# disabled, so this stays silent unless the user turned it on. Claude Code
# exposes plugin userConfig as CLAUDE_PLUGIN_OPTION_<KEY>; anything other than
# a literal "true" means off, including the far more common case of the
# variable being unset.
[ "${CLAUDE_PLUGIN_OPTION_CAPTURE_ON_STOP}" = "true" ] || exit 0

cat <<'EOF'
If this session produced something reusable — a prompt that worked, a rule, a
skill — offer to save it to the team STH library with library_save. Ask first,
show the exact body, and skip it entirely if nothing here is worth a colleague's
time. Do not save secrets or anything specific to this repository.
EOF
