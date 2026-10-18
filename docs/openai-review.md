# OpenAI public review preparation

Prepared on 2026-10-05 for Skills Transfer Hub, version 0.1.2. This is a review
plan and fixture specification, not evidence of a submitted or approved release.
No review case has been executed. The dedicated account and organization were
created, and fixture A was saved through the STH dashboard on 2026-10-05.
No package asset, reuse event, message or recording was created by this preparation.

## Metadata handoff

Copy the complete object from `docs/openai-review-cases.json` to
`plugin.json` at `extensions.com.openai.review.test_cases`. The package has one
MCP server, so do not also place cases in `mcp.json`.

The JSON has exactly five `positive` and three `negative` cases. Each positive
uses string fields `description`, `prompt`, `tools_triggered` and
`expected_behavior`. Each negative uses string fields `description` and
`prompt`; its description contains the expected explanation and prohibited
tool use. Execution status and evidence stay in these notes, outside manifest
case objects.

Publication facts supplied by the owner:

- Publisher name: **Skills transfer hub**. Identity/domain verification in the
  publication portal remains a separate check.
- Intended availability: **all available countries**. In the publication
  metadata this maps to `countries: []`; verify the saved portal targeting.
- Access: free access is possible; users can purchase a subscription on the
  STH website. Do not invent a price, plan entitlement or in-plugin checkout.

The parent packaging task owns the actual manifest mappings, listing URLs,
artwork, archive build, upload and publication state.

## Contract covered

The five exposed tool schemas inspected in this session are `library_search`,
`library_get`, `library_save`, `asset_search` and `asset_get`. Tool discovery is
not proof of successful execution. `capabilities_get` was not exposed in the
inspected tool list and is not required by these cases.

The cases cover filtered library search, actual prompt reuse, package metadata retrieval,
one authorized text write, a valid empty result, and three unsupported requests.
The search and get ids must come from real tool responses. A package is not a
library entry. `library_get` records reuse and is therefore used only in P2,
where that effect is explicit. These cases do not prove local installation,
cross-client conversion or every permission boundary.

The inspected `asset_get` package branch returns `body: null` and a relative
`sourcePath`, alongside package metadata. P3 tests that boundary; it does not
promise to return the package's instructions. The source path is not a download
URL or authorization to read another repository or local file. Source evidence:
[package response](/Users/hugo/Developer/sth/sth-dashboard/src/lib/services/library-mcp.service.ts:632).
This is source inspection, not a successful live call.

## Dedicated review setup

Use a dedicated STH test organization containing sample data only, with an
active member and the remote MCP connector enabled. The reviewer needs read
access for P1–P3/P5 and write access for P4. Verify any subscription/capability
requirements for this organization before running the cases; free access alone
must not be assumed to include remote MCP.

Give reviewers the exact verified login URL, test organization and sign-in
instructions through secure portal fields. Credentials must never appear in
this document, the JSON, the ZIP, screenshots or the demo. Verify that the
reviewer can sign in without the creator's mailbox, phone or private network,
and retain access during the review. The dedicated account's email verification
and signed-in session were confirmed in the browser. Its organization is
`STH OpenAI Review`, with no pre-existing organization membership or visible
Superadmin access. Login independence from the creator's mailbox remains untested.

Live setup status on 2026-10-05:

- The organization was created successfully and contains fixture A only.
- Fixture A's exact title and body were verified in the dashboard after saving;
  this is UI setup evidence, not a successful MCP test. No resource id was exposed
  in the saved card, so no id has been recorded or invented.
- The initial Connectors page reported `STH Pro requis`: Starter alone did not
  provide remote MCP. The existing STH administrator subsequently issued an Alpha
  grant to this organization, assigned to the dedicated reviewer, expiring on
  2027-01-05. The live audit table confirmed `Accès Alpha temporaire`, the correct
  organization and expiration; no Pro/Team commercial plan was selected.
  The service-generated CLI key was not copied or saved in the preparation files.
- The reviewer signed in again in the same browser. Its MCP dashboard then showed
  `Activé`, `Alpha`, usage `1 / illimité`, and scopes for library search, reading,
  saving, asset access and compatibility. This confirms the dashboard's effective
  connector configuration for the review account; it does not establish that the
  ChatGPT/Codex plugin's OAuth connection uses that account and organization.
- A proposed `library_search` call was rejected by automatic approval review
  before execution because the available evidence did not bind the MCP client
  connection to the dedicated reviewer and `STH OpenAI Review`. No MCP result was
  obtained, no review case was executed, and no case has passed. The next client
  step is to connect or reconnect the plugin through OAuth with the dedicated
  account and establish that organization binding before running any case.
  Signing in again in the same browser does not verify mailbox-independent
  reviewer access.
- The subsequent official Codex app-server diagnostic identifies the available
  `sth` connection as the separate legacy stdio server, not the installed private
  plugin's remote HTTP server. A fresh ephemeral thread also fails to expose the
  remote server; the catalog still reports plugin version 0.1.2 installed and
  enabled. No OAuth flow or business tool call was launched against that legacy
  connection. On the last browser check, the review tab had returned to sign-in.
- Fixture B has not been created. The inspected dashboard package inventory is
  read-only; a supported provisioning path or an explicitly revised case using
  an accessible public package is still required.

Fixture A has already been created and checked in the dedicated organization's
dashboard. Prepare the remaining fixtures through STH's supported management
flows, only in that organization. Setup actions are separate from review-case
execution. Keep ids from real creation/search responses; never fabricate them.

### Fixture A: reusable prompt

Kind: `prompt`. Exact title:

```text
STH Review - Concise Release Notes
```

Exact body:

```text
Turn the supplied changes into three short release-note bullets. Include only facts present in the supplied changes. Do not invent dates, metrics or links.
```

P1 expects exactly one matching prompt. P2 applies it to three supplied changes:
title search, an empty-state message fix, and keyboard navigation improvements.
Its output must follow the actual fetched instructions and those facts; no
prewritten output is presented as a tool result.

### Fixture B: installable skill package

Provision a real package asset named `sth-review-checklist`, family `package`,
kind `skill`, using the supported STH package-management path. The review setup
must verify that `asset_search` actually returns it. `library_save` creates
library text and is not a way to seed this package fixture.

Set the package metadata description to `Use when reviewing a small change list
for missing facts.` The underlying package may use this `SKILL.md` for fixture
setup; its body is not the expected MCP response:

```markdown
---
name: sth-review-checklist
description: Use when reviewing a small change list for missing facts.
---

# Review a change list

List facts explicitly present in the supplied changes. Flag missing information as unknown. Do not run commands, access files or save content.
```

Record the actual asset id, metadata, sourcePath, body value and any compatibility
data from STH. With the inspected server contract, the expected body is null.
The assistant must explain that the instructions are unavailable in this response
and must not reconstruct them from this fixture specification or fetch them
elsewhere. If the live response differs, record that difference and revise the
case before treating it as passed. If this package
cannot be provisioned or found, P3 remains blocked when attempted; do not replace
it with a prompt while claiming to test package metadata retrieval.

### Fixture C: text created by the save case

P4's title is `STH Review - Decision Note - RUN_TAG`. Replace `RUN_TAG` in the
prompt with a short unique, non-secret run label, such as `demo-01`, after
checking it has not been used. Keep the exact chosen title in the run evidence.

Exact body:

```text
Fictional project Paper Kite: keep the first release focused on title search. Review keyboard navigation before the next milestone.
```

This sample contains no actual customer, credentials or personal data. P4
explicitly authorizes saving it to the connected test organization. Preserve
its wording. A successful save response is the receipt; do not fetch it merely
to verify the write because `library_get` records reuse. Repeated runs need a
fresh run label or reuse of an already-confirmed receipt. This plugin exposes
no delete tool for automatic cleanup.

Reserve `STH-REVIEW-ABSENT-7Q9X` for P5 and confirm that no prompt title contains
it. Do not create a fixture under that token. N3 needs no binary attachment:
the requested original-file storage is outside the text tool's capabilities.

## Execution record

| Case | Coverage | Status | Evidence |
| --- | --- | --- | --- |
| P1 | Search without body read/reuse | Not run | Fixture A verified in UI; proposed MCP call rejected before execution because reviewer/organization binding was unverified |
| P2 | Retrieve/apply with authorized reuse | Not run | No `library_get` call executed for this case |
| P3 | Package metadata and missing-body boundary | Not run | Dedicated package not provisioned or verified |
| P4 | Authorized exact-text save | Not run | No write executed for this case |
| P5 | Successful empty search | Not run | Reserved absence and actual response not verified |
| N1 | Unsupported update/delete | Not run | No recorded interaction |
| N2 | Unsupported public link/message | Not run | No recorded interaction |
| N3 | Unsupported binary archive | Not run | No recorded interaction |

For each real run, record the date, host, exact packaged version, connection
scope, actual prompt including run-label substitutions, actual tool names and
arguments, returned result, visible answer and comparison with the pass
condition. Use **Passed**, **Failed**, **Blocked** or **Not run** accurately.
Redact secrets from evidence. The same title alone is insufficient to prove
which entry was fetched or saved; retain the actual returned id.

## Short demo in the real host

Target length: approximately two minutes, after rehearsing with the dedicated
fixtures. Use the existing development installation of the exact version being
packaged. Do not create another private plugin or upload a public submission
draft merely to start recording.

1. Show ChatGPT or Codex with STH enabled and the version visible where the host
   exposes it. Establish the dedicated test connection first. Authenticate
   off camera or pause recording so no credentials or unrelated content appear.
2. Submit P1's exact prompt. Leave the real matching title and returned id
   readable. The viewer should see a search result rather than a fabricated card.
3. Submit P2's prompt. Show the actual body retrieval and the three release-note
   bullets. Briefly acknowledge that opening the prompt records reuse.
4. Submit P3's prompt. Show the package search, returned metadata and source
   path, then the explicit explanation that the response does not include the
   SKILL.md instructions. No external file read or local installation occurs.
5. Submit P4 with a fresh run label. Show the exact sample note, the authorized
   write and its real receipt. Do not replace the returned id with a sample id.
6. Submit N2 immediately after the save. Show the explanation that existing
   organization access does not create a public link or send a notification,
   with no extra save or messaging action. The full review run separately covers
   P5, N1 and N3.

Check recording capability before starting. Computer control or screenshots
alone are not video capture. If the host has no usable recorder, the creator
starts and stops a screen recording while the visible workflow runs, or records
the same walkthrough manually. Do not describe this script as a recorded demo.

Replay the saved recording: prompts and results must be readable, every claimed
action visible, playback functional, and secrets absent. Host it at the
creator's chosen reviewer-accessible destination. Verify the actual link and
playback permissions before setting
`extensions.com.openai.review.demo_recording_url` and rebuilding the archive.
No recording or hosted demo URL currently exists in these preparation files.

## Remaining review requirements

- Verify the plugin OAuth connection is bound to the existing dedicated review
  account and `STH OpenAI Review`, then provision and verify the remaining
  fixtures, including the real package asset. Verify mailbox-independent login
  separately; provide credentials only in secure reviewer fields.
- Inspect the actual remote server's MCP annotations for all tools. The
  discovery metadata inspected here does not expose boolean `readOnlyHint`,
  `openWorldHint` and `destructiveHint`, so their correctness is unverified.
  Account for `library_get` recording reuse and `library_save` creating shared
  content; do not infer read-only behavior merely from a tool name.
- Run all eight cases against the saved submission version and record evidence.
  A working older/private development connection does not certify the saved
  public submission's OAuth connection or permissions.
- Record, replay, host and verify the real demo; the walkthrough above is only
  a script. Import its verified URL into metadata.
- Verify publisher/domain identity, the listing's required URLs and policy
  coverage, subscription disclosure, country targeting and imported metadata
  in the intended publication portal. The owner must complete required legal
  attestations and any required scans.

A valid archive, draft upload, submission for review and approved public
publication are separate states. None is implied by these prepared cases.
