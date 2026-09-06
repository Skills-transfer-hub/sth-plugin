import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { ENDPOINT, PLUGIN_NAME, exists, json, read, readSkill, skillNames } from '../scripts/manifest-helpers.mjs'

/**
 * The four clients that read neither Agent Plugins 1.0 nor Claude Code's
 * format, plus Kimi, which has no plugin format at all.
 */

describe('Antigravity', () => {
  test('the Agent Plugins manifest also satisfies Antigravity', () => {
    // Antigravity requires only `name` at the root of plugin.json, which the
    // specification already mandates — so one file serves both and there is no
    // second manifest to keep in step.
    const manifest = json('plugin.json')
    assert.equal(typeof manifest.name, 'string')
    assert.ok(manifest.name.length > 0)
  })

  test('MCP config is published under the name Antigravity reads', () => {
    assert.ok(exists('mcp_config.json'), 'Antigravity reads mcp_config.json, not mcp.json')
    assert.equal(json('mcp_config.json').mcpServers[PLUGIN_NAME].url, ENDPOINT)
  })

  test('skills sit where Antigravity discovers them', () => {
    for (const name of skillNames()) assert.ok(exists(`skills/${name}/SKILL.md`))
  })
})

describe('Gemini CLI', () => {
  const extension = json('gemini-extension.json')

  test('the extension manifest sits at the repository root', () => {
    // `gemini extensions install <github url>` reads the repository root, which
    // is why this package is a repository rather than a monorepo subdirectory.
    assert.ok(exists('gemini-extension.json'))
    assert.equal(extension.name, PLUGIN_NAME)
    assert.equal(typeof extension.version, 'string')
  })

  test('MCP servers are inline, using Gemini’s httpUrl key', () => {
    const server = extension.mcpServers[PLUGIN_NAME]
    assert.equal(server.httpUrl, ENDPOINT)
    assert.equal(server.url, undefined, 'Gemini reads httpUrl, not url')
  })

  test('it declares only fields Gemini understands', () => {
    const permitted = new Set([
      'name', 'version', 'description', 'mcpServers',
      'contextFileName', 'excludeTools', 'migratedTo', 'plan',
    ])
    const stray = Object.keys(extension).filter((key) => !permitted.has(key))
    assert.deepEqual(stray, [], `unknown gemini-extension.json fields: ${stray.join(', ')}`)
  })
})

describe('Cursor', () => {
  const manifest = json('.cursor-plugin/plugin.json')

  test('the native manifest declares the richer component set', () => {
    assert.equal(manifest.name, PLUGIN_NAME)
    assert.match(manifest.name, /^[a-z0-9][a-z0-9-]*$/, 'lowercase kebab-case is required')
    for (const key of ['skills', 'commands', 'agents', 'mcpServers']) {
      assert.ok(manifest[key], `${key} should be declared for Cursor`)
      assert.ok(exists(manifest[key].replace(/^\.\//, '')), `${key} points at a missing path`)
    }
  })

  test('the root manifest still covers Cursor’s Agent Plugins mode', () => {
    // Cursor reads either format. Both must be present and agree, or the same
    // repository installs differently depending on which one Cursor picks.
    assert.equal(json('plugin.json').name, manifest.name)
    assert.equal(json('plugin.json').version, manifest.version)
  })
})

describe('Codex', () => {
  const manifest = json('.codex-plugin/plugin.json')

  test('the native manifest points at the shared components', () => {
    assert.equal(manifest.name, PLUGIN_NAME)
    for (const key of ['skills', 'mcpServers']) {
      assert.ok(exists(manifest[key].replace(/^\.\//, '')), `${key} points at a missing path`)
    }
  })

  test('hooks are left to the conventional path', () => {
    // Codex documents hooks at hooks/hooks.json "or referenced in manifest".
    // Claude Code proved that re-declaring the standard path double-loads it
    // and kills the plugin, so the convention is the safer of the two here too.
    assert.equal(manifest.hooks, undefined)
    assert.ok(exists('hooks/hooks.json'))
  })

  test('the Agent Plugins root manifest agrees with it', () => {
    assert.equal(json('plugin.json').version, manifest.version)
  })

  test('the repo marketplace file is absent on purpose, and said so', () => {
    // Its location is documented; its schema is not. A guessed schema fails
    // later and quietly, so the gap is recorded instead of filled.
    assert.equal(exists('.agents/plugins/marketplace.json'), false)
    assert.match(read('README.md'), /\.agents\/plugins\/marketplace\.json/)
  })
})

describe('Kimi — no plugin format, so the skills must be portable on their own', () => {
  test('front matter uses only keys the Agent Skills spec defines', () => {
    // Kimi, Antigravity and Gemini read SKILL.md directly out of a directory.
    // A Claude-specific front-matter key would be noise at best there.
    for (const name of skillNames()) {
      const { fields } = readSkill(name)
      assert.deepEqual(Object.keys(fields).sort(), ['description', 'name'], `skills/${name}`)
    }
  })

  test('skills carry no path that assumes a plugin installer', () => {
    for (const name of skillNames()) {
      const { text } = readSkill(name)
      assert.equal(/\$\{CLAUDE_PLUGIN_ROOT\}/.test(text), false, `skills/${name} is Claude-only`)
    }
  })
})
