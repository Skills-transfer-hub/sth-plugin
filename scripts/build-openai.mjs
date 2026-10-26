import { copyFileSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { ROOT } from './manifest-helpers.mjs'

// Only runtime files belong in an account upload. Keep client-specific commands,
// hooks, build tools, tests, Git metadata, and dependency directories out.
export const OPENAI_FILES = [
  'plugin.json', '.codex-plugin/plugin.json', 'mcp.json',
  'skills', 'assets', 'LICENSE',
]

function copyRuntime(source, destination) {
  const info = lstatSync(source)
  if (info.isSymbolicLink()) throw new Error(`Refusing to package symlink: ${source}`)
  if (info.isDirectory()) {
    mkdirSync(destination, { recursive: true })
    for (const name of readdirSync(source).sort()) {
      if (['.git', 'node_modules', '.DS_Store', '__pycache__'].includes(name)) continue
      if (/^\.env(?:\.|$)|\.(?:pem|key|p12|pfx)$/i.test(name)) {
        throw new Error(`Refusing to package a potential secret: ${source}/${name}`)
      }
      copyRuntime(join(source, name), join(destination, name))
    }
  } else if (info.isFile()) {
    mkdirSync(dirname(destination), { recursive: true })
    copyFileSync(source, destination)
  } else {
    throw new Error(`Unsupported package entry: ${source}`)
  }
}

export function buildOpenAI({ outputDir = join(ROOT, 'dist'), sourceRoot = ROOT } = {}) {
  const { name, version } = JSON.parse(readFileSync(join(sourceRoot, 'plugin.json'), 'utf8'))
  if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(name) || !/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error('Expected a kebab-case plugin name and a strict release version')
  }
  const stage = mkdtempSync(join(tmpdir(), 'sth-openai-'))
  try {
    const packageRoot = join(stage, name)
    for (const entry of OPENAI_FILES) {
      copyRuntime(join(sourceRoot, entry), join(packageRoot, entry))
    }
    copyRuntime(join(sourceRoot, 'docs/openai.md'), join(packageRoot, 'README.md'))
    mkdirSync(outputDir, { recursive: true })
    const archive = resolve(outputDir, `${name}-openai-${version}.tar.gz`)
    execFileSync('tar', ['-czf', archive, '-C', stage, name], {
      env: { ...process.env, COPYFILE_DISABLE: '1' },
    })
    return archive
  } finally {
    rmSync(stage, { recursive: true, force: true })
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(buildOpenAI())
}
