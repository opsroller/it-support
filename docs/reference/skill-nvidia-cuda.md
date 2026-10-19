*Reference, for anyone looking up what the `nvidia-cuda` skill covers while working.*

# nvidia-cuda

| Field | Value |
|---|---|
| Type | Skill |
| File | [`skills/nvidia-cuda/SKILL.md`](../../skills/nvidia-cuda/SKILL.md) |
| Loaded when | use when a machine has an NVIDIA GPU - installing or changing the driver (open or proprietary kernel modules, driver branch, modesetting, Wayland, hybrid graphics and PRIME, suspend), CUDA toolkits and the driver versions they need, CUDA builds and binary caches on NixOS, GPU access from containers through the NVIDIA Container Toolkit and CDI, persistence and multi-GPU, and diagnosing GPU faults with nvidia-smi, Xid messages and the kernel log. |
| Referenced by | [resolve-support-request](workflow-resolve-support-request.md), [provide-software](workflow-provide-software.md), [host-audit](workflow-host-audit.md) |

## Inputs

The machine and its GPUs, the workloads (display, CUDA, containers) and the CUDA versions they need.

## Outputs

Driver branch and version, module type, CUDA versions and the driver minimum they need, how the change was applied, and the verification output.

## At a glance

| Item | Detail |
|---|---|
| Facts | `lspci -nnk`, `nvidia-smi`, `/proc/driver/nvidia/version`, Xid lines in `dmesg` |
| NixOS driver | `hardware.graphics.enable`, `services.xserver.videoDrivers = [ "nvidia" ]`, `hardware.nvidia.{open,modesetting,package,prime,nvidiaPersistenced}` |
| CUDA on NixOS | `cudaPackages*` in a devShell, `cudaSupport`, `cudaCapabilities`, the CUDA binary cache |
| Containers | `hardware.nvidia-container-toolkit.enable`, CDI `--device nvidia.com/gpu=all` |
| Compatibility | A newer driver runs older CUDA; each CUDA major has a driver minimum |

## Quality bar

- Loaded module version equals the userspace version.
- Driver changes are applied with `boot` and a reboot, then verified.
- Display changes are verified on the live session the person uses.
- CUDA builds come from a cache where one has them.

## Documentation owed

How-to (setting up an NVIDIA or CUDA machine); reference (the host's GPU configuration). Written in the same change as the work, one Diataxis kind per page.

## Related

[Skills index](index.md#skills) · [Agent](agent.md) · [About the role](../explanation/about-the-role.md)
