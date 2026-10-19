---
name: change-management
description: Use before changing a machine that someone depends on - deciding whether a change is standard, normal or an emergency, writing its reason, test, rollback and verification, getting the owner's approval where it is needed, choosing a window, backing up first, applying it in stages, and recording what was done.
---

# Change management

A change that is reviewed, tested, reversible and recorded is cheap to
make. Small, frequent, well-understood changes beat rare, large ones.

## Kinds of change

| Kind | Examples | Approval |
|---|---|---|
| **Standard** (pre-approved, low risk, done before) | Add a packaged tool to a devShell; add a user to a group; bump a flake input on a workstation and `test` it | None beyond the project's normal review |
| **Normal** | New service, driver branch change, kernel change, new VM network, release upgrade | The host owner or the project's change reviewer, before it is applied to a shared host |
| **Emergency** | Restoring a down service | Apply the smallest restoring change now; record and review it right after |
| **Destructive** | Wiping disks, deleting a VM's storage, dropping data, removing generations needed to roll back | Always the owner's explicit word, plus a verified backup |

The project profile says who owns each host and which changes it has
pre-approved. When it says nothing, treat shared hosts as normal and
personal workstations as standard for reversible changes.

## Every change carries

1. **Reason:** the request or problem it answers.
2. **What:** the exact configuration diff (a commit or PR in the
   configuration repository).
3. **Test:** how it was built and tried before it reached the host
   people use (`nixos-rebuild build` and `test`, a VM, a spare host).
4. **Rollback:** the exact command (`nixos-rebuild switch --rollback`,
   `virsh snapshot-revert`, a git revert and rebuild) and confirmation
   that its target exists.
5. **Verification:** what will show it worked, tied to the reason.
6. **Impact:** what restarts, who notices, for how long; a window if
   people will notice.
7. **Record:** who applied it, when, the generation or version, and
   the outcome.

## Applying

- Back up what the change could damage, and check the backup is
  readable, before starting.
- Stage: a test VM or one host before many; `test` before `switch`;
  reboot-requiring changes with `boot`, then reboot in the window.
- Keep a way back in that does not depend on the change (a console,
  out-of-band access, a previous boot entry) for anything touching
  networking, SSH, boot or the GPU driving the only display.
- One change at a time; verify before the next.
- If verification fails, roll back first and diagnose after.

## Afterwards

The configuration in version control matches the running system. The
record is in the ticket or change log. Anything learned goes into a
how-to or the host's reference page in the same change.

## Output

A change record (reason, diff, test, rollback, verification, impact,
outcome) linked from the PR or ticket.
