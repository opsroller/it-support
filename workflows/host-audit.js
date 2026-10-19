// SPDX-License-Identifier: GPL-2.0-or-later
export const meta = {
  name: 'host-audit',
  description: 'Audit the health, security and recoverability of one machine without changing it: take an inventory (OS, release, where its configuration lives, hardware, GPUs, virtualization, services), run parallel independent read-only lenses that apply to it (configuration drift, updates, storage, services and logs, security and exposure, backups, NVIDIA and CUDA, libvirt), rank the findings by severity, write the host\'s reference page and findings in the project docs, have the docs checked independently, and return follow-ups to run with resolve-support-request or provide-software. args: { host: "<host>", focus?: ["config", "updates", "storage", "services", "security", "backups", "gpu", "virtualization"] (default: every lens that applies) }',
  phases: [
    { title: 'Inventory', detail: 'what the host is and which lenses apply, read-only' },
    { title: 'Audit', detail: 'parallel independent read-only lenses' },
    { title: 'Docs', detail: 'host reference page and findings, uncommitted' },
    { title: 'Check', detail: 'independent read-only check of the docs against the findings' },
  ],
}

// --- run-modes v2 begin ---
const RUN = ((a, realAgent, realPhase, realLog) => {
  const opted = !!(a && typeof a === 'object' && a.run && typeof a.run === 'object')
  const c = opted ? a.run : {}
  const mode = c.mode === 'inline' ? 'inline' : 'agents'
  const results = c.results && typeof c.results === 'object' ? c.results : {}
  const reviewers = c.reviewers && typeof c.reviewers === 'object' ? c.reviewers : {}
  const only = Array.isArray(c.only) && c.only.length ? c.only.map(String) : null
  const from = c.from ? String(c.from) : null
  const titles = typeof meta !== 'undefined' && meta && Array.isArray(meta.phases) ? meta.phases.map((p) => p.title) : []
  const unknown = titles.length ? (from ? [from] : []).filter((t) => !titles.includes(t)) : []
  const error = c.mode && !['agents', 'inline'].includes(c.mode)
    ? `run.mode must be "agents" or "inline", got "${c.mode}"`
    : unknown.length ? `run.from names no phase: ${unknown.join(', ')}. Phases: ${titles.join(', ')}` : null
  const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k)
  // An answer must carry every required key of its schema, as the runtime
  // enforces for agents; returns the missing keys, or null when it fits.
  const missing = (v, schema) => {
    if (v === null || v === undefined) return 'an answer'
    if (!schema || schema.type !== 'object') return null
    if (typeof v !== 'object' || Array.isArray(v)) return 'a JSON object'
    const gap = (schema.required || []).filter((k) => !has(v, k) || v[k] === undefined)
    return gap.length ? gap.join(', ') : null
  }
  const seen = {}
  const out = {}
  // Who answered each step marked independent: "subagent" when this run
  // spawned it, else the reviewer named in run.reviewers, else "self".
  const by = {}
  const who = (k) => (typeof reviewers[k] === 'string' && reviewers[k].trim() ? reviewers[k].trim() : 'self')
  const skipped = []
  const next = []
  const logs = []
  let current = ''
  let reached = !from
  let halting = false
  let release = () => {}
  const halted = new Promise((r) => { release = r })
  const picked = (ph, label) => reached && (!only || only.some((s) => s === ph || s === label || label.startsWith(s + ':')))
  const agent = (prompt, opts) => {
    const op = opts || {}
    const independent = op.independent === true
    const ph = op.phase || current
    const base = op.label || ph || 'agent'
    seen[base] = (seen[base] || 0) + 1
    const key = seen[base] > 1 ? `${base}#${seen[base]}` : base
    let note = null
    if (has(results, key)) {
      const gap = missing(results[key], op.schema)
      if (!gap) { out[key] = results[key]; if (independent) by[key] = who(key); return Promise.resolve(results[key]) }
      note = `answer missing ${gap}; answer this brief again`
    }
    if (!picked(ph, base)) { skipped.push(key); return Promise.resolve(null) }
    if (mode === 'agents') {
      const pass = Object.assign({}, op)
      delete pass.independent
      return realAgent(prompt, opts ? pass : opts).then((r) => {
        if (r !== null && r !== undefined) { out[key] = r; if (independent) by[key] = 'subagent' }
        return r
      })
    }
    const brief = { key, phase: ph, prompt, schema: op.schema || null }
    if (independent) brief.independent = true
    if (note) brief.note = note
    next.push(brief)
    if (!halting) {
      halting = true
      // Wait 200 microtask turns before pausing, so every sibling in a
      // parallel() or pipeline() fan-out queues its brief into this pause.
      ;(async () => { for (let i = 0; i < 200; i++) await null; release('__run_halted__') })()
    }
    return new Promise(() => {})
  }
  const phase = (t) => { current = t; if (from && t === from) reached = true; return realPhase(t) }
  const log = (m) => { logs.push(String(m)); return realLog(m) }
  const finish = (value) => {
    if (!opted) return value
    const self_reviewed = Object.keys(by).filter((k) => by[k] === 'self')
    if (value === '__run_halted__') {
      return {
        run: 'inline', status: 'next', next, results: out, reviewers: by, self_reviewed, skipped, logs,
        how: 'Do each brief in next, in order: follow its prompt in this session (it may tell you to edit files, commit or push), and shape your answer to its schema when one is given, with every required field. A brief marked independent reviews work this run produced, so do not answer it yourself: send its prompt to a reviewer with no part in the work (the project\'s code-reviewer role, a fresh session or a fresh subagent), use their answer, and name them in run.reviewers under its key; if you must answer it yourself, it is listed in self_reviewed and must be reported as self-reviewed. A brief with a note was answered before without the fields it names. Add each answer to results under its key, then run this workflow again with the same args, run.results set to the merged results and run.reviewers to the merged reviewers. Repeat until status is "done". To avoid pasting results back on every call, drive the run with engineering-practices tools/run-inline.mjs and a state file instead: it stores each answer and prints only the next briefs.',
      }
    }
    return { run: mode, status: 'done', result: value, results: out, reviewers: by, self_reviewed, skipped, logs }
  }
  return { agent, phase, log, finish, halted, error }
})(typeof args === 'undefined' ? undefined : args, agent, phase, log)
if (RUN.error) return RUN.error
const RUN_OUT = await Promise.race([RUN.halted, (async (agent, phase, log) => {
// --- run-modes v2 end (workflow body follows; close it with the tail line) ---

const LENSES = {
  config: 'configuration and drift: the host rebuilds from configuration in version control (NixOS: the running system equals the build of the committed flake; no nix-env or nix profile packages for users that should be declarative; hand edits under /etc), flake.lock age, generations kept for rollback, stateVersion',
  updates: 'patch level: age of the nixpkgs input or the distribution\'s pending security updates, packages flagged insecure or with known vulnerabilities in the system closure, kernel and firmware updates, reboot needed',
  storage: 'storage: free space and inodes per filesystem, SMART or NVMe health, filesystem or pool errors and last scrub, Nix store size and garbage-collection settings, /boot space, journal size',
  services: 'services and logs: failed units, units restarting in loops, errors and warnings in this boot\'s journal and kernel log, OOM kills, slow boot, timers that have not run',
  security: 'security and exposure: listening ports and their owners, firewall state, SSH configuration (keys only, root login), sudo rules, accounts, secrets in the Nix store or world-readable files, disk encryption',
  backups: 'backups: what data matters on this host, whether it is backed up, the age of the last good backup, off-host copy, and when a restore was last tested',
  gpu: 'NVIDIA and CUDA: driver branch and module type, loaded module equals userspace version, Xid errors in the kernel log, CUDA versions in use against the driver minimum, persistence, container toolkit, thermals and throttle reasons',
  virtualization: 'libvirt and KVM: virt-host-validate, guests and their autostart, networks and pools active, guest definitions kept in configuration, snapshots mistaken for backups, IOMMU and VFIO state for passthrough',
}

const USAGE = 'usage: host-audit { host: "<host>", focus: ["config", "updates", "storage", "services", "security", "backups", "gpu", "virtualization"] (optional) }'
if (!args || !args.host) return USAGE
const host = String(args.host)
const focus = Array.isArray(args.focus) && args.focus.length ? args.focus.map(String) : null
if (focus && focus.some((f) => !LENSES[f])) return USAGE

const ONBOARD = 'You are the it-support role. Onboard first (engineering-practices project-onboarding): read the project profile for the hosts in scope, how you reach them and where their configuration lives. Touch nothing outside that scope. This audit is read-only: change nothing on the host or in any repository, and scope every command to what the lens needs (no filesystem-wide searches, no reading people\'s files).'

const DOCS_FRAGMENT = 'Keep each page to one Diataxis kind, title it by the project pattern, start it with a line naming its kind and audience, and link to the related pages of the other kinds.'

const NOTES_RULE = 'Put a problem in the blocking list only if it is a failure you can point to: a docs page contradicts the findings, a finding has no evidence, a page mixes Diataxis kinds. Everything else goes in notes; an empty blocking list means done.'

const INVENTORY = {
  type: 'object',
  properties: {
    os: { type: 'string', description: 'operating system and release, and how it is configured (flake, configuration.nix, other tool)' },
    configRepo: { type: 'string', description: 'where the configuration lives, or "none"' },
    hardware: { type: 'string', description: 'CPU, memory, disks, GPUs' },
    role: { type: 'string', description: 'what the host is for and who uses it' },
    services: { type: 'array', items: { type: 'string' } },
    hasNvidia: { type: 'boolean' },
    hasLibvirt: { type: 'boolean' },
    blockers: { type: 'array', items: { type: 'string' }, description: 'only what stops the audit: host unreachable or out of scope' },
  },
  required: ['os', 'configRepo', 'hardware', 'role', 'services', 'hasNvidia', 'hasLibvirt'],
}
const FINDINGS = {
  type: 'object',
  properties: {
    findings: { type: 'array', items: { type: 'object', properties: { severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] }, title: { type: 'string' }, evidence: { type: 'string', description: 'command and the relevant output' }, recommendation: { type: 'string', description: 'the declarative change or action that fixes it' }, workflow: { type: 'string', enum: ['resolve-support-request', 'provide-software', 'none'] } }, required: ['severity', 'title', 'evidence', 'recommendation'] } },
    healthy: { type: 'array', items: { type: 'string' }, description: 'what was checked and found fine' },
    notChecked: { type: 'array', items: { type: 'string' }, description: 'what could not be checked and why' },
  },
  required: ['findings', 'healthy', 'notChecked'],
}
const DOCS = { type: 'object', properties: { pages: { type: 'array', items: { type: 'object', properties: { path: { type: 'string' }, kind: { type: 'string', enum: ['tutorial', 'how-to', 'reference', 'explanation'] } }, required: ['path', 'kind'] } }, undocumented: { type: 'array', items: { type: 'string' } } }, required: ['pages', 'undocumented'] }
const CHECK = { type: 'object', properties: { pass: { type: 'boolean' }, problems: { type: 'array', items: { type: 'string' } }, notes: { type: 'array', items: { type: 'string' } } }, required: ['pass', 'problems'] }

const strings = (xs) => (Array.isArray(xs) ? xs.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim()) : [])
const RANK = { critical: 0, high: 1, medium: 2, low: 3 }
const notes = []

phase('Inventory')
const inv = await agent(
  `${ONBOARD} Then follow the it-support skills linux-administration and nixos-administration. Host: ${host}. Take an inventory: OS, release and how it is configured, where the configuration lives, hardware (CPU, memory, disks, GPUs), what the host is for, the main services, and whether it has an NVIDIA GPU and libvirt.`,
  { schema: INVENTORY, phase: 'Inventory', label: 'inventory' })
if (!inv) return { status: 'blocked', reason: 'inventory returned nothing' }
if (strings(inv.blockers).length) return { status: 'blocked', stage: 'inventory', open: strings(inv.blockers) }

phase('Audit')
const applies = (k) => (k === 'gpu' ? inv.hasNvidia : k === 'virtualization' ? inv.hasLibvirt : true)
const chosen = (focus || Object.keys(LENSES)).filter(applies)
const skippedLenses = (focus || Object.keys(LENSES)).filter((k) => !applies(k))
const skillFor = { config: 'nixos-administration', updates: 'host-security', storage: 'linux-administration', services: 'linux-administration', security: 'host-security', backups: 'host-security', gpu: 'nvidia-cuda', virtualization: 'virtualization' }
const results = await parallel(chosen.map((k) => () => agent(
  `${ONBOARD} You are an it-support auditor giving an independent review of one area of this host; do not edit anything. Follow the it-support skill ${skillFor[k]}. Host: ${host} (${inv.os}; configuration: ${inv.configRepo}; role: ${inv.role}). Lens: ${LENSES[k]}.
For each finding give a severity (critical: data loss or compromise likely now; high: an outage or exposure waiting to happen; medium: drift or weak practice; low: tidiness), the evidence (command and output), and the recommendation as a declarative change where one applies; name the it-support workflow that would carry it out (resolve-support-request for a fix, provide-software for missing software) or none. List what you checked and found healthy, and what you could not check and why.`,
  { schema: FINDINGS, phase: 'Audit', label: 'audit:' + k, independent: true })))
const unverified = []
const findings = []
const healthy = []
const notChecked = []
results.forEach((r, i) => {
  const k = chosen[i]
  if (!r || !Array.isArray(r.findings)) { unverified.push(k); return }
  r.findings.forEach((f) => findings.push(Object.assign({ lens: k }, f)))
  strings(r.healthy).forEach((h) => healthy.push(`${k}: ${h}`))
  strings(r.notChecked).forEach((n) => notChecked.push(`${k}: ${n}`))
})
findings.sort((a, b) => (RANK[a.severity] ?? 9) - (RANK[b.severity] ?? 9))

phase('Docs')
const docs = await agent(
  `You are the it-support role. Write the audit into the project's docs (per the project profile). Do not commit. Host: ${host}. Inventory: ${JSON.stringify(inv)}. Findings, most severe first: ${JSON.stringify(findings)}. Healthy: ${JSON.stringify(healthy)}. Not checked: ${JSON.stringify(notChecked)}.
Update or create the host's reference page (what it is, hardware, OS and release, where it is configured, services, owner) and a reference page or section for the audit dated today with every finding, its severity, evidence and recommendation, and what was healthy and not checked. Add a how-to only for a procedure the findings show people need and lack. ${DOCS_FRAGMENT} Report the pages written.`,
  { schema: DOCS, phase: 'Docs', label: 'docs' })
if (!docs) return { status: 'blocked', reason: 'docs step failed; the audit is not done without its record', findings }
const docPages = (Array.isArray(docs.pages) ? docs.pages : []).map((p) => (p && typeof p === 'object'
  ? { path: String(p.path || ''), kind: String(p.kind || '') }
  : { path: String(p), kind: '' })).filter((p) => p.path)
const docPaths = docPages.map((p) => p.path)
const docList = docPages.map((p) => (p.kind ? `${p.path} (${p.kind})` : p.path)).join(', ')

phase('Check')
const check = await agent(
  `You are a technical reviewer giving an independent check of audit documentation you did not write. Read only; do not edit anything. Pages: ${docList || 'none reported'}. Findings they must carry: ${JSON.stringify(findings.map((f) => ({ severity: f.severity, title: f.title })))}.
Check: every finding appears with its severity, evidence and recommendation; nothing is claimed that the findings do not support; no secret, password or private key appears in the pages; each page is one Diataxis kind with a first line naming kind and audience, a title by pattern and links to related kinds. Report problems and notes separately. ` + NOTES_RULE + ' Set pass to true exactly when problems is empty.',
  { schema: CHECK, phase: 'Check', label: 'check', independent: true })
if (!check) return { status: 'unverified', reason: 'docs check returned nothing', findings, docs: docPaths }
strings(check.notes).forEach((n) => notes.push('check: ' + n))
if (strings(check.problems).length || !check.pass) return { status: 'blocked', stage: 'check', open: strings(check.problems).length ? strings(check.problems) : ['docs check failed without naming a problem'], findings, docs: docPaths, notes }

const followUps = findings.filter((f) => f.workflow && f.workflow !== 'none').map((f) => `${f.severity}: /it-support:${f.workflow} for "${f.title}"`)
return {
  status: unverified.length ? 'unverified' : 'done',
  host,
  os: inv.os,
  counts: ['critical', 'high', 'medium', 'low'].reduce((o, s) => Object.assign(o, { [s]: findings.filter((f) => f.severity === s).length }), {}),
  findings,
  healthy,
  notChecked,
  lensesRun: chosen,
  lensesSkipped: skippedLenses,
  unverifiedLenses: unverified,
  docs: docPaths,
  docsCommitted: false,
  undocumented: docs.undocumented,
  followUps,
  notes,
  next: unverified.length
    ? `rerun the lenses that returned nothing with run.only: [${unverified.map((n) => JSON.stringify('audit:' + n)).join(', ')}] and run.results from this run`
    : `the docs are written but not committed: land them with /engineering-practices:small-change { change: "docs: record the ${host} host audit" }; then carry out the follow-ups, most severe first${followUps.length ? ': ' + followUps.join('; ') : ''}`,
}
})(RUN.agent, RUN.phase, RUN.log)]); return RUN.finish(RUN_OUT)
