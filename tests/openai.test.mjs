import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { buildOpenAI, OPENAI_FILES } from '../scripts/build-openai.mjs'
import { ROOT, json } from '../scripts/manifest-helpers.mjs'

describe('OpenAI account package', () => {
  const manifest = json('plugin.json')
  const presentation = manifest.extensions['com.openai'].interface

  test('portable and Codex manifests present the same plugin', () => {
    assert.deepEqual(json('.codex-plugin/plugin.json').interface, presentation)
    assert.equal(presentation.displayName, 'Skills Transfer Hub')
    assert.ok(presentation.shortDescription.length <= 30)
    assert.ok(presentation.defaultPrompt.length >= 1 && presentation.defaultPrompt.length <= 3)
    assert.deepEqual(presentation.capabilities, ['Read', 'Write'])
  })

  test('both themes reference contained square PNG assets', () => {
    for (const key of ['logo', 'logoDark', 'composerIcon', 'composerIconDark']) {
      const path = presentation[key]
      assert.match(path, /^\.\/assets\/[a-z0-9-]+\.png$/)
      const png = readFileSync(join(ROOT, path))
      assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a')
      const width = png.readUInt32BE(16)
      assert.equal(width, png.readUInt32BE(20))
      assert.ok(width >= 48 && width <= 4096)
      assert.ok(png.length <= 5 * 1024 * 1024)
    }
    assert.notEqual(presentation.logo, presentation.logoDark)
  })

  test('export extracts as one self-contained runtime package', () => {
    const output = mkdtempSync(join(tmpdir(), 'sth-export-test-'))
    try {
      const archive = buildOpenAI({ outputDir: output })
      const entries = execFileSync('tar', ['-tzf', archive], { encoding: 'utf8' }).trim().split('\n')
      assert.ok(entries.every((path) => path.startsWith('sth/') && !path.includes('..')))
      for (const path of [
        'plugin.json', '.codex-plugin/plugin.json', 'mcp.json', 'README.md', 'LICENSE',
        'skills/sth-library/SKILL.md', 'skills/sth-transfer/SKILL.md',
        'skills/sth-transfer/reference/compatibility.md',
        'skills/sth-doctor/SKILL.md', 'skills/sth-curate/SKILL.md',
        'assets/sth-icon-light.png', 'assets/sth-icon-dark.png',
      ]) assert.ok(entries.includes(`sth/${path}`), `missing ${path}`)
      for (const entry of entries) {
        assert.doesNotMatch(entry, /(?:^|\/)(?:\.git|\.agents|\.claude-plugin|\.cursor-plugin|hooks|commands|agents|node_modules|tests|scripts|dist)(?:\/|$)/)
      }
      execFileSync('tar', ['-xzf', archive, '-C', output])
      for (const path of ['plugin.json', '.codex-plugin/plugin.json', 'mcp.json', presentation.logo, presentation.logoDark]) {
        assert.deepEqual(readFileSync(join(output, 'sth', path)), readFileSync(join(ROOT, path)))
      }
    } finally {
      rmSync(output, { recursive: true, force: true })
    }
  })

  test('export rejects symlinks and potential secret files in bundled trees', () => {
    const fixture = mkdtempSync(join(tmpdir(), 'sth-export-unsafe-'))
    try {
      for (const entry of [...OPENAI_FILES, 'docs']) {
        cpSync(join(ROOT, entry), join(fixture, entry), { recursive: true })
      }
      const link = join(fixture, 'assets', 'external-link')
      symlinkSync(join(ROOT, 'package.json'), link)
      assert.throws(() => buildOpenAI({ sourceRoot: fixture, outputDir: join(fixture, 'dist') }), /symlink/)
      rmSync(link)
      writeFileSync(join(fixture, 'assets', '.env.local'), 'EXAMPLE=value\n')
      assert.throws(() => buildOpenAI({ sourceRoot: fixture, outputDir: join(fixture, 'dist') }), /potential secret/)
    } finally {
      rmSync(fixture, { recursive: true, force: true })
    }
  })
})
