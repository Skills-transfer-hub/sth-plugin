import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
export const read = (path) => readFileSync(join(ROOT, path), 'utf8')
export const json = (path) => JSON.parse(read(path))
export const exists = (path) => existsSync(join(ROOT, path))

/** The one endpoint every manifest must agree on. */
export const ENDPOINT = 'https://mcp.skillsth.com/api/mcp'
export const PLUGIN_NAME = 'sth'
export const VERSION = json('package.json').version

/**
 * Every tool the connector can expose. Newer servers add library_update and
 * library_archive; older ones stop at the other six, so skills must handle both.
 */
export const MCP_TOOLS = [
  'library_search',
  'library_get',
  'library_save',
  'library_update',
  'library_archive',
  'asset_search',
  'asset_get',
  'capabilities_get',
]

/** Every manifest that carries the plugin's identity. */
export const IDENTITY_MANIFESTS = [
  'plugin.json',
  'gemini-extension.json',
  '.claude-plugin/plugin.json',
  '.cursor-plugin/plugin.json',
  '.codex-plugin/plugin.json',
]

/**
 * The two names the Agent Plugins MCP configuration is published under.
 * Claude Code's `.mcp.json` declares the same server in its own shape.
 */
export const MCP_MANIFESTS = ['mcp.json', 'mcp_config.json']

/**
 * Everything the Claude plugin directory receives. It scans every file at the
 * root of the branch it tracks, and from an organization that is not Verified
 * it refuses tests, scripts, hooks and other client formats, so it tracks a
 * branch that scripts/build-claude.mjs builds from these paths only.
 */
export const CLAUDE_DIRECTORY_FILES = [
  '.claude-plugin/plugin.json',
  '.claude-plugin/icon.png',
  '.mcp.json',
  'skills',
  'commands',
  'agents',
  'README.md',
  'LICENSE',
]

export function skillNames() {
  return readdirSync(join(ROOT, 'skills'))
    .filter((entry) => statSync(join(ROOT, 'skills', entry)).isDirectory())
    .sort()
}

/**
 * Front matter as plain one-line `key: value` pairs, the only form the Claude
 * plugin directory accepts from an organization that is not Verified. Block
 * scalars (`>-`, `|`), lists, blank lines, comments, and values holding `: ` or
 * ` #` (which YAML reads as a mapping or a comment) fail to parse here, so the
 * tests refuse them before the directory does.
 */
export function frontmatter(text) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text)
  if (!match) return null
  const fields = {}
  for (const line of match[1].split('\n')) {
    const pair = /^([A-Za-z][\w-]*): ((?![>|[{])(?:(?!: | #).)+)$/.exec(line)
    if (!pair) throw new Error(`Front matter must be plain key: value lines: ${line}`)
    fields[pair[1]] = pair[2].replace(/^["']|["']$/g, '')
  }
  return fields
}

export function readSkill(name) {
  const text = read(join('skills', name, 'SKILL.md'))
  return { text, fields: frontmatter(text) }
}

/** Every tracked file, so a whole-package scan cannot miss a directory. */
export function allFiles(dir = ROOT, acc = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === '.git' || entry === 'node_modules') continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) allFiles(full, acc)
    else acc.push(full.slice(ROOT.length + 1))
  }
  return acc
}

/** The GitHub owner this package claims to live under. */
export function declaredOwner() {
  const match = /github\.com\/([^/]+)\//.exec(json('plugin.json').repository)
  if (!match) throw new Error('plugin.json has no parseable GitHub repository URL')
  return match[1]
}
