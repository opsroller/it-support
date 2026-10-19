*Reference, for anyone looking up what the `virtualization` skill covers while working.*

# virtualization

| Field | Value |
|---|---|
| Type | Skill |
| File | [`skills/virtualization/SKILL.md`](../../skills/virtualization/SKILL.md) |
| Loaded when | use for virtual machines on Linux with libvirt, QEMU and KVM - enabling libvirtd, virsh and virt-install, qemu:///system and qemu:///session, virtual networks and bridges, storage pools and volumes, UEFI (OVMF) and TPM (swtpm) guests, snapshots and backups of guests, virtio drivers, CPU and memory tuning, VFIO PCI and GPU passthrough with IOMMU groups, and diagnosing a guest that will not start or is slow. |
| Referenced by | [resolve-support-request](workflow-resolve-support-request.md), [provide-software](workflow-provide-software.md), [host-audit](workflow-host-audit.md) |

## Inputs

The host, the guests needed (OS, size, network, devices).

## Outputs

Guests, networks and pools created or changed, their definitions saved in configuration, verification and how to undo.

## At a glance

| Item | Detail |
|---|---|
| Host checks | `virt-host-validate qemu`, `/dev/kvm`, IOMMU groups |
| NixOS | `virtualisation.libvirtd.enable`, `qemu.swtpm.enable`, `programs.virt-manager.enable`, `libvirtd` group |
| Guests | `virt-install`, `virsh list/start/shutdown/autostart/dumpxml/define` |
| Networks | Default NAT `virbr0`, a host bridge, macvtap |
| Passthrough | IOMMU on, `vfio-pci.ids`, whole IOMMU group to the guest |
| Destructive | `virsh undefine --remove-all-storage`, `vol-delete`: owner's word and a backup first |

## Quality bar

- Guest definitions are kept in version control.
- virtio for disk and network.
- Snapshots are not counted as backups.

## Documentation owed

How-to (creating a VM, passing a device through); reference (the host's guests, networks and pools). Written in the same change as the work, one Diataxis kind per page.

## Related

[Skills index](index.md#skills) · [Agent](agent.md) · [About the role](../explanation/about-the-role.md)
