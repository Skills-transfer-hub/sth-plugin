import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { read } from './helpers.mjs'
import { loadManifest, renderReference } from '../scripts/build-reference.mjs'

describe('the compatibility reference is derived, not retyped', () => {
  const manifest = loadManifest()

  test('the committed file matches what the generator produces', () => {
    // The failure this catches: the CLI ships a new dialect, the reference
    // keeps promising the old one, and an agent writes a file the target
    // silently ignores. Run `npm run build:reference` to fix.
    assert.equal(
      read('skills/sth-transfer/reference/compatibility.md'),
      renderReference(manifest),
      'compatibility.md is stale — run: npm run build:reference',
    )
  })

  test('the matrix has exactly one cell per target and artifact kind', () => {
    // Derived rather than pinned to 36: a seventh target upstream should make
    // this fail as an incoherence, not as a hard-coded count nobody updated.
    const expected = manifest.targets.length * manifest.artifact_kinds.length
    assert.equal(manifest.compatibility.length, expected)
    const seen = new Set(manifest.compatibility.map((c) => `${c.target_kind}/${c.artifact_kind}`))
    assert.equal(seen.size, expected, 'duplicate or missing cell')
  })

  test('every cell declares a level the skill knows how to act on', () => {
    const levels = new Set(['exact', 'lossy', 'native-only', 'unsupported'])
    for (const cell of manifest.compatibility) {
      assert.ok(levels.has(cell.level), `${cell.target_kind}/${cell.artifact_kind}: ${cell.level}`)
    }
  })

  test('every implemented, convertible cell names a destination', () => {
    // A cell the CLI will act on but that gives no path leaves the agent to
    // invent one, which is exactly what the skill forbids.
    for (const cell of manifest.compatibility) {
      if (!cell.implemented || cell.level === 'unsupported') continue
      assert.ok(cell.destination, `${cell.target_kind}/${cell.artifact_kind} has no destination`)
    }
  })

  test('the vendored manifest declares the targets the skill names', () => {
    assert.deepEqual(
      [...manifest.targets].sort(),
      ['antigravity', 'claude', 'codex', 'copilot', 'cursor', 'gemini'],
    )
  })
})
