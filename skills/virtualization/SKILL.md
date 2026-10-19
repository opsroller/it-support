---
name: virtualization
description: Use for virtual machines on Linux with libvirt, QEMU and KVM - enabling libvirtd, virsh and virt-install, qemu:///system and qemu:///session, virtual networks and bridges, storage pools and volumes, UEFI (OVMF) and TPM (swtpm) guests, snapshots and backups of guests, virtio drivers, CPU and memory tuning, VFIO PCI and GPU passthrough with IOMMU groups, and diagnosing a guest that will not start or is slow.
---

# Virtualization with libvirt and KVM

libvirt manages QEMU/KVM guests through one daemon and one API; `virsh`
is its command line, `virt-install` creates guests and `virt-manager`
is the desktop front end. Guests are described by XML domain
definitions, which belong in version control like any configuration.

## Host checks

- KVM available: `ls -l /dev/kvm`, `lscpu | grep -i virtualization`,
  `lsmod | grep kvm`; if missing, enable VT-x or AMD-V (and VT-d or
  AMD-Vi for passthrough) in firmware.
- `virt-host-validate qemu`: KVM, cgroups, IOMMU and more in one report.
- User access: membership in `libvirtd` (and `kvm`) for
  `qemu:///system`; `qemu:///session` runs unprivileged guests per user
  with user-mode networking. Say which URI you use: guests in one are
  invisible from the other.

## NixOS

Search the module first (`nixpkgs-search`, browse
`virtualisation.libvirtd`):

```nix
virtualisation.libvirtd = {
  enable = true;
  qemu.swtpm.enable = true;   # TPM 2.0 for guests that need it
  # UEFI firmware for guests ships with QEMU; check the qemu.* options of the host's release
};
programs.virt-manager.enable = true;           # desktop hosts
users.users.<admin>.extraGroups = [ "libvirtd" ];
networking.firewall.trustedInterfaces = [ "virbr0" ];  # if guests on the default NAT network lose DHCP or DNS
```

Declarative guests, networks and pools are possible with a community
module such as NixVirt; otherwise keep `virsh dumpxml` output in the
configuration repository and `virsh define` it.

## Everyday virsh

| Task | Command |
|---|---|
| List guests | `virsh list --all` |
| Start, shut down, force off | `virsh start`, `virsh shutdown`, `virsh destroy` (force off, not delete) |
| Start with the host | `virsh autostart <guest>` |
| Console | `virsh console <guest>` (serial), or SPICE/VNC via `virt-viewer` |
| See or change definition | `virsh dumpxml`, `virsh edit`, `virsh define <file>` |
| Info | `virsh dominfo`, `domblklist`, `domiflist`, `domifaddr` |
| Networks | `virsh net-list --all`, `net-start default`, `net-autostart default` |
| Storage | `virsh pool-list --all`, `vol-list <pool>`, `pool-define-as`, `vol-create-as` |
| Snapshots | `virsh snapshot-create-as <guest> <name>`, `snapshot-list`, `snapshot-revert` |

Creating a guest: `virt-install --name <n> --memory <MiB> --vcpus <n>
--disk size=<GiB>,bus=virtio --cdrom <iso> --os-variant <id>
--network network=default,model=virtio --boot uefi` (`osinfo-query os`
lists variant ids). Use virtio for disk and network; Windows guests
need the virtio-win drivers.

`virsh undefine --remove-all-storage` and `vol-delete` destroy data:
owner's word and a backup first.

## Networks

- Default NAT network (`virbr0`): guests reach out, the host reaches
  them, the LAN does not.
- Bridged (`br0` on the host NIC): guests are on the LAN. On NixOS
  `networking.bridges.br0.interfaces = [ "<nic>" ];` and move the IP
  configuration to `br0`; do this from a console, not over the SSH
  session it can cut.
- macvtap: simple LAN access, but host-to-guest traffic does not work.

## Performance

- CPU model `host-passthrough`; pin vCPUs (`<cputune>`) and use
  hugepages for latency-sensitive guests on busy hosts.
- Disk: virtio-blk or virtio-scsi with `cache='none'` and
  `io='native'` on raw or qcow2 files; preallocate for heavy writes.
- Measure inside and outside the guest before tuning; change one thing.

## VFIO passthrough (GPUs and other PCI devices)

1. IOMMU on: `intel_iommu=on` (or `amd_iommu=on`, default on recent
   kernels) and `iommu=pt` in kernel parameters.
2. Check IOMMU groups (`/sys/kernel/iommu_groups/*/devices/*`): every
   device in the group goes to the guest together, apart from PCI
   bridges.
3. Bind the device to `vfio-pci` early: `vfio-pci.ids=<vendor:device>,...`
   for the GPU and its audio function, and keep the host driver from
   claiming it (on NixOS: `boot.kernelParams`,
   `boot.initrd.kernelModules = [ "vfio_pci" "vfio" "vfio_iommu_type1" ]`).
4. A GPU the host also uses for its own displays cannot be passed
   through while in use; plan which GPU drives the host.
5. Attach with `virsh attach-device` or `virt-manager`; UEFI guest.

Passthrough changes the host's boot; test with a generation you can
roll back to and keep a console path that does not depend on the GPU.

## Backups

Snapshots are not backups. Back up guest disks (offline, or with
`virsh backup-begin` or an external snapshot and block commit) and the
domain XML, and test a restore into a new guest.

## Output

The guests, networks and pools created or changed, their definitions
saved where the project keeps configuration, how they were verified
(the guest boots, networks, the device works inside it), and how to undo
the change.
