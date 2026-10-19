*Reference, for anyone looking up the `provide-software` workflow's arguments, phases and results.*

# provide-software

| Field | Value |
|---|---|
| Type | Workflow |
| File | [`workflows/provide-software.js`](../../workflows/provide-software.js) |
| Invoke | `/it-support:provide-software` |
| Skills used | nixpkgs-search (with the bundled `nixos` MCP server), nixos-administration, change-management; engineering-practices project-onboarding, git-workflow |

Makes a tool, service or setting available declaratively, after finding
it in nixpkgs, at the right layer: the system, one user, or one
project's devShell.

## Arguments

| Arg | Required | Type | Meaning |
|---|---|---|---|
| `need` | yes | string | What the person needs, in their words |
| `scope` | no | `system`, `user` or `project` | Where it goes; default: decided from the need |
| `host` | no | string | Host for system or user scope |
| `project` | no | string | Project repository or directory, for project scope |
| `apply` | no | boolean | `true` lets the workflow apply a system or user change; default `false` |
| `branch` | no | string | Existing branch to work on |
| `pr` | no | string | Existing PR to work on |

Missing `need`, or a `scope` other than the three, returns the usage string.

## Phases

| Phase | Agents | Edits files | Does |
|---|---|---|---|
| Search | 1 | no | Channel the host follows; packages, module options, Home Manager options, licence, cache status, versions; every query recorded. Returns `not-packaged` if nothing provides it |
| Configure | 1 | yes (branch) | The change at the chosen layer, unfree allowed by name, committed and built; the software runs in the built result; change kind classified |
| Check | 1-3, independent | no; one revision edits | Independent read-only review: searches enough, existing module used, right layer, declarative, rollback real; one revision and re-check |
| Apply | 0-1 | host | System or user scope, only when `apply` is `true`, the change is not destructive and the profile does not require the owner: test, check, switch; rolls back on failure. Project scope needs no apply |
| Docs | 2 (one independent) | yes | Reference and how-to pages; an independent read-only docs check |
| Hand off | 1 | no (pushes) | Pushes; updates or opens a draft `feat:` PR. Does not mark it ready or merge |

## Results

| Field | Meaning |
|---|---|
| `status` | `done`; `not-packaged` (with `queries` and `next`); `awaiting-approval`; `unverified`; `blocked` with `open` or `reason` |
| `choice`, `scope`, `queries` | What was chosen, where, and the searches behind it |
| `generation`, `rollback` | When applied, and how to undo |
| `docs`, `undocumented`, `notes` | As in the other workflows |
| `handoff` | The engineering-practices hand-off object, when `done` |
| `next` | Tell the person how to use it, then land-pr |

## Run modes

Run modes v2, as in [resolve-support-request](workflow-resolve-support-request.md#run-modes).

Step labels: `search`, `configure`, `check`, `revise`, `check-again`, `apply`, `docs`, `docs-check`, `handoff`.

Independent steps: `check`, `check-again` and `docs-check`.

Related: [How to find a package or option](../how-to/how-to-find-a-package-or-option.md) · [nixpkgs-search](skill-nixpkgs-search.md) · [The nixos MCP server](mcp-server.md) · [index](index.md)
