*How-to guide, for someone using the plugin who needs to find software or a setting in nixpkgs.*

# How to find a package or option

This guide finds the package, module option or version that answers a
request, with the bundled `nixos` MCP server.

## Ask in plain words

```
Find how to run Syncthing as a service on NixOS 26.05.
```

The agent follows `nixpkgs-search`: it searches packages and options,
browses `services.syncthing`, and answers with the option path to set,
not only the package.

## Search options, not only packages

| Request | Look under |
|---|---|
| Run a service | `services.<name>` |
| A program with shell or desktop integration | `programs.<name>` |
| Drivers and devices | `hardware.<name>` |
| VMs and containers | `virtualisation.<name>` |
| One user's settings | Home Manager source |

## Match the host's channel

Tell the agent the release or point it at the host's flake. An option on
unstable may not exist on a stable release.

## Check before a heavy rebuild

For CUDA, large compilers or anything with `cudaSupport`:

```
Is pytorch with CUDA cached for x86_64-linux on nixos-unstable?
```

The server's `cache` action answers before you spend hours compiling.

## Get another version

```
Which nixpkgs commit has terraform 1.9?
```

`nix_versions` gives the commit; pin it as a separate flake input for
that one package.

## Without the server

```
nix search nixpkgs '^syncthing$'
nix eval nixpkgs#syncthing.meta.license.spdxId
man configuration.nix   # every option of the installed release
```

or search.nixos.org in a browser.

Related: [nixpkgs-search](../reference/skill-nixpkgs-search.md) ·
[The nixos MCP server](../reference/mcp-server.md) ·
[provide-software](../reference/workflow-provide-software.md)
