// SPDX-License-Identifier: GPL-2.0-or-later
export const meta = {
  name: 'resolve-support-request',
  description: 'Resolve one support request or incident on a machine: take it down in the person\'s words and triage it by impact, gather facts read-only, find the root cause (or plan the requested change), write the smallest declarative change on a branch after searching nixpkgs or the platform\'s packages, have the plan checked in an independent read-only review, apply it with test before switch only when apply is true and the change kind allows it, document it, verify the original symptom is gone in an independent read-only check, and push the configuration change as a draft PR. args: { request: "<the request in the person\'s words, or a ticket link>", host?: "<host it concerns>", apply?: true|false (default false: stop with the plan for approval), branch?: "<existing branch of the configuration repository>", pr?: "<existing PR>" }',
  phases: [
    { title: 'Triage', detail: 'symptom, kind, impact, facts and recent changes, read-only' },
    { title: 'Diagnose', detail: 'root cause for incidents and problems, read-only' },
    { title: 'Plan', detail: 'smallest declarative change on a branch, built, not applied' },
    { title: 'Review', detail: 'independent read-only check of the plan, one revision' },
    { title: 'Apply', detail: 'test, then switch, when allowed' },
    { title: 'Docs', detail: 'ticket notes and the Diataxis pages the work owes' },
    { title: 'Verify', detail: 'independent read-only check of the symptom, the host and the docs' },
    { title: 'Hand off', detail: 'push and open or update the draft PR' },
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

const USAGE = 'usage: resolve-support-request { request: "<the request in the person\'s words, or a ticket link>", host: "<host, optional>", apply: true|false (optional, default false), branch: "<existing branch, optional>", pr: "<existing PR, optional>" }'
if (!args || !args.request) return USAGE
const request = String(args.request)
const host = args.host ? String(args.host) : 'the host the request names, as the project profile identifies it'
const apply = args.apply === true
const where = args.pr
  ? `Work on the existing PR ${args.pr} and its head branch in the configuration repository; do not create a new branch or PR.`
  : args.branch
    ? `Work on the existing branch ${args.branch} of the configuration repository (reuse its open PR if one exists); do not create a new branch.`
    : 'Work in the configuration repository the project profile names for this host; cut a Conventional branch (fix/<slug> for an incident, feat/<slug> for a request) from its latest default branch.'

const ONBOARD = 'You are the it-support role. Onboard first (engineering-practices project-onboarding): read the project profile for the hosts in scope, who owns each, how you reach them, where their configuration lives and what you may change without asking. Touch nothing outside that scope. Scope every command to the problem: no filesystem-wide searches, no reading other people\'s files.'

const DOCS_FRAGMENT = 'Classify every user-visible change in this work with the Diataxis compass (action/cognition x study/work). For each, update or add exactly one page of that kind under the project\'s docs location (per the project profile), keep each page to one kind, title it by the project pattern, and link to the related pages of the other kinds. Report pages touched and any change you left undocumented and why.'

const NOTES_RULE = 'Put a problem in the blocking list only if it is a failure you can point to: the symptom still shows, a build fails, a unit failed, a rollback target is missing, a step broke a rule of the it-support role. Everything else goes in notes; an empty blocking list means done.'

const TRIAGE = {
  type: 'object',
  properties: {
    kind: { type: 'string', enum: ['incident', 'service-request', 'problem'], description: 'incident: something that worked stopped; service-request: something new is wanted; problem: the cause behind repeated incidents' },
    symptom: { type: 'string', description: 'what the person tried, what happened instead, exact error text, since when, which host and account' },
    impact: { type: 'string', description: 'who is blocked and how badly' },
    os: { type: 'string', description: 'operating system and release, e.g. NixOS 26.05 with a flake' },
    configRepo: { type: 'string', description: 'where the host\'s configuration lives, or "none" if it is not in version control' },
    facts: { type: 'array', items: { type: 'string' }, description: 'commands run and the relevant output, read-only' },
    recentChanges: { type: 'array', items: { type: 'string' }, description: 'generations, config commits, updates since it last worked' },
    reproduced: { type: 'boolean' },
    restore: { type: 'string', description: 'for an incident: the fastest safe way to restore service now (often a rollback), or ""' },
    blockers: { type: 'array', items: { type: 'string' }, description: 'only what stops the work: host unreachable, out of scope, request unclear with no way to proceed' },
  },
  required: ['kind', 'symptom', 'impact', 'os', 'configRepo', 'facts', 'recentChanges', 'reproduced'],
}
const DIAG = {
  type: 'object',
  properties: {
    rootCause: { type: 'string', description: 'one sentence that explains every symptom, or "unknown"' },
    evidence: { type: 'string' },
    ruledOut: { type: 'array', items: { type: 'string' }, description: 'hypotheses tested and the observation that ruled each out' },
    explainsAll: { type: 'boolean' },
    fix: { type: 'string', description: 'the change at the cause' },
  },
  required: ['rootCause', 'evidence', 'ruledOut', 'explainsAll', 'fix'],
}
const PLAN = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    changeKind: { type: 'string', enum: ['standard', 'normal', 'emergency', 'destructive'], description: 'per the change-management skill and the project profile' },
    searched: { type: 'array', items: { type: 'string' }, description: 'nixpkgs or package searches run (tool, query, channel) and what they found' },
    branch: { type: 'string' },
    files: { type: 'array', items: { type: 'string' } },
    built: { type: 'boolean', description: 'the configuration builds (nixos-rebuild build or the platform\'s dry run)' },
    closureDiff: { type: 'string', description: 'packages that change, from nix store diff-closures or the package manager\'s preview' },
    test: { type: 'string', description: 'how it will be tried before it becomes the default (nixos-rebuild test, a VM)' },
    rollback: { type: 'string', description: 'exact rollback command and confirmation its target exists' },
    verification: { type: 'string', description: 'what will show it worked, tied to the original symptom or request' },
    impact: { type: 'string', description: 'what restarts or reboots, who notices, for how long' },
    needsOwner: { type: 'boolean', description: 'the project profile requires the host owner\'s approval for this change' },
    blockers: { type: 'array', items: { type: 'string' } },
  },
  required: ['summary', 'changeKind', 'searched', 'branch', 'files', 'built', 'test', 'rollback', 'verification', 'impact', 'needsOwner'],
}
const CHECK = { type: 'object', properties: { pass: { type: 'boolean' }, problems: { type: 'array', items: { type: 'string' } }, notes: { type: 'array', items: { type: 'string' } } }, required: ['pass', 'problems'] }
const APPLY = {
  type: 'object',
  properties: {
    applied: { type: 'boolean' },
    generation: { type: 'string', description: 'new generation number or version now running' },
    output: { type: 'string', description: 'relevant output of test, switch and the verification commands' },
    rolledBack: { type: 'boolean', description: 'verification failed and the change was rolled back' },
    failing: { type: 'array', items: { type: 'string' } },
    notes: { type: 'array', items: { type: 'string' } },
  },
  required: ['applied', 'rolledBack', 'failing'],
}
const DOCS = { type: 'object', properties: { ticketNotes: { type: 'string', description: 'symptom, impact, cause, fix, verification, rollback, follow-ups' }, pages: { type: 'array', items: { type: 'object', properties: { path: { type: 'string' }, kind: { type: 'string', enum: ['tutorial', 'how-to', 'reference', 'explanation'] } }, required: ['path', 'kind'] } }, undocumented: { type: 'array', items: { type: 'string' } } }, required: ['ticketNotes', 'pages', 'undocumented'] }
const HANDOFF = { type: 'object', properties: { branch: { type: 'string' }, pr: { type: 'string' }, head_sha: { type: 'string' }, builds: { type: 'boolean' }, problem: { type: 'string' } }, required: ['branch', 'builds'] }

const strings = (xs) => (Array.isArray(xs) ? xs.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim()) : [])
const notes = []

phase('Triage')
const triage = await agent(
  `${ONBOARD} Then follow the it-support skills troubleshooting and linux-administration (and nixos-administration on NixOS). Request: ${request}. Host: ${host}.
Record the symptom in the person's words with the exact error text. Classify it as incident, service-request or problem, and state the impact. Gather facts read-only: OS and release, where the configuration lives, failed units, the journal and kernel log around the symptom, and what changed since it last worked (NixOS: list generations and diff the closures of the last good and current ones; git log of the configuration). Reproduce it if you can. For an incident, name the fastest safe restore (often a rollback) but do not apply it. Change nothing on the host.`,
  { schema: TRIAGE, phase: 'Triage', label: 'triage' })
if (!triage) return { status: 'blocked', reason: 'triage returned nothing' }
const triageBlockers = strings(triage.blockers)
if (triageBlockers.length) return { status: 'blocked', stage: 'triage', open: triageBlockers, symptom: triage.symptom }
if (triage.kind !== 'service-request' && !triage.reproduced && !strings(triage.facts).length) {
  return { status: 'blocked', stage: 'triage', open: ['could not reproduce the symptom and gathered no facts that show it'], symptom: triage.symptom }
}

let diag = null
if (triage.kind !== 'service-request') {
  phase('Diagnose')
  diag = await agent(
    `${ONBOARD} Diagnose this per the it-support troubleshooting skill, and the skill for the area (nixos-administration, linux-administration, nvidia-cuda, virtualization or host-security). Symptom: ${triage.symptom}. OS: ${triage.os}. Facts: ${JSON.stringify(strings(triage.facts))}. Recent changes: ${JSON.stringify(strings(triage.recentChanges))}.
Start from what changed. Work one hypothesis at a time, most likely first; for each, state the observation that would rule it out and make the smallest read-only check. Bisect generations, layers or components when the cause is not obvious. State the root cause in one sentence and whether it explains every symptom, list what you ruled out, and propose the fix at the cause. Read only; change nothing on the host or in the configuration.`,
    { schema: DIAG, phase: 'Diagnose', label: 'diagnose' })
  if (!diag) return { status: 'blocked', reason: 'diagnosis returned nothing', symptom: triage.symptom }
  if (!diag.explainsAll) {
    return { status: 'blocked', stage: 'diagnose', open: ['the cause found does not explain every symptom: ' + diag.rootCause], ruledOut: strings(diag.ruledOut), restore: triage.restore || '' }
  }
}

phase('Plan')
const goal = diag ? `Fix at the cause: ${diag.fix} (root cause: ${diag.rootCause}).` : `Provide what was requested: ${triage.symptom}.`
const planBrief = (extra) =>
  `${ONBOARD} Plan and write this change per the it-support skills change-management, nixos-administration (on NixOS) and nixpkgs-search. ${goal} Host: ${host}, ${triage.os}; configuration: ${triage.configRepo}. ${where}
Search first: for any package, service or setting, query nixpkgs with the nixos MCP server (nix tool: search and info, browse for module options, cache for heavy packages; nix_versions for another version), falling back to nix search nixpkgs and nixos-option; on other systems, the distribution's packages. Use the existing module or package; write no new script, derivation or tool unless nothing packaged does the job, and say so. Write the smallest declarative change in the configuration repository, commit it with a Conventional Commit, and build it without activating (nixos-rebuild build, then nix store diff-closures against /run/current-system; or the platform's dry run). Do not apply it to the host. Classify the change kind (standard, normal, emergency, destructive) per change-management and the project profile, name the test, the exact rollback and that its target exists, the verification tied to the symptom, the impact, and whether the profile requires the owner's approval.${extra} ` + NOTES_RULE
let plan = await agent(planBrief(''), { schema: PLAN, phase: 'Plan', label: 'plan' })
if (!plan) return { status: 'blocked', reason: 'plan step returned nothing' }
if (strings(plan.blockers).length) return { status: 'blocked', stage: 'plan', open: strings(plan.blockers) }
if (!plan.built) return { status: 'blocked', stage: 'plan', open: ['the planned configuration does not build'], branch: plan.branch }

phase('Review')
const reviewBrief = (p) =>
  `You are an it-support reviewer giving an independent review of a change plan you did not write. Read only; do not edit anything. Request: ${request}. ${diag ? `Root cause: ${diag.rootCause}.` : ''} Plan: ${JSON.stringify(p)}. Read the diff on branch ${p.branch}.
Check: 1) it fixes the cause or delivers the request, and nothing more; 2) it is declarative, in the host's configuration, with no imperative install or hand edit of generated files; 3) nixpkgs (or the platform's packages) was searched and an existing module or package used where one exists, with no invented tool; 4) the rollback is real and its target exists; 5) the test happens before the change becomes the default; 6) no security control is disabled and no secret enters the Nix store or git; 7) the change kind and the approval need are right for the project profile. Report problems and notes separately. ` + NOTES_RULE + ' Set pass to true exactly when problems is empty.'
let review = await agent(reviewBrief(plan), { schema: CHECK, phase: 'Review', label: 'review', independent: true })
if (!review) return { status: 'unverified', reason: 'plan review returned nothing', plan }
strings(review.notes).forEach((n) => notes.push('review: ' + n))
if (strings(review.problems).length || !review.pass) {
  const problems = strings(review.problems)
  plan = await agent(planBrief(` Revise the plan on the same branch to fix these review problems: ${JSON.stringify(problems.length ? problems : ['the review failed without naming a problem; re-check every point'])}.`), { schema: PLAN, phase: 'Review', label: 'revise' })
  if (!plan) return { status: 'blocked', reason: 'revision returned nothing', open: problems }
  if (!plan.built) return { status: 'blocked', stage: 'review', open: ['the revised configuration does not build'], branch: plan.branch }
  review = await agent(reviewBrief(plan), { schema: CHECK, phase: 'Review', label: 'review-again', independent: true })
  if (!review) return { status: 'unverified', reason: 'second plan review returned nothing', plan }
  strings(review.notes).forEach((n) => notes.push('review-again: ' + n))
  if (strings(review.problems).length || !review.pass) return { status: 'blocked', stage: 'review', open: strings(review.problems).length ? strings(review.problems) : ['review failed twice'], plan, notes }
}

phase('Apply')
const holdReason = !apply
  ? 'apply was not set'
  : plan.changeKind === 'destructive'
    ? 'the change is destructive and needs the host owner\'s explicit word and a verified backup'
    : plan.needsOwner
      ? 'the project profile requires the host owner\'s approval for this change'
      : ''
if (holdReason) {
  return {
    status: 'awaiting-approval',
    reason: holdReason,
    kind: triage.kind,
    symptom: triage.symptom,
    rootCause: diag ? diag.rootCause : '',
    restore: triage.restore || '',
    plan,
    notes,
    next: `get the host owner's approval for the plan on branch ${plan.branch}, then rerun with the same args plus apply: true, run: { from: "Apply", results: <this run's results> } to apply, document, verify and hand off`,
  }
}
const applied = await agent(
  `${ONBOARD} Apply the reviewed change on branch ${plan.branch} to ${host} per the it-support change-management skill. First confirm the rollback target exists (${plan.rollback}) and back up anything the change could damage. Then: ${plan.test}; check the verification (${plan.verification}); only if it passes, make it the default (nixos-rebuild switch, or boot and reboot in the window for kernel or driver changes; or the platform's equivalent). If verification fails at any point, roll back first (${plan.rollback}) and report rolledBack. Keep a way back in that does not depend on the change for anything touching networking, SSH, boot or the only display. Return applied, the generation now running, the relevant output, rolledBack, failing and notes. ` + NOTES_RULE,
  { schema: APPLY, phase: 'Apply', label: 'apply' })
if (!applied) return { status: 'blocked', reason: 'apply step returned nothing; check the host state before retrying', plan }
strings(applied.notes).forEach((n) => notes.push('apply: ' + n))
if (applied.rolledBack || !applied.applied || strings(applied.failing).length) {
  return { status: 'blocked', stage: 'apply', open: strings(applied.failing).length ? strings(applied.failing) : ['the change did not apply cleanly'], rolledBack: !!applied.rolledBack, plan, notes }
}

phase('Docs')
const docs = await agent(
  `You are the it-support role. Document this work in the same change. Request: ${request}. Kind: ${triage.kind}. ${diag ? `Root cause: ${diag.rootCause}.` : ''} Change: ${plan.summary} (branch ${plan.branch}, generation ${applied.generation || 'unknown'}). Write the ticket notes (symptom, impact, cause, fix, verification, rollback, follow-ups). A procedure people will repeat gets a how-to; a host or service whose setup changed gets its reference page updated; a decision with trade-offs gets an explanation. ${DOCS_FRAGMENT} Commit on the same branch.`,
  { schema: DOCS, phase: 'Docs', label: 'docs' })
if (!docs) return { status: 'blocked', reason: 'docs step failed; work without its docs is not done', plan }
const docPages = (Array.isArray(docs.pages) ? docs.pages : []).map((p) => (p && typeof p === 'object'
  ? { path: String(p.path || ''), kind: String(p.kind || '') }
  : { path: String(p), kind: '' })).filter((p) => p.path)
const docPaths = docPages.map((p) => p.path)
const docList = docPages.map((p) => (p.kind ? `${p.path} (${p.kind})` : p.path)).join(', ')

phase('Verify')
const verify = await agent(
  `You are a second it-support engineer giving an independent check of a change you did not make. Read only; do not edit or change anything on the host. Host: ${host}. Original symptom or request: ${triage.symptom}. Change: ${plan.summary}, now at generation ${applied.generation || 'unknown'}.
1) Reproduce the original symptom the original way: it must be gone, or the request must be met. 2) No new failed units, and no new errors in the journal or kernel log since the change. 3) The running system matches the committed configuration on ${plan.branch} (NixOS: the current system is the build of that commit), and the rollback target still exists. 4) For each docs page (${docList || 'none reported'}): one Diataxis kind, a first line naming kind and audience, a title by pattern, links to related kinds. Report problems and notes separately. ` + NOTES_RULE + ' Set pass to true exactly when problems is empty.',
  { schema: CHECK, phase: 'Verify', label: 'verify', independent: true })
if (!verify) return { status: 'unverified', reason: 'verification returned nothing', plan, docs: docPaths, notes }
strings(verify.notes).forEach((n) => notes.push('verify: ' + n))
if (strings(verify.problems).length) return { status: 'blocked', stage: 'verify', open: strings(verify.problems), plan, notes }
if (!verify.pass) return { status: 'blocked', stage: 'verify', open: ['verification failed without naming a problem; run it again'], notes }

phase('Hand off')
const handoff = await agent(
  `Hand off this change. ${where} Make sure every commit is pushed to ${plan.branch}. Look for an open pull request for that branch first${args.pr ? ` (the caller names ${args.pr})` : ''}; update its body if one is open, and open a draft PR titled as a Conventional Commit (${triage.kind === 'service-request' ? 'feat:' : 'fix:'}) only if none is open. The body states the request, ${diag ? 'the root cause in one sentence, ' : ''}the change and its kind, the test, the rollback, the verification, the generation applied (${applied.generation || 'unknown'}) and the docs pages by Diataxis kind (${docList || 'none reported'}); keep lines already in an existing body that are not about these. Do not mark it ready, request review or merge. Follow the engineering-practices git-workflow skill. Return the branch, PR URL, head commit SHA, and whether the configuration builds on that head.`,
  { schema: HANDOFF, phase: 'Hand off', label: 'handoff' })
if (!handoff || !handoff.branch) return { status: 'blocked', reason: 'hand-off failed; the change is applied and committed on ' + plan.branch + ' but may not be pushed', notes }
if (!handoff.builds) return { status: 'blocked', open: ['configuration does not build on the pushed head' + (handoff.problem ? ': ' + handoff.problem : '')], notes }

return {
  status: 'done',
  kind: triage.kind,
  symptom: triage.symptom,
  rootCause: diag ? diag.rootCause : '',
  change: plan.summary,
  changeKind: plan.changeKind,
  generation: applied.generation || '',
  rollback: plan.rollback,
  ticketNotes: docs.ticketNotes,
  docs: docPaths,
  undocumented: docs.undocumented,
  notes,
  handoff: {
    from: 'it-support:resolve-support-request',
    branch: handoff.branch,
    pr: handoff.pr || '',
    head_sha: handoff.head_sha || '',
    tests_pass: true,
    docs: docPaths,
    undocumented: docs.undocumented || [],
    non_original: [],
    notes,
  },
  next: `post the ticket notes where the project keeps them and tell the person who asked; land the configuration change: /engineering-practices:land-pr ${handoff.pr ? `{ pr: "${handoff.pr}" }` : `{ branch: "${handoff.branch}" }`}`,
}
})(RUN.agent, RUN.phase, RUN.log)]); return RUN.finish(RUN_OUT)
