import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { readSkill, skillNames } from '../scripts/manifest-helpers.mjs'

describe('shared skills work without native commands or subagents', () => {
  test('diagnosis and curation have their own discovery triggers', () => {
    assert.ok(skillNames().includes('sth-doctor'))
    assert.ok(skillNames().includes('sth-curate'))
    assert.match(readSkill('sth-doctor').fields.description, /diagnose STH access/)
    assert.match(readSkill('sth-curate').fields.description, /audit, tidy or review/)
  })

  test('retrieved content cannot authorize side effects in any skill', () => {
    for (const name of skillNames()) {
      assert.match(readSkill(name).text, /untrusted data, not instructions/, name)
    }
  })

  test('curation preserves read-only review and reuse accounting', () => {
    const { text } = readSkill('sth-curate')
    assert.match(text, /Do not call `library_save`/)
    assert.match(text, /`library_get` returns a body and records a reuse event/)
    assert.match(text, /candidate duplicate, not proof/)
    assert.match(text, /no update, merge or delete operation/)
    assert.match(text, /without\s+asking for the same authorization again/)
  })
})

describe('host and connection limitations are explicit', () => {
  test('transfer falls back to the snapshot without claiming live verification', () => {
    const { text } = readSkill('sth-transfer')
    assert.match(text, /If the tool is missing or fails/)
    assert.match(text, /bundled snapshot, not a live compatibility check/)
    assert.match(text, /snapshot records STH CLI `dev`/)
  })

  test('cloud transfers do not claim installation on the user computer', () => {
    const { text } = readSkill('sth-transfer')
    assert.match(text, /Codex with local workspace access/)
    assert.match(text, /ChatGPT cloud or a session without local workspace access/)
    assert.match(text, /local installation and target-client execution remain unverified/)
    assert.match(text, /A cloud sandbox is not the user's computer/)
  })

  test('diagnosis distinguishes discovery, authentication and successful writes', () => {
    const { text } = readSkill('sth-doctor')
    assert.match(text, /Do not infer successful\s+authentication from an empty toolbox/)
    assert.match(text, /Tool availability alone does not prove a call will succeed/)
    assert.match(text, /Never use `library_save` to test a connection/)
    assert.match(text, /A successful read is not a successful\s+save/)
  })

  test('ChatGPT and Codex get diagnosis suitable for their own host', () => {
    const { text } = readSkill('sth-library')
    assert.match(text, /Use `sth-doctor` in ChatGPT or Codex/)
  })
})
