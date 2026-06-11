# V0312 Comment / Dynamic Isolated Retry G5 Review

This document is the main-thread review for the isolated-profile retry evidence bundle:

```text
output/v0312-comment-dynamic-sampling/v0312-comment-dynamic-safari-isolated-login-20260611-045945/
```

It is not a final evidence report, implementation task, release acceptance record, or runtime release authorization.

## Verdict

`NOT_VERIFIED - ISOLATED SCRIPT INJECTION FAILURE / AUDIT REQUIRED`

The retry corrected the earlier personal-profile policy deviation, but it did not verify comment or dynamic behavior.

The hard capture gates are accepted with one metadata caveat: the isolated profile was used, no personal-profile fallback was used, sanitized login proof exists, sample URLs were frozen before target-script enablement, scout observed the target script absent/disabled, and the installed Tampermonkey script hash matched the target dist hash.

However, all required sample pages reported that the target userscript was not exposed or mounted on the page. Since `bsbNodeCount=0`, the panel was absent, and the runtime config was unavailable on the sample pages, badge absence cannot be interpreted as either positive failure or negative-sample safety.

## Evidence Directory

Primary evidence:

- `summary.json`
- `sample-url-manifest.json`
- `sample-classification.csv`
- `sample-classification.md`
- `dist/installed-hash-compare.txt`
- `login/safari-main-window-login-proof.json`
- `profile/profile-setup-proof.json`
- `profile/tampermonkey-connect-permission-proof.json`
- `scout/pre-scout-target-script-state.json`
- `storage/storage-before-summary.json`
- `storage/storage-final-summary.json`
- `privacy/privacy-scan.json`
- per-sample `page-state.json` and `operator-notes.md`

## Accepted Facts

- The observed Safari/Tampermonkey profile was `Codex V0312 Comment Dynamic Clean`.
- No personal-profile fallback was used.
- Scout observed the target userscript absent or disabled before target-script exposure.
- Sample URLs were frozen before target-script enablement.
- The installed userscript SHA-256 matched the target dist SHA-256:

```text
ec53876ecda67f51d92faa3d7af6679d4d3b3e04aa65ac48af6ac6f420ae7aa2
```

- The sanitized login proof file records `code=0`, `isLogin=true`, Safari user-agent family, `webdriver=false`, and no included UID, username, avatar, raw response, cookie, token or request headers.
- Before sampling, the isolated local-learning panel summary reported `0` video records and `0` comment feedback locks.
- The privacy scan reports `0` concrete forbidden findings.
- The run did not modify `src/`, repository `dist/`, `package.json` or `package-lock.json`.

## Main-Thread Findings

### F1 - Retry fixed the original profile policy deviation

The previous personal-profile run could not satisfy the isolated-profile contract. This retry used the intended isolated profile and did not fall back to the user's personal profile.

### F2 - Login redaction is stronger than the summary metadata says

`summary.json` marks `hard_gates.login_proof_sanitized=false`, but `login/safari-main-window-login-proof.json` contains only boolean / presence fields and explicitly marks identity, cookie, token, raw response and request-header retention as false.

The main thread treats this as a summary metadata inconsistency that the next audit thread must call out. It is not currently a privacy blocker, but it prevents accepting the summary hard-gate block without qualification.

### F3 - Target script identity is verified, but page injection is not

The installed script hash proves the target dist was installed in Tampermonkey. It does not prove that the script injected into the four required Bilibili sample pages.

All required sample page states reported:

- `bsbNodeCount=0`;
- `panelMounted=false`;
- `configCommentFilterMode=null`;
- `configDynamicFilterMode=null`.

Therefore, the absence of badges, hidden items or writes is not causal evidence.

### F4 - Negative samples cannot be counted as false-positive safety

The negative comment and dynamic samples loaded their surfaces and had no visible badges or hiding. Since the target script was not exposed on those pages, these observations are only page-state observations, not QoL Core false-positive safety evidence.

### F5 - Storage final and cleanup remain not verified

The before state is useful and shows an empty isolated-profile local-learning panel. The final state was downgraded because the userscript panel was unavailable after the sample-page injection failure, and no raw storage dump was created.

Do not claim final storage equality, restore equality, no-write proof, or cleanup proof from this bundle.

## Main-Thread Decision

Do not retry Safari capture blindly.

The active `V0312 Comment/Dynamic Sample Governance` lane remains open, but it must move through a narrow injection-failure audit before any further capture is authorized.

Next authorized thread:

```text
V0312 Comment/Dynamic Isolated Injection Failure Audit
```

This is a read-only evidence audit / method-repair thread. It may write one docs-only report, but it may not operate Safari, resample, modify runtime code, change dist, change package files, push, tag, release or start integration.

## Next Thread Instructions

Thread name:

```text
V0312 Comment/Dynamic Isolated Injection Failure Audit
```

Thread status:

```text
APPROVED TO START - READ-ONLY EVIDENCE AUDIT / METHOD REPAIR ONLY
```

Goal:

Determine why the target dist was installed and enabled in the isolated Tampermonkey profile but was not exposed or mounted on the frozen Bilibili sample pages. Decide whether a further isolated-profile capture is warranted, whether the capture method needs tightening, or whether the target should close as `NOT_VERIFIED`.

Required inputs:

- `docs/V0312_COMMENT_DYNAMIC_SAMPLE_GOVERNANCE_DESIGN.md`
- `docs/V0312_COMMENT_DYNAMIC_SAMPLING_MANIFEST_PLAN.md`
- `docs/V0312_COMMENT_DYNAMIC_CAPTURE_G3_REVIEW.md`
- `docs/V0312_COMMENT_DYNAMIC_EVIDENCE_AUDIT.md`
- `docs/V0312_COMMENT_DYNAMIC_AUDIT_G4_DECISION.md`
- `docs/V0312_COMMENT_DYNAMIC_ISOLATED_RETRY_G5_REVIEW.md`
- `output/v0312-comment-dynamic-sampling/v0312-comment-dynamic-safari-isolated-login-20260611-045945/`

Required audit questions:

- Is the `login_proof_sanitized=false` summary field a summary metadata bug or a real evidence defect?
- Does the Tampermonkey dashboard evidence prove the script was enabled before navigating or reloading each sample page?
- Did the extension permission state cover `www.bilibili.com` and `t.bilibili.com` before sample-page load?
- Do the userscript metadata `@match` / `@include` rules cover the frozen sample URLs?
- Was each sample page loaded or reloaded after the target script became enabled?
- Could the page-state probes miss a mounted script, or do the diagnostic files also support true injection failure?
- Is the failure limited to the isolated profile, the dynamic domain, the video domain, or the capture method?
- Does any evidence suggest a runtime bug that would require a separate implementation thread, or is this a capture-method / extension-permission issue?

Allowed writes:

- `docs/V0312_COMMENT_DYNAMIC_ISOLATED_INJECTION_AUDIT.md`

Forbidden:

- no Safari operation or resampling;
- no personal-profile fallback;
- no code implementation;
- no `src/`, `dist/`, `package.json` or `package-lock.json` changes;
- no raw comment text, dynamic text, identity values, cookies, tokens, request headers, raw API responses or raw storage dumps;
- no screenshots unless a later main-thread instruction explicitly authorizes fully redacted screenshots;
- no integration, release/preflight, version bump, dist rebuild, tag, release, push or MBGA work.

Required exits:

- `RETRY_WITH_METHOD_FIX`: only if the audit can specify an exact minimal capture-method correction and preserve all G4 privacy/profile gates.
- `NEEDS_TAMPERMONKEY_PERMISSION_FIX`: if the likely issue is extension or site permission setup that must be corrected before retry.
- `ACCEPT_NOT_VERIFIED_AND_CLOSE`: if evidence is sufficient to close the target as not verified without another capture.
- `NEEDS_IMPLEMENTATION_INVESTIGATION`: if a plausible runtime injection bug exists, with exact source/metadata clues and no implementation authorization.
- `NO-GO`: if privacy or profile constraints cannot be satisfied.

## Forbidden Wording

Do not write:

- `comment/dynamic Safari sampling verified`;
- `organic comment scanning verified`;
- `comment feedback lock closure verified`;
- `dynamic samples prove Local Learning closure`;
- `false positives ruled out broadly`;
- `negative samples passed`;
- `sample badges absent therefore safe`;
- `storage restored`;
- `isolated capture passed`;
- `v0.3.12 runtime release acceptance`;
- `recognition accuracy improved`.

These strings may appear only as forbidden wording examples in governance documents.

## Status

`V0312 Comment/Dynamic Safari Capture - Isolated Profile Retry` is accepted as a useful `NOT_VERIFIED` injection-failure evidence bundle, not as functional evidence.

The broader `V0312 Comment/Dynamic Sample Governance` task remains active and moves to isolated injection-failure audit.
