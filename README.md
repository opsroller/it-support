# IT support

A role plugin for IT support and systems administration. The IT support
role keeps the workstations, servers and virtual machines people depend
on working: it answers support requests by triage, diagnosis and a
reversible fix; administers operating systems, NixOS first and other
Linux distributions and macOS as well; runs NVIDIA drivers and CUDA,
and libvirt/KVM virtual machines; and treats every change as reviewed,
tested, reversible and documented.

On NixOS, everything starts with a search of nixpkgs. The plugin bundles
the `nixos` MCP server (the `mcp-nixos` package from nixpkgs) for fast
package, option, version and binary-cache lookups.

## Install

```
/plugin marketplace add opsroller/claude-plugins
/plugin install it-support@opsroller
```

It builds on `engineering-practices`; install that too. The bundled MCP
server starts with `nix run nixpkgs#mcp-nixos`, so the machine running
the agent needs Nix; without it the skills fall back to `nix search` and
search.nixos.org.

## Documentation

**Start here.** [Your first support request](docs/tutorials/first-task.md)
walks through a search with the MCP server, a declarative change and
closing the request.

**Doing the job.** Task guides:
[handle a support request](docs/how-to/how-to-handle-a-support-request.md),
[find a package or option](docs/how-to/how-to-find-a-package-or-option.md),
[set up NVIDIA and CUDA on NixOS](docs/how-to/how-to-set-up-nvidia-and-cuda-on-nixos.md),
[run virtual machines with libvirt](docs/how-to/how-to-run-vms-with-libvirt.md) and
[roll back a bad change](docs/how-to/how-to-roll-back-a-bad-change.md).

**Looking things up.** The [reference](docs/reference/index.md) describes
the agent, the bundled MCP server, the eight skills and the three
workflows (`resolve-support-request`, `provide-software`, `host-audit`)
with their arguments and outputs; [SOURCES.md](SOURCES.md) lists the
research behind them.

**Wondering why?** [About the IT support role](docs/explanation/about-the-role.md)
explains the reasoning (configuration as code, nixpkgs first, test before
switch, the person decides when it is fixed) and the boundaries with
neighbouring roles.

## License

Copyright (C) 2026 the contributors. Licensed under the GNU General Public License v2.0 or later (`GPL-2.0-or-later`); see `LICENSE`.
