# Score deployment decision — 03-01

Status: **proposal; no deployment, provision, license publication or private-score acceptance authorized**. Package review is separate in [score-dependency-review.md](score-dependency-review.md). Account ID, bucket allocation, role, production host, source-offer location, cost operator and setup evidence remain unset. D-01 through D-12 remain locked; this proposal changes none of them.

## Concrete topology and license options

| Option | Exact artifact/change scope | Network and distribution | Decision needed |
| --- | --- | --- | --- |
| A — proposed conservative source-offer topology | Unmodified Audiveris 5.11.0 Windows console MSI SHA-256 `5f1b4e96a12c53c7da426814b76e599363c4181e291855996e0a6878dda95f71`; app-owned bounded worker/import/source-map wrapper and source patches listed per release. Smoosic 2.0.2 patched/rebuilt under retained MIT notices. | Browser → authenticated API → private object store / durable job → isolated worker with fixed local files. No public worker endpoint. Publish corresponding covered source, build/install scripts, modifications and notices linked from the interacting UI and distribution; conservatively include the integrated app/wrapper source under an AGPL-compatible release policy. | Approve publication scope, copyright/license authority and actual source URL; choose a real contained Windows worker host or re-review a different native distro. |
| B — revise before use | Alternative reviewed OMR artifact or a reviewed narrower combined-work/source-offer scope. No alternative pin is selected. | Must still deliver PDF input, partial recognition, source mapping and the complete editing/review behavior. | New provenance, feasibility and license evidence before install/use. |

Audiveris' exact [AGPLv3 text](https://raw.githubusercontent.com/Audiveris/audiveris/5.11.0/LICENSE) covers source correspondence (section 1), notices and modified/combined works (4–5), object-code distribution (6) and modified remote interaction/source access (13). The operator must identify what is modified, what is conveyed (including images/VMs/installers to hosting operators or recipients), and what users interact with. Section 13 requires an appropriate corresponding-source opportunity for users interacting remotely with a modified version. Source must correspond to the actual deployed/distributed build and include covered build/install/run scripts and modifications; an unrelated upstream homepage is insufficient. Preserve copyright, license, modification dates and warranty notices, and satisfy bundled components' own notice/source requirements. These are implementation requirements drawn from the license, with the conservative scope in option A a proposal for user review. Process separation is not an automatic exemption or a determination that no combined work exists.

Unmodified inputs currently inspected: the exact MSI, its embedded `audiveris.jar` (`47d8e482d6566ebb64d5e8bd121f6a381ca8cef27521000b861885a19413b428`), bundled Java 25.0.3, native recognition/data dependencies and the npm input archives. Proposed modifications: Smoosic XML/privacy/source build patch; worker containment, importer and source-map/export wrapper. No Audiveris Java/model modification is currently proposed; if source mapping requires it, record that exact patch and source correspondence before deployment. Do not imply wrapper separation settles license scope. No output score is automatically relicensed merely because it was processed; the license's section 2 treats output according to its content. Keep singer PDFs and credentials out of public source archives.

The native evidence includes JAR hashes/embedded notices and MSI custom actions, but does not certify a complete redistributable source offer, resolve every missing third-party notice, or establish a clean vulnerability disposition for old bundled dependencies. Release/private-worker acceptance waits for that review and containment proof. Releasing Linux containers would require review of the exact Linux native artifact and contained dependencies rather than reuse approval for this Windows installer.

## Private storage operating contract proposed for approval

Provider: AWS S3, proposed region **us-east-2 (Ohio)**. Proposed logical bucket name `pitch-proof-private-scores-<account-id>-us-east-2` (globally available actual name and owning account must be confirmed). Proposed role names `PitchProofScoreApi` and `PitchProofScoreWorker`; the machine contract initially records the authorized API role, while approved worker-role privileges must be scoped separately in deployment evidence. Account/ARN values are intentionally absent until selected; names here are not proof of provisioning.

Use all four account and bucket Block Public Access settings, bucket-owner-enforced object ownership/no ACLs, deny non-TLS requests, SSE-S3 encryption, and bucket policies restricted to the approved roles. Review effective IAM/bucket/access-point policies as well: Block Public Access alone does not replace least privilege. No website hosting, public URLs, public ACLs, cross-account principals, browser SDK credentials, presigned bearer URLs, CORS browser bucket access, or caller-supplied bucket/object keys. The API derives `owner_user_id` from a verified session and authorizes metadata before every byte operation; use random opaque keys and owner SQL predicates. [AWS public-access controls](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html) support this policy.

API role: Get/Put/DeleteObject and bounded multipart operations only on the score prefix; bounded ListBucket prefix only for reconciliation, not user listing. Worker role: read assigned job originals and write only attempt-scoped output/scratch prefixes; job assignment/owner metadata comes from the API, never caller-selected paths. No bucket/IAM administration in app roles. User setup/provisioning supplies separate deployment-policy evidence, exact two role ARNs and actual account/bucket tests before private input. One account's denial before provider invocation remains mandatory even though both objects occupy one private bucket.

Contain worker processing outside the HTTP event loop: one non-admin worker, one concurrent job, durable SQLite lease/fencing/outbox, fixed executable/argument array (no shell or user flags), per-attempt random scratch directory, restricted filesystem, no arbitrary network egress, process-tree timeout/kill, bounded streams and artifacts. API-only S3 transfer should leave the native subprocess without network credentials. No cloud worker host is selected or provisioned. Windows host must prove memory/CPU/process-tree enforcement; unsupported containment blocks the native tracer. Choose another reviewed host if necessary.

Server setup references (never commit values): `SCORE_S3_REGION`, `SCORE_S3_BUCKET`, `SCORE_S3_ROLE_ARN`; proposed workload federation uses `AWS_ROLE_ARN` and a protected `AWS_WEB_IDENTITY_TOKEN_FILE`. The checker requires matching approved settings and an accessible identity-file path, and rejects static access-key configuration. It neither reads/prints token content nor establishes that STS will accept it. Provider connection and actual private access are proved by later cloud tests, not env presence. A different instance/container identity mechanism requires an explicit reviewed contract update. Existing `PUBLIC_BASE_URL`, durable `DATABASE_PATH`, auth and mail settings remain server-only; do not expose private roots as static assets.

Capability choices are detailed in [COVERAGE.md](../.planning/phases/03-corrected-pdf-score/COVERAGE.md): integrate private Get/Put/Head/Delete, bounded multipart and cleanup; omit app-level IAM/bucket administration, public/presigned URLs and provider event buses. Corpus uploads remain permission-gated independently.

## Retention, deletion, backup and failure behavior

- Original upload plus recognition candidate lives in owner-private pending storage. Failed/abandoned uploads, canceled/stale attempts, unsaved candidates and worker scratch are removed within **24 hours** of their last active lease; periodic sweeps run at most hourly, with durable retry state and alarms. An active job does not become an immortal orphan: maximum attempts/time are bounded. Expired pending originals are excluded from reads immediately, even before physical purge.
- Explicit **Save draft** persists the original and selected draft/candidate artifacts in the private library until owner deletion. Confirmation adds an immutable retained snapshot; editing creates a separate draft. Never autosave editor memory to browser storage, a worker artifact or a remote service. An original awaiting a first save must not be presented as permanently retained. Warn about unsaved edits on leaving; preserve partial usable recognition during the pending window.
- Delete/revoke access immediately in owner metadata; purge current objects, derivatives, multipart remnants and orphan keys within **24 hours**, retry failures and report bounded tombstones. Account deletion must reconcile object deletion independently from SQL cascade. S3 lifecycle is a backup mechanism, not proof of an exact 24-hour purge; application sweeps and actual evidence enforce that promise. [AWS lifecycle documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html) describes provider expiration behavior.
- Proposed encrypted backups retain **7 days**, same approved region/account, with no public access; no cross-region replication. Approve whether object versioning/backups are enabled and record noncurrent-object expiry, multipart-abort policy and restore permissions. A restore must replay deletion tombstones before serving data. Deleted backups must age out within 7 days; restoring one must never restore a deleted user's access. Do not claim immediate physical erasure from immutable backups.
- Runtime logs contain only bounded status codes/job IDs, with no PDF contents, notation, cloud tokens, raw provider errors, pitch sessions or microphone data. Proposed operational log retention: 7 days. This phase does not store voice recordings. Private score access/deletion UI and later full-data-control work must match the actual approved policy; do not promise an unimplemented UI.

## Proposed initial limits (not measured support promises)

| Resource | Proposed maximum |
| --- | ---: |
| One uploaded PDF | 20 MiB (20,971,520 bytes) |
| Pages per PDF | 20 |
| Raster pixels per page / across job | 20,000,000 / 200,000,000 |
| Expanded archive bytes / entries | 256 MiB (268,435,456 bytes) / 2,000 |
| XML bytes / nesting / nodes | 32 MiB / 128 / 500,000 |
| Canonical musical events across all parts | 100,000 |
| System queue / active jobs per owner | 20 / 1 |
| Concurrent native workers | 1 |
| Owner retained bytes / saved scores | 1 GiB / 50 |
| Worker wall time / memory / CPU | 300 seconds / 2,048 MiB / 2 cores |
| Attempts per job / lease / heartbeat | 2 / 60 seconds / 15 seconds |
| Proposed monthly spending target / warning | USD 25 / USD 15 |

Reject beyond limits before expensive decode when possible and during streaming/decompression as actual sizes accumulate. Enforce expanded bytes, compressed-to-expanded ratio (100:1), count, depth, path traversal and symlink rejection without extracting caller paths. Limit request/body streams independently of declared Content-Length; compare actual PDF signature/parser result and reject encrypted/unsupported PDFs. A limit rejection is actionable and never silently truncates recognized content. Canonical schema approval later defines exact rational/ID/hash/CAS representation; this proposal does not freeze that schema.

Make limits configurable only through bounded, reviewed server settings; a change modifies the deployment evidence and invalidates its approval. The machine block includes the principal proposed limits. Additional controls above must be added to deployment enforcement tests before actual ingress. Preserve all parts for editing while evaluating one part per practice attempt.

Cost policy: app admission stops at a conservative projected monthly USD 25 allowance, with per-owner quotas, one worker, retry bounds and an operator alert at USD 15. Choose a named billing operator and real AWS budget/notification destination before provisioning. AWS budgets/alarms are not a guaranteed billing hard cap: existing storage/compute/egress can still accrue charges. Actual rates and hosting cost have not been quoted; if a hard all-in USD 25 cap is required, do not provision until a design can enforce the requested limit. No purchase, subscription, spend or infrastructure authorization is inferred from package approval.

## Decision and verification sequence

03-01-03 asks the human to choose A or revise B, and approve actual account/region/bucket/roles/host, source-offer scope/URL, retention/backups, quantitative limits, spend policy and operator. After setup, retain effective private bucket/IAM/TLS/encryption evidence, actual SDK identity/region checks, owner A/B and unauthenticated denials, multipart failure/orphan cleanup and deletion/restore checks. Configuration without these tests does not close LIB-01. `storage.lifecycleVerified` stays false until actual evidence exists.

The deployment checker fails until the human's approval is bound to all populated decisions and configuration matches. It is intentionally blocked now. Model stage additionally reads the later `docs/score-model-contract.md`, hashes actual schema bytes and the actual editor/native evidence reports, and requires a separate human approval covering stable IDs, exact rationals, source unions, review hashes, expected-revision CAS and immutable snapshots. It does not accept this deployment packet as model approval.

<!-- score-prerequisites:start -->
```json
{
  "schemaVersion": 1,
  "evidence": {
    "packetTextSha256": "3a8d654cb5951c7fabecf315b13b2f99d37e480a50f9eedcd5c5e9e18758556f",
    "provider": "aws-s3",
    "accountId": null,
    "region": "us-east-2",
    "bucket": null,
    "roleArn": null,
    "workerRoleArn": null,
    "workerHost": null,
    "topology": "isolated-worker",
    "license": {
      "disposition": "pending",
      "sourceUrl": null,
      "noticePath": "LICENSES/Audiveris",
      "modifiedArtifacts": [
        "Smoosic 2.0.2 XML/privacy source patch (not built)",
        "worker/import/source-map wrapper (not built)"
      ],
      "unmodifiedArtifacts": [
        "Audiveris 5.11.0 windowsConsole MSI 5f1b4e96a12c53c7da426814b76e599363c4181e291855996e0a6878dda95f71"
      ],
      "combinedWorkReview": "Option A proposes covered corresponding source including integrated app/wrapper; user scope decision and native third-party source/notice review pending."
    },
    "storage": {
      "publicAccessBlocked": true,
      "authenticatedReadsOnly": true,
      "ownerAuthorizationBeforeBytes": true,
      "encryption": "SSE-S3",
      "roleOnly": true,
      "lifecycleVerified": false
    },
    "retention": {
      "scratchHours": 24,
      "orphanHours": 24,
      "backupsDays": 7,
      "explicitSavesOnly": true,
      "savedRetention": "until-owner-deletion",
      "deletionPolicy": "Revoke immediately; purge objects/orphans within 24 hours; expire encrypted backups within 7 days; restore tombstones before access."
    },
    "limits": {
      "uploadBytes": 20971520,
      "pages": 20,
      "pagePixels": 20000000,
      "totalPixels": 200000000,
      "archiveExpandedBytes": 268435456,
      "archiveEntries": 2000,
      "archiveExpansionRatio": 100,
      "xmlBytes": 33554432,
      "xmlDepth": 128,
      "xmlNodes": 500000,
      "events": 100000,
      "queue": 20,
      "ownerJobs": 1,
      "ownerBytes": 1073741824,
      "ownerScores": 50,
      "workerSeconds": 300,
      "workerMemoryMiB": 2048,
      "workerCpus": 2,
      "workerConcurrency": 1,
      "attempts": 2,
      "leaseSeconds": 60,
      "heartbeatSeconds": 15,
      "monthlyUsd": 25
    },
    "cost": {
      "enforceAdmissionCap": true,
      "alertThresholdUsd": 15,
      "operator": null,
      "billingHardCapGuaranteed": false
    },
    "configuration": {
      "regionEnv": "SCORE_S3_REGION",
      "bucketEnv": "SCORE_S3_BUCKET",
      "roleEnv": "SCORE_S3_ROLE_ARN",
      "credentials": "workload-role",
      "identityTokenLocation": "protected server file referenced by AWS_WEB_IDENTITY_TOKEN_FILE; not configured"
    }
  },
  "approval": {
    "status": "pending",
    "by": null,
    "at": null,
    "evidenceSha256": null
  }
}
```
<!-- score-prerequisites:end -->
