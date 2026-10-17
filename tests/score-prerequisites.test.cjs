const test = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { resolve } = require('node:path');

// Independent fixtures deliberately contain no production artifact data.
const digest = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const approved = (evidence) => ({ status: 'approved', by: 'fixture-human', at: '2026-10-16T12:00:00Z', evidenceSha256: digest(evidence) });
function fixtures() {
  const pins = [['smoosic', '2.0.2'], ['pdfjs-dist', '6.4.299'], ['@aws-sdk/client-s3', '3.1152.0'], ['@xmldom/xmldom', '0.9.12'], ['yauzl', '3.4.0'], ['Audiveris', '5.11.0']];
  const packages = { schemaVersion: 1, evidence: {
    artifacts: pins.map(([name, version]) => ({ name, version, url: 'https://example.org/artifact', repository: 'https://github.com/example/project', sourceRef: 'a'.repeat(40), sha256: 'a'.repeat(64), observedSha256: 'a'.repeat(64), integrity: name === 'Audiveris' ? null : 'sha512-' + Buffer.alloc(64, 1).toString('base64'), observedIntegrity: name === 'Audiveris' ? null : 'sha512-' + Buffer.alloc(64, 1).toString('base64'), inventorySha256: 'b'.repeat(64), fileCount: 3, scriptsReviewed: true, licensesReviewed: true, provenanceStatus: 'verified' })),
    xml: { strategy: 'reviewed-source-patch', parser: '@xmldom/xmldom@0.9.12', requireWellFormed: true, rejectDtd: true, originalBundleAllowed: false, paths: ['src/import.ts', 'build/bundle.js'], unresolvedPaths: [], patchPlanSha256: 'c'.repeat(64) },
    privacy: { disableRemoteLoading: true, disableHiddenPersistence: true, paths: ['src/application.ts'] },
  } };
  packages.approval = approved(packages.evidence);
  const deployment = { schemaVersion: 1, evidence: {
    provider: 'aws-s3', accountId: '123456789012', region: 'us-east-2', bucket: 'fixture-private-scores', roleArn: 'arn:aws:iam::123456789012:role/score-worker', topology: 'isolated-worker',
    license: { disposition: 'agpl-compliant-source-offer', sourceUrl: 'https://example.org/source', noticePath: 'LICENSES/Audiveris', modifiedArtifacts: ['wrapper'], unmodifiedArtifacts: ['Audiveris-5.11.0'], combinedWorkReview: 'Publish corresponding covered sources with build scripts; retain notices.' },
    storage: { publicAccessBlocked: true, authenticatedReadsOnly: true, ownerAuthorizationBeforeBytes: true, encryption: 'SSE-S3', roleOnly: true, lifecycleVerified: true },
    retention: { scratchHours: 24, orphanHours: 24, backupsDays: 7, explicitSavesOnly: true, savedRetention: 'until-owner-deletion', deletionPolicy: 'Revoke immediately; purge within 24 hours; expire backups in 7 days.' },
    limits: { uploadBytes: 20971520, pages: 20, pagePixels: 20000000, totalPixels: 200000000, archiveExpandedBytes: 268435456, archiveEntries: 2000, events: 100000, queue: 20, ownerJobs: 1, ownerBytes: 1073741824, workerSeconds: 300, workerMemoryMiB: 2048, workerCpus: 2, monthlyUsd: 25 },
    cost: { enforceAdmissionCap: true, alertThresholdUsd: 15, operator: 'fixture-operator' },
    configuration: { regionEnv: 'SCORE_S3_REGION', bucketEnv: 'SCORE_S3_BUCKET', roleEnv: 'SCORE_S3_ROLE_ARN', credentials: 'workload-role' },
  } };
  deployment.approval = approved(deployment.evidence);
  const model = { schemaVersion: 1, evidence: { schemaPath: 'score-model.js', schemaSha256: 'd'.repeat(64), observedSchemaSha256: 'd'.repeat(64), contractVersion: '1', editorEvidenceSha256: 'e'.repeat(64), recognitionEvidenceSha256: 'f'.repeat(64), decisions: ['stable-ids', 'rational-time', 'source-unions', 'review-hashes', 'expected-revision-cas', 'immutable-confirmation'] } };
  model.approval = approved(model.evidence);
  return { packages, deployment, model, env: { SCORE_S3_REGION: 'us-east-2', SCORE_S3_BUCKET: 'fixture-private-scores', SCORE_S3_ROLE_ARN: deployment.evidence.roleArn } };
}
async function checker() {
  try { return (await import('../scripts/check-score-prerequisites.mjs')).validatePrerequisites; }
  catch (error) {
    if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error;
    // Baseline is the pre-checker behavior: nothing prevents use. This makes
    // RED an assertion about the missing guard, rather than an import crash.
    return () => ({ ok: true, errors: [] });
  }
}

test('missing package approval blocks use before installation', async () => {
  const input = fixtures(); delete input.packages.approval;
  assert.equal((await checker())({ stage: 'packages', ...input }).ok, false);
});
test('valid exact recorded decisions pass each stage', async () => {
  const validate = await checker();
  for (const stage of ['packages', 'deployment', 'model']) assert.deepEqual(validate({ stage, ...fixtures() }), { ok: true, errors: [] });
});
test('changed tarball, native hash, version, or incomplete inventory blocks use', async () => {
  const validate = await checker();
  for (const [index, field, value] of [[0, 'observedSha256', 'b'.repeat(64)], [5, 'observedSha256', 'b'.repeat(64)], [1, 'version', '6.4.300'], [2, 'inventorySha256', ''], [3, 'observedIntegrity', 'sha512-bad'], [4, 'provenanceStatus', 'unverified']]) {
    const input = fixtures(); input.packages.evidence.artifacts[index][field] = value;
    input.packages.approval = approved(input.packages.evidence);
    assert.equal(validate({ stage: 'packages', ...input }).ok, false, field);
  }
});
test('stale approval, missing artifact, or duplicate artifact fails', async () => {
  const validate = await checker();
  for (const mutate of [(p) => { p.evidence.artifacts[0].sha256 = 'b'.repeat(64); }, (p) => { p.evidence.artifacts.pop(); }, (p) => { p.evidence.artifacts.push(p.evidence.artifacts[0]); }, (p) => { p.approval.by = ''; }, (p) => { p.approval.at = 'not-a-date'; }]) {
    const input = fixtures(); mutate(input.packages);
    assert.equal(validate({ stage: 'packages', ...input }).ok, false);
  }
});
test('reachable old XML parser and remote loading or persistence remain blocked', async () => {
  const validate = await checker();
  for (const mutate of [(e) => { e.xml.originalBundleAllowed = true; }, (e) => { e.xml.unresolvedPaths = ['build/smoosic.js']; }, (e) => { e.xml.requireWellFormed = false; }, (e) => { e.xml.rejectDtd = false; }, (e) => { e.xml.parser = 'xmldom@0.6.0'; }, (e) => { e.privacy.disableHiddenPersistence = false; }, (e) => { e.privacy.disableRemoteLoading = false; }]) {
    const input = fixtures(); mutate(input.packages.evidence); input.packages.approval = approved(input.packages.evidence);
    assert.equal(validate({ stage: 'packages', ...input }).ok, false);
  }
});
test('deployment requires approved license, private storage, retention, cost and bounded limits', async () => {
  const validate = await checker();
  for (const mutate of [(d) => { delete d.approval; }, (d) => { d.evidence.license.disposition = 'subprocess-exemption'; }, (d) => { d.evidence.storage.publicAccessBlocked = false; }, (d) => { d.evidence.retention.scratchHours = 25; }, (d) => { d.evidence.retention.explicitSavesOnly = false; }, (d) => { d.evidence.limits.monthlyUsd = 0; }, (d) => { delete d.evidence.limits.pagePixels; }, (d) => { d.evidence.cost.enforceAdmissionCap = false; }, (d) => { d.evidence.accountId = 'UNSET'; }]) {
    const input = fixtures(); mutate(input.deployment);
    if (input.deployment.approval) input.deployment.approval = approved(input.deployment.evidence);
    assert.equal(validate({ stage: 'deployment', ...input }).ok, false);
  }
});
test('missing or mismatched configuration fails without revealing values', async () => {
  const validate = await checker();
  for (const env of [{}, { SCORE_S3_REGION: 'secret-region-value', SCORE_S3_BUCKET: 'secret-bucket-value', SCORE_S3_ROLE_ARN: 'secret-role-value' }]) {
    const result = validate({ stage: 'deployment', ...fixtures(), env });
    assert.equal(result.ok, false);
    assert.doesNotMatch(JSON.stringify(result), /secret-region-value|secret-bucket-value|secret-role-value/);
  }
});
test('model requires exact schema, independent editor/native evidence and human approval', async () => {
  const validate = await checker();
  for (const mutate of [(m) => { delete m.approval; }, (m) => { m.evidence.observedSchemaSha256 = 'e'.repeat(64); }, (m) => { m.evidence.recognitionEvidenceSha256 = ''; }, (m) => { m.evidence.decisions.pop(); }]) {
    const input = fixtures(); mutate(input.model);
    if (input.model.approval) input.model.approval = approved(input.model.evidence);
    assert.equal(validate({ stage: 'model', ...input }).ok, false);
  }
});
test('unknown stages and malformed packets fail closed without input echo', async () => {
  const validate = await checker();
  for (const stage of ['other', '', 'secret-stage-value']) assert.equal(validate({ stage, ...fixtures() }).ok, false);
  for (const packages of [null, {}, { schemaVersion: 1, evidence: 'secret-packet-value' }]) {
    const result = validate({ stage: 'packages', packages });
    assert.equal(result.ok, false); assert.doesNotMatch(JSON.stringify(result), /secret-packet-value/);
  }
});
test('CLI fails closed on real pending approvals and never prints environment secrets', () => {
  const result = spawnSync(process.execPath, [resolve('scripts/check-score-prerequisites.mjs'), '--stage', 'packages'], { encoding: 'utf8', env: { ...process.env, AWS_SECRET_ACCESS_KEY: 'do-not-print-this-secret' } });
  assert.notEqual(result.status, 0);
  assert.doesNotMatch(result.stdout + result.stderr, /do-not-print-this-secret/);
});
