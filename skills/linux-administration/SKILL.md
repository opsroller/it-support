---
name: linux-administration
description: Use for operating system work that is not specific to NixOS - systemd units, timers and the journal, launchd on macOS, users, groups, sudo and file permissions, disks, partitions, filesystems, mounts, SMART and RAID, networking with ip, ss, resolvectl and NetworkManager, firewalls, processes and resource limits, kernel modules and boot, monitoring, and the package managers of Debian, Ubuntu, Fedora, RHEL, Arch and macOS.
---

# Linux and macOS administration

The fundamentals of running a Unix-like machine. On NixOS, read this for
how to inspect and diagnose; make every lasting change through the
configuration (`nixos-administration`).

## Services

- systemd: `systemctl status <unit>`, `systemctl list-units --failed`,
  `systemctl cat <unit>` (the unit as loaded, with drop-ins),
  `systemd-analyze blame` and `critical-chain` for slow boots,
  `systemctl --user` for user services, `loginctl enable-linger <user>`
  for user services that run without a login.
- Timers over cron: `systemctl list-timers`.
- Logs: `journalctl -u <unit> -b` (this boot), `-b -1` (previous boot),
  `-p warning`, `--since "1 hour ago"`, `-k` (kernel). `journalctl
  --disk-usage` and `SystemMaxUse=` keep it bounded.
- macOS: `launchctl print system/<label>` and `gui/<uid>/<label>`,
  `log show --last 1h --predicate 'process == "<name>"'`.

## Users and permissions

- Accounts and groups: `id <user>`, `getent passwd|group`; device
  access usually comes from a group (`video`, `render`, `kvm`,
  `libvirtd`, `docker`, `dialout`). On NixOS set them in
  `users.users.<name>.extraGroups`; a new group needs a new login.
- Least privilege: sudo rules for exact commands, not `ALL` by habit.
- Files: `ls -l`, `stat`, `namei -l <path>` to see every directory on
  the way, ACLs (`getfacl`), and the security context (`ls -Z`) where
  SELinux runs.

## Storage

- Inventory: `lsblk -f`, `findmnt`, `df -h`, `df -i` (inodes),
  `du -xh --max-depth=1 <dir>` scoped to the directory in question.
- Health: `smartctl -a /dev/<disk>` (reallocated and pending sectors,
  media errors on NVMe), `nvme smart-log`, `dmesg` for I/O errors.
- Filesystems: ext4, XFS, Btrfs (`btrfs filesystem usage`, `scrub`),
  ZFS (`zpool status`, `scrub`, snapshots). RAID with `mdadm --detail`.
- Mount by UUID or label, never by `/dev/sdX`; `nofail` for disks that
  may be absent.
- Anything that rewrites a partition table or filesystem needs a
  checked backup and the owner's word first.

## Networking

- `ip -br addr`, `ip route`, `ip -s link` for errors;
  `ss -tulpn` for listening sockets and their processes.
- DNS: `resolvectl status` and `resolvectl query <name>`, `dig`;
  `/etc/resolv.conf` is usually generated.
- `nmcli` for NetworkManager hosts; `networkctl` for systemd-networkd.
- Reachability in layers: link, address, route, DNS, port (`nc -vz`),
  then TLS (`openssl s_client -connect`) and the application.
- Firewalls: nftables (`nft list ruleset`), firewalld, `ufw`; on NixOS
  `networking.firewall.*`. Open exactly the port and interface needed.

## Processes and resources

- `top`/`htop`, `ps -eo pid,ppid,user,%cpu,%mem,etime,cmd --sort=-%cpu`,
  `free -h`, `vmstat 1`, `iostat -xz 1`, `pidstat`.
- Out-of-memory kills: `journalctl -k | grep -i oom`; systemd-oomd
  decisions in its journal.
- Limits: unit `MemoryMax=`, `CPUQuota=`, `TasksMax=`; `ulimit` and
  `/etc/security/limits.conf` on other systems.

## Kernel and boot

- `uname -r`, `lsmod`, `modinfo <mod>`, `dmesg -T --level=err,warn`.
- Kernel parameters: `/proc/cmdline`; on NixOS `boot.kernelParams`.
- Boot loader entries: `bootctl list` for systemd-boot.

## Other distributions and macOS

| System | Packages | Updates |
|---|---|---|
| Debian, Ubuntu | `apt search`, `apt install`, `apt-cache policy` | `apt update && apt upgrade`; `unattended-upgrades` |
| Fedora, RHEL | `dnf search`, `dnf install`, `dnf info` | `dnf upgrade`; `dnf-automatic` |
| Arch | `pacman -Ss`, `pacman -S` | `pacman -Syu` (whole system only) |
| macOS | Homebrew (`brew search`, `brew install`), or Nix with nix-darwin | `softwareupdate -l`; `brew upgrade` |

Where Nix is installed on any of these, prefer packages from nixpkgs
through the project's flake for project tools, so every machine gets the
same versions.

## Monitoring

Watch what fails silently: free disk and inodes, SMART health, failed
units, certificate expiry, backup age, and memory pressure. Use what
the project already runs (Prometheus node exporter, Netdata, a hosted
monitor); add alerts there rather than writing a new checker.

## Output

The facts gathered (commands and their relevant output), the change made
in the system's configuration source, and how it was verified.
