*Explanation, for anyone who wants to understand what the IT support role does and why this plugin works the way it does.*

# About the IT support role

## What the job is

IT support, systems administration and the help desk are one job seen
from different sides: keeping the computers people depend on working,
and getting a person who is stuck back to work. Postings and skills
frameworks describe a stable core. Install and maintain operating
systems and software; set up accounts and permissions; keep systems
patched and secure; watch performance and capacity; answer support
requests and troubleshoot faults reported by people or by monitoring;
plan changes with a way back; and write down how things are set up. The
SFIA framework's "system software administration" skill puts it as
installing, managing and maintaining operating systems and utility
software, testing new versions with fallback plans, and keeping
operational procedures current. Postings for teams that run NixOS ask
for the same Linux fundamentals plus daily work with Nix, and for
"predictable, debuggable, maintainable systems".

This plugin holds that job for an agent: the generic practice in its
skills, the steps that must happen in order in its workflows, and
nothing about any particular organisation's machines. The project's
profile names the hosts, their owners and what may be changed.

## Why configuration is code

A machine whose state lives only in its own disk can be fixed but not
understood, reviewed, repeated or undone. When every lasting change is
a change to declared configuration in version control, a fix becomes a
diff someone can read, a rollback becomes a revert, and a new machine
becomes a rebuild. NixOS makes this the default: the whole system is
built from one configuration, each build is a generation, and the
previous generation is one command or one boot-menu entry away. On
systems without that, the same discipline is kept with whatever the
project uses as its source of truth.

That is why the role never installs software imperatively on a managed
host: a change made by hand is lost at the next rebuild, or worse,
survives unrecorded.

## Why nixpkgs first, and why an MCP server

Most requests ("install this", "run that as a service", "turn on the
GPU") are already answered in nixpkgs, often by a NixOS module that also
sets up the users, groups, udev rules and firewall the package alone
lacks. Writing a script or a derivation before looking is how a team
ends up maintaining tools nobody needed. So every request starts with a
search, and every search is recorded.

The plugin bundles the `mcp-nixos` server, which is itself packaged in
nixpkgs and started from it. It answers package, option, Home Manager,
nix-darwin, version-history and binary-cache questions directly, which
is faster and more precise than scraping search pages or evaluating
nixpkgs locally. When it cannot start, the command line and the web
search remain. The plugin uses an existing, packaged tool for this
rather than inventing its own, which is the same rule it applies to
every request.

## Why test before switch, and ask before destroy

`nixos-rebuild test` activates a change without making it the boot
default, so a reboot undoes it; `switch` comes only after the change is
verified. Driver and kernel changes go through `boot` and a reboot in a
window. This makes almost every change reversible, so the role can act
without asking. The few things that are not reversible (wiping a disk,
deleting a VM's storage, removing the generations needed to roll back)
always wait for the owner, with a backup checked first. The line is
drawn by reversibility, not by how important the machine feels.

## Why the person decides when it is fixed

A support request is a service to a person. A command that exits zero
is not the same as the person being able to work again, so every fix is
checked against the symptom they reported, the way they reported it,
and closed with their confirmation where possible. A root cause, or an
honest "unknown" with what was ruled out, keeps the same problem from
coming back as a new ticket.

## GPUs and virtual machines

NVIDIA drivers and CUDA, and libvirt with KVM, get their own skills
because they fail in characteristic ways: a kernel module that does not
match its userspace, a CUDA runtime newer than the driver supports, a
missing group or library path, an IOMMU group that cannot be split, a
bridge that cuts off the SSH session configuring it. Knowing those
patterns turns hours of guessing into a few read-only checks.

## Boundaries with neighbouring roles

- The **devops-engineer** owns how software is built, tested and
  released, including CI runners and pipelines. IT support keeps the
  machines those runners live on healthy and says what they provide.
- The engineering roles own their code, GPU code included. IT support
  provides the drivers, toolkits and libraries, and diagnoses the
  platform beneath them.
- The **project-manager** decides priorities; the **code-reviewer**
  reviews pull requests, including configuration changes.
- Hardware, accounts, licences and money belong to the owner; the role
  says exactly what is needed and why.

Related: [Reference](../reference/index.md) · [Your first support request](../tutorials/first-task.md)
