# Score dependency review — 03-01

Status: **prepared; human approval pending**. Inspected 2026-10-17 UTC (2026-10-16 Central). No npm installation, third-party script, installer action, native program, build or deployment ran. Downloads stayed in temporary storage; the committed evidence contains inventories and text, not executable packages.

The three research SUS flags concern release freshness and, for Smoosic, low download volume. They are review triggers, not allegations about Mozilla, AWS or Smoosic identity. The research download counts are historical observations, not remeasured usage statistics.

## Exact artifacts to approve

| Artifact | Official source / selected ref | Downloaded bytes | SHA-256 |
| --- | --- | ---: | --- |
| smoosic 2.0.2 | [Smoosic commit ab1abbbb](https://github.com/Smoosic/Smoosic/commit/ab1abbbb53bc22cca83396f40982982895d1053d) | 25,112,477 | `ea9129b4220ea11d14c4b994461e500df8fcb2dac1bb9fde29ec4137a1429819` |
| pdfjs-dist 6.4.299 | [Mozilla tag v6.4.299](https://github.com/mozilla/pdf.js/releases/tag/v6.4.299), commit d0991a0d53f3bb3a7307e3b83f279c1d117aafb3 | 8,539,589 | `86269b40170eb41740ea05ad2102d71d33de4f122b34eb2f478be0ea7779c415` |
| @aws-sdk/client-s3 3.1152.0 | [AWS tag v3.1152.0](https://github.com/aws/aws-sdk-js-v3/releases/tag/v3.1152.0), commit 3ce8aa778c22193dad5f7fcefe239e3a74a3cd4f | 412,092 | `aa7e6027035df4cd57cf657b94b035888681acadb57eb14b774f644bfaef83dc` |
| @xmldom/xmldom 0.9.12 | [xmldom tag 0.9.12](https://github.com/xmldom/xmldom/tree/0.9.12), commit 0af8cf829d8a92bbac612903422c6947f5458f06 | 109,708 | `08245e18c248b957b4c6e07f8549ad5f55ae11b7a8abd4c1113a0fd61ddc67ee` |
| yauzl 3.4.0 | [yauzl tag 3.4.0](https://github.com/thejoshwolfe/yauzl/releases/tag/3.4.0), commit f5798e15204ffbb9a428b00217e4659684a41b0f | 31,577 | `ec962fa3205d4be5849f0fc3bebd0492b0abe8acf402656fd80490531fa8ba88` |
| Audiveris 5.11.0 Windows console x86_64 MSI | [Audiveris release 5.11.0](https://github.com/Audiveris/audiveris/releases/tag/5.11.0), commit 9e1e55cd2746037d059345881c53e6a6754bffbd | 85,062,430 | `5f1b4e96a12c53c7da426814b76e599363c4181e291855996e0a6878dda95f71` |

The machine section below contains each exact registry tarball URL, full SHA-512 SRI, observed hash, source ref and inventory hash. Every npm tarball's calculated SRI matched registry metadata. Registry ECDSA signatures verified against the npm keys endpoint for the `name@version:integrity` payload. This authenticates registry metadata; it is not a reproducible-build or malware certificate. See [official-source/signature observations](../.planning/phases/03-corrected-pdf-score/03-01-evidence/official-sources.json).

Smoosic has **no published tags** in the checked official repository. The nonexistent `2.0.2` ref returned 422; its npm gitHead resolves to the official commit and that commit's manifest says 2.0.2. Approval must explicitly accept this commit-based provenance, rather than invent a release tag. AWS has no npm gitHead field in the selected version metadata; its official tag and `clients/client-s3/package.json` agree on 3.1152.0. PDF.js registry gitHead equals the official release commit; its source config uses versionPrefix `6.4.` and the prior stableVersion `6.3.289` as release machinery inputs. yauzl's tag is `3.4.0`, without a `v`. [Additional ref checks](../.planning/phases/03-corrected-pdf-score/03-01-evidence/additional-refs.json) retain the rejected guesses and actual tags.

GitHub reported verified commit signatures for PDF.js and xmldom; Smoosic, AWS, yauzl and Audiveris commits were unsigned. The downloaded MSI is **NotSigned** according to Windows Authenticode. Its SHA-256 matches the digest on GitHub's release-asset API. No independent native build attestation or byte-for-byte source reproduction was established. A Linux/macOS worker or GUI MSI is a different artifact and requires a refreshed review.

## Archive, script and license inventory

Full filenames, manifest dependencies, script commands, license texts, registry SRI/signatures and byte hashes are retained per archive:

| Inventory | Entries | Entry point / inspection |
| --- | ---: | --- |
| [smoosic.json](../.planning/phases/03-corrected-pdf-score/03-01-evidence/smoosic.json) | 1,216 | `build/smoosic.js`; also ships `release/smoosic.js`, TypeScript, demos, tools, fonts and assets. Two MIT license notices retained. |
| [pdfjs-dist.json](../.planning/phases/03-corrected-pdf-score/03-01-evidence/pdfjs-dist.json) | 554 | `build/pdf.mjs`; matching workers, legacy builds, cmaps, ICC, fonts and WASM. Apache-2.0 plus component/font/JBIG2/OpenJPEG/QCMS licenses retained. No scripts declared. |
| [client-s3.json](../.planning/phases/03-corrected-pdf-score/03-01-evidence/@aws-sdk-client-s3.json) | 442 | `dist-cjs/index.js`, `dist-es/index.js`, types; Apache-2.0. |
| [xmldom.json](../.planning/phases/03-corrected-pdf-score/03-01-evidence/@xmldom-xmldom.json) | 15 | `lib/index.js`; MIT. |
| [yauzl.json](../.planning/phases/03-corrected-pdf-score/03-01-evidence/yauzl.json) | 6 | `index.js`; MIT. |
| [Audiveris MSI tables](../.planning/phases/03-corrected-pdf-score/03-01-evidence/audiveris-msi-inventory.json) | 2,707 files | Read-only File, Property, Media, CustomAction, Binary-name and execute-sequence tables; one embedded `Data.cab`. |

None of the five npm manifests declares `preinstall`, `install`, `postinstall` or `prepare`. This applies to these exact tarballs, not their unresolved transitive graph. All other script commands are recorded verbatim in each inventory. Smoosic's `test` is `exit 0`; it proves nothing. Its build runs `node ./build/build.js` and uses repository tooling; running that script is not approved by inspection alone. AWS scripts invoke monorepo tools; xmldom has release/test/version scripts; yauzl has its own test script. No such command ran.

MSI inspection used `WindowsInstaller.OpenDatabase(..., 0)` and read queries only. Its nine CustomAction rows include WiX path validation/EULA printing/folder removal, JPackage directory/related-product detection, and property-setting actions. The installer requests `ALLUSERS=1`; approval of provenance does not authorize installation on this machine. No MSI action was invoked. Embedded cabinet entries were read as data with Record.ReadStream and selected payloads expanded by Windows `expand.exe`. `tar.exe` could not read that CAB variant; Windows expand succeeded. [Extracted notices/runtime metadata](../.planning/phases/03-corrected-pdf-score/03-01-evidence/native-notices.json) include GPLv2/ClassPath-exception runtime notices and Java 25.0.3. The embedded `audiveris.jar` SHA-256 is `47d8e482d6566ebb64d5e8bd121f6a381ca8cef27521000b861885a19413b428`.

[Native library inventory](../.planning/phases/03-corrected-pdf-score/03-01-evidence/native-libraries.json) records each of 56 bundled JARs' exact filename, hash, entry count and embedded license/notice text. Twenty-seven had a matching embedded license/notice; 29 (including audiveris.jar) did not. The JSON names every missing case. This includes PDFBox 3.0.6, iText 5.5.13.2, Logback 1.4.14, JavaCPP/Tesseract/Leptonica, and other dependencies listed by the MSI. Missing embedded notices, source correspondence and current vulnerability disposition remain deployment review items; do not infer that a recently released wrapper refreshes every bundled library. The exact Audiveris source carries [AGPLv3](https://raw.githubusercontent.com/Audiveris/audiveris/5.11.0/LICENSE). Corresponding source and bundled-component obligations are addressed in the [deployment proposal](score-deployment-decision.md).

## Actual XML reachability and patch proposal

The [text/source path scan](../.planning/phases/03-corrected-pdf-score/03-01-evidence/smoosic-reachability.json) covers the inspected tarball's `.js`, `.ts`, `.vue` and `.json` files (source maps excluded). It found unscoped `xmldom` in `package.json:33` (`^0.6.0`) and `tools/parseSoundXml.js:3` (`require('xmldom')`). Neither `build/smoosic.js` nor `release/smoosic.js` contains the string `xmldom`. The development bundle uses webpack eval modules and is unsuitable for the intended CSP. This is static path evidence, not a runtime coverage or complete vulnerability verdict.

Reachable application XML paths use browser globals: `src/application/application.ts:265` imports an initial XML score; `src/render/sui/scoreViewOperations.ts:202` parses remote XML; `src/ui/dialogs/fileDialogs.ts:55` parses uploads and `:114` constructs an XMLSerializer for export. Those operations feed the MusicXML conversion code under `src/smo/mxml/`. The XML maintenance tool is not proven reachable from the browser entry, but its manifest dependency would still install unless removed. Installing the scoped parser alongside Smoosic leaves that declaration intact.

The [maintainer advisory GHSA-27p8-2357-5qqv](https://github.com/xmldom/xmldom/security/advisories/GHSA-27p8-2357-5qqv) identifies unscoped xmldom as affected and scoped 0.9.12 as patched; safe serialization requires the opt-in well-formed check. The downloaded 0.9.12 `lib/dom.js` and types confirm `new XMLSerializer().serializeToString(node, { requireWellFormed: true })`. That option is not a complete schema validator.

Proposed reviewed source patch/build, to be implemented only after approval:

1. Start from the exact Smoosic commit/tarball above. Remove unscoped xmldom from the manifest and lock graph; replace the maintenance tool import with the exact scoped pin or exclude that tool from the build. Never execute the upstream server, demo or sound-XML tool.
2. Route all four browser XML entry points and server normalization through a bounded scoped-parser adapter; do not replace browser globals globally. Reject DOCTYPE/entity declarations before parsing, enforce UTF-8/byte/depth/node/event limits, treat parser warnings/errors as failure, require the expected MusicXML root, and reject unknown/active constructs. Permit no network resolver. Emit with `{ requireWellFormed: true }`; reparse and validate serialized output and reject invalid names, comments, processing instructions, CDATA, namespaces and attributes. Convert only reviewed, inert DOM content for Smoosic; test real browser DOM interoperability.
3. Build from reviewed source into a new production bundle. Exclude the original `build/smoosic.js` and `release/smoosic.js` from app assets. Record patch diff hash, exact toolchain/lockfile and output SHA-256; retain MIT/font/third-party notices. Do not execute a newly resolved build dependency until its install/scripts/identity inventory is reviewed. The current packet freezes direct inputs, not an invented future dependency lock.
4. Inspect the loaded browser and server module graph: zero unscoped xmldom modules, zero leftover direct XML entry bypasses, no unapproved code generation/eval. Exercise malformed XML and serialization tests against the actual production bundle. Stop 03-03 if the graph differs. Bundle execution/private-score ingress remains blocked until these later checks pass; approving this plan alone is not evidence that a patch exists.

No unknown XML path has been silently waived. The machine field `unresolvedPaths` means unreviewed paths, not unimplemented patch steps; `buildStatus` remains `not-built`. Any new reachable XML path reopens review. The patch proposal's exact text hash is bound below.

## Remote loading and hidden persistence to remove

| Inspected path | Current behavior | Required source/build change |
| --- | --- | --- |
| `application.ts:239,252` | `remoteScore` XHR; fallback to browser localStorage | Accept only app-authorized in-memory score; remove remote and local restore fallback. |
| `configuration.ts:97` | Default SmoScores library URL | Remove remote defaults, library controls and demo bootstraps. |
| `scoreViewOperations.ts:198,214,2132` | Remote XML/JSON; `localStorage.setItem` backup | Remove URL loaders and persistence method/callers; route explicit Save draft to owner API only. |
| `ui/fileio/xhrLoader.ts:39`, `ui/fileio/library.ts:89`, library dialogs | Generic XHR and nested score-library loads | Exclude remote library features and caller URLs; fixed app byte adapter only. |
| `render/audio/samples.ts:106`, `oscillator.ts`, `smplr` bundle | Remote soundfonts/drumfont, playback/cache support | Remove upstream playback/sample bootstraps and smplr/cache graph; preserve existing app count-in/audio outside editor. |
| `generateVexTests.ts`, bundled demo/server code | Remote demo scores / development tooling | Exclude from loaded artifacts. |

The [broader path scan](../.planning/phases/03-corrected-pdf-score/03-01-evidence/smoosic-path-review.json) records source lines and bundle contexts. SVG namespace URLs are identifiers, not network requests. Source comments and deliberate external documentation links are distinguishable from loaders; no private score/referrer may travel to external links. Remove generic upstream navigation from the private editor. Audit localStorage, sessionStorage, indexedDB, CacheStorage, service workers, fetch/XHR, workers and dynamically loaded assets in the final graph and browser network trace; string scans alone cannot prove absence. Session expiry must clear memory/canvases without autosaving. Keep D-01 through D-12 intact, including all-part editing, automatic rebar and explicit save.

## Remaining gates and approval binding

03-01-02 must explicitly approve the six exact artifacts, unsigned/native and missing-Smoosic-tag caveats, and source patch/build policy, or name rejected artifacts/corrected pins. No human approval is recorded here. 03-01-03 separately chooses license scope, account/provider/region, worker host, cost and retention. Native/bundle feasibility, complete resolved dependency/notice/security review, real cloud checks and model approval remain later gates. A failed review blocks consumers; it is never permission to install a similarly named alternative.

The checker reads the single marked JSON block. To record an actual human decision, preserve the evidence object/property order, set approval `status`, `by`, ISO UTC `at`, and `evidenceSha256 = SHA256(JSON.stringify(evidence))` using the exported `evidenceDigest`. Do not auto-fill approval. Any evidence mutation invalidates the binding. Inventory and narrative hashes use UTF-8 with CRLF normalized to LF; archive hashes always cover exact binary bytes. The narrative prefix is bound by `packetTextSha256`; all retained review files are separately hashed. Before installation, redownload exact URLs without executing them and run the packages checker with `--artifact-dir` containing the exact `fileName` values below; it rehashes actual bytes. Without that option the checker validates the retained review record only. Installing packages remains 03-03 work. This is an audit gate, not a signature/authentication system against a malicious repository writer.

<!-- score-prerequisites:start -->
```json
{
  "schemaVersion": 1,
  "evidence": {
    "preparedAt": "2026-10-17T00:15:58.120Z",
    "packetTextSha256": "b37af95b275cd9c791d71580457d40aa5f25ba365b50d2306cd669a0b72f3cb3",
    "files": [
      {
        "path": ".planning/phases/03-corrected-pdf-score/03-01-evidence/@aws-sdk-client-s3.json",
        "sha256": "eaede3f729653f7ab8f397e6ec563779732d232d101a5368de8cff045cf5d020"
      },
      {
        "path": ".planning/phases/03-corrected-pdf-score/03-01-evidence/@xmldom-xmldom.json",
        "sha256": "9554d030cb4089615558414d646d560025f273da5fd93d28cfcc3a148b7d96fc"
      },
      {
        "path": ".planning/phases/03-corrected-pdf-score/03-01-evidence/additional-refs.json",
        "sha256": "0d754242b51752147884a5b3c896e45d2788eab4bb55e455391f6acaab81ed27"
      },
      {
        "path": ".planning/phases/03-corrected-pdf-score/03-01-evidence/audiveris-msi-inventory.json",
        "sha256": "8d17cd45cb78e131e073d0e6665faf019758a094fba6aa45986ba8533ebe0c21"
      },
      {
        "path": ".planning/phases/03-corrected-pdf-score/03-01-evidence/audiveris-release.json",
        "sha256": "489760e2661e9bf2cab48aeec82ef6f74ac652108adef1a22eeb4e1929b0f80f"
      },
      {
        "path": ".planning/phases/03-corrected-pdf-score/03-01-evidence/native-libraries.json",
        "sha256": "69e469afa2d3237d324476e95103c4c398658e39722cd54b0f5a3932598a41d9"
      },
      {
        "path": ".planning/phases/03-corrected-pdf-score/03-01-evidence/native-notices.json",
        "sha256": "aab43d8171c3009ae12e1d5804cbbd476eeb1c0471569450c0045400b9191613"
      },
      {
        "path": ".planning/phases/03-corrected-pdf-score/03-01-evidence/npm-registry-keys.json",
        "sha256": "14748632f92fc8f1e0370a4eb637d162574d6e81ad865ee15962e55d16a016e5"
      },
      {
        "path": ".planning/phases/03-corrected-pdf-score/03-01-evidence/official-sources.json",
        "sha256": "3d6782d366337baaa5f58e308f9244d95530c96dc708d62d7401883ec77c4c02"
      },
      {
        "path": ".planning/phases/03-corrected-pdf-score/03-01-evidence/pdfjs-dist.json",
        "sha256": "bc6bca5adac7fbb3c03caebd8ff4769981078cd9587afa02be531b6ebd34eb92"
      },
      {
        "path": ".planning/phases/03-corrected-pdf-score/03-01-evidence/smoosic-path-review.json",
        "sha256": "6cf2a35ade7a292c611f99562aee074036fbb95bd7085d5fce7b9778dd368951"
      },
      {
        "path": ".planning/phases/03-corrected-pdf-score/03-01-evidence/smoosic-reachability.json",
        "sha256": "59646a464f795e875013bf57e006c7d40c51d6dde356361eee8baf6926b036d3"
      },
      {
        "path": ".planning/phases/03-corrected-pdf-score/03-01-evidence/smoosic.json",
        "sha256": "98402bac983fd0b070638b3d6146989c7d37088d9ecd676d062970a90466543a"
      },
      {
        "path": ".planning/phases/03-corrected-pdf-score/03-01-evidence/yauzl.json",
        "sha256": "b9561eded2e413f1cdfcdd7061354ceae00c54a3058a49a44615085a3d0713ff"
      }
    ],
    "artifacts": [
      {
        "name": "smoosic",
        "version": "2.0.2",
        "url": "https://registry.npmjs.org/smoosic/-/smoosic-2.0.2.tgz",
        "fileName": "smoosic.tgz",
        "repository": "https://github.com/Smoosic/Smoosic",
        "sourceRef": "ab1abbbb53bc22cca83396f40982982895d1053d",
        "sha256": "ea9129b4220ea11d14c4b994461e500df8fcb2dac1bb9fde29ec4137a1429819",
        "observedSha256": "ea9129b4220ea11d14c4b994461e500df8fcb2dac1bb9fde29ec4137a1429819",
        "integrity": "sha512-TTvszqTF64d46piFChWYxQf6zTyjpqI2Rc7bQX9DLzx59DqyrWP3WzyroEzYY6tS3DaL4yxnFZOThY8PV0afCA==",
        "observedIntegrity": "sha512-TTvszqTF64d46piFChWYxQf6zTyjpqI2Rc7bQX9DLzx59DqyrWP3WzyroEzYY6tS3DaL4yxnFZOThY8PV0afCA==",
        "inventoryPath": ".planning/phases/03-corrected-pdf-score/03-01-evidence/smoosic.json",
        "inventorySha256": "98402bac983fd0b070638b3d6146989c7d37088d9ecd676d062970a90466543a",
        "fileCount": 1216,
        "scriptsReviewed": true,
        "licensesReviewed": true,
        "provenanceStatus": "verified"
      },
      {
        "name": "pdfjs-dist",
        "version": "6.4.299",
        "url": "https://registry.npmjs.org/pdfjs-dist/-/pdfjs-dist-6.4.299.tgz",
        "fileName": "pdfjs-dist.tgz",
        "repository": "https://github.com/mozilla/pdf.js",
        "sourceRef": "d0991a0d53f3bb3a7307e3b83f279c1d117aafb3",
        "sha256": "86269b40170eb41740ea05ad2102d71d33de4f122b34eb2f478be0ea7779c415",
        "observedSha256": "86269b40170eb41740ea05ad2102d71d33de4f122b34eb2f478be0ea7779c415",
        "integrity": "sha512-AVl138zALtfaAPvADulE0PZThbYzCBS79nL4pOSL/6Sm/4AH5A21BD9VHt97OlCuzJuCpmeZtAtkinisF4Vb1g==",
        "observedIntegrity": "sha512-AVl138zALtfaAPvADulE0PZThbYzCBS79nL4pOSL/6Sm/4AH5A21BD9VHt97OlCuzJuCpmeZtAtkinisF4Vb1g==",
        "inventoryPath": ".planning/phases/03-corrected-pdf-score/03-01-evidence/pdfjs-dist.json",
        "inventorySha256": "bc6bca5adac7fbb3c03caebd8ff4769981078cd9587afa02be531b6ebd34eb92",
        "fileCount": 554,
        "scriptsReviewed": true,
        "licensesReviewed": true,
        "provenanceStatus": "verified"
      },
      {
        "name": "@aws-sdk/client-s3",
        "version": "3.1152.0",
        "url": "https://registry.npmjs.org/@aws-sdk/client-s3/-/client-s3-3.1152.0.tgz",
        "fileName": "@aws-sdk-client-s3.tgz",
        "repository": "https://github.com/aws/aws-sdk-js-v3",
        "sourceRef": "3ce8aa778c22193dad5f7fcefe239e3a74a3cd4f",
        "sha256": "aa7e6027035df4cd57cf657b94b035888681acadb57eb14b774f644bfaef83dc",
        "observedSha256": "aa7e6027035df4cd57cf657b94b035888681acadb57eb14b774f644bfaef83dc",
        "integrity": "sha512-oI1+ZaM6pSOwZazu4nAb7rL8ug7LSjg31tDoJqRB9MooRqqWCf/qvkIZqne1mRA3xK3slg6K0RNWXaJYHbWLvg==",
        "observedIntegrity": "sha512-oI1+ZaM6pSOwZazu4nAb7rL8ug7LSjg31tDoJqRB9MooRqqWCf/qvkIZqne1mRA3xK3slg6K0RNWXaJYHbWLvg==",
        "inventoryPath": ".planning/phases/03-corrected-pdf-score/03-01-evidence/@aws-sdk-client-s3.json",
        "inventorySha256": "eaede3f729653f7ab8f397e6ec563779732d232d101a5368de8cff045cf5d020",
        "fileCount": 442,
        "scriptsReviewed": true,
        "licensesReviewed": true,
        "provenanceStatus": "verified"
      },
      {
        "name": "@xmldom/xmldom",
        "version": "0.9.12",
        "url": "https://registry.npmjs.org/@xmldom/xmldom/-/xmldom-0.9.12.tgz",
        "fileName": "@xmldom-xmldom.tgz",
        "repository": "https://github.com/xmldom/xmldom",
        "sourceRef": "0af8cf829d8a92bbac612903422c6947f5458f06",
        "sha256": "08245e18c248b957b4c6e07f8549ad5f55ae11b7a8abd4c1113a0fd61ddc67ee",
        "observedSha256": "08245e18c248b957b4c6e07f8549ad5f55ae11b7a8abd4c1113a0fd61ddc67ee",
        "integrity": "sha512-5AXjrcMClTryPe9LgZrygpB1lj7s0S9E0+W+AHaVKAVyHanafK86iPSvG5xHVSp/jC+VH1UXu0TAEmY279xH7A==",
        "observedIntegrity": "sha512-5AXjrcMClTryPe9LgZrygpB1lj7s0S9E0+W+AHaVKAVyHanafK86iPSvG5xHVSp/jC+VH1UXu0TAEmY279xH7A==",
        "inventoryPath": ".planning/phases/03-corrected-pdf-score/03-01-evidence/@xmldom-xmldom.json",
        "inventorySha256": "9554d030cb4089615558414d646d560025f273da5fd93d28cfcc3a148b7d96fc",
        "fileCount": 15,
        "scriptsReviewed": true,
        "licensesReviewed": true,
        "provenanceStatus": "verified"
      },
      {
        "name": "yauzl",
        "version": "3.4.0",
        "url": "https://registry.npmjs.org/yauzl/-/yauzl-3.4.0.tgz",
        "fileName": "yauzl.tgz",
        "repository": "https://github.com/thejoshwolfe/yauzl",
        "sourceRef": "f5798e15204ffbb9a428b00217e4659684a41b0f",
        "sha256": "ec962fa3205d4be5849f0fc3bebd0492b0abe8acf402656fd80490531fa8ba88",
        "observedSha256": "ec962fa3205d4be5849f0fc3bebd0492b0abe8acf402656fd80490531fa8ba88",
        "integrity": "sha512-jIH9yLR9wqr0wOS0TpBvo/g/2UgZH5qePVbjgRliiF0BYvOZyaBknKsF+x9Iht0O6sqgnB93rCICdOZFecJuDw==",
        "observedIntegrity": "sha512-jIH9yLR9wqr0wOS0TpBvo/g/2UgZH5qePVbjgRliiF0BYvOZyaBknKsF+x9Iht0O6sqgnB93rCICdOZFecJuDw==",
        "inventoryPath": ".planning/phases/03-corrected-pdf-score/03-01-evidence/yauzl.json",
        "inventorySha256": "b9561eded2e413f1cdfcdd7061354ceae00c54a3058a49a44615085a3d0713ff",
        "fileCount": 6,
        "scriptsReviewed": true,
        "licensesReviewed": true,
        "provenanceStatus": "verified"
      },
      {
        "name": "Audiveris",
        "version": "5.11.0",
        "url": "https://github.com/Audiveris/audiveris/releases/download/5.11.0/Audiveris-5.11.0-windowsConsole-x86_64.msi",
        "fileName": "Audiveris-5.11.0-windowsConsole-x86_64.msi",
        "repository": "https://github.com/Audiveris/audiveris",
        "sourceRef": "9e1e55cd2746037d059345881c53e6a6754bffbd",
        "sha256": "5f1b4e96a12c53c7da426814b76e599363c4181e291855996e0a6878dda95f71",
        "observedSha256": "5f1b4e96a12c53c7da426814b76e599363c4181e291855996e0a6878dda95f71",
        "integrity": null,
        "observedIntegrity": null,
        "inventoryPath": ".planning/phases/03-corrected-pdf-score/03-01-evidence/audiveris-msi-inventory.json",
        "inventorySha256": "8d17cd45cb78e131e073d0e6665faf019758a094fba6aa45986ba8533ebe0c21",
        "fileCount": 2707,
        "scriptsReviewed": true,
        "licensesReviewed": true,
        "provenanceStatus": "verified"
      }
    ],
    "xml": {
      "strategy": "reviewed-source-patch",
      "parser": "@xmldom/xmldom@0.9.12",
      "requireWellFormed": true,
      "rejectDtd": true,
      "originalBundleAllowed": false,
      "paths": [
        "tools/parseSoundXml.js:3",
        "src/application/application.ts:265",
        "src/render/sui/scoreViewOperations.ts:202",
        "src/ui/dialogs/fileDialogs.ts:55,114",
        "build/smoosic.js",
        "release/smoosic.js"
      ],
      "unresolvedPaths": [],
      "patchPlanSha256": "15a45827cfc70e1a79af85e0e7d45959dd9805b0cc18abd41fda59aec2445dce",
      "buildStatus": "not-built"
    },
    "privacy": {
      "disableRemoteLoading": true,
      "disableHiddenPersistence": true,
      "paths": [
        "src/application/application.ts",
        "src/application/configuration.ts",
        "src/render/sui/scoreViewOperations.ts",
        "src/ui/fileio/xhrLoader.ts",
        "src/ui/fileio/library.ts",
        "src/ui/dialogs/library.ts",
        "src/ui/dialogs/libraryVue.ts",
        "src/render/audio/samples.ts",
        "src/render/audio/oscillator.ts",
        "smplr dependency graph"
      ]
    }
  },
  "approval": {
    "status": "approved",
    "by": "Project user via explicit Codex user reply at checkpoint 03-01-02",
    "at": "2026-10-17T20:30:12.516Z",
    "evidenceSha256": "1dc082498c8d797e562208f1c9255df2e81c9349102bde7885fe30f280bdf868"
  }
}
```
<!-- score-prerequisites:end -->

## Actual approval record — 03-01-02

**Decision:** Approved by the project user through an explicit Codex user reply. Recorded at **2026-10-17T20:30:12.516Z** UTC; this is the recording time, not an inferred response timestamp.

**Question presented:** “Approve the six exact artifact hashes and XML patch/build approach in the dependency packet? Review docs/score-dependency-review.md, including unsigned Audiveris, commit-based Smoosic provenance, and the remaining deployment holds. This approves these dependency inputs and the reviewed patch approach; deployment/cloud spending is a separate decision.”

**Exact user response:** “Approve the exact artifacts and XML approach”.

**Approved evidence digest:** `1dc082498c8d797e562208f1c9255df2e81c9349102bde7885fe30f280bdf868` (`SHA256(JSON.stringify(evidence))`). The digest matches the packet presented to the user. The six exact artifact versions, hashes, source refs, retained inventories, XML patch proposal and bound narrative prefix are unchanged from commit `34d419c93d82a4d3c2e1a7a3904aea8c2a3f1bbf`. This approval includes the disclosed unsigned Audiveris MSI and commit-based Smoosic provenance caveats. The preparation-time “approval pending” statements above remain as historical bound evidence; this appended record and the machine approval supersede that status without changing the approved evidence.

Approval covers these dependency inputs and the reviewed XML/privacy source patch/build approach. It does not establish a completed patched build or approve native installation, source publication scope, cloud account/bucket/roles, worker host, credentials, spending, retention or deployment. Those choices and the remaining native notice/security, containment and real-cloud evidence gates remain open. Installation remains task 03-03 work and requires the prescribed fresh inert artifact rehash and later build/dependency checks. No package install, provisioning, native execution or deployment ran while recording this decision.

Verification: `node scripts/check-score-prerequisites.mjs --stage packages` passed; all 12 prerequisite tests and all 109 full regression tests passed, with no failures, skips or TODOs. Deployment stage remained blocked on its independent decisions and actual setup. [Rule 1 - Bug] The CLI regression assumed the live package packet would remain pending forever; recording approval exposed that assumption. It now exercises an independent temporary pending packet, checks the missing-human-approval diagnostic, and retains the secret-output assertion without depending on real approval state.
