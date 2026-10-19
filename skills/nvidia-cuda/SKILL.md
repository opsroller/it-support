---
name: nvidia-cuda
description: Use when a machine has an NVIDIA GPU - installing or changing the driver (open or proprietary kernel modules, driver branch, modesetting, Wayland, hybrid graphics and PRIME, suspend), CUDA toolkits and the driver versions they need, CUDA builds and binary caches on NixOS, GPU access from containers through the NVIDIA Container Toolkit and CDI, persistence and multi-GPU, and diagnosing GPU faults with nvidia-smi, Xid messages and the kernel log.
---

# NVIDIA GPUs and CUDA

Two layers must agree: the kernel driver (modules plus the matching
userspace libraries) and the CUDA toolkit or runtime an application was
built with. Most GPU tickets are a mismatch between them, a missing
group or library path, or a module that did not load.

## Facts first

- `lspci -nnk | grep -A3 -i nvidia`: the GPU, and which kernel driver
  is in use (`nvidia`, `nouveau`, `vfio-pci` or none).
- `nvidia-smi`: driver version, the highest CUDA version that driver
  supports, GPUs, memory, processes. `nvidia-smi -q` for clocks,
  throttle reasons, ECC and PCIe link; `nvidia-smi topo -m` for
  multi-GPU links.
- `cat /proc/driver/nvidia/version`, `modinfo nvidia | grep ^version`:
  the loaded module's version, which must equal the userspace version.
- `dmesg -T | grep -iE 'nvrm|xid|nvidia'`: load failures and Xid
  errors. Look the Xid number up in NVIDIA's Xid catalogue; some mean
  an application fault, some a driver bug, some failing hardware or
  power.
- `nvidia-bug-report.sh` collects everything NVIDIA asks for.

## NixOS driver configuration

Search the options first (`nixpkgs-search`, browse `hardware.nvidia`).
The usual set:

```nix
hardware.graphics.enable = true;
services.xserver.videoDrivers = [ "nvidia" ];   # loads the driver, Wayland included
hardware.nvidia = {
  open = true;                   # open kernel modules: Turing (RTX 20, GTX 16) and newer; false for older GPUs
  modesetting.enable = true;     # required for Wayland
  package = config.boot.kernelPackages.nvidiaPackages.stable;  # or production, beta, legacy_<branch>
  powerManagement.enable = false; # true if suspend/resume corrupts the display
};
nixpkgs.config.allowUnfreePredicate = pkg: builtins.elem (lib.getName pkg) [
  "nvidia-x11" "nvidia-settings" "nvidia-persistenced"  # plus the cuda_* packages if CUDA is used
];
```

- `hardware.nvidia.open` must be set explicitly on current releases.
  Open modules are NVIDIA's recommended path on supported GPUs; the
  userspace is still unfree either way.
- Driver changes are kernel changes: `nixos-rebuild boot` and reboot,
  then check `nvidia-smi` and the module version.
- Hybrid laptops and an iGPU next to a dGPU: `hardware.nvidia.prime`
  with the bus IDs from `lspci` (converted to decimal, `PCI:b:d:f`);
  `offload` keeps the iGPU primary and works under Wayland, `sync` is
  X11 only.
- Persistence on headless or compute machines:
  `hardware.nvidia.nvidiaPersistenced = true`.
- A driver that fails to build against a new kernel: pin
  `boot.kernelPackages` to a kernel the driver supports, or choose
  another driver branch; do not patch the driver.
- On a desktop with displays attached, test driver changes on the
  live session the person uses; a headless check does not prove the
  display stack works.

## Other distributions

Use the distribution's packaged driver (Ubuntu `ubuntu-drivers`, Fedora
RPM Fusion `akmod-nvidia`, Debian `nvidia-driver`, Arch `nvidia-open`)
over NVIDIA's `.run` installer, which the package manager cannot
upgrade or remove cleanly. Secure Boot needs the module signed (MOK
enrolment).

## CUDA

- **Compatibility:** a newer driver runs code built with an older
  toolkit. Within one CUDA major version, the driver must meet that
  major's minimum (for example 525 or later for CUDA 12.x, 580 or
  later for CUDA 13.x), and code that relies on PTX JIT needs a driver
  at least as new as the toolkit. The "CUDA Version" in `nvidia-smi`
  is the highest the driver supports, not what is installed. Check the
  toolkit's release notes for the exact minimum.
- **On NixOS:**
  - Per project, in a `devShell`: `cudaPackages.cuda_nvcc`,
    `cudaPackages.cuda_cudart`, `cudaPackages.cudnn` and the libraries
    needed, with `allowUnfree` (or a predicate) and
    `cudaSupport = true` in that flake's nixpkgs config. Pick
    `cudaPackages_<major>_<minor>` to match what the code needs.
  - `nixpkgs.config.cudaCapabilities = [ "8.9" ]` (the GPU's compute
    capability) cuts build time and size when building from source.
  - The driver's userspace libraries are at `/run/opengl-driver/lib`;
    nixpkgs packages find them. A binary built elsewhere needs that
    path in `LD_LIBRARY_PATH`, or `programs.nix-ld` with the libraries
    listed.
  - `cudaSupport = true` system-wide rebuilds a large share of nixpkgs.
    Use the CUDA binary cache (`https://cache.nixos-cuda.org`, key
    `cache.nixos-cuda.org:74DUi4Ye579gUqzH4ziL9IyiJBlDpMRn9MBN8oNan9M=`,
    per the NixOS wiki; confirm the key there) and check cache status
    with the `nixos` MCP server's `cache` action before switching.
    Prefer enabling CUDA per package or per project.
- **Elsewhere:** NVIDIA's repository packages for the distribution, or
  conda/container images that carry their own runtime on top of the
  host driver.

## Containers

- NixOS: `hardware.nvidia-container-toolkit.enable = true` generates a
  CDI specification; run with `--device nvidia.com/gpu=all` in Docker
  or Podman.
- Elsewhere: NVIDIA Container Toolkit packages, `nvidia-ctk cdi
  generate`, or `nvidia-ctk runtime configure` for Docker.
- The image's CUDA version must be supported by the host driver
  (rules above). Test with `nvidia-smi` inside the container.

## Output

Driver branch and version, module type, CUDA versions in use and the
driver minimum they need, how the change was applied (rebuild mode,
reboot) and the verification output (`nvidia-smi`, a CUDA sample or the
person's own workload).
