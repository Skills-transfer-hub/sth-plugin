import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { MCP_TOOLS, exists, json, read, readSkill, skillNames } from '../scripts/manifest-helpers.mjs'

describe('Agent Skills contract', () => {
  for (const name of skillNames()) {
    describe(`skills/${name}`, () => {
      const { text, fields } = readSkill(name)

      test('front matter parses and names itself after its directory', () => {
        assert.ok(fields, 'missing front matter')
        assert.equal(fields.name, name)
      })

      test('the description is specific enough to fire, short enough to load', () => {
        // Every session pays for this line, and it is the only thing the model
        // sees before deciding whether to open the skill.
        assert.ok(fields.description.length >= 80, 'too vague to trigger reliably')
        assert.ok(fields.description.length <= 600, 'too long for a discovery line')
      })

      test('the description says when to use it, not what it is', () => {
        assert.match(fields.description, /\bUse when\b/i)
      })

      test('the body is substantial and starts with a heading', () => {
        const body = text.split(/\n---\n/).slice(1).join('\n---\n').trim()
        assert.ok(body.length > 500, 'a skill this thin belongs in the description')
        assert.match(body, /^#\s+\S/)
      })

      test('it names no tool the connector does not expose', () => {
        for (const match of text.matchAll(/\b([a-z]+_[a-z_]+)\(/g)) {
          assert.ok(MCP_TOOLS.includes(match[1]), `unknown tool referenced: ${match[1]}`)
        }
      })
    })
  }
})

describe('the two skills divide the work without overlapping', () => {
  test('their descriptions do not both claim the same trigger', () => {
    // Two skills whose descriptions overlap fire at random. The library skill
    // owns search and save; the transfer skill owns the compatibility matrix.
    const library = readSkill('sth-library').fields.description.toLowerCase()
    const transfer = readSkill('sth-transfer').fields.description.toLowerCase()
    assert.equal(library.includes('compatibility'), false)
    assert.equal(transfer.includes('library_save'), false)
  })

  test('sth-library covers the whole library loop', () => {
    const { text } = readSkill('sth-library')
    for (const tool of ['library_search', 'library_get', 'library_save', 'asset_search', 'asset_get']) {
      assert.ok(text.includes(tool), `sth-library never mentions ${tool}`)
    }
  })

  test('sth-transfer sends the model to the matrix before converting', () => {
    const { text } = readSkill('sth-transfer')
    assert.ok(text.includes('capabilities_get'))
    for (const level of ['exact', 'lossy', 'native-only', 'unsupported']) {
      assert.ok(text.includes(level), `sth-transfer never explains "${level}"`)
    }
  })
})

describe('the skills tell the truth about consent and secrets', () => {
  test('the one skill that can write requires asking first', () => {
    const { text } = readSkill('sth-library')
    assert.match(text, /Ask before saving/i)
    assert.match(text, /secret/i)
  })

  test('the curating agent is forbidden from writing', () => {
    const agent = read('agents/sth-librarian.md')
    assert.match(agent, /Never write/i)
    // Assert on the sentence, not on a regex that happened to evaluate false.
    // The previous form used a `(?! )` lookahead that failed on any trailing
    // space, so it returned false even for "Always call `library_save`" — the
    // exact regression it was meant to catch.
    assert.match(agent, /(?:Do not|Never) call `library_save`/i)
    for (const line of agent.split('\n')) {
      if (!line.includes('`library_save`')) continue
      assert.match(line, /\b(?:do not|never|not)\b/i, `permissive mention: ${line.trim()}`)
    }
  })

  test('the save command shows the body before writing it', () => {
    assert.match(read('commands/save.md'), /show it to the user before writing/i)
  })
})

describe('the transfer skill ships its reference', () => {
  test('the compatibility file exists where the skill points', () => {
    assert.ok(exists('skills/sth-transfer/reference/compatibility.md'))
    assert.match(readSkill('sth-transfer').text, /reference\/compatibility\.md/)
  })

  test('it covers every target and artifact kind the manifest declares', () => {
    const manifest = json('data/sth-capabilities-v1.json')
    const reference = read('skills/sth-transfer/reference/compatibility.md')
    for (const target of manifest.targets) assert.ok(reference.includes(target), target)
    for (const kind of manifest.artifact_kinds) assert.ok(reference.includes(kind), kind)
  })
})
