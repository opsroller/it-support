*How-to guide, for someone using the plugin who needs virtual machines on a Linux host with libvirt and KVM.*

# How to run virtual machines with libvirt

This guide enables libvirt on a NixOS host, creates a UEFI guest, and
keeps its definition in configuration.

## 1. Check the host

```
virt-host-validate qemu
```

If KVM is missing, enable VT-x or AMD-V in the firmware.

## 2. Enable libvirt

```nix
virtualisation.libvirtd = {
  enable = true;
  qemu.swtpm.enable = true;
};
programs.virt-manager.enable = true;      # on desktops
users.users.<admin>.extraGroups = [ "libvirtd" ];
```

Build, `test`, `switch`, then log in again for the group to apply.

## 3. Start the default network

```
virsh -c qemu:///system net-start default
virsh -c qemu:///system net-autostart default
```

If guests get no address, add
`networking.firewall.trustedInterfaces = [ "virbr0" ];`.

## 4. Create a guest

```
virt-install --connect qemu:///system --name test-vm \
  --memory 4096 --vcpus 2 --disk size=40,bus=virtio \
  --cdrom /path/to/installer.iso --os-variant <id> \
  --network network=default,model=virtio --boot uefi
```

`osinfo-query os` lists the variant ids.

## 5. Keep its definition

```
virsh dumpxml test-vm > <configuration repository>/vms/test-vm.xml
```

Commit it. To recreate the guest later: `virsh define vms/test-vm.xml`.

## 6. Snapshot before risky work

```
virsh snapshot-create-as test-vm before-upgrade
virsh snapshot-revert test-vm before-upgrade
```

Snapshots are not backups; back up the disk image and the XML elsewhere.

## Removing a guest

`virsh undefine --remove-all-storage` deletes its disks. Get the
owner's word and check a backup first.

Related: [virtualization skill](../reference/skill-virtualization.md)
