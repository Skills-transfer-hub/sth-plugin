import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { PLUGIN_NAME, ROOT, exists, frontmatter, json, read } from './helpers.mjs'

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

describe('Claude Code — hooks', () => {
  const hooks = json('hooks/hooks.json')

  test('every hook command resolves through CLAUDE_PLUGIN_ROOT', () => {
    // A bare relative path resolves against the user's cwd, not the plugin.
    for (const entries of Object.values(hooks.hooks)) {
      for (const group of entries) {
        for (const hook of group.hooks) {
          assert.equal(hook.type, 'command')
          assert.match(hook.command, /\$\{CLAUDE_PLUGIN_ROOT\}/)
          const script = hook.command.replace(/["']/g, '').replace('${CLAUDE_PLUGIN_ROOT}/', '')
          assert.ok(exists(script), `hook script missing: ${script}`)
        }
      }
    }
  })

  test('the capture hook stays silent unless the user opted in', () => {
    // Hooks are trusted at install time; a chatty default gets the whole
    // plugin disabled, taking the skills with it.
    const script = read('scripts/offer-capture.sh')
    assert.match(script, /CLAUDE_PLUGIN_OPTION_CAPTURE_ON_STOP/)
    assert.match(script, /\|\|\s*exit 0/)
    assert.ok(
      json('.claude-plugin/plugin.json').userConfig?.capture_on_stop,
      'the hook reads an option the manifest never declares',
    )
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
