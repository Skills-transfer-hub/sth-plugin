import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { buildOpenAI } from './build-openai.mjs'
import { ROOT } from './manifest-helpers.mjs'

const readJSON = (path) => JSON.parse(readFileSync(path, 'utf8'))
const writeJSON = (path, value) => writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`)

// Public submission is a separate copy: keep private/local source hooks and
// account bindings intact. Missing review materials remain explicit gaps.
export function buildOpenAIPublic({ sourceRoot = ROOT, outputDir = join(ROOT, 'dist') } = {}) {
  const source = readJSON(join(sourceRoot, 'plugin.json'))
  const legacy = readJSON(join(sourceRoot, '.codex-plugin/plugin.json'))
  for (const manifest of [source, legacy]) {
    if (manifest.apps != null || manifest.extensions?.['com.openai']?.apps != null) {
      throw new Error('Public export requires MCP endpoints, not existing app bindings')
    }
  }
  if (existsSync(join(sourceRoot, '.app.json'))) throw new Error('Review the private .app.json binding before public export')
  const stage = mkdtempSync(join(tmpdir(), 'sth-public-'))
  try {
    const runtime = buildOpenAI({ sourceRoot, outputDir: stage })
    execFileSync('tar', ['-xzf', runtime, '-C', stage])
    const packageRoot = join(stage, source.name)
    const metadata = readJSON(join(sourceRoot, 'docs/openai-publication.json'))
    const cases = readJSON(join(sourceRoot, 'docs/openai-review-cases.json'))
    const mcp = readJSON(join(packageRoot, 'mcp.json'))
    if (Object.keys(mcp.mcpServers).length !== 1) throw new Error('Review cases require exactly one MCP server')
    const openai = source.extensions['com.openai']
    delete openai.hooks
    delete source.hooks
    openai.interface = { ...openai.interface, ...metadata.interface }
    openai.review = { ...metadata.review, test_cases: cases }
    openai.publication = metadata.publication
    delete legacy.hooks
    if (legacy.extensions?.['com.openai']) delete legacy.extensions['com.openai'].hooks
    legacy.interface = openai.interface
    writeJSON(join(packageRoot, 'plugin.json'), source)
    writeJSON(join(packageRoot, '.codex-plugin/plugin.json'), legacy)
    const missing = []
    for (const key of ['websiteURL', 'supportURL', 'privacyPolicyURL', 'termsOfServiceURL']) {
      if (!openai.interface[key]) missing.push(`interface.${key}`)
    }
    if (!openai.review.demo_recording_url) missing.push('review.demo_recording_url')
    if (cases.positive?.length !== 5 || cases.negative?.length !== 3) {
      throw new Error('Initial MCP review needs five positive and three negative cases')
    }
    mkdirSync(outputDir, { recursive: true })
    const archive = resolve(outputDir, `${source.name}-openai-public-${source.version}.draft.zip`)
    // zip updates existing archives; remove only this generated output first so
    // removed source files cannot survive from an older build.
    rmSync(archive, { force: true })
    execFileSync('zip', ['-q', '-r', '-X', archive, source.name], { cwd: stage })
    const readiness = {
      archive, package_metadata_complete: missing.length === 0,
      missing_package_fields: missing, submitted_for_review: false,
      published: false,
      remaining_checks: [
        'Confirm published policies cover cloud-library and MCP data practices.',
        'Record and verify the demo with a dedicated reviewer account and sample data.',
        'Verify tool annotations and execute all cases against the saved portal version.',
        'Verify developer identity/domain and complete secure reviewer access fields.',
        'Have the authorized developer complete policy attestations in the portal.'
      ]
    }
    writeJSON(archive.replace(/\.zip$/, '.readiness.json'), readiness)
    return readiness
  } finally {
    rmSync(stage, { recursive: true, force: true })
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(buildOpenAIPublic(), null, 2))
}
