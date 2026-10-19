---
name: troubleshooting
description: Use when someone reports that something on a computer is broken, slow or missing, or monitoring flags a fault - triaging a support request or incident by impact, gathering facts read-only, restoring service first, forming and testing hypotheses one at a time, finding the root cause, confirming the fix with the person who asked, and writing the ticket notes and any post-incident review.
---

# Troubleshooting and support requests

Support is a service to a person. The job is done when they can work
again and the cause is known, not when a command succeeds.

## 1. Take the request

Record, in the person's words: what they tried to do, what happened
instead, the exact error text, when it started, what host and account,
and whether it worked before. Ask for anything missing in one message,
then get on with what you can do meanwhile.

Classify it:

- **Incident:** something that worked has stopped. Restore first.
- **Service request:** something new is wanted (software, access, a
  VM). Plan it as a change (`change-management`).
- **Problem:** the underlying cause of one or more incidents, worked
  after service is back.

## 2. Triage

Impact (how many people, how blocked) and urgency set the order. A
shared service down outranks one person's slow laptop. Stop the
bleeding before diagnosing: roll back the last change, fail over,
restart the one failed unit, or give a workaround. Keep evidence (logs,
the failing generation, a copy of the config) while you do.

## 3. Gather facts, read-only

- **What changed?** It is usually the answer. NixOS:
  `nixos-rebuild list-generations`, `nix store diff-closures` between
  the last good and current generation, `git log` of the configuration.
  Elsewhere: package manager history (`/var/log/apt/history.log`,
  `dnf history`), recent updates, config edits.
- **State:** `systemctl --failed`, `journalctl -b -p warning`, `dmesg
  -T --level=err,warn`, disk and memory (`df -h`, `free -h`).
- **The failing thing itself:** its unit status and log, its config as
  loaded, its version.
- Reproduce it yourself if you can, with the same account and inputs.

Scope every command to the problem: no filesystem-wide searches, no
reading other users' files.

## 4. Diagnose

Work hypothesis by hypothesis, most likely first:

- State the hypothesis and the observation that would rule it out.
- Test it with the smallest, safest check. Prefer reading to changing;
  when a change is the test, make it reversible and note it.
- Split the system in halves (layers, components, bisected generations
  or commits) until the fault is in one piece.
- Write every test and result down as you go, so you can return the
  machine to a known state and the next person can follow.

Pitfalls: chasing a symptom that is not the person's problem; trusting
a correlation; assuming last month's cause; changing several things at
once; "fixing" by disabling a safety control.

## 5. Fix

- Fix the cause, through the system's configuration
  (`nixos-administration`), as one reviewed change with a rollback.
- If only a workaround is possible now, apply it, say it is a
  workaround, and open the problem record for the real fix.

## 6. Verify and close

- The original symptom, reproduced the original way, is gone.
- Nothing else regressed: failed units, the journal since the change.
- The person confirms it works for them. If they cannot be reached,
  close as resolved-unconfirmed with what was checked.
- Notes in the ticket or log: symptom, impact, cause, fix, rollback,
  time to restore, follow-ups.

## 7. Learn

For an incident with real impact or a repeat cause, write a blameless
review: timeline, cause, what went well, what will change (with an
owner for each action). A procedure people will repeat becomes a
how-to in the project's docs; a recurring request becomes a documented
self-service answer or a configuration default.

## Output

Ticket notes (symptom, cause, fix, verification, rollback, follow-ups),
the configuration change if any, and the doc pages the work owes.
