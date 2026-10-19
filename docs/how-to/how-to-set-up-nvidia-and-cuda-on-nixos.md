*How-to guide, for someone using the plugin who needs an NVIDIA GPU and CUDA working on a NixOS machine.*

# How to set up NVIDIA and CUDA on NixOS

This guide gets the NVIDIA driver loaded and a CUDA workload running,
declaratively, with a way back.

## 1. Identify the GPU

```
lspci -nnk | grep -A3 -i nvidia
```

Turing (RTX 20, GTX 16) or newer can use the open kernel modules;
older GPUs need `open = false` and possibly a `legacy_` driver branch.

## 2. Add the driver module

Ask the agent to run `provide-software` with the need "NVIDIA driver on
this host", or add to the host's GPU module:

```nix
hardware.graphics.enable = true;
services.xserver.videoDrivers = [ "nvidia" ];
hardware.nvidia = {
  open = true;
  modesetting.enable = true;
  package = config.boot.kernelPackages.nvidiaPackages.stable;
};
nixpkgs.config.allowUnfreePredicate = pkg: builtins.elem (lib.getName pkg) [
  "nvidia-x11" "nvidia-settings" "nvidia-persistenced"
];
```

For a laptop or a machine with an integrated GPU too, add
`hardware.nvidia.prime` with the bus IDs (see the `nvidia-cuda` skill).

## 3. Apply with a reboot

```
nixos-rebuild build --flake .#<host>
nixos-rebuild boot --flake .#<host>
```

Reboot in a window. If the display does not come up, choose the
previous generation in the boot menu.

## 4. Verify

```
nvidia-smi
cat /proc/driver/nvidia/version
```

The driver version in both must match. On a desktop, check the person's
own session: their displays, resolution and refresh rate.

## 5. Give a project CUDA

In the project's `flake.nix`, with `config.allowUnfree = true;` and
`config.cudaSupport = true;` in its nixpkgs import, add to the devShell
the CUDA packages the code needs, for example
`cudaPackages.cuda_nvcc`, `cudaPackages.cuda_cudart`,
`cudaPackages.cudnn`. Check the driver meets the toolkit's minimum
(`nvidia-smi` shows the highest CUDA version it supports).

## 6. Avoid compiling CUDA for hours

Add the CUDA binary cache to the host and rebuild once before relying on
it:

```nix
nix.settings.substituters = [ "https://cache.nixos-cuda.org" ];
nix.settings.trusted-public-keys = [ "cache.nixos-cuda.org:74DUi4Ye579gUqzH4ziL9IyiJBlDpMRn9MBN8oNan9M=" ];
```

Confirm the key on the NixOS wiki's CUDA page before adding it.

## 7. Containers (optional)

```nix
hardware.nvidia-container-toolkit.enable = true;
```

then `docker run --device nvidia.com/gpu=all <image> nvidia-smi`.

Related: [nvidia-cuda skill](../reference/skill-nvidia-cuda.md) ·
[How to roll back a bad change](how-to-roll-back-a-bad-change.md)
