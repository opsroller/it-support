*Reference, for anyone looking up the `resolve-support-request` workflow's arguments, phases and results.*

# resolve-support-request

| Field | Value |
|---|---|
| Type | Workflow |
| File | [`workflows/resolve-support-request.js`](../../workflows/resolve-support-request.js) |
| Invoke | `/it-support:resolve-support-request` |
| Skills used | troubleshooting, change-management, nixpkgs-search, nixos-administration, linux-administration, and the skill for the area (nvidia-cuda, virtualization, host-security); engineering-practices project-onboarding, git-workflow |

Takes one support request or incident from the person's words to a
verified, documented, reversible configuration change.

## Arguments

| Arg | Required | Type | Meaning |
|---|---|---|---|
| `request` | yes | string | The request in the person's words, or a ticket link |
| `host` | no | string | Host it concerns; default: the one the request names |
| `apply` | no | boolean | `true` lets the workflow apply the change; default `false` stops with the plan |
| `branch` | no | string | Existing branch of the configuration repository |
| `pr` | no | string | Existing PR to work on |

Missing `request` returns the usage string.

## Phases

| Phase | Agents | Edits files | Does |
|---|---|---|---|
| Triage | 1 | no | Symptom in the person's words, kind (incident, service request, problem), impact, facts and recent changes, a restore suggestion. Blocks if the host is out of reach or scope |
| Diagnose | 0-1 | no | Incidents and problems only: root cause in one sentence, what was ruled out, the fix at the cause. Blocks if the cause does not explain every symptom |
| Plan | 1 | yes (branch) | Searches nixpkgs first, writes the smallest declarative change, commits, builds without activating, names kind, test, rollback, verification, impact |
| Review | 1-3, independent | no; one revision edits | Independent read-only check of the plan; one revision and re-check if it finds problems |
| Apply | 0-1 | host | Only when `apply` is `true`, the change is not destructive and the profile does not require the owner: test, verify, then switch; rolls back on failure. Otherwise returns `awaiting-approval` |
| Docs | 1 | yes | Ticket notes and the Diataxis pages the work owes |
| Verify | 1, independent | no | Original symptom gone, no new failures, running system matches the commit, rollback target exists, docs well formed |
| Hand off | 1 | no (pushes) | Pushes; updates or opens a draft `fix:` or `feat:` PR. Does not mark it ready or merge |

## Results

| Field | Meaning |
|---|---|
| `status` | `done`; `awaiting-approval` (with `plan` and `next`); `unverified` (a review or the verification returned nothing); `blocked` with `open` or `reason` |
| `kind`, `symptom`, `rootCause` | The triage and diagnosis |
| `change`, `changeKind`, `generation`, `rollback` | What was applied and how to undo it |
| `ticketNotes` | Text for the ticket or log the project uses |
| `docs`, `undocumented`, `notes` | Pages touched, gaps, non-blocking notes |
| `handoff` | The engineering-practices hand-off object, when `done` |
| `next` | Tell the person, then land-pr |

## Run modes

Run modes v2. Besides its own args, the workflow takes the optional `run` arg defined in the engineering-practices
[workflow run modes reference](https://github.com/opsroller/engineering-practices/blob/main/docs/reference/workflow-run-modes.md):
`run: { mode: "inline" }` runs every phase in the calling session with no subagents, `run.only` runs chosen phases or steps,
and `run.from` with `run.results` resumes a stopped run (for example `run.from: "Apply"` after approval).
See [how to run a workflow inline](https://github.com/opsroller/engineering-practices/blob/main/docs/how-to/how-to-run-a-workflow-inline.md).

Step labels: `triage`, `diagnose`, `plan`, `review`, `revise`, `review-again`, `apply`, `docs`, `verify`, `handoff`.

Independent steps: `review`, `review-again` and `verify`. In inline mode send them to a reviewer who did not do the work and name them in `run.reviewers`, or the run lists them under `self_reviewed`.

Related: [How to handle a support request](../how-to/how-to-handle-a-support-request.md) · [troubleshooting](skill-troubleshooting.md) · [index](index.md)
