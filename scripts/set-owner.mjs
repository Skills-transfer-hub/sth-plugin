#!/usr/bin/env node
/**
 * Rewrites the GitHub owner across every file that names it.
 *
 *   node scripts/set-owner.mjs skillsth
 *
 * The owner appears in two manifests and four install commands. Editing them by
 * hand is how a package ends up advertising a repository it does not live in —
 * so it is one command, and `tests/identity.test.mjs` checks the result against
 * the actual git remote rather than trusting the file.
 *
 * Run this *after* the repository has been transferred, not before: the test
 * compares the declared repository with `origin`, and will fail on a URL that
 * does not yet exist.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const REPO = 'sth-plugin'
const FILES = ['plugin.json', '.claude-plugin/plugin.json', 'README.md']

export function currentOwner() {
  const manifest = JSON.parse(readFileSync(join(root, 'plugin.json'), 'utf8'))
  const match = /github\.com\/([^/]+)\//.exec(manifest.repository)
  if (!match) throw new Error('plugin.json has no parseable GitHub repository URL')
  return match[1]
}

export function setOwner(owner) {
  if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(owner)) {
    throw new Error(`Not a valid GitHub owner: ${owner}`)
  }
  const previous = currentOwner()
  if (previous === owner) return { previous, changed: [] }
  const changed = []
  for (const file of FILES) {
    const path = join(root, file)
    const before = readFileSync(path, 'utf8')
    const after = before.split(`${previous}/${REPO}`).join(`${owner}/${REPO}`)
    if (after !== before) {
      writeFileSync(path, after)
      changed.push(file)
    }
  }
  return { previous, changed }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const owner = process.argv[2]
  if (!owner) {
    console.log(`Current owner: ${currentOwner()}`)
    console.error('Usage: node scripts/set-owner.mjs <github-owner>')
    process.exit(1)
  }
  const { previous, changed } = setOwner(owner)
  console.log(
    changed.length === 0
      ? `Owner is already ${owner}.`
      : `${previous} -> ${owner} in ${changed.length} file(s): ${changed.join(', ')}`,
  )
}
