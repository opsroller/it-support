// SPDX-License-Identifier: GPL-2.0-or-later
export const meta = {
  name: 'provide-software',
  description: 'Make a piece of software, a service or a setting available declaratively: search nixpkgs first with the bundled nixos MCP server (packages, module options, Home Manager options, versions, licence, binary-cache status), choose the package or module and the right layer (system, user or a project devShell entered with direnv), write the configuration change on a branch and build it, have it checked in an independent read-only review, apply it with test before switch only when apply is true, document it and push it as a draft PR. On systems without Nix, the distribution\'s packages and configuration tool take nixpkgs\' place. args: { need: "<what the person needs, in their words>", scope?: "system"|"user"|"project" (default: decided from the need), host?: "<host>", project?: "<project repository or directory, for scope project>", apply?: true|false (default false), branch?: "<existing branch>", pr?: "<existing PR>" }',
  phases: [
    { title: 'Search', detail: 'nixpkgs packages, options, versions, licence and cache' },
    { title: 'Configure', detail: 'declarative change on a branch, built, not applied' },
    { title: 'Check', detail: 'independent read-only review of the change' },
    { title: 'Apply', detail: 'test, then switch, when allowed' },
    { title: 'Docs', detail: 'the Diataxis pages the change owes, checked independently' },
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

const USAGE = 'usage: provide-software { need: "<what the person needs>", scope: "system"|"user"|"project" (optional), host: "<host, optional>", project: "<project repository or directory, optional>", apply: true|false (optional, default false), branch: "<existing branch, optional>", pr: "<existing PR, optional>" }'
if (!args || !args.need) return USAGE
const need = String(args.need)
const scopes = ['system', 'user', 'project']
if (args.scope && !scopes.includes(String(args.scope))) return USAGE
const scope = args.scope ? String(args.scope) : ''
const host = args.host ? String(args.host) : 'the host the project profile names for this need'
const project = args.project ? String(args.project) : ''
const apply = args.apply === true
const where = args.pr
  ? `Work on the existing PR ${args.pr} and its head branch; do not create a new branch or PR.`
  : args.branch
    ? `Work on the existing branch ${args.branch} (reuse its open PR if one exists); do not create a new branch.`
    : 'Work in the repository that holds this configuration (the host\'s configuration repository, or the project repository for a devShell), per the project profile; cut a Conventional branch (feat/<slug>) from its latest default branch.'

const ONBOARD = 'You are the it-support role. Onboard first (engineering-practices project-onboarding): read the project profile for the hosts in scope, who owns each, where their configuration lives and what you may change without asking. Touch nothing outside that scope.'

const DOCS_FRAGMENT = 'Classify every user-visible change in this work with the Diataxis compass (action/cognition x study/work). For each, update or add exactly one page of that kind under the project\'s docs location (per the project profile), keep each page to one kind, title it by the project pattern, and link to the related pages of the other kinds. Report pages touched and any change you left undocumented and why.'

const NOTES_RULE = 'Put a problem in the blocking list only if it is a failure you can point to: a build fails, the software does not run, an option does not exist on the host\'s channel, a step broke a rule of the it-support role. Everything else goes in notes; an empty blocking list means done.'

const SEARCH = {
  type: 'object',
  properties: {
    os: { type: 'string', description: 'operating system, release and the nixpkgs channel or revision the host follows' },
    queries: { type: 'array', items: { type: 'string' }, description: 'every search run: tool, action or command, query, source, channel' },
    candidates: { type: 'array', items: { type: 'object', properties: { path: { type: 'string', description: 'attribute path or option path' }, kind: { type: 'string', enum: ['package', 'nixos-option', 'home-manager-option', 'darwin-option', 'flake', 'distro-package'] }, version: { type: 'string' }, license: { type: 'string' }, cached: { type: 'string', description: 'yes, no, or unknown, for the host\'s system' }, notes: { type: 'string' } }, required: ['path', 'kind'] } },
    choice: { type: 'string', description: 'the package or option chosen and why (prefer a module\'s enable option over a bare package)' },
    scope: { type: 'string', enum: ['system', 'user', 'project'] },
    unfree: { type: 'boolean' },
    nothingPackaged: { type: 'boolean', description: 'no package, option or maintained flake provides it' },
    blockers: { type: 'array', items: { type: 'string' } },
  },
  required: ['os', 'queries', 'candidates', 'choice', 'scope', 'unfree', 'nothingPackaged'],
}
const CONFIG = {
  type: 'object',
  properties: {
    branch: { type: 'string' },
    files: { type: 'array', items: { type: 'string' } },
    built: { type: 'boolean' },
    runs: { type: 'boolean', description: 'the software starts or the service unit is valid in the built result (e.g. nix develop -c <tool> --version, or the unit in the built system)' },
    closureDiff: { type: 'string' },
    rollback: { type: 'string' },
    needsOwner: { type: 'boolean', description: 'the project profile requires the host owner\'s approval for this change' },
    failing: { type: 'array', items: { type: 'string' } },
    notes: { type: 'array', items: { type: 'string' } },
  },
  required: ['branch', 'files', 'built', 'runs', 'rollback', 'needsOwner', 'failing'],
}
const CHECK = { type: 'object', properties: { pass: { type: 'boolean' }, problems: { type: 'array', items: { type: 'string' } }, notes: { type: 'array', items: { type: 'string' } } }, required: ['pass', 'problems'] }
const APPLY = { type: 'object', properties: { applied: { type: 'boolean' }, generation: { type: 'string' }, output: { type: 'string' }, rolledBack: { type: 'boolean' }, failing: { type: 'array', items: { type: 'string' } }, notes: { type: 'array', items: { type: 'string' } } }, required: ['applied', 'rolledBack', 'failing'] }
const DOCS = { type: 'object', properties: { pages: { type: 'array', items: { type: 'object', properties: { path: { type: 'string' }, kind: { type: 'string', enum: ['tutorial', 'how-to', 'reference', 'explanation'] } }, required: ['path', 'kind'] } }, undocumented: { type: 'array', items: { type: 'string' } } }, required: ['pages', 'undocumented'] }
const HANDOFF = { type: 'object', properties: { branch: { type: 'string' }, pr: { type: 'string' }, head_sha: { type: 'string' }, builds: { type: 'boolean' }, problem: { type: 'string' } }, required: ['branch', 'builds'] }

const strings = (xs) => (Array.isArray(xs) ? xs.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim()) : [])
const notes = []

phase('Search')
const found = await agent(
  `${ONBOARD} Then follow the it-support skill nixpkgs-search. Need: ${need}. Host: ${host}.${project ? ` Project: ${project}.` : ''}${scope ? ` Scope: ${scope}.` : ''}
Read the host's OS, release and the nixpkgs channel or revision it follows (its flake.lock or nixos-version). Search with the nixos MCP server first: the nix tool with action search over packages and options (source nixos, and home-manager for user-level settings), browse the module prefix (services.*, programs.*, hardware.*, virtualisation.*) and read every option before choosing, info for version, licence and platforms, cache for heavy packages on the host's system, and nix_versions only if a different version is needed. If the server is not running, use nix search nixpkgs, nix eval of meta, nixos-option, then search.nixos.org; on a system without Nix, the distribution's package search. List every query. Prefer a module's enable option over a bare package. Decide the scope: system for services and tools every user needs, user for one person's tools (Home Manager), project for tools one codebase needs (a devShell entered with direnv). Set nothingPackaged only if nothing provides it. Change nothing.`,
  { schema: SEARCH, phase: 'Search', label: 'search' })
if (!found) return { status: 'blocked', reason: 'search returned nothing' }
if (strings(found.blockers).length) return { status: 'blocked', stage: 'search', open: strings(found.blockers) }
if (!strings(found.queries).length) return { status: 'blocked', stage: 'search', open: ['no searches were recorded; search nixpkgs before configuring anything'] }
if (found.nothingPackaged) {
  return {
    status: 'not-packaged',
    need,
    queries: strings(found.queries),
    candidates: found.candidates,
    next: 'nothing in nixpkgs or the platform\'s packages provides this: report it as a gap with the queries above, and get the owner\'s decision before writing a new derivation (nixpkgs-search, "When nothing is packaged")',
  }
}

phase('Configure')
const chosenScope = scope || found.scope
const layer = chosenScope === 'project'
  ? `the project's flake.nix devShells (with an .envrc of "use flake" for direnv if the project has none), in ${project || 'the project repository the profile names'}`
  : chosenScope === 'user'
    ? 'the person\'s Home Manager configuration (home.packages or programs.*), or users.users.<name>.packages if the host has no Home Manager'
    : 'the module for its concern in the host\'s NixOS configuration (the module\'s options, or environment.systemPackages for a plain tool)'
const configBrief = (extra) =>
  `${ONBOARD} Follow the it-support skills nixos-administration and change-management. ${where} Need: ${need}. Chosen: ${found.choice}. Candidates: ${JSON.stringify(found.candidates)}. Write the change in ${layer}. ${found.unfree ? 'It is unfree: allow exactly these packages with allowUnfreePredicate (or the project\'s existing unfree setting), not a blanket allowUnfree unless the configuration already uses one. ' : ''}Keep it minimal and pinned by the existing lock; never install imperatively. Commit with a Conventional Commit, then build without activating (nixos-rebuild build and nix store diff-closures against /run/current-system for system scope; home-manager build for user scope; nix develop -c <tool> --version for project scope; the platform's dry run elsewhere), and check the software runs or the unit is valid in the built result. Name the rollback, and whether the project profile requires the owner's approval to apply it.${extra} ` + NOTES_RULE
let config = await agent(configBrief(''), { schema: CONFIG, phase: 'Configure', label: 'configure' })
if (!config) return { status: 'blocked', reason: 'configure step returned nothing' }
strings(config.notes).forEach((n) => notes.push('configure: ' + n))
if (!config.built || !config.runs || strings(config.failing).length) {
  return { status: 'blocked', stage: 'configure', open: strings(config.failing).length ? strings(config.failing) : ['the configuration does not build or the software does not run'], branch: config.branch, notes }
}

phase('Check')
const checkBrief = (c) =>
  `You are an it-support reviewer giving an independent review of a configuration change you did not write. Read only; do not edit anything. Need: ${need}. Searches run: ${JSON.stringify(strings(found.queries))}. Choice: ${found.choice}. Read the diff on branch ${c.branch} (files ${JSON.stringify(c.files)}).
Check: 1) the searches were enough to find the existing module or package, and the change uses it (a module's enable option rather than a bare package where one exists); 2) the option exists on the host's channel; 3) the layer is right (system, user or project devShell); 4) declarative and pinned, no imperative install, no new tool or script where a package exists; 5) unfree allowed narrowly, nothing insecure or broken forced; 6) no secret in the Nix store or git; 7) the rollback (${c.rollback}) is real. Report problems and notes separately. ` + NOTES_RULE + ' Set pass to true exactly when problems is empty.'
let check = await agent(checkBrief(config), { schema: CHECK, phase: 'Check', label: 'check', independent: true })
if (!check) return { status: 'unverified', reason: 'check returned nothing', branch: config.branch, notes }
strings(check.notes).forEach((n) => notes.push('check: ' + n))
if (strings(check.problems).length || !check.pass) {
  const problems = strings(check.problems)
  config = await agent(configBrief(` Revise the change on the same branch to fix these review problems: ${JSON.stringify(problems.length ? problems : ['the check failed without naming a problem; re-check every point'])}.`), { schema: CONFIG, phase: 'Check', label: 'revise' })
  if (!config) return { status: 'blocked', reason: 'revision returned nothing', open: problems }
  if (!config.built || !config.runs || strings(config.failing).length) return { status: 'blocked', stage: 'check', open: strings(config.failing).length ? strings(config.failing) : ['the revised configuration does not build or run'], notes }
  check = await agent(checkBrief(config), { schema: CHECK, phase: 'Check', label: 'check-again', independent: true })
  if (!check) return { status: 'unverified', reason: 'second check returned nothing', branch: config.branch, notes }
  strings(check.notes).forEach((n) => notes.push('check-again: ' + n))
  if (strings(check.problems).length || !check.pass) return { status: 'blocked', stage: 'check', open: strings(check.problems).length ? strings(check.problems) : ['check failed twice'], notes }
}

phase('Apply')
let applied = null
if (chosenScope !== 'project') {
  if (!apply || config.needsOwner) {
    return {
      status: 'awaiting-approval',
      reason: !apply ? 'apply was not set' : 'the project profile requires the host owner\'s approval for this change',
      choice: found.choice,
      scope: chosenScope,
      branch: config.branch,
      rollback: config.rollback,
      closureDiff: config.closureDiff || '',
      notes,
      next: `rerun with the same args plus apply: true, run: { from: "Apply", results: <this run's results> } once the change may be applied`,
    }
  }
  applied = await agent(
    `${ONBOARD} Apply the reviewed change on branch ${config.branch} to ${host} per the it-support change-management skill. Confirm the rollback target exists (${config.rollback}). Activate it without making it the default first (nixos-rebuild test, or home-manager switch for user scope, which keeps the previous generation), check the software runs for the person or the service is up, and only then make it the default (nixos-rebuild switch). If anything fails, roll back first and report rolledBack. Return applied, the generation now running, the relevant output, rolledBack, failing and notes. ` + NOTES_RULE,
    { schema: APPLY, phase: 'Apply', label: 'apply' })
  if (!applied) return { status: 'blocked', reason: 'apply step returned nothing; check the host state before retrying', branch: config.branch }
  strings(applied.notes).forEach((n) => notes.push('apply: ' + n))
  if (applied.rolledBack || !applied.applied || strings(applied.failing).length) {
    return { status: 'blocked', stage: 'apply', open: strings(applied.failing).length ? strings(applied.failing) : ['the change did not apply cleanly'], rolledBack: !!applied.rolledBack, notes }
  }
}

phase('Docs')
const docs = await agent(
  `You are the it-support role. Document this change in the same branch (${config.branch}). Need: ${need}. Provided by: ${found.choice}, scope ${chosenScope}. A host's or project's reference page lists what it provides and where it is configured; a procedure people will repeat (entering the devShell, using the new service) gets a how-to. ${DOCS_FRAGMENT} Commit on the same branch.`,
  { schema: DOCS, phase: 'Docs', label: 'docs' })
if (!docs) return { status: 'blocked', reason: 'docs step failed; work without its docs is not done' }
const docPages = (Array.isArray(docs.pages) ? docs.pages : []).map((p) => (p && typeof p === 'object'
  ? { path: String(p.path || ''), kind: String(p.kind || '') }
  : { path: String(p), kind: '' })).filter((p) => p.path)
const docPaths = docPages.map((p) => p.path)
const docList = docPages.map((p) => (p.kind ? `${p.path} (${p.kind})` : p.path)).join(', ')
const docsCheck = await agent(
  `You are a technical reviewer giving an independent check of documentation you did not write. Read only; do not edit anything. For each page (${docList || 'none reported'}) on branch ${config.branch}: one Diataxis kind, a first line naming kind and audience, a title by the project pattern, links to related kinds, and the commands in it match the change. Report problems and notes separately. ` + NOTES_RULE + ' Set pass to true exactly when problems is empty.',
  { schema: CHECK, phase: 'Docs', label: 'docs-check', independent: true })
if (!docsCheck) return { status: 'unverified', reason: 'docs check returned nothing', branch: config.branch, docs: docPaths, notes }
strings(docsCheck.notes).forEach((n) => notes.push('docs-check: ' + n))
if (strings(docsCheck.problems).length || !docsCheck.pass) return { status: 'blocked', stage: 'docs', open: strings(docsCheck.problems).length ? strings(docsCheck.problems) : ['docs check failed without naming a problem'], notes }

phase('Hand off')
const handoff = await agent(
  `Hand off this change. ${where} Make sure every commit is pushed to ${config.branch}. Look for an open pull request for that branch first${args.pr ? ` (the caller names ${args.pr})` : ''}; update its body if one is open, and open a draft PR titled as a feat: Conventional Commit only if none is open. The body states the need, the searches and the choice (${found.choice}), the scope (${chosenScope}), the closure diff, the rollback${applied ? `, the generation applied (${applied.generation || 'unknown'})` : ''} and the docs pages by Diataxis kind (${docList || 'none reported'}); keep lines already in an existing body that are not about these. Do not mark it ready, request review or merge. Follow the engineering-practices git-workflow skill. Return the branch, PR URL, head commit SHA, and whether the configuration builds on that head.`,
  { schema: HANDOFF, phase: 'Hand off', label: 'handoff' })
if (!handoff || !handoff.branch) return { status: 'blocked', reason: 'hand-off failed; the change is committed on ' + config.branch + ' but may not be pushed', notes }
if (!handoff.builds) return { status: 'blocked', open: ['configuration does not build on the pushed head' + (handoff.problem ? ': ' + handoff.problem : '')], notes }

return {
  status: 'done',
  choice: found.choice,
  scope: chosenScope,
  queries: strings(found.queries),
  generation: applied ? applied.generation || '' : '',
  rollback: config.rollback,
  docs: docPaths,
  undocumented: docs.undocumented,
  notes,
  handoff: {
    from: 'it-support:provide-software',
    branch: handoff.branch,
    pr: handoff.pr || '',
    head_sha: handoff.head_sha || '',
    tests_pass: true,
    docs: docPaths,
    undocumented: docs.undocumented || [],
    non_original: [],
    notes,
  },
  next: `tell the person how to use it${chosenScope === 'project' ? ' (enter the project directory; direnv loads the devShell)' : ''}; land the change: /engineering-practices:land-pr ${handoff.pr ? `{ pr: "${handoff.pr}" }` : `{ branch: "${handoff.branch}" }`}`,
}
})(RUN.agent, RUN.phase, RUN.log)]); return RUN.finish(RUN_OUT)
