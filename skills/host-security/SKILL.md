---
name: host-security
description: Use when hardening or checking the security and resilience of a machine - security updates and vulnerability notices, accounts and sudo, SSH configuration and keys, firewalls and exposed ports, secrets handling (never in the Nix store or git), disk encryption, backups that are actually restored in tests, audit logs, and following a recognised benchmark for the operating system.
---

# Host security and resilience

Security on a host is mostly basic hygiene done every time: patched,
least privilege, little exposed, secrets kept secret, data backed up and
restorable.

## Updates

- NixOS: move the nixpkgs input regularly on its release branch (which
  carries security fixes), build, `test`, `switch`; check
  `nix eval` of `meta.knownVulnerabilities` for packages flagged
  insecure, and tools such as `vulnix` against the system closure.
- Other systems: the distribution's security updates
  (`unattended-upgrades`, `dnf-automatic`), and reboot for kernel fixes.
- Firmware: `fwupdmgr get-updates` where supported.
- Track what is behind and why; an unpatched service exposed to a
  network is a priority finding.

## Accounts and access

- One account per person; no shared logins. Remove access when people
  leave.
- sudo for a group of administrators, rules for exact commands for
  everyone else; root login disabled.
- SSH: keys only (`PasswordAuthentication no`,
  `KbdInteractiveAuthentication no`), `PermitRootLogin no` or
  `prohibit-password`, Ed25519 keys, keys declared in configuration
  (`users.users.<name>.openssh.authorizedKeys.keys`); consider
  `fail2ban` or rate limits on exposed hosts.

## Exposure

- `ss -tulpn` on the host and a scan from outside show what listens.
  Every listening port has an owner and a reason.
- Firewall on by default (`networking.firewall.enable` is on in NixOS);
  open ports per interface (`networking.firewall.interfaces.<if>.allowedTCPPorts`)
  rather than everywhere.
- Prefer a VPN (WireGuard, Tailscale) over opening admin ports to the
  internet.

## Secrets

- Never in a Nix expression (the store is world-readable), a git
  repository, a unit's `Environment=`, a shell history or a log.
- Use sops-nix or agenix, systemd credentials (`LoadCredential=`), or
  files with mode 0400 owned by the service user, referenced by the
  module's `*File` options.
- Rotate a secret that leaked; deleting it from git history does not
  un-leak it.

## Data at rest and backups

- Full-disk encryption (LUKS) on laptops and anything that leaves the
  building; know how unlock works at boot and remotely.
- Backups: 3-2-1 (three copies, two media, one off site), encrypted,
  automated (restic or borg with a systemd timer, ZFS or Btrfs
  snapshots sent elsewhere). Snapshots on the same disk are not a
  backup.
- A backup is real only once a restore was tested; record when and
  what was restored.

## Audit and benchmarks

- Keep logs long enough to investigate; ship them off the host for
  servers.
- Use a recognised benchmark for the OS (CIS Benchmarks, the
  distribution's hardening guide, the NixOS hardened profile as a
  reference) as a checklist, and record deliberate deviations.

## Output

Findings with severity (exposed and exploitable first), the
configuration changes made, and what remains with an owner and a date.
