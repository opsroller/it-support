*Reference, for anyone looking up what the `host-security` skill covers while working.*

# host-security

| Field | Value |
|---|---|
| Type | Skill |
| File | [`skills/host-security/SKILL.md`](../../skills/host-security/SKILL.md) |
| Loaded when | use when hardening or checking the security and resilience of a machine - security updates and vulnerability notices, accounts and sudo, SSH configuration and keys, firewalls and exposed ports, secrets handling (never in the Nix store or git), disk encryption, backups that are actually restored in tests, audit logs, and following a recognised benchmark for the operating system. |
| Referenced by | [host-audit](workflow-host-audit.md), [resolve-support-request](workflow-resolve-support-request.md) |

## Inputs

The host and what it is for.

## Outputs

Findings with severity, the configuration changes made, and what remains with an owner and a date.

## At a glance

| Area | Practice |
|---|---|
| Updates | Regular input or distro security updates; vulnerable packages tracked |
| Access | One account per person, keys-only SSH, narrow sudo |
| Exposure | Every listening port owned; firewall per interface; VPN for admin |
| Secrets | sops-nix, agenix, systemd credentials or 0400 files; never the store or git |
| Data | LUKS where devices travel; 3-2-1 backups with tested restores |
| Benchmarks | CIS or the distribution's guide, deviations recorded |

## Quality bar

- No secret in the Nix store, git or logs.
- A backup counts once a restore was tested.
- No security control disabled to make something work.

## Documentation owed

Reference (host security posture, backup and restore record); how-to (restoring from backup). Written in the same change as the work, one Diataxis kind per page.

## Related

[Skills index](index.md#skills) · [Agent](agent.md) · [About the role](../explanation/about-the-role.md)
