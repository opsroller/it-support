*Reference, for anyone looking up what the `nixos-administration` skill covers while working.*

# nixos-administration

| Field | Value |
|---|---|
| Type | Skill |
| File | [`skills/nixos-administration/SKILL.md`](../../skills/nixos-administration/SKILL.md) |
| Loaded when | use when administering a NixOS machine - flakes and flake.lock, configuration.nix and modules, nixos-rebuild build/test/switch/boot, generations and rollback, channels and pinned inputs, unfree and insecure packages, overlays and overrides, Home Manager, per-project tools in a devShell with direnv, binary caches and substituters, garbage collection and store size, remote deployment, and upgrading between releases. |
| Referenced by | [resolve-support-request](workflow-resolve-support-request.md), [provide-software](workflow-provide-software.md), [host-audit](workflow-host-audit.md) |

## Inputs

The host, its flake or configuration.nix, and what must change.

## Outputs

A committed configuration change, built, tested and switched (or left at `test` with the reason), with the generation, closure diff and rollback.

## At a glance

| Step | Command |
|---|---|
| Build, nothing activated | `nixos-rebuild build --flake .#<host>` |
| See what changes | `nix store diff-closures /run/current-system ./result` |
| Try it, old boot default kept | `nixos-rebuild test --flake .#<host>` |
| Make it the default | `nixos-rebuild switch` (or `boot` for kernel and driver changes) |
| Undo | `nixos-rebuild switch --rollback` |

## Quality bar

- The running system equals the build of the committed configuration.
- No imperative installs on managed hosts.
- Unfree and insecure packages are allowed by name, with a reason.
- Secrets never enter the Nix store.

## Documentation owed

Reference (the host: what it runs, where it is configured); how-to for procedures people repeat. Written in the same change as the work, one Diataxis kind per page.

## Related

[Skills index](index.md#skills) · [Agent](agent.md) · [About the role](../explanation/about-the-role.md)
