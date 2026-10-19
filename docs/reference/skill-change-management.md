*Reference, for anyone looking up what the `change-management` skill covers while working.*

# change-management

| Field | Value |
|---|---|
| Type | Skill |
| File | [`skills/change-management/SKILL.md`](../../skills/change-management/SKILL.md) |
| Loaded when | use before changing a machine that someone depends on - deciding whether a change is standard, normal or an emergency, writing its reason, test, rollback and verification, getting the owner's approval where it is needed, choosing a window, backing up first, applying it in stages, and recording what was done. |
| Referenced by | [resolve-support-request](workflow-resolve-support-request.md), [provide-software](workflow-provide-software.md) |

## Inputs

The change and the host; the project profile's owners and pre-approved changes.

## Outputs

A change record (reason, diff, test, rollback, verification, impact, outcome) linked from the PR or ticket.

## At a glance

| Kind | Approval |
|---|---|
| Standard | Normal review only |
| Normal | Host owner or change reviewer before a shared host |
| Emergency | Apply the smallest restoring change; review right after |
| Destructive | Owner's explicit word and a verified backup, always |

## Quality bar

- Every change names a rollback whose target exists.
- Test before it becomes the default.
- One change at a time; roll back first when verification fails.

## Documentation owed

The change record; the host's reference page when its setup changed. Written in the same change as the work, one Diataxis kind per page.

## Related

[Skills index](index.md#skills) · [Agent](agent.md) · [About the role](../explanation/about-the-role.md)
