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

/** The six tools the connector exposes, and the two skills that describe them. */
export const MCP_TOOLS = [
  'library_search',
  'library_get',
  'library_save',
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

/** The three names the same MCP configuration is published under. */
export const MCP_MANIFESTS = ['mcp.json', 'mcp_config.json', '.mcp.json']

export function skillNames() {
  return readdirSync(join(ROOT, 'skills'))
    .filter((entry) => statSync(join(ROOT, 'skills', entry)).isDirectory())
    .sort()
}

/**
 * Enough YAML for an Agent Skill's front matter: `key: value` and the folded
 * (`>-`) and literal (`|`) block scalars used for long descriptions. Anything
 * richer than that does not belong in a front matter block that six different
 * clients have to agree on, so failing to parse it is the correct outcome.
 */
export function frontmatter(text) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text)
  if (!match) return null
  const fields = {}
  const lines = match[1].split('\n')
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    if (!line.trim() || line.startsWith('#')) continue
    const pair = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line)
    if (!pair) throw new Error(`Unparsable front matter line: ${line}`)
    const [, key, rawValue] = pair
    if (rawValue === '>-' || rawValue === '>' || rawValue === '|' || rawValue === '|-') {
      const block = []
      while (index + 1 < lines.length && /^\s+\S/.test(lines[index + 1])) {
        block.push(lines[index + 1].trim())
        index += 1
      }
      fields[key] = rawValue.startsWith('|') ? block.join('\n') : block.join(' ')
    } else {
      fields[key] = rawValue.replace(/^["']|["']$/g, '')
    }
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
