# V0312 Comment / Dynamic Injection Audit G6 Decision

This document is the main-thread decision after reviewing:

```text
docs/V0312_COMMENT_DYNAMIC_ISOLATED_INJECTION_AUDIT.md
```

It is not a final evidence report, implementation task, release acceptance record, or runtime release authorization.

## Verdict

`AUDIT ACCEPTED - RETRY_WITH_METHOD_FIX`

The main thread accepts the audit conclusion. The isolated-profile retry did not verify comment or dynamic behavior, but the injection-failure evidence is not strong enough to close the target as final `NOT_VERIFIED`.

The current failure is best treated as a capture-method / permission / reload-proof gap. A further retry is authorized only if it records the missing method proofs that were absent from the previous run.

## Accepted Audit Findings

- `summary.json` setting `hard_gates.login_proof_sanitized=false` is a summary metadata bug, not a concrete privacy evidence defect. The login proof file itself is sanitized.
- The installed userscript hash matched the target dist hash.
- Tampermonkey dashboard evidence proves the script was enabled before the sample pass, but does not prove each frozen sample page was loaded or reloaded after enablement.
- `dist/bilibili-qol-core.user.js` metadata covers both sample host classes:

```text
@match https://www.bilibili.com/*
@match https://t.bilibili.com/*
```

- Runtime page support also covers video and dynamic URLs.
- The script mounted in the isolated profile on `https://www.bilibili.com/` before sampling, so the failure is narrower than isolated-profile total failure.
- Retained permission evidence does not prove both `www.bilibili.com` and `t.bilibili.com` were ready before loading their sample pages.
- The page-state probe likely did not miss a mounted runtime; panel, config and processed markers were all absent.
- No implementation investigation is authorized yet because no retained evidence proves a runtime bootstrap bug.

## Main-Thread Decision

The active `V0312 Comment/Dynamic Sample Governance` lane remains open.

Next authorized thread:

```text
V0312 Comment/Dynamic Safari Capture - Method-Fixed Isolated Retry
```

This is still a Safari main-window evidence capture continuation, not a new feature target, implementation task, release path, integration task or MBGA task.

## Method-Fixed Retry Instructions

Thread name:

```text
V0312 Comment/Dynamic Safari Capture - Method-Fixed Isolated Retry
```

Thread status:

```text
APPROVED TO START - METHOD-FIXED ISOLATED SAFARI CAPTURE ONLY
```

Goal:

Run one corrected isolated-profile Safari capture that proves, per sample, whether QoL Core injects and mounts after target-script enablement, per-domain permission readiness and post-enable navigation/reload.

Target dist:

```text
dist/bilibili-qol-core.user.js
sha256: ec53876ecda67f51d92faa3d7af6679d4d3b3e04aa65ac48af6ac6f420ae7aa2
version metadata: 0.3.11
```

### Required Setup

- Use only the isolated Safari/Tampermonkey profile named `Codex V0312 Comment Dynamic Clean`.
- Do not use the user's personal profile.
- Do not use current-profile write-capable sampling.
- Before scout, ensure the target userscript is absent or disabled for the scout phase.
- Close or ignore old sample tabs from previous runs unless they are reloaded after the method-fixed enablement point.
- Preserve the existing no-raw-text, no-identity, no-cookie, no-token, no-header, no-raw-storage policy.

### Required Proofs

The next evidence run must include:

- sanitized profile proof;
- sanitized login proof;
- target dist hash and installed script hash proof;
- `enabledAt` timestamp captured after target-script enablement;
- per-domain permission readiness proof using domain labels only:
  - `www.bilibili.com`;
  - `t.bilibili.com`;
- per-sample navigation proof showing the page was freshly loaded or hard reloaded after both `enabledAt` and permission readiness for that sample domain;
- per-sample page-state proof with:
  - sanitized origin/path;
  - `navigationStartedAfterEnabled=true`;
  - `permissionReadyBeforeNavigation=true`;
  - `readyState`;
  - `bsbNodeCount`;
  - panel/config presence;
  - processed marker counts;
  - badge counts;
  - hidden counts;
  - a method-only page-context sentinel result.

The page-context sentinel must not require source-code changes. It may use only existing page-visible markers, bridge/snapshot flags or boolean/count probes already exposed by the current dist. If no safe sentinel exists, record `sentinel_unavailable` and explain why.

### Sample Rules

- Prefer the same four frozen samples from the previous isolated run unless a page is inaccessible.
- If a replacement sample is required, freeze its sanitized URL before target-script enablement and explain the replacement.
- Dynamic samples remain adjacent capability evidence only. They must not be used to prove video-page Local Learning closure.
- Label-only mode remains required.
- Hide-mode evidence remains forbidden.

### Stop Conditions

Stop and return a clear `BLOCKED_*` or `NOT_VERIFIED_*` status if:

- isolated login cannot be proven with sanitized fields;
- the target script is enabled before URL freeze;
- installed hash does not match target dist;
- permission readiness cannot be shown for the relevant domain before sample navigation;
- fresh post-enable navigation/reload cannot be proven;
- any required evidence would need raw comment text, raw dynamic text, identity values, cookies, tokens, request headers, raw API response or raw storage dump;
- negative sample shows unsafe badge/write;
- cleanup cannot be proven after a write;
- the thread needs personal-profile fallback.

### Exit Matrix

- `VERIFIED_WITH_CAVEAT`: panel/config injects, sample checks complete, privacy/storage boundaries hold, and verdicts are supported by per-sample evidence.
- `PARTIAL`: inject/mount is proven for only some required sample classes, with clear per-sample caveats.
- `NOT_VERIFIED_INJECTION_ABSENT`: permission and reload proofs are complete, sentinel and panel remain absent, and no runtime entry can be observed.
- `NEEDS_IMPLEMENTATION_INVESTIGATION`: permission and reload proofs are complete, page-context sentinel indicates runtime entry, but panel/config/controller markers fail to mount.
- `BLOCKED_*`: a gate fails before meaningful sampling.
- `NO-GO`: privacy or profile constraints cannot be satisfied.

## Forbidden

- no personal-profile fallback;
- no implementation;
- no `src/`, `dist/`, `package.json` or `package-lock.json` changes;
- no raw comment text, dynamic text, comment hash details, UID, username, avatar, cookies, tokens, request headers, raw API responses or persistent raw storage dumps;
- no screenshots unless a later main-thread instruction explicitly authorizes fully redacted screenshots;
- no integration, release/preflight, version bump, dist rebuild, tag, release, push or MBGA work.

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
- `runtime injection bug confirmed`;
- `v0.3.12 runtime release acceptance`;
- `recognition accuracy improved`.

These strings may appear only as forbidden wording examples in governance documents.

## Status

`V0312 Comment/Dynamic Isolated Injection Failure Audit` is accepted.

The broader `V0312 Comment/Dynamic Sample Governance` task remains active and moves to one method-fixed isolated Safari capture retry.
