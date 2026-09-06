import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { ENDPOINT, PLUGIN_NAME, ROOT, exists, json, skillNames } from './helpers.mjs'

/**
 * Agent Plugins 1.0 — the vendor-neutral standard published by OpenAI,
 * Microsoft, AWS, Cursor and Vercel. Conforming here is what makes the same
 * directory installable in Codex, Cursor, GitHub Copilot, VS Code and Kiro
 * without a per-client build.
 */
describe('Agent Plugins 1.0 — manifest', () => {
  const manifest = json('plugin.json')

  test('declares the 1.0.0 schema', () => {
    assert.equal(manifest.$schema, 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json')
  })

  test('name matches the required shape', () => {
    assert.equal(manifest.name, PLUGIN_NAME)
    assert.match(manifest.name, /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/)
    assert.ok(manifest.name.length >= 1 && manifest.name.length <= 64)
  })

  test('uses no field outside the closed top-level set', () => {
    // The specification permits exactly these and nothing else; anything
    // client-specific belongs under `extensions`. A stray key is the kind of
    // thing a strict validator rejects long after it was added.
    const permitted = new Set([
      '$schema', 'name', 'version', 'description',
      'author', 'homepage', 'repository', 'license', 'keywords', 'extensions',
    ])
    const stray = Object.keys(manifest).filter((key) => !permitted.has(key))
    assert.deepEqual(stray, [], `unpermitted top-level fields: ${stray.join(', ')}`)
  })

  test('author, homepage and repository are usable', () => {
    assert.equal(typeof manifest.author.name, 'string')
    for (const url of [manifest.homepage, manifest.repository, manifest.author.url]) {
      assert.match(url, /^https:\/\//)
    }
  })
})

describe('Agent Plugins 1.0 — mcp.json', () => {
  const mcp = json('mcp.json')

  test('declares the 1.0.0 MCP schema', () => {
    assert.equal(mcp.$schema, 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json')
  })

  test('every server names its transport explicitly', () => {
    // The closed format exists so a client never infers a transport from the
    // shape of the object.
    for (const [name, server] of Object.entries(mcp.mcpServers)) {
      assert.ok(['stdio', 'streamable-http', 'sse'].includes(server.type), `${name}: ${server.type}`)
    }
  })

  test('the HTTP server carries an absolute URL and no stdio keys', () => {
    const server = mcp.mcpServers[PLUGIN_NAME]
    assert.equal(server.type, 'streamable-http')
    assert.equal(server.url, ENDPOINT)
    assert.doesNotThrow(() => new URL(server.url))
    for (const key of ['command', 'args', 'cwd']) {
      assert.equal(server[key], undefined, `${key} belongs to stdio, not streamable-http`)
    }
  })

  test('plain HTTP is only ever allowed for loopback', () => {
    for (const server of Object.values(mcp.mcpServers)) {
      if (!server.url) continue
      const { protocol, hostname } = new URL(server.url)
      if (protocol === 'http:') {
        assert.ok(['localhost', '127.0.0.1', '::1'].includes(hostname), hostname)
      }
    }
  })
})

describe('Agent Plugins 1.0 — skills discovery', () => {
  test('every immediate child of skills/ holds a SKILL.md', () => {
    const names = skillNames()
    assert.ok(names.length > 0, 'a plugin with no skills is just an MCP config')
    for (const name of names) {
      assert.ok(exists(join('skills', name, 'SKILL.md')), `skills/${name} has no SKILL.md`)
    }
  })

  test('no SKILL.md hides deeper than one level, where no client will look', () => {
    // Clients MUST NOT search deeper than the immediate children, so a skill
    // nested two levels down is silently dead rather than broken.
    for (const name of skillNames()) {
      const walk = (dir, depth) => {
        for (const entry of readdirSync(dir)) {
          const full = join(dir, entry)
          if (statSync(full).isDirectory()) walk(full, depth + 1)
          else if (entry === 'SKILL.md' && depth > 0) {
            assert.fail(`${full.slice(ROOT.length + 1)} is nested too deep to be discovered`)
          }
        }
      }
      walk(join(ROOT, 'skills', name), 0)
    }
  })
})
