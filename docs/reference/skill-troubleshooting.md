*Reference, for anyone looking up what the `troubleshooting` skill covers while working.*

# troubleshooting

| Field | Value |
|---|---|
| Type | Skill |
| File | [`skills/troubleshooting/SKILL.md`](../../skills/troubleshooting/SKILL.md) |
| Loaded when | use when someone reports that something on a computer is broken, slow or missing, or monitoring flags a fault - triaging a support request or incident by impact, gathering facts read-only, restoring service first, forming and testing hypotheses one at a time, finding the root cause, confirming the fix with the person who asked, and writing the ticket notes and any post-incident review. |
| Referenced by | [resolve-support-request](workflow-resolve-support-request.md) |

## Inputs

The request in the person's words; the host.

## Outputs

Ticket notes (symptom, cause, fix, verification, rollback, follow-ups), the configuration change if any, and the doc pages the work owes.

## At a glance

| Step | Does |
|---|---|
| Take the request | Symptom in the person's words, exact error, since when |
| Triage | Incident, service request or problem; impact; restore first |
| Gather facts | Read-only, starting from what changed |
| Diagnose | One hypothesis at a time, bisect, write everything down |
| Fix | At the cause, as a reviewed, reversible change |
| Verify and close | Original symptom gone, the person confirms, notes written |
| Learn | Blameless review for real impact; how-to for repeats |

## Quality bar

- Every request closes with a cause, or "unknown" with what was ruled out.
- The fix is checked against the reported symptom.
- Workarounds are labelled and followed by a problem record.

## Documentation owed

Ticket notes; a how-to for repeated procedures; a post-incident review where impact was real. Written in the same change as the work, one Diataxis kind per page.

## Related

[Skills index](index.md#skills) · [Agent](agent.md) · [About the role](../explanation/about-the-role.md)
