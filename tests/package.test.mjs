import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  ENDPOINT, IDENTITY_MANIFESTS, MCP_MANIFESTS, PLUGIN_NAME, VERSION,
  allFiles, json, read,
} from './helpers.mjs'

describe('every manifest parses', () => {
  for (const path of [...IDENTITY_MANIFESTS, ...MCP_MANIFESTS, '.claude-plugin/marketplace.json']) {
    test(path, () => assert.doesNotThrow(() => json(path)))
  }
})

describe('one identity across five manifest families', () => {
  // A client that reads a different name or version than its neighbour turns
  // one plugin into several half-installed ones.
  for (const path of IDENTITY_MANIFESTS) {
    test(`${path} agrees on name and version`, () => {
      const manifest = json(path)
      assert.equal(manifest.name, PLUGIN_NAME)
      assert.equal(manifest.version, VERSION)
    })
  }

  test('descriptions are identical, not merely similar', () => {
    const descriptions = new Set(IDENTITY_MANIFESTS.map((path) => json(path).description))
    // Gemini's manifest is allowed a shorter line; everything else must match.
    assert.ok(descriptions.size <= 2, `too many distinct descriptions: ${descriptions.size}`)
  })
})

describe('the three MCP files are one configuration under three names', () => {
  const reference = json('mcp.json')

  for (const path of MCP_MANIFESTS) {
    test(`${path} declares the same server`, () => {
      assert.deepEqual(json(path).mcpServers, reference.mcpServers)
    })
  }

  test('the server is the production connector over HTTPS', () => {
    const server = reference.mcpServers[PLUGIN_NAME]
    assert.ok(server, 'mcpServers must be keyed by the plugin name')
    assert.equal(server.url, ENDPOINT)
    assert.ok(server.url.startsWith('https://'), 'a non-loopback endpoint must be HTTPS')
  })

  test('Gemini points at the same endpoint through its own key', () => {
    assert.equal(json('gemini-extension.json').mcpServers[PLUGIN_NAME].httpUrl, ENDPOINT)
  })
})

describe('the package carries no credentials', () => {
  // The Agent Plugins specification is explicit that header values in mcp.json
  // are visible package data, not a portable secret mechanism. This connector
  // authenticates with OAuth, so it needs none — and the test keeps it that way.
  for (const path of MCP_MANIFESTS) {
    test(`${path} sets no headers or env`, () => {
      for (const server of Object.values(json(path).mcpServers)) {
        assert.equal(server.headers, undefined, 'headers would ship as plaintext')
        assert.equal(server.env, undefined)
      }
    })
  }

  test('no file contains anything shaped like a key', () => {
    const patterns = [
      /\b(?:sk|pk|ghp|gho|github_pat)_[A-Za-z0-9_]{16,}/,
      /\b[A-Fa-f0-9]{40,}\b/,
      /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    ]
    for (const file of allFiles()) {
      if (file.startsWith('tests/')) continue
      const content = read(file)
      for (const pattern of patterns) {
        assert.equal(pattern.test(content), false, `${file} matches ${pattern}`)
      }
    }
  })
})

describe('documentation states what the package actually is', () => {
  const readme = read('README.md')

  test('names every install path from the connector table', () => {
    for (const client of ['Claude Code', 'Codex', 'Cursor', 'Gemini CLI', 'Antigravity', 'Kimi']) {
      assert.ok(readme.includes(client), `README does not mention ${client}`)
    }
  })

  test('publishes the endpoint it actually configures', () => {
    assert.ok(readme.includes(ENDPOINT))
  })
})
