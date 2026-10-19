---
name: nixpkgs-search
description: Use before installing, packaging or configuring anything on a NixOS or Nix-managed machine - finding a package, a NixOS module option, a Home Manager or nix-darwin option, an older package version, its licence, platforms and binary-cache status, with the bundled nixos MCP server first and nix search, nixos-option and search.nixos.org as fallbacks.
---

# Searching nixpkgs

nixpkgs holds well over a hundred thousand packages and the NixOS module
system's options. Almost every request for "install X", "run X as a
service" or "turn on X" is answered there. Search before writing
anything.

## Tools, in order

1. **The `nixos` MCP server bundled with this plugin** (the `mcp-nixos`
   package from nixpkgs, started with `nix run nixpkgs#mcp-nixos`).
   Two tools:
   - `nix` with an `action`:
     - `search`: packages, options or programs matching a query;
       `source` selects `nixos` (packages and NixOS options),
       `home-manager`, `darwin`, `flakes`, `noogle` (library
       functions), `wiki` or `nix-dev`; `type` narrows to `packages`,
       `options` or `programs`; `channel` picks `unstable` or a
       release.
     - `info`: one package or option in full: version, description,
       licence, platforms, homepage, default and type of an option.
     - `browse`: options under a prefix, e.g. `services.openssh` or
       `hardware.nvidia`.
     - `channels`: the channels and their current revisions.
     - `cache`: whether a package version is built in the binary cache
       for a system, before a rebuild compiles it for hours.
     - `flake-inputs` and `store`: inputs of the local flake and files
       in a store path (need Nix on the host).
   - `nix_versions`: the versions of a package that nixpkgs has carried,
     with the nixpkgs commit for each, for pinning an older or newer
     version than the channel has.
2. **Command line**, when the server is not running:
   - `nix search nixpkgs <regex>` (add `--json` for scripts);
   - `nix eval nixpkgs#<attr>.meta --json` for licence, platforms and
     whether it is broken or insecure;
   - `nixos-option <path>` or `nix eval .#nixosConfigurations.<host>.config.<path>`
     for the current value of an option on a host;
   - `man configuration.nix` for every option of the installed release.
3. **search.nixos.org** (packages and options) and the Home Manager
   option search, in a browser or by fetching the page.

If the server fails to start, the host has no Nix or no flakes; say so
and use the fallbacks. Never install a different MCP server or tool to
replace it.

## How to search well

- **Search options as well as packages.** "Run Jellyfin" is
  `services.jellyfin.enable`, not `environment.systemPackages`.
  A service, a driver or a desktop feature is almost always a module.
  Browse the prefix (`services.<name>`, `programs.<name>`,
  `hardware.<name>`, `virtualisation.<name>`) and read every option
  before setting one.
- **Prefer `programs.<name>.enable` over a bare package** when it
  exists: the module adds the groups, udev rules, wrappers and shell
  integration the package alone lacks.
- **Match the channel the host follows.** Read the host's flake lock or
  `nixos-version`; search that channel. An option that exists on
  unstable may not exist on the stable release the host runs.
- **Read `meta` before choosing:** licence (unfree needs
  `allowUnfree` or a per-package predicate), `platforms`, `broken`,
  `knownVulnerabilities`, `mainProgram`.
- **Check the cache for heavy packages** (CUDA, ROCm, large compilers,
  anything with a `cudaSupport` or `rocmSupport` override): an
  uncached build can take hours. Name the cache that has it (see
  `nvidia-cuda`) or choose a variant that is cached.
- **Find the attribute path,** not just the name: `python3Packages.x`,
  `cudaPackages.x`, `kdePackages.x`, `linuxPackages.x` differ.
- **Older or newer version:** `nix_versions` gives a nixpkgs commit;
  pin it as a separate flake input used only for that package, never
  by moving the whole system to that commit.

## When nothing is packaged

Say so with what was searched (terms, sources, channel). Then, in
order: a package in a maintained community flake found through the
`flakes` source; an override of a close existing package; and only then
a new derivation in the project's configuration, with its source,
licence and provenance recorded (engineering-practices `provenance`).
Report the missing package as a gap to whoever tracks them.

## Output

The attribute path or option path, the channel searched, version,
licence, platforms and cache status, and the declarative change that
uses it (see `nixos-administration`).
