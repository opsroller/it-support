*Reference, for anyone looking up what the `linux-administration` skill covers while working.*

# linux-administration

| Field | Value |
|---|---|
| Type | Skill |
| File | [`skills/linux-administration/SKILL.md`](../../skills/linux-administration/SKILL.md) |
| Loaded when | use for operating system work that is not specific to NixOS - systemd units, timers and the journal, launchd on macOS, users, groups, sudo and file permissions, disks, partitions, filesystems, mounts, SMART and RAID, networking with ip, ss, resolvectl and NetworkManager, firewalls, processes and resource limits, kernel modules and boot, monitoring, and the package managers of Debian, Ubuntu, Fedora, RHEL, Arch and macOS. |
| Referenced by | [resolve-support-request](workflow-resolve-support-request.md), [host-audit](workflow-host-audit.md) |

## Inputs

The host and the symptom or task.

## Outputs

The facts gathered, the change made in the system's configuration source, and how it was verified.

## At a glance

| Area | Main tools |
|---|---|
| Services and logs | `systemctl`, `journalctl`, `systemd-analyze`; `launchctl`, `log` on macOS |
| Users and permissions | `id`, `getent`, `namei -l`, `getfacl`, sudo rules |
| Storage | `lsblk -f`, `findmnt`, `df`, `smartctl`, `btrfs`, `zpool`, `mdadm` |
| Networking | `ip`, `ss`, `resolvectl`, `nmcli`, `nft` |
| Processes | `ps`, `top`, `vmstat`, `iostat`, unit resource limits |
| Other package managers | `apt`, `dnf`, `pacman`, Homebrew |

## Quality bar

- Commands are scoped to the problem.
- Partition or filesystem rewrites wait for a backup and the owner.
- Ports are opened per interface, for a reason.

## Documentation owed

Reference (host services, storage, network); how-to for repeated procedures. Written in the same change as the work, one Diataxis kind per page.

## Related

[Skills index](index.md#skills) · [Agent](agent.md) · [About the role](../explanation/about-the-role.md)
