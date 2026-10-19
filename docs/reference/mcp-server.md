*Reference, for anyone looking up the MCP server this plugin bundles and what it needs to run.*

# The nixos MCP server

| Field | Value |
|---|---|
| File | [`.mcp.json`](../../.mcp.json) |
| Server name | `nixos` |
| Package | `mcp-nixos` from nixpkgs (upstream: utensils/mcp-nixos, MIT licence) |
| Started with | `nix --extra-experimental-features "nix-command flakes" run nixpkgs#mcp-nixos --` |
| Needs | Nix on the machine running the agent, and network access to the sources it queries |
| Used by | [nixpkgs-search](skill-nixpkgs-search.md), [provide-software](workflow-provide-software.md), [resolve-support-request](workflow-resolve-support-request.md) |

The plugin starts the server from nixpkgs at run time; nothing from it is
copied into this repository.

## Which version runs

`nixpkgs#mcp-nixos` resolves `nixpkgs` through the flake registry of the
machine running the agent, so the registry entry decides the server's
version. On NixOS hosts configured from a flake, the registry usually
points at the system's own pinned nixpkgs, so the server matches the
system. To pin it explicitly, set the registry entry in the host's
configuration (`nix.registry.nixpkgs.flake = inputs.nixpkgs;`), or check
with `nix registry list` which revision it follows.

## Tools

| Tool | Arguments | Returns |
|---|---|---|
| `nix` | `action`, `query`, `source`, `type`, `channel`, `limit`, and for `cache` also `version`, `system` | Search results, package or option details, statistics, option trees, channels, local flake inputs, binary-cache status, store files |
| `nix_versions` | `package`, `version`, `limit` | Versions of a package across nixpkgs history, with the commit for each |

### `nix` actions

| Action | Does |
|---|---|
| `search` | Packages, options, programs or flakes matching `query` |
| `info` | One package or option in full |
| `stats` | Counts and categories for a source |
| `browse` | Options under a prefix such as `services.openssh` |
| `channels` | Channels and their revisions |
| `flake-inputs` | Inputs of the local flake (needs Nix) |
| `cache` | Whether a package version is in the binary cache for a system |
| `store` | Files at a `/nix/store` path (needs Nix) |

### Sources

`nixos` (packages and NixOS options), `home-manager`, `darwin`, `flakes`,
`flakehub`, `nixvim`, `nvf`, `noogle`, `wiki`, `nix-dev`, `nixhub`.

Tool names, actions and sources are those of mcp-nixos 3.x; the server's
own tool descriptions are authoritative if they differ.

## When it does not start

The machine has no Nix, or cannot reach nixpkgs. The skills fall back to
`nix search nixpkgs`, `nix eval`, `nixos-option` and search.nixos.org.
Installing Nix, or adding the server through the host's own
configuration (`pkgs.mcp-nixos`), is the fix; installing a different
server is not.

Related: [index](index.md) · [How to find a package or option](../how-to/how-to-find-a-package-or-option.md)
