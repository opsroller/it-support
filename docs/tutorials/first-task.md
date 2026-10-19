*Tutorial, for someone using the it-support plugin for the first time.*

# Your first support request: give a project a tool, the Nix way

In this tutorial we will take a small, real request, find the answer in
nixpkgs with the bundled MCP server, provide it declaratively in a
project's devShell, and close the request with notes. We will use the
`it-support` agent, the `nixpkgs-search` skill and the
`provide-software` workflow.

Our request, from a colleague: **"I need `jq` and `shellcheck` when I
work in this project."** It is small on purpose, so we can watch each
step.

## Before we start

You need:

- the plugin installed (see the [README](../../README.md)), with
  `engineering-practices`;
- a machine with Nix and flakes (NixOS, or Nix on another Linux or
  macOS), and `direnv` with nix-direnv;
- a project in git with a `CLAUDE.md` that says where its docs live.

## 1. Check the MCP server is running

Ask the agent:

```
Use the nixos MCP server to list the NixOS channels.
```

You should see the channels and their revisions. If the server is not
available, Nix is missing or cannot reach nixpkgs; the skills will fall
back to `nix search`, but fix this before going on.

## 2. Search before anything else

Ask:

```
/it-support:provide-software
args: { need: "jq and shellcheck when I work in this project", scope: "project" }
```

Watch the **Search** phase. The agent reads which nixpkgs revision the
project's flake follows, then searches packages with the MCP server's
`nix` tool. Notice two things in its result:

- `queries` lists every search it ran;
- `candidates` gives the attribute paths (`jq`, `shellcheck`), versions,
  licences and cache status.

Both are free software and cached, so nothing will compile.

## 3. Watch the change being written

In **Configure** the agent edits the project's `flake.nix`, adding both
packages to `devShells.<system>.default`, and adds an `.envrc` with
`use flake` if the project has none. It commits on a new branch and
builds the shell with `nix develop -c jq --version`.

Open the diff. It is a few lines in one file. Nothing was installed on
the machine itself.

## 4. See it checked by someone else

In **Check**, a reviewer who did not write the change confirms the
searches were enough, the right layer was used, and nothing was
installed imperatively. If it finds a problem, the agent revises once
and the reviewer looks again.

## 5. Use it

A project change needs no apply step. In a terminal:

```
cd <the project>
direnv allow
jq --version
shellcheck --version
```

Both answer. Leave the directory and they are gone again: the tools
belong to the project, not to the machine.

## 6. Close the request

The workflow's **Docs** phase added or updated a page saying what the
devShell provides, and **Hand off** opened a draft pull request. Its
result has a `next` line: tell your colleague how to use it, and land
the PR with `/engineering-practices:land-pr`.

## What we did

We answered a request by searching nixpkgs first, put the tools at the
narrowest layer that served the need, changed only declared
configuration, had the change checked independently, and left a record.
Every request this role handles follows the same shape.

Next: [How to handle a support request](../how-to/how-to-handle-a-support-request.md) ·
[About the role](../explanation/about-the-role.md)
