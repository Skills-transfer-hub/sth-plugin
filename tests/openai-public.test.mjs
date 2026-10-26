import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { buildOpenAIPublic } from '../scripts/build-openai-public.mjs'

test('public ZIP retains reviewed metadata and removes private-only declarations', () => {
  const dir = mkdtempSync(join(tmpdir(), 'sth-public-test-'))
  try {
    const result = buildOpenAIPublic({ outputDir: dir })
    assert.equal(result.package_metadata_complete, false)
    assert.equal(result.submitted_for_review, false)
    assert.equal(result.published, false)
    assert.ok(result.missing_package_fields.includes('review.demo_recording_url'))
    const entries = execFileSync('unzip', ['-Z1', result.archive], { encoding: 'utf8' }).trim().split('\n')
    assert.ok(entries.every((path) => path.startsWith('sth/')))
    assert.ok(!entries.includes('sth/.app.json'))
    assert.ok(!entries.some((path) => path.startsWith('sth/hooks/')))
    execFileSync('unzip', ['-q', result.archive, '-d', dir])
    const read = (path) => JSON.parse(readFileSync(join(dir, 'sth', path), 'utf8'))
    const manifest = read('plugin.json')
    const legacy = read('.codex-plugin/plugin.json')
    const openai = manifest.extensions['com.openai']
    assert.equal(openai.hooks, undefined)
    assert.equal(legacy.hooks, undefined)
    assert.equal(openai.apps, undefined)
    assert.equal(legacy.apps, undefined)
    assert.equal(openai.interface.developerName, 'Skills Transfer Hub')
    assert.equal(openai.interface.supportURL, 'https://www.skillsth.com/fr/contact')
    assert.deepEqual(legacy.interface, openai.interface)
    assert.deepEqual(openai.publication.countries, [])
    assert.equal(openai.review.commerce, true)
    assert.match(openai.review.commerce_description, /website/)
    assert.equal(openai.review.test_cases.positive.length, 5)
    assert.equal(openai.review.test_cases.negative.length, 3)
    for (const c of openai.review.test_cases.positive) {
      for (const field of ['description', 'prompt', 'tools_triggered', 'expected_behavior']) {
        assert.equal(typeof c[field], 'string')
        assert.ok(c[field].trim())
      }
    }
    for (const key of ['logo', 'logoDark', 'composerIcon', 'composerIconDark']) {
      assert.ok(entries.includes(`sth/${openai.interface[key].replace(/^\.\//, '')}`))
    }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
