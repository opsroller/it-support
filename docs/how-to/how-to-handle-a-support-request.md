*How-to guide, for someone using the plugin who has a support request or incident to resolve.*

# How to handle a support request

This guide takes a request from "it's broken" to a verified fix with a
record, using the `resolve-support-request` workflow.

## Run the workflow

```
/it-support:resolve-support-request
args: { request: "Since this morning's update my GPU isn't detected: nvidia-smi says it can't communicate with the driver", host: "ws-07" }
```

- Paste the person's words and exact error text; do not paraphrase.
- Leave `apply` unset the first time. The workflow stops with a
  reviewed plan and `status: "awaiting-approval"`.

## If service is down, restore first

For an incident, the result's `restore` field names the fastest safe
way back, usually `nixos-rebuild switch --rollback`. If people are
blocked, do that now and say so in the ticket; the workflow's plan is
the real fix.

## Approve and apply

Read `plan`: the change kind, the diff on its branch, the test, the
rollback and the verification. When the change may go ahead (the host
owner agreed, or the project profile pre-approves it), resume:

```
/it-support:resolve-support-request
args: { request: "<same>", host: "ws-07", apply: true,
        run: { from: "Apply", results: <results from the first run> } }
```

The workflow tests the change, verifies it, makes it the default, and
rolls back by itself if verification fails.

## Close it

- Post `ticketNotes` where the project keeps them and tell the person.
- Ask them to confirm it works for them.
- Land the configuration PR: `/engineering-practices:land-pr { pr: "<the PR>" }`.

## If it stops

| Result | Do |
|---|---|
| `blocked` at triage | The host is out of reach or out of scope; fix access or ask the owner to add it to the profile |
| `blocked` at diagnose | The cause does not explain every symptom; gather the missing facts named in `open` and run again |
| `blocked` at apply with `rolledBack: true` | The host is back on its previous generation; read `open` and revise the plan |
| `unverified` | A reviewer returned nothing; rerun that step with `run.only` |

Related: [resolve-support-request reference](../reference/workflow-resolve-support-request.md) ·
[troubleshooting skill](../reference/skill-troubleshooting.md) ·
[How to roll back a bad change](how-to-roll-back-a-bad-change.md)
