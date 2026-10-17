import { createHash } from 'node:crypto';
import { readFile, access } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const pins = new Map([['smoosic', '2.0.2'], ['pdfjs-dist', '6.4.299'], ['@aws-sdk/client-s3', '3.1152.0'], ['@xmldom/xmldom', '0.9.12'], ['yauzl', '3.4.0'], ['Audiveris', '5.11.0']]);
const hashPattern = /^[a-f0-9]{64}$/;
const text = (value) => typeof value === 'string' && value.trim().length > 0 && !/^(pending|unset|unknown|todo)$/i.test(value);
const hash = (value) => typeof value === 'string' && hashPattern.test(value);
const https = (value) => {
  try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password && !u.search && !u.hash; }
  catch { return false; }
};
export const evidenceDigest = (evidence) => createHash('sha256').update(JSON.stringify(evidence)).digest('hex');
// Git may convert text line endings on Windows; artifact byte hashes never use
// this normalization. Review inventories/prose use UTF-8 with LF for portability.
export const reviewFileDigest = (content) => createHash('sha256').update(content.toString().replace(/\r\n/g, '\n')).digest('hex');

function approved(packet) {
  const a = packet?.approval;
  return packet?.schemaVersion === 1 && packet.evidence && typeof packet.evidence === 'object' && !Array.isArray(packet.evidence)
    && a?.status === 'approved' && text(a.by) && typeof a.at === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(a.at) && Number.isFinite(Date.parse(a.at))
    && hash(a.evidenceSha256) && a.evidenceSha256 === evidenceDigest(packet.evidence);
}

// Pure validation returns fixed diagnostics only. Never reflect packet or env
// values: even a malformed URL, JSON parse error or provider path can be private.
export function validatePrerequisites({ stage, packages, deployment, model, env = {} } = {}) {
  const errors = [];
  const require = (condition, message) => { if (!condition) errors.push(message); };
  if (!['packages', 'deployment', 'model'].includes(stage)) return { ok: false, errors: ['Unknown prerequisite stage.'] };
  try {
    require(approved(packages), 'Package evidence needs current human approval.');
    const e = packages?.evidence;
    require(Array.isArray(e?.files) && e.files.length > 0 && e.files.every((f) => text(f.path) && hash(f.sha256)), 'Retained source and inspection evidence is incomplete.');
    const artifacts = Array.isArray(e?.artifacts) ? e.artifacts : [];
    require(artifacts.length === pins.size && new Set(artifacts.map((a) => a.name)).size === pins.size, 'Exact artifact inventory is incomplete.');
    for (const [name, version] of pins) {
      const a = artifacts.find((a) => a.name === name);
      require(a?.version === version && https(a?.url) && https(a?.repository) && /^[a-f0-9]{40}$/.test(a?.sourceRef || ''), 'An exact artifact source or version is unresolved.');
      require(hash(a?.sha256) && a.sha256 === a.observedSha256, 'An artifact byte hash changed or is absent.');
      require(hash(a?.inventorySha256) && Number.isSafeInteger(a?.fileCount) && a.fileCount > 0 && a.scriptsReviewed === true && a.licensesReviewed === true && a.provenanceStatus === 'verified', 'An artifact inspection is unresolved.');
      if (name !== 'Audiveris') require(/^sha512-[A-Za-z0-9+/]{86}==$/.test(a?.integrity || '') && a.integrity === a.observedIntegrity, 'A tarball integrity hash changed or is absent.');
    }
    const x = e?.xml;
    require(x?.strategy === 'reviewed-source-patch' && x.parser === '@xmldom/xmldom@0.9.12' && x.requireWellFormed === true && x.rejectDtd === true && x.originalBundleAllowed === false && Array.isArray(x.paths) && x.paths.length > 0 && Array.isArray(x.unresolvedPaths) && x.unresolvedPaths.length === 0 && hash(x.patchPlanSha256), 'XML source replacement and unsafe bundle exclusion need review.');
    require(e?.privacy?.disableRemoteLoading === true && e.privacy.disableHiddenPersistence === true && Array.isArray(e.privacy.paths) && e.privacy.paths.length > 0, 'Remote loading and hidden persistence removal need review.');
    if (stage !== 'packages') {
      require(approved(deployment), 'Deployment evidence needs current human approval.');
      const d = deployment?.evidence;
      require(d?.provider === 'aws-s3' && /^\d{12}$/.test(d.accountId || '') && /^[a-z]{2}-[a-z]+-\d$/.test(d.region || '') && /^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(d.bucket || '') && d.roleArn?.startsWith(`arn:aws:iam::${d.accountId}:role/`) && d.topology === 'isolated-worker', 'Private provider account, region, bucket and role need approval.');
      const l = d?.license;
      require(l?.disposition === 'agpl-compliant-source-offer' && https(l.sourceUrl) && text(l.noticePath) && Array.isArray(l.modifiedArtifacts) && l.modifiedArtifacts.length > 0 && Array.isArray(l.unmodifiedArtifacts) && l.unmodifiedArtifacts.length > 0 && text(l.combinedWorkReview), 'License scope, corresponding source and notice obligations are unresolved.');
      const s = d?.storage;
      require(s?.publicAccessBlocked === true && s.authenticatedReadsOnly === true && s.ownerAuthorizationBeforeBytes === true && s.encryption === 'SSE-S3' && s.roleOnly === true && s.lifecycleVerified === true, 'Private byte access and lifecycle evidence are unresolved.');
      const r = d?.retention;
      require(Number.isSafeInteger(r?.scratchHours) && r.scratchHours > 0 && r.scratchHours <= 24 && Number.isSafeInteger(r?.orphanHours) && r.orphanHours > 0 && r.orphanHours <= 24 && Number.isSafeInteger(r?.backupsDays) && r.backupsDays >= 0 && r.backupsDays <= 30 && r.explicitSavesOnly === true && r.savedRetention === 'until-owner-deletion' && text(r.deletionPolicy), 'Scratch, orphan, explicit-save and backup retention need approval.');
      const limitNames = ['uploadBytes', 'pages', 'pagePixels', 'totalPixels', 'archiveExpandedBytes', 'archiveEntries', 'archiveExpansionRatio', 'xmlBytes', 'xmlDepth', 'xmlNodes', 'events', 'queue', 'ownerJobs', 'ownerBytes', 'ownerScores', 'workerSeconds', 'workerMemoryMiB', 'workerCpus', 'workerConcurrency', 'attempts', 'leaseSeconds', 'heartbeatSeconds', 'monthlyUsd'];
      require(limitNames.every((key) => Number.isSafeInteger(d?.limits?.[key]) && d.limits[key] > 0), 'Resource, queue, owner quota and cost limits must be positive integers.');
      require(d?.limits?.totalPixels >= d?.limits?.pagePixels && d?.limits?.ownerBytes >= d?.limits?.uploadBytes && d?.limits?.ownerJobs <= d?.limits?.queue && d?.limits?.heartbeatSeconds < d?.limits?.leaseSeconds, 'Resource limit relationships are invalid.');
      require(d?.cost?.enforceAdmissionCap === true && Number.isFinite(d.cost.alertThresholdUsd) && d.cost.alertThresholdUsd > 0 && d.cost.alertThresholdUsd < d?.limits?.monthlyUsd && text(d.cost.operator), 'Cost admission cap, alert and operator need approval.');
      const c = d?.configuration;
      require(c?.regionEnv === 'SCORE_S3_REGION' && c.bucketEnv === 'SCORE_S3_BUCKET' && c.roleEnv === 'SCORE_S3_ROLE_ARN' && c.credentials === 'workload-role', 'Server credential references need approval.');
      require(text(env.SCORE_S3_REGION) && env.SCORE_S3_REGION === d?.region && text(env.SCORE_S3_BUCKET) && env.SCORE_S3_BUCKET === d?.bucket && text(env.SCORE_S3_ROLE_ARN) && env.SCORE_S3_ROLE_ARN === d?.roleArn, 'Server storage settings are missing or differ from the approved decision.');
      require(text(env.AWS_WEB_IDENTITY_TOKEN_FILE) && env.AWS_ROLE_ARN === d?.roleArn && !env.AWS_ACCESS_KEY_ID && !env.AWS_SECRET_ACCESS_KEY, 'Approved workload identity configuration is missing or conflicting.');
    }
    if (stage === 'model') {
      require(approved(model), 'Model contract needs current human approval.');
      const m = model?.evidence;
      require(text(m?.schemaPath) && hash(m?.schemaSha256) && m.schemaSha256 === m.observedSchemaSha256 && text(m.contractVersion), 'Exact persisted schema bytes or version changed or are absent.');
      require(hash(m?.editorEvidenceSha256) && hash(m?.recognitionEvidenceSha256), 'Actual editor and native source evidence are required.');
      const decisions = ['stable-ids', 'rational-time', 'source-unions', 'review-hashes', 'expected-revision-cas', 'immutable-confirmation'];
      require(Array.isArray(m?.decisions) && decisions.every((value) => m.decisions.includes(value)), 'Persistent identity and revision decisions are incomplete.');
    }
  } catch {
    errors.push('Malformed prerequisite evidence.');
  }
  return { ok: errors.length === 0, errors: [...new Set(errors)] };
}

export function parseEvidence(markdown) {
  const matches = [...markdown.matchAll(/<!-- score-prerequisites:start -->\s*```json\s*([\s\S]*?)\s*```\s*<!-- score-prerequisites:end -->/g)];
  if (matches.length !== 1) throw new Error('Invalid evidence section.');
  return JSON.parse(matches[0][1]);
}

function inside(base, path) {
  if (!text(path) || isAbsolute(path)) throw new Error('Invalid evidence path.');
  const target = resolve(base, path);
  const rel = relative(base, target);
  if (rel === '..' || rel.startsWith('../') || rel.startsWith('..\\') || isAbsolute(rel)) throw new Error('Invalid evidence path.');
  return target;
}

// Disk checks compare retained inventories and (when supplied) freshly downloaded
// inert artifacts. Installers must use --artifact-dir before executing anything.
export async function checkPrerequisites({ stage, projectRoot = root, artifactDir, env = process.env } = {}) {
  try {
    const load = async (path) => {
      const markdown = await readFile(resolve(projectRoot, path), 'utf8');
      const packet = parseEvidence(markdown);
      const digest = reviewFileDigest(markdown.split('<!-- score-prerequisites:start -->')[0].trim());
      if (packet.evidence.packetTextSha256 !== digest) throw new Error('Review text changed.');
      return packet;
    };
    const packages = await load('docs/score-dependency-review.md');
    for (const f of packages.evidence.files) {
      if (reviewFileDigest(await readFile(inside(projectRoot, f.path))) !== f.sha256) return { ok: false, errors: ['Retained source or inspection evidence changed.'] };
    }
    for (const a of packages.evidence.artifacts) {
      const bytes = await readFile(inside(projectRoot, a.inventoryPath));
      if (reviewFileDigest(bytes) !== a.inventorySha256) return { ok: false, errors: ['Retained artifact inventory changed.'] };
      if (artifactDir) a.observedSha256 = createHash('sha256').update(await readFile(inside(resolve(artifactDir), a.fileName))).digest('hex');
    }
    const deployment = stage === 'packages' ? undefined : await load('docs/score-deployment-decision.md');
    const model = stage === 'model' ? await load('docs/score-model-contract.md') : undefined;
    if (model) {
      model.evidence.observedSchemaSha256 = createHash('sha256').update(await readFile(inside(projectRoot, model.evidence.schemaPath))).digest('hex');
      for (const [path, expected] of [['docs/score-editor-evidence.md', model.evidence.editorEvidenceSha256], ['docs/score-recognition-evidence.md', model.evidence.recognitionEvidenceSha256]]) {
        if (createHash('sha256').update(await readFile(resolve(projectRoot, path))).digest('hex') !== expected) return { ok: false, errors: ['Model integration evidence changed.'] };
      }
    }
    if (stage !== 'packages' && text(env.AWS_WEB_IDENTITY_TOKEN_FILE)) await access(env.AWS_WEB_IDENTITY_TOKEN_FILE);
    return validatePrerequisites({ stage, packages, deployment, model, env });
  } catch {
    return { ok: false, errors: ['Required evidence or server identity file is missing, unreadable or malformed.'] };
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  const valid = args.length === 2 || (args.length === 4 && args[2] === '--artifact-dir');
  const result = args[0] === '--stage' && valid
    ? await checkPrerequisites({ stage: args[1], artifactDir: args[3] })
    : { ok: false, errors: ['Usage: node scripts/check-score-prerequisites.mjs --stage packages|deployment|model [--artifact-dir PATH]'] };
  console.log(result.ok ? 'Score prerequisites passed.' : 'Score prerequisites blocked.');
  for (const message of result.errors) console.error(message);
  process.exitCode = result.ok ? 0 : 1;
}
