import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { ROOT, declaredOwner, json, read } from '../scripts/manifest-helpers.mjs'

/**
 * The package must not advertise a repository it does not live in. Every
 * install command in the README clones that URL, so a stale owner is a
 * six-client outage that no other test would notice.
 */
describe('the declared repository is the real one', () => {
  const owner = declaredOwner()
  const slug = `${owner}/sth-plugin`

  test('both manifests that name a repository agree', () => {
    for (const path of ['plugin.json', '.claude-plugin/plugin.json']) {
      assert.equal(json(path).repository, `https://github.com/${slug}`, path)
    }
  })

  test('every install command in the README uses that slug', () => {
    const readme = read('README.md')
    const mentioned = [...readme.matchAll(/github\.com\/([\w-]+\/[\w-]+)/g)].map((m) => m[1])
    const marketplaceAdd = [...readme.matchAll(/marketplace add ([\w-]+\/[\w-]+)/g)].map((m) => m[1])
    for (const found of [...mentioned, ...marketplaceAdd]) {
      assert.equal(found, slug, `README points at ${found}, not ${slug}`)
    }
    assert.ok(marketplaceAdd.length > 0, 'the README lost its marketplace add command')
  })

  test('the git remote matches what the manifests claim', () => {
    let remote
    try {
      remote = execFileSync('git', ['remote', 'get-url', 'origin'], {
        cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
      }).trim()
    } catch {
      return // no remote: an archive export or a bare copy, nothing to compare
    }
    const actual = /github\.com[:/]([\w-]+\/[\w-]+?)(?:\.git)?$/.exec(remote)
    assert.ok(actual, `unparsable remote: ${remote}`)
    assert.equal(
      actual[1].toLowerCase(),
      slug.toLowerCase(),
      'the manifests name a different repository than the one this clone came from',
    )
  })
})
