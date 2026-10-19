*Reference, for anyone looking up what the `nixpkgs-search` skill covers while working.*

# nixpkgs-search

| Field | Value |
|---|---|
| Type | Skill |
| File | [`skills/nixpkgs-search/SKILL.md`](../../skills/nixpkgs-search/SKILL.md) |
| Loaded when | use before installing, packaging or configuring anything on a NixOS or Nix-managed machine - finding a package, a NixOS module option, a Home Manager or nix-darwin option, an older package version, its licence, platforms and binary-cache status, with the bundled nixos MCP server first and nix search, nixos-option and search.nixos.org as fallbacks. |
| Referenced by | [resolve-support-request](workflow-resolve-support-request.md), [provide-software](workflow-provide-software.md) |

## Inputs

What the person needs; the host and the nixpkgs channel or revision it follows.

## Outputs

The attribute or option path, channel, version, licence, platforms and cache status, and the declarative change that uses it.

## At a glance

| Tool | Use |
|---|---|
| `nixos` MCP server, `nix` tool | `search`, `info`, `browse`, `channels`, `cache`, `flake-inputs`, `store` over NixOS packages and options, Home Manager, nix-darwin, flakes and more |
| `nixos` MCP server, `nix_versions` tool | Versions a package has had, with the nixpkgs commit for each |
| `nix search nixpkgs`, `nix eval`, `nixos-option` | Command-line fallback when the server is not running |
| search.nixos.org | Last fallback, in a browser |

## Quality bar

- Every request starts with recorded searches.
- Module options are preferred over bare packages.
- The channel searched is the one the host follows.
- Heavy packages are checked against the binary cache before a rebuild.

## Documentation owed

Reference (what a host or project provides and where it is configured). A missing package is reported as a gap, with the queries run. Written in the same change as the work, one Diataxis kind per page.

## Related

[Skills index](index.md#skills) · [Agent](agent.md) · [About the role](../explanation/about-the-role.md)
