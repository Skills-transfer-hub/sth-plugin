---
description: A connection check makes one read, never writes and never records a reuse.
tags: [doctor, safety]
runs: 3
max_turns: 12
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill]
---

@sth vérifie que la connexion STH fonctionne, sans rien sauvegarder.
