*How-to guide, for someone using the plugin whose machine broke after a change.*

# How to roll back a bad change

This guide gets a NixOS machine back to its last good state, then makes
sure the fault does not return at the next rebuild.

## 1. Go back now

If the machine boots and you can reach a shell:

```
nixos-rebuild switch --rollback
```

If it does not boot, or the display or network is gone, reboot and pick
the previous generation in the boot menu.

## 2. Find what changed

```
nixos-rebuild list-generations
nix store diff-closures /nix/var/nix/profiles/system-<good>-link /nix/var/nix/profiles/system-<bad>-link
git -C <configuration repository> log --oneline -5
```

## 3. Fix forward

The rollback only changes what is running. The configuration still
holds the bad change, so the next `switch` would bring it back. Either:

- revert the commit and rebuild, or
- fix it and rebuild, using `resolve-support-request` for anything not
  obvious.

## 4. Record it

Write what broke, why, and what was done in the ticket or change log.

## Other systems

- A VM: `virsh snapshot-revert <guest> <snapshot>`.
- Debian or Ubuntu: downgrade with `apt install <pkg>=<version>` from
  `/var/log/apt/history.log`; Fedora: `dnf history undo <id>`.
- Btrfs or ZFS root with snapshots: boot or roll back to the snapshot
  taken before the change.

Related: [nixos-administration](../reference/skill-nixos-administration.md) ·
[change-management](../reference/skill-change-management.md)
