*Reference landing page, for anyone looking up a part of the it-support plugin.*

# Reference

These pages describe each part of the plugin as it is. They mirror the
repository: one page for the agent, one for the bundled MCP server, one
per skill, one per workflow.

## Agent

- [it-support](agent.md): what the agent owns, what it asks before
  doing, what it leaves to neighbouring roles, and its "never" list.

## Bundled MCP server

- [nixos](mcp-server.md): the `mcp-nixos` server from nixpkgs, its `nix`
  and `nix_versions` tools, and what happens when Nix is absent.

## Skills

**Finding and installing**
- [nixpkgs-search](skill-nixpkgs-search.md): packages, options, versions, licences and cache status in nixpkgs.
- [nixos-administration](skill-nixos-administration.md): flakes, modules, rebuilds, generations, rollback, devShells, caches.

**Running machines**
- [linux-administration](skill-linux-administration.md): services, logs, users, storage, networking, other distributions and macOS.
- [nvidia-cuda](skill-nvidia-cuda.md): NVIDIA drivers, CUDA compatibility and builds, GPU containers, GPU faults.
- [virtualization](skill-virtualization.md): libvirt, KVM, virsh, networks, storage, UEFI and TPM, passthrough.

**Doing it safely**
- [troubleshooting](skill-troubleshooting.md): support requests and incidents from report to root cause and closure.
- [change-management](skill-change-management.md): change kinds, rollback, approval, staging and records.
- [host-security](skill-host-security.md): updates, access, exposure, secrets, encryption, backups.

## Workflows

| Workflow | Args | Page |
|---|---|---|
| `resolve-support-request` | `{ request, host?, apply?, branch?, pr? }` | [resolve-support-request](workflow-resolve-support-request.md) |
| `provide-software` | `{ need, scope?, host?, project?, apply?, branch?, pr? }` | [provide-software](workflow-provide-software.md) |
| `host-audit` | `{ host, focus? }` | [host-audit](workflow-host-audit.md) |

## plugin.json fields

| Field | Value |
|---|---|
| `name` | `it-support` |
| `version` | `0.1.0` |
| `author.name` | `opsroller` |
| `repository` | `https://github.com/opsroller/it-support` |
| `license` | `GPL-2.0-or-later` |
| `keywords` | `role`, `job-function`, `it-support`, `help-desk`, `sysadmin`, `nixos`, `nixpkgs`, `linux`, `nvidia`, `cuda`, `libvirt`, `kvm`, `virtualization` |

## Sources

The research behind the plugin is listed in [SOURCES.md](../../SOURCES.md).
