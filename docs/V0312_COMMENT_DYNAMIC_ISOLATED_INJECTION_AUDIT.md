# V0312 Comment / Dynamic Isolated Injection Audit

Thread: `V0312 Comment/Dynamic Isolated Injection Failure Audit`

Status: `READ-ONLY EVIDENCE AUDIT / METHOD REPAIR ONLY`

Evidence run:

```text
output/v0312-comment-dynamic-sampling/v0312-comment-dynamic-safari-isolated-login-20260611-045945/
```

## Verdict

`RETRY_WITH_METHOD_FIX`

Do not retry the same capture procedure blindly. The target userscript bytes were
installed and enabled in the isolated profile, and the script mounted on
`https://www.bilibili.com/` before sampling. The sample pages later showed no
QoL Core DOM/runtime markers, but the retained evidence does not prove that each
sample page was loaded or reloaded after both target-script enablement and
domain permission readiness.

The failure is best classified as a capture-method / permission-proof gap, not
as a verified runtime implementation bug. A further isolated-profile retry is
worth doing only if it adds explicit per-domain permission and post-enable
navigation proof.

## Reviewed Inputs

- `docs/V0312_COMMENT_DYNAMIC_SAMPLE_GOVERNANCE_DESIGN.md`
- `docs/V0312_COMMENT_DYNAMIC_SAMPLING_MANIFEST_PLAN.md`
- `docs/V0312_COMMENT_DYNAMIC_CAPTURE_G3_REVIEW.md`
- `docs/V0312_COMMENT_DYNAMIC_EVIDENCE_AUDIT.md`
- `docs/V0312_COMMENT_DYNAMIC_AUDIT_G4_DECISION.md`
- `docs/V0312_COMMENT_DYNAMIC_ISOLATED_RETRY_G5_REVIEW.md`
- isolated retry evidence under the run directory above
- `dist/bilibili-qol-core.user.js`
- `src/main.ts`, `src/runtime/lifecycle.ts`, `src/utils/page.ts`

No Safari operation, resampling, raw storage export, runtime edit, package edit,
release/preflight work, push, tag, or MBGA work was performed.

## Findings

### F1 - Login Redaction Is A Summary Metadata Bug

`summary.json` has `hard_gates.login_proof_sanitized=false`, but
`login/safari-main-window-login-proof.json` stores only login booleans and
presence booleans. It explicitly records that `mid`, `uname`, avatar, raw
response, cookies, tokens and request headers were not included.

The run privacy scan also reports `concreteForbiddenFindingCount=0`.

Conclusion: this is a summary metadata inconsistency, not a concrete privacy or
evidence defect.

### F2 - Installed Script Identity And Dashboard Enablement Are Proven

The repository dist hash and Tampermonkey installed script hash both equal:

```text
ec53876ecda67f51d92faa3d7af6679d4d3b3e04aa65ac48af6ac6f420ae7aa2
```

`dist/installed-browser-hash.json` records `Bilibili QoL Core` version `0.3.11`
with the expected match rules. `dist/tampermonkey-dashboard-diagnostic.json`
records `targetScriptPresent=true` and `targetScriptEnabled=true` at
`2026-06-11T05:22:44.533Z`.

This proves installed bytes and dashboard enablement. It does not by itself
prove injection into each already-open or newly-open sample page.

### F3 - Runtime Mounted In The Isolated Profile Before Sampling

The script was not globally dead in the isolated profile. After enablement,
`config/config-snapshot-after-label-mode.json` captured the script panel DOM on
`https://www.bilibili.com/` at `2026-06-11T05:25:16.475Z`, with
`enabled=true`, `dynamicFilterMode=label`, and `commentFilterMode=label`.

`storage/storage-before-summary.json` also reports `managerPresent=true` on
`https://www.bilibili.com/` at `2026-06-11T05:25:57.329Z`.

Therefore the issue is narrower than "Tampermonkey did not load the installed
script anywhere in the isolated profile."

### F4 - Per-Sample Post-Enable Navigation Is Not Proven Strongly Enough

Sample operator notes start after enablement:

- `comment-goods-01`: `2026-06-11T05:31:27.139Z`
- `comment-negative-ordinary-01`: `2026-06-11T05:31:56.409Z`
- `dynamic-goods-01`: `2026-06-11T05:32:25.678Z`
- `dynamic-negative-ordinary-01`: `2026-06-11T05:32:43.928Z`

The page-state files were captured after these starts and show `readyState =
complete`, so the page observations happened after dashboard enablement.

The missing proof is more specific: the bundle does not retain a per-sample
navigation or reload event proving that each frozen URL was loaded after the
script was enabled and after any domain permission prompts were settled. If a
sample tab was opened during scout or URL freeze while the target script was
absent/disabled, then observing that tab later would produce exactly this kind
of no-mount evidence unless the page was reloaded.

### F5 - Metadata Match Rules Cover The Frozen URLs

`dist/bilibili-qol-core.user.js` declares:

```text
@match https://www.bilibili.com/*
@match https://t.bilibili.com/*
```

The frozen video URLs are under `https://www.bilibili.com/video/...`; the dynamic
URLs are under `https://t.bilibili.com/...`.

Runtime gating also covers these URLs: `src/utils/page.ts` includes both
`www.bilibili.com` and `t.bilibili.com` in `SUPPORTED_HOSTS`, treats
`/video/...` as `video`, and treats `t.bilibili.com/...` as `dynamic`.

Conclusion: there is no current metadata or runtime URL-support clue explaining
the no-mount result.

### F6 - Site Permission Evidence Is Insufficient For Both Domains

`profile/tampermonkey-connect-permission-proof.json` records:

```text
action = always_allow_current_domain
scope = current requested domain only
didNotSelect = always_allow_all_domains
```

This is privacy-preserving, but it omits which domain was granted. The sample
`permission-events.json` files are empty, and no artifact proves independent
permission readiness for both `www.bilibili.com` and `t.bilibili.com` before
sample-page load.

The homepage panel proves at least one `www.bilibili.com` context could run the
script. It does not prove the dynamic domain permission, and it does not prove
that the video sample tabs were loaded after the permission state was ready.

Conclusion: `@match` coverage is sufficient; retained site/extension permission
proof is not sufficient.

### F7 - Page-State Probe Likely Did Not Miss A Mounted Runtime

Each required sample page loaded its surface but had no QoL Core runtime markers:

- `userScript.bsbNodeCount=0`
- `userScript.panelMounted=false`
- `configDynamicFilterMode=null`
- `configCommentFilterMode=null`
- `commentEvidence.processedCount=0`
- `dynamicEvidence.processedCount=0`

The probe was not relying only on badge absence. It checked independent markers:
panel mount, config visibility, processed markers, badges and hidden counts.
Because the panel is mounted by the main controller on supported pages, and the
homepage evidence proves those panel markers are observable when the script
mounts, the sample-page result should be read as "QoL Core not mounted on those
pages," not as "badge selector missed a successful injection."

The current probe still cannot separate two lower-level causes:

- Tampermonkey/Safari did not inject the userscript into that page context.
- The userscript entered but failed before mounting DOM markers.

That distinction requires an additional page-context runtime sentinel in the
next method.

### F8 - No Current Source-Level Runtime Bug Is Verified

The available code path supports the sample URLs:

- `src/main.ts` boots only in top-level windows and supported locations.
- `src/utils/page.ts` supports both sampled host families.
- `src/runtime/lifecycle.ts` starts on initial boot and again on `pageshow`.
- `src/ui/panel.ts` has stable `.bsb-tm-panel` / `data-bsb-*` markers.

No retained evidence shows a thrown bootstrap error, console error, script syntax
failure, unsupported URL branch, or dist/package drift. The script mounted on
the isolated `www.bilibili.com/` homepage shortly before sample navigation.

Conclusion: do not open an implementation investigation yet. Open one only if a
method-fixed isolated retry proves all of the following at the same time:

- target script enabled before sample navigation;
- permission readiness for the exact sample domain;
- hard reload or fresh direct navigation after enablement;
- `@match` still covers the final observed URL;
- page-context sentinel proves the userscript entered but failed before panel or
  controller mount.

## Required Answers

| Question | Answer |
| --- | --- |
| `login_proof_sanitized=false` summary bug or evidence defect? | Summary metadata bug. The login proof is sanitized; no concrete forbidden finding was retained. |
| Tampermonkey enabled before sample pages loaded/reloaded? | Enabled before the sample pass, but the bundle does not prove each sample page was loaded or reloaded after enablement. |
| `www.bilibili.com` and `t.bilibili.com` permissions sufficient? | Userscript `@match` is sufficient. Retained Safari/Tampermonkey permission evidence is insufficient for both domains. |
| Userscript `@match` / `@include` cover frozen URLs? | Yes. `www.bilibili.com/*` covers the video samples and `t.bilibili.com/*` covers the dynamic samples. |
| Could page-state probe misjudge? | Unlikely for mounted runtime; it checked panel/config/processed markers, not only badges. It cannot distinguish no injection from early bootstrap failure. |
| Runtime injection bug clues? | No verified source-level runtime bug. Current evidence points first to method/permission/reload proof gaps. |

## Minimal Method Repair For Retry

A new isolated-profile retry should be authorized only with these additions:

1. Keep the same isolated profile and privacy gates. Do not use a personal
   profile.
2. After target-script enablement, capture a sanitized `enabledAt` timestamp.
3. For each host class before sampling, prove permission readiness with a
   domain label only: `www.bilibili.com` and `t.bilibili.com`. Do not save raw
   request URLs, cookies, headers or account values.
4. Open each frozen sample URL by fresh direct navigation or hard reload after
   both `enabledAt` and domain permission readiness. Record only:
   `navigationStartedAfterEnabled=true`, `navigationType`, `readyState`,
   sanitized origin/path, and timestamp.
5. Add a page-context runtime sentinel to the safe page-state probe. Prefer a
   count/boolean-only check for existing bridge markers, such as whether the
   native request guard page-context flag or snapshot event responds. This
   remains method-only; do not change `src/`.
6. If sentinel absent and panel absent, classify as extension injection /
   permission / reload failure.
7. If sentinel present but panel/config absent, stop and route to
   `NEEDS_IMPLEMENTATION_INVESTIGATION` with the exact page-state artifact.
8. If panel/config present, proceed with the existing label-only sample checks
   and storage summaries.

## Exit Matrix

| Exit | Decision |
| --- | --- |
| `RETRY_WITH_METHOD_FIX` | Selected. Exact minimal fixes are available and preserve G4 privacy/profile gates. |
| `NEEDS_TAMPERMONKEY_PERMISSION_FIX` | Not selected as the sole exit, but permission proof is a required method fix. |
| `ACCEPT_NOT_VERIFIED_AND_CLOSE` | Not selected. The installed runtime mounted on homepage, so a narrower corrected retry can still answer the target. |
| `NEEDS_IMPLEMENTATION_INVESTIGATION` | Not selected now. No verified runtime bug clue survives the method gaps. |
| `NO-GO` | Not selected. Privacy/profile constraints remain satisfiable. |

## Verification

- `git diff --check` passed.
- No `src/`, repository `dist/`, `package.json`, or `package-lock.json` diff was present.
- `git branch --contains 69194bc` returned only `codex/panel-choice-menu-version`.
- Private asset boundary check returned empty.
- Forbidden wording, where present in source governance docs, remains in
  prohibition or denial context only and is not used here as a positive claim.
