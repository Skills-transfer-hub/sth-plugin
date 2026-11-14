import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  CLAUDE_DIRECTORY_FILES, ENDPOINT, PLUGIN_NAME, ROOT, exists, frontmatter, json, read,
} from '../scripts/manifest-helpers.mjs'

/** Anthropic sat out Agent Plugins 1.0, so Claude Code needs its own manifest. */
describe('Claude Code — plugin manifest', () => {
  const manifest = json('.claude-plugin/plugin.json')

  test('name is the install slug and is immutable once published', () => {
    assert.equal(manifest.name, PLUGIN_NAME)
    assert.match(manifest.name, /^[a-z0-9][a-z0-9-]*$/)
  })

  test('a display label exists so the name never has to change for cosmetics', () => {
    assert.equal(typeof manifest.displayName, 'string')
    assert.notEqual(manifest.displayName, manifest.name)
  })

  test('every declared component path resolves', () => {
    // A dangling pointer disables the component silently at load time.
    for (const key of ['mcpServers', 'hooks', 'commands', 'agents', 'skills']) {
      const value = manifest[key]
      if (!value) continue
      for (const path of Array.isArray(value) ? value : [value]) {
        assert.ok(exists(path.replace(/^\.\//, '')), `${key} points at missing ${path}`)
      }
    }
  })

  test('userConfig keys are shaped for the CLAUDE_PLUGIN_OPTION_ contract', () => {
    for (const [key, spec] of Object.entries(manifest.userConfig ?? {})) {
      assert.match(key, /^[a-z][a-z0-9_]*$/, `${key} will not survive env-var casing`)
      assert.ok(['string', 'number', 'boolean', 'directory', 'file'].includes(spec.type))
      assert.equal(typeof spec.title, 'string')
    }
  })
})

describe('Claude Code — marketplace', () => {
  const marketplace = json('.claude-plugin/marketplace.json')

  test('the marketplace name is what users type after the @', () => {
    assert.match(marketplace.name, /^[a-z0-9][a-z0-9-]*$/)
    assert.equal(typeof marketplace.owner.name, 'string')
  })

  test('it lists this plugin from the repository root', () => {
    const entry = marketplace.plugins.find((plugin) => plugin.name === PLUGIN_NAME)
    assert.ok(entry, `marketplace does not list "${PLUGIN_NAME}"`)
    assert.equal(entry.source, './')
    assert.ok(entry.description.length > 20)
  })
})

describe('Claude plugin directory', () => {
  // Exactly what scripts/build-claude.mjs puts on the branch the directory
  // tracks, checked against the rules it applies to unverified organizations.
  const files = execFileSync('git', ['ls-files', '-z', '--', ...CLAUDE_DIRECTORY_FILES], { cwd: ROOT, encoding: 'utf8' })
    .split('\0').filter(Boolean)

  test('every listed path is tracked', () => {
    for (const path of CLAUDE_DIRECTORY_FILES) {
      assert.ok(files.some((file) => file === path || file.startsWith(`${path}/`)), `${path} is not tracked`)
    }
  })

  test('it ships only Markdown, JSON, PNG and the license, as UTF-8 without a shebang', () => {
    for (const file of files) {
      assert.match(file, /^[\w./-]+$/, `${file}: rename it`)
      assert.ok(/\.(md|json|png)$/.test(file) || file === 'LICENSE', `${file}: a file type the directory refuses`)
      if (file.endsWith('.png')) continue
      const text = new TextDecoder('utf-8', { fatal: true }).decode(readFileSync(join(ROOT, file)))
      assert.ok(!text.startsWith('#!') && !text.includes('\0'), file)
    }
  })

  test('front matter is plain key: value lines, in keys the directory accepts', () => {
    // It refused `skills:` on an agent without naming the key; keys that give a
    // component more than text (skills, hooks, mcpServers, permissionMode) go too.
    const allowed = { skills: ['name', 'description'], commands: ['name', 'description'], agents: ['name', 'description', 'model'] }
    for (const file of files.filter((path) => path.endsWith('.md'))) {
      for (const key of Object.keys(frontmatter(read(file)) ?? {})) {
        assert.ok(allowed[file.split('/')[0]]?.includes(key), `${file}: the directory may refuse "${key}"`)
      }
    }
  })

  test('no hooks, and one remote MCP server in fields the directory accepts', () => {
    assert.equal(json('.claude-plugin/plugin.json').hooks, undefined)
    assert.deepEqual(json('.mcp.json'), { mcpServers: { [PLUGIN_NAME]: { type: 'http', url: ENDPOINT } } })
  })
})

describe('Claude Code — commands and agents', () => {
  const commands = readdirSync(join(ROOT, 'commands')).filter((f) => f.endsWith('.md'))

  test('there is at least one command', () => assert.ok(commands.length > 0))

  for (const file of commands) {
    test(`commands/${file} declares name and description`, () => {
      const fields = frontmatter(read(join('commands', file)))
      assert.ok(fields, 'missing front matter')
      assert.equal(fields.name, file.replace(/\.md$/, ''), 'name must match the filename')
      assert.ok(fields.description.length >= 20, 'description is what users see in the picker')
    })
  }

  test('agents declare a name matching their filename', () => {
    for (const file of readdirSync(join(ROOT, 'agents')).filter((f) => f.endsWith('.md'))) {
      const fields = frontmatter(read(join('agents', file)))
      assert.equal(fields.name, file.replace(/\.md$/, ''))
      assert.ok(fields.description.length >= 20)
    }
  })
})
