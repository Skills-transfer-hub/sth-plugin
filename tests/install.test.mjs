import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { PLUGIN_NAME, exists, json, read } from '../scripts/manifest-helpers.mjs'

/**
 * One test per supported install path: each asserts the files that command
 * actually reads are present and coherent. If a client is added to the README,
 * it gets a case here or the claim is unbacked.
 */
describe('install paths', () => {
  test('Claude Code — /plugin marketplace add … then /plugin install sth@<marketplace>', () => {
    assert.ok(exists('.claude-plugin/marketplace.json'), 'marketplace add reads this file')
    const marketplace = json('.claude-plugin/marketplace.json')
    const entry = marketplace.plugins.find((plugin) => plugin.name === PLUGIN_NAME)
    assert.ok(entry, 'the marketplace does not list the plugin')
    assert.ok(exists('.claude-plugin/plugin.json'), 'the installed plugin needs its own manifest')
    // What the user actually types is `<plugin>@<marketplace>`.
    assert.ok(read('README.md').includes(`${PLUGIN_NAME}@${marketplace.name}`))
  })

  test('Codex — codex plugin add from the git source', () => {
    assert.ok(exists('.codex-plugin/plugin.json') || exists('plugin.json'))
    assert.ok(exists('mcp.json'))
    assert.ok(exists('skills'))
  })

  test('Cursor — Customize page or git repository', () => {
    assert.ok(exists('.cursor-plugin/plugin.json'))
    assert.ok(exists('plugin.json'), 'Cursor also accepts the Agent Plugins root manifest')
    assert.ok(exists('mcp.json'))
  })

  test('Gemini CLI — gemini extensions install <github url>', () => {
    // The manifest must be at the repository root: the command clones the repo
    // and looks there, with no path argument.
    assert.ok(exists('gemini-extension.json'))
    assert.equal(json('gemini-extension.json').name, PLUGIN_NAME)
  })

  test('Antigravity — drop the directory into .agents/plugins/', () => {
    assert.ok(exists('plugin.json'), 'Antigravity identifies a directory by root plugin.json')
    assert.ok(exists('mcp_config.json'))
    assert.ok(exists('skills'))
  })

  test('Kimi — kimi mcp add, then skills into .agents/skills/', () => {
    // Kimi has no plugin format: it needs a standard mcpServers object it can
    // be pointed at, and skills that stand alone as files.
    const mcp = json('mcp.json')
    assert.ok(mcp.mcpServers[PLUGIN_NAME].url, 'kimi mcp add needs a url')
    assert.ok(exists('skills/sth-library/SKILL.md'))
  })

  test('the README documents the repository these commands clone', () => {
    const repository = json('plugin.json').repository
    const slug = repository.replace('https://github.com/', '')
    assert.ok(read('README.md').includes(slug), `README does not name ${slug}`)
  })
})
