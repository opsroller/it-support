# Sources

*Reference: the research behind this plugin. Each entry: title, link, what it informed.*

## Job postings and occupational data

- **IT System Administrator, NixOS discourse job post (January 2026)** - https://discourse.nixos.org/t/it-system-administrator-m-w-d-cyberus-technology-dresden-germany/74339 - routine operations and support requests, administering and automating infrastructure, Linux production duties, daily Nix/NixOS work, "predictable, debuggable, maintainable systems" (agent mission, explanation).
- **Infrastructure & Operations Engineer (Rust / NixOS)** - https://hexjobs.com/praca/oferta/zewnetrzna/infrastructure-and-operations-engineer-rust-nixos-m-w-d-23b3f0387d3f69f58780ed44cc5d0a77 - NixOS operations as a named job requirement (agent, explanation).
- **Network and Computer Systems Administrators, US Bureau of Labor Statistics** - https://www.bls.gov/ooh/computer-and-information-technology/network-and-computer-systems-administrators.htm - installing OS and software, upgrades and repairs, security, performance, user accounts and permissions, training users, troubleshooting reported and monitored problems (agent responsibilities, explanation).
- **IT Support Specialist job description (aggregated duties)** - https://resumegeni.com/job-descriptions/it-support-specialist-job-description - help-desk duties: ticket intake, troubleshooting, user communication and documentation (`troubleshooting`).

## Professional frameworks

- **SFIA 9: System software administration (SYSP)** - https://sfia-online.org/en/skillcode/9/SYSP - installing, managing and maintaining operating systems and utility software; testing new versions; implementation procedures with fallback plans; diagnostic tools (agent, `change-management`, explanation).
- **SFIA 9: Infrastructure operations (ITOP)** - https://sfia-online.org/en/sfia-9/skills/infrastructure-operations - provisioning, monitoring and maintaining infrastructure (`host-audit`, `linux-administration`).
- **ITIL 4 service desk, incident and service request management (AXELOS)** - https://www.axelos.com/case-studies-and-white-papers/service-desk-incident-service-request-management - incident vs service request vs problem, restore first, then root cause (`troubleshooting`, `resolve-support-request`).
- **Site Reliability Engineering, chapter 12: Effective Troubleshooting (Google)** - https://sre.google/sre-book/effective-troubleshooting/ - triage, examine, diagnose, test and treat, cure; stop the bleeding first; record every test; pitfalls (`troubleshooting`).

## NixOS and nixpkgs

- **NixOS manual** - https://nixos.org/manual/nixos/stable/ - configuration, `nixos-rebuild` modes, generations and rollback, upgrades and `system.stateVersion` (`nixos-administration`).
- **NixOS wiki: nixos-rebuild** - https://wiki.nixos.org/wiki/Nixos-rebuild - build, test, switch, boot and remote deployment (`nixos-administration`, `change-management`).
- **NixOS wiki: Flakes** - https://wiki.nixos.org/wiki/Flakes - flake inputs, locks and `nixosConfigurations` (`nixos-administration`).
- **NixOS wiki: Storage optimization** - https://wiki.nixos.org/wiki/Storage_optimization - garbage collection and store optimisation settings (`nixos-administration`).
- **mcp-nixos package in nixpkgs** - https://github.com/NixOS/nixpkgs/blob/nixos-unstable/pkgs/by-name/mc/mcp-nixos/package.nix - the packaged MCP server, version 3.x, MIT licence, `mainProgram` (`.mcp.json`, MCP server reference).
- **mcp-nixos server listing (utensils/mcp-nixos)** - https://mcpservers.org/id/servers/utensils/mcp-nixos - the `nix` and `nix_versions` tools, their actions and sources, `pkgs.mcp-nixos` (`nixpkgs-search`, MCP server reference).

## NVIDIA and CUDA

- **NixOS wiki: NVIDIA** - https://wiki.nixos.org/wiki/NVIDIA - `hardware.nvidia.open` (required since driver 560, Turing or newer), modesetting for Wayland, driver package branches, PRIME offload and sync, power management (`nvidia-cuda`, how-to).
- **NixOS wiki: CUDA** - https://wiki.nixos.org/wiki/Cuda - `cudaSupport`, CUDA packages in devShells, the CUDA binary cache and its key (`nvidia-cuda`, how-to).
- **NVIDIA CUDA Compatibility** - https://docs.nvidia.com/deploy/cuda-compatibility/ - backward compatibility, minor-version compatibility and driver minimums per CUDA major, forward-compatibility packages, PTX JIT limits (`nvidia-cuda`).

## Virtualization

- **NixOS wiki: Libvirt** - https://wiki.nixos.org/wiki/Libvirt - `virtualisation.libvirtd.enable`, `qemu.swtpm`, the `libvirtd` group, default network autostart, `trustedInterfaces` for `virbr0` (`virtualization`, how-to).
- **libvirt virsh manual** - https://libvirt.org/manpages/virsh.html - domain, network, storage and snapshot commands (`virtualization`).
- **ArchWiki: PCI passthrough via OVMF** - https://wiki.archlinux.org/title/PCI_passthrough_via_OVMF - IOMMU groups, binding devices to vfio-pci, UEFI guests (`virtualization`).

## Plugin format

- **Claude Code plugin manifest reference** - https://code.claude.com/docs/en/plugins-reference - `.mcp.json` at the plugin root, standard layout, `workflows/` (`.claude-plugin/plugin.json`, `.mcp.json`).

## Method

- **Diataxis** - https://diataxis.fr/ - the docs layout of this plugin and the docs steps in every workflow.
