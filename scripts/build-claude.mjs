import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { CLAUDE_DIRECTORY_FILES, ROOT, VERSION } from './manifest-helpers.mjs'

// The Claude plugin directory tracks this branch instead of main. It holds the
// committed plugin files and nothing else, so main keeps the other clients'
// manifests, the scripts and the tests the directory would refuse.
const BRANCH = 'claude-directory'

const git = (args, options = {}) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', ...options }).trim()
const commitOf = (ref) => {
  try { return git(['rev-parse', '--quiet', '--verify', `${ref}^{commit}`]) } catch { return '' }
}

const scratch = mkdtempSync(join(tmpdir(), 'sth-claude-'))
// A throwaway index: neither the working tree nor the real index changes.
const index = { env: { ...process.env, GIT_INDEX_FILE: join(scratch, 'index') } }
try {
  if (git(['status', '--porcelain', '--', ...CLAUDE_DIRECTORY_FILES])) {
    console.warn('Uncommitted changes to the plugin files are left out: this builds HEAD.')
  }
  const listing = git(['ls-tree', '-r', '-z', 'HEAD', '--', ...CLAUDE_DIRECTORY_FILES])
  for (const path of CLAUDE_DIRECTORY_FILES) {
    if (!listing.includes(`\t${path}`)) throw new Error(`${path} is not committed at HEAD`)
  }
  git(['update-index', '-z', '--index-info'], { ...index, input: listing })
  const tree = git(['write-tree'], index)
  const parent = commitOf(`refs/heads/${BRANCH}`) || commitOf(`refs/remotes/origin/${BRANCH}`)
  if (parent && git(['rev-parse', `${parent}^{tree}`]) === tree) {
    console.log(`${BRANCH} already holds the plugin at HEAD.`)
  } else {
    const source = git(['rev-parse', '--short', 'HEAD'])
    const commit = git(['commit-tree', tree, ...(parent ? ['-p', parent] : []), '-m', `sth ${VERSION} from ${source}`])
    git(['update-ref', `refs/heads/${BRANCH}`, commit])
    console.log(`${BRANCH} is now ${commit.slice(0, 7)}, sth ${VERSION} from ${source}. Publish it: git push origin ${BRANCH}`)
  }
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
