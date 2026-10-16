# API and SDK Coverage — Phase 03

The deterministic API detector returned `detected:true` against nonempty phase scope. This matrix records the complete application-facing capability families of the selected integrations, rather than private library implementation methods. INTEGRATE is the baseline; every subtraction has an explicit reason. Candidate versions remain subject to 03-01 artifact approval. Provider and capability decisions are reviewed at 03-01-03 before cloud use.

## Private S3 SDK and service

| capability | decision | reason |
| --- | --- | --- |
| S3Client server-only credential-chain/region configuration | INTEGRATE | 03-06 validates approved role/region without browser credentials. |
| PutObjectCommand with checksums and bounded body | INTEGRATE | Immutable original/derivative private bytes; 03-06. |
| GetObjectCommand with bounded stream and abort | INTEGRATE | Owner API reads originals/derivatives; 03-06. |
| HeadObjectCommand for length/checksum/availability | INTEGRATE | Verify persisted artifact metadata and actual cloud state. |
| DeleteObjectCommand | INTEGRATE | Failed upload/orphan/scratch cleanup; 03-13. |
| AbortSignal/SDK request timeout and bounded retry | INTEGRATE | Cancellation/resource ceilings across upload/read/cleanup. |
| HeadBucket/GetBucketLocation | INTEGRATE | Read-only approved account/bucket/region setup validation. |
| GetPublicAccessBlock/GetBucketPolicyStatus/GetBucketEncryption | INTEGRATE | Actual private-bucket acceptance before score ingress. |
| PutPublicAccessBlock/PutBucketEncryption/PutBucketPolicy | OPT-OUT | Operator provisions the approved private bucket and role; the app verifies policy/encryption and refuses unsafe configuration. |
| GetBucketLifecycleConfiguration/PutBucketLifecycleConfiguration | OPT-OUT | Bounded app cleanup/outbox enforces transient retention; operator approves backup policy without adding bucket lifecycle administration to the app. |
| GetObjectAttributes | OPT-OUT | HeadObject and actual streamed checksums already verify immutable metadata/bytes; no independent attributes workflow is needed. |
| CreateBucket/DeleteBucket | OPT-OUT | User selects/provisions the account and approved bucket; destructive bucket deletion is outside this phase. |
| ListBuckets | OPT-OUT | The app accepts one explicitly approved bucket and must not enumerate account inventory. |
| ListObjectsV2/ListObjectVersions | OPT-OUT | DB-recorded random keys and durable outbox provide bounded orphan cleanup without bucket-wide discovery; backups/version retention are operator policy. |
| CreateMultipartUpload/UploadPart/CompleteMultipartUpload | OPT-OUT | Approved PDF byte ceiling uses bounded single-object upload; no multipart objects are created. |
| AbortMultipartUpload/ListParts/ListMultipartUploads | OPT-OUT | The app creates no multipart uploads, so it has no multipart recovery or enumeration workflow. |
| CopyObject/UploadPartCopy | OPT-OUT | Revisions reference immutable originals and snapshots instead of copying private objects. |
| PutObjectAcl/GetObjectAcl/PutBucketAcl | OPT-OUT | Bucket-owner-enforced policy/private access replaces ACL-managed sharing; no public/private ACL UI. |
| SDK presigning/getSignedUrl and direct browser bucket access | OPT-OUT | Bearer URLs bypass fresh API authorization; all private reads use owner-authorized API. |
| Public website, access-point and object-lambda APIs | OPT-OUT | The private score store is not a website or public transformation service. |
| S3 select/query/inventory/analytics/intelligent-tiering APIs | OPT-OUT | The application reads known immutable PDF/artifact keys; analytics/query services are not part of PDF correction. |
| S3 replication, cross-region failover and batch operations | OPT-OUT | One approved region/provider and explicit backup policy; no cross-region product workflow. |
| Object lock/legal hold/retention-compliance APIs | OPT-OUT | No regulatory immutable-object hold is required; application snapshots are immutable through owner API policy. |
| Object/bucket tagging and notification/event APIs | OPT-OUT | SQLite job/outbox authority drives processing; no provider event bus or tag workflow is needed. |
| Bucket versioning configuration | OPT-OUT | Operator-approved backup/version policy is reviewed in deployment; application writes unique immutable keys. |
| Bucket logging/metrics/request-payment/accelerate/CORS administration | OPT-OUT | Deployment operations stay with approved operator controls; no cross-origin browser bucket access or acceleration workflow. |
| IAM role/account/credential administration | OPT-OUT | User-owned account/role setup is an explicit dependency, not an in-app identity administration feature. |

## Audiveris native integration

| capability | decision | reason |
| --- | --- | --- |
| Batch PDF recognition with fixed CLI executable/arguments | INTEGRATE | Genuine candidate recognition under containment; 03-05/07/14. |
| Printed digital and eligible scan input processing | INTEGRATE | Both strata require actual independent gold/correction/source evidence. |
| MusicXML/MXL export | INTEGRATE | Secure rational normalization of notes/rests/measures/context/parts. |
| Saved .omr book/sheet/artifact output | INTEGRATE | Original-page source identity/transform join and partial outcomes. |
| Page/sheet selection and observed processing stages | INTEGRATE | Durable partial results and honest progress, not fabricated percentages. |
| Native logs/exit/failure output | INTEGRATE | Sanitized bounded status and actionable errors without score/secret disclosure. |
| GUI manual OMR correction | OPT-OUT | Singers correct directly in the browser staff workflow required by D-01 through D-04. |
| Arbitrary CLI scripts/plugins/custom user options | OPT-OUT | Untrusted code/arguments are outside supported PDF input. |
| Recognition-model training/tuning administration | OPT-OUT | Phase measures a pinned recognition tool; model-training infrastructure is outside scope. |
| Bulk book/playlist management outside an owner upload | OPT-OUT | Owner-scoped durable jobs operate on one approved uploaded score and its bounded pages. |

## Smoosic browser editor

| capability | decision | reason |
| --- | --- | --- |
| Library/editor initialization and full-score engraving | INTEGRATE | Self-hosted patched bundle; whole score remains editable. |
| MusicXML import/export adapter | INTEGRATE | Conversion is validated against the one canonical app score/ID model. |
| Staff hit testing, selection and pitch gestures | INTEGRATE | Direct staff correction and keyboard equivalents per D-01. |
| Rhythm/duration and note/rest insertion/deletion | INTEGRATE | App command boundary implements D-02 and exact D-03 redistribution. |
| Measure/part/tempo/key/meter/clef operations | INTEGRATE | Supported full-score corrections, including both parts of reassignment. |
| Undo/redo | INTEGRATE | App-owned atomic command history preserves IDs, source unions and review state. |
| Score/part/measure navigation and selected-part emphasis | INTEGRATE | One practice part emphasized while all parts remain editable. |
| Layout/zoom needed for readable staff interaction | INTEGRATE | Actual responsive/pointer/keyboard browser acceptance. |
| Upstream autosave/localStorage fallback | OPT-OUT | D-08 requires explicit Save draft and unsaved warning. |
| Remote sample/library/score loading and remote soundfonts/audio | OPT-OUT | Private authorized data and self-hosted assets only; no automatic remote fetch. |
| Built-in score playback/reference pitch | OPT-OUT | Reference listening is deferred PRACTICE-03; Phase 3 only replays the verified practice timeline. |
| General engraving publishing/print/export UI | OPT-OUT | PDF input correction/confirmed practice is the phase outcome; interchange exports remain internal adapter operations. |
| Guitar/tab/percussion/nonmelodic instrument editing | OPT-OUT | The measured support contract targets selected melodic vocal parts; unsupported notation stays visible/unavailable. |

## PDF.js

| capability | decision | reason |
| --- | --- | --- |
| getDocument from authorized data bytes | INTEGRATE | Original private PDF rendering without caller URL fetch. |
| getPage/getViewport/page.render | INTEGRATE | Beside-score original view and zoom/crop/rotation transforms. |
| RenderTask.cancel/loadingTask.destroy/document.cleanup/destroy | INTEGRATE | Bound memory and clear private state on navigation/expiry. |
| document.numPages/page viewport bounds | INTEGRATE | Page/pixel limits and missing-page/source checks. |
| Matching worker/fonts/cmaps/standard-font assets | INTEGRATE | Self-hosted exact-version renderer support. |
| getData | INTEGRATE | Only authorized bytes; checksum/source identity checks where needed. |
| getTextContent | OPT-OUT | OMR rather than text extraction proposes notation; lyrics/search is not a phase requirement. |
| getAnnotations, scripting/forms and annotation editing | OPT-OUT | Original is a read-only comparison source; active PDF interaction is outside scope. |
| getOutline/getPageLabels/getMetadata | OPT-OUT | Canonical score source page/region identities are primary; optional document metadata is not required for trustworthy review. |
| getAttachments and embedded file extraction | OPT-OUT | Uploaded PDF attachments are not notation input and must not become executable/imported content. |
| Generic viewer download/print/presentation/find UI | OPT-OUT | App-owned authorized comparison viewer supplies only needed review navigation/zoom. |
| Password callback/encrypted PDF opening | OPT-OUT | Encrypted scores receive actionable unsupported behavior until separately measured. |
| URL/range/network loading and external links | OPT-OUT | API-authorized full bounded bytes avoid remote fetch and bearer source access. |

## Scoped XML and ZIP libraries

| capability | decision | reason |
| --- | --- | --- |
| DOMParser.parseFromString bounded MusicXML/.omr XML | INTEGRATE | Scoped patched parser with DTD/entities/network disabled and strict error handling. |
| XMLSerializer.serializeToString with well-formed enforcement | INTEGRATE | Actual Smoosic import/export path tested against malformed XML. |
| General DOM document mutation outside canonical adapter | OPT-OUT | XML is interchange; all musical truth/mutation uses the app score command model. |
| yauzl.open/fromBuffer lazy bounded ZIP entry reading | INTEGRATE | Known private local output/input artifacts under cumulative actual decompression limits. |
| yauzl.readEntry/openReadStream/close | INTEGRATE | Bounded entry paths/counts/content and cleanup under cancellation. |
| yauzl.fromFd/fromRandomAccessReader custom backends | OPT-OUT | Fixed local private artifacts and bounded buffers suffice; no caller-provided remote/random-access backend. |
| ZIP extraction to caller paths/write/archive creation | OPT-OUT | Import consumes bounded entries; it does not extract untrusted paths or create user archives. |

Required recognition, correction, source mapping, partial results, explicit saves, review, immutable confirmation and actual cloud bytes are INTEGRATE scope. None is opted out. The API coverage seal checks this matrix; native containment and cloud provisioning remain explicit execution prerequisites rather than inferred configuration.
