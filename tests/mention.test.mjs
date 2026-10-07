import { after, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { chmodSync, copyFileSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { hasSthMention, mentionContext } from '../scripts/sth-mention.mjs'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const plugin = mkdtempSync(join(tmpdir(), 'sth mention test '))
const workflow = join(plugin, 'skills/sth/SKILL.md')
mkdirSync(join(plugin, 'scripts'), { recursive: true })
mkdirSync(dirname(workflow), { recursive: true })
copyFileSync(join(ROOT, 'scripts/sth-mention.mjs'), join(plugin, 'scripts/sth-mention.mjs'))
chmodSync(join(plugin, 'scripts/sth-mention.mjs'), 0o755)
writeFileSync(workflow, '---\nname: sth\ndescription: fixture\n---\nUse current context. Read [connection](../sth-library/reference/connection.md).\n')
after(() => rmSync(plugin, { recursive: true, force: true }))

const hooks = JSON.parse(readFileSync(join(ROOT, 'hooks/hooks.json'), 'utf8'))
const hook = hooks.hooks.UserPromptSubmit[0].hooks[0]
function run(raw) {
  return spawnSync('/bin/sh', ['-c', hook.command], {
    env: { ...process.env, CLAUDE_PLUGIN_ROOT: plugin },
    input: typeof raw === 'string' ? raw : JSON.stringify(raw),
    encoding: 'utf8',
  })
}
const event = (prompt) => ({ hook_event_name: 'UserPromptSubmit', prompt })

describe('explicit @sth invocation in visible prompt prose', () => {
  for (const prompt of ['@sth', '@STH sauvegarde ça', 'Partage ça @sth', '(@sth)', '@sth, sauvegarde ce résultat', 'Utilise @sth.', '`example` puis @sth sauvegarde ça']) {
    test(`recognizes ${JSON.stringify(prompt)}`, () => assert.equal(hasSthMention(prompt), true))
  }
  for (const prompt of [
    'user@sth.com', '@sth.com', '@sth/file', '/@sth', './@sth', '@sth-other', '@sthing', '@sth:save',
    '`@sth`', '``@sth``', '``one ` @sth ` two``', '`first\n@sth\nlast`', '```text\n@sth\n```', '~~~\n@sth\n~~~', '```\n@sth',
    '> @sth sauvegarde ça', '  > @sth', '    @sth', '\t@sth',
    '<pasted_content id="1">@sth</pasted_content id="1">', '<pasted_content>@sth',
    'Voici un exemple :\n```\n@sth sauvegarde\n```\nExplique cet exemple.',
    'rien à sauvegarder', '', null, {},
  ]) {
    test(`ignores ${JSON.stringify(prompt)}`, () => assert.equal(hasSthMention(prompt), false))
  }
})

describe('real UserPromptSubmit hook execution', () => {
  test('runs from a plugin path containing spaces, with the current context workflow', () => {
    const result = run(event('@sth sauvegarde ça'))
    assert.equal(result.status, 0, result.stderr)
    assert.equal(result.stderr, '')
    const output = JSON.parse(result.stdout)
    assert.deepEqual(Object.keys(output), ['hookSpecificOutput'])
    assert.equal(output.hookSpecificOutput.hookEventName, 'UserPromptSubmit')
    const context = output.hookSpecificOutput.additionalContext
    assert.match(context, /main conversation/)
    assert.match(context, /Use current context/)
    assert.ok(context.includes(`[connection](<${join(realpathSync(plugin), 'skills/sth-library/reference/connection.md')}>)`))
    assert.doesNotMatch(context, /name: sth|description: fixture/)
    assert.ok(context.length < 10_000)
  })

  test('stays silent without invocation, on other events, and for malformed payloads', () => {
    for (const input of [event('Explique ce code'), event('`@sth`'), { ...event('@sth'), hook_event_name: 'SessionStart' }, '{broken-json', '{}', 'null', event(12)]) {
      const result = run(input)
      assert.equal(result.status, 0)
      assert.equal(result.stdout, '')
      assert.equal(result.stderr, '')
    }
  })

  test('does not echo the prompt or read supplied transcript paths', () => {
    const result = run({ ...event('@sth secret-marker-123'), transcript_path: '/does/not/exist/private-transcript', cwd: '/does/not/exist' })
    assert.equal(result.status, 0)
    assert.ok(JSON.parse(result.stdout).hookSpecificOutput.additionalContext)
    assert.doesNotMatch(result.stdout, /secret-marker|private-transcript/)
  })

  test('fails open if the bundled workflow is missing', () => {
    rmSync(workflow)
    const result = run(event('@sth secret-marker-123'))
    assert.equal(result.status, 0)
    assert.equal(result.stdout, '')
    assert.equal(result.stderr, '')
  })
})

test('large workflow stays below the context limit and points to the canonical file', () => {
  const output = mentionContext(event('@sth'), () => 'x'.repeat(20_000), '/plugin path/skills/sth/SKILL.md')
  assert.ok(output.hookSpecificOutput.additionalContext.length < 10_000)
  assert.match(output.hookSpecificOutput.additionalContext, /canonical workflow at \/plugin path/)
})

test('non-invocations never read the workflow', () => {
  assert.equal(mentionContext(event('hello'), () => { throw new Error('must not read') }), null)
})
