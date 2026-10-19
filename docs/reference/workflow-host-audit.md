*Reference, for anyone looking up the `host-audit` workflow's arguments, phases and results.*

# host-audit

| Field | Value |
|---|---|
| Type | Workflow |
| File | [`workflows/host-audit.js`](../../workflows/host-audit.js) |
| Invoke | `/it-support:host-audit` |
| Skills used | linux-administration, nixos-administration, host-security, nvidia-cuda, virtualization; engineering-practices project-onboarding |

Audits one machine without changing it and records what it found.

## Arguments

| Arg | Required | Type | Meaning |
|---|---|---|---|
| `host` | yes | string | The host to audit |
| `focus` | no | array | Lenses to run, from `config`, `updates`, `storage`, `services`, `security`, `backups`, `gpu`, `virtualization`; default: every lens that applies |

Missing `host`, or an unknown lens, returns the usage string. `gpu` runs
only on hosts with an NVIDIA GPU and `virtualization` only where libvirt
is present.

## Phases

| Phase | Agents | Edits files | Does |
|---|---|---|---|
| Inventory | 1 | no | OS and release, configuration location, hardware, role, services, NVIDIA and libvirt presence |
| Audit | up to 8, parallel, independent | no | One read-only lens each; findings with severity, evidence, recommendation and the workflow that would fix it |
| Docs | 1 | yes (uncommitted) | Host reference page and dated audit findings in the project docs |
| Check | 1, independent | no | Every finding carried with evidence, nothing unsupported, no secrets, one Diataxis kind per page |

## Results

| Field | Meaning |
|---|---|
| `status` | `done`; `unverified` (a lens returned nothing); `blocked` with `open` or `reason` |
| `counts` | Findings per severity |
| `findings` | Most severe first, each with `lens`, `severity`, `title`, `evidence`, `recommendation`, `workflow` |
| `healthy`, `notChecked` | What was fine, and what could not be checked |
| `lensesRun`, `lensesSkipped`, `unverifiedLenses` | Coverage |
| `docs`, `docsCommitted` | Pages written; always `false`: the docs are left for small-change |
| `followUps` | Workflow runs that would fix the findings |
| `next` | Land the docs with small-change, then the follow-ups, most severe first |

## Run modes

Run modes v2, as in [resolve-support-request](workflow-resolve-support-request.md#run-modes).

Step labels: `inventory`, `audit:config`, `audit:updates`, `audit:storage`, `audit:services`, `audit:security`, `audit:backups`, `audit:gpu`, `audit:virtualization`, `docs`, `check`.

Independent steps: every `audit:` lens and `check`.

Related: [host-security](skill-host-security.md) · [index](index.md)
