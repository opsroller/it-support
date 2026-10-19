*Reference, for anyone looking up what the `it-support` agent does and does not do.*

# it-support agent

| Field | Value |
|---|---|
| Type | Subagent |
| File | [`agents/it-support.md`](../../agents/it-support.md) |
| Base | Loads `engineering-practices` and follows `project-onboarding` before any task |
| Bundled tools | The [`nixos` MCP server](mcp-server.md) for nixpkgs package and option search |
| First rule | Configuration is code: every lasting change is a change to the host's declared configuration in version control |

## Owns

| Area | Skill or workflow |
|---|---|
| Support requests and incidents | [troubleshooting](skill-troubleshooting.md), [resolve-support-request](workflow-resolve-support-request.md) |
| Finding packages, options and versions | [nixpkgs-search](skill-nixpkgs-search.md) |
| NixOS: flakes, modules, rebuilds, generations, rollback, devShells | [nixos-administration](skill-nixos-administration.md), [provide-software](workflow-provide-software.md) |
| Linux and macOS: services, logs, users, storage, networking | [linux-administration](skill-linux-administration.md) |
| NVIDIA drivers, CUDA, GPU containers | [nvidia-cuda](skill-nvidia-cuda.md) |
| libvirt, KVM, virsh, passthrough | [virtualization](skill-virtualization.md) |
| Changes: test, rollback, approval, record | [change-management](skill-change-management.md) |
| Updates, access, exposure, secrets, backups | [host-security](skill-host-security.md), [host-audit](workflow-host-audit.md) |

## Does not own

| Area | Owner |
|---|---|
| CI pipelines, build runners, releases, signing, store submission | devops-engineer |
| Application code, including GPU code | The engineering role that owns it |
| Plans and priorities | project-manager |
| PR review | code-reviewer |
| Hardware purchases, accounts, licences, payments | The owner |

## Asks before

Wiping disks or data, deleting a VM's storage, removing generations
needed to roll back, changing a host outside the project profile's
scope, and anything that takes shared service down.

## Never

- Installs software imperatively on a managed host, or hand-edits generated files.
- Writes a derivation, script or tool before searching nixpkgs and the platform's packages.
- Runs a destructive command without the owner's word and a checked backup.
- Disables a security control to make something work.
- Leaves a host in a state its configuration does not describe without recording it.
- Searches the whole filesystem or reads people's files beyond what the request needs.

Related: [index](index.md) · [About the role](../explanation/about-the-role.md)
