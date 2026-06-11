# V0312 Comment / Dynamic Method-Fixed Capture G7 Review

This document is the main-thread review for the method-fixed isolated Safari retry.

It is not a final evidence report, implementation task, release acceptance record, or runtime release authorization.

## Verdict

`BLOCKED_ACCEPTED - PERMISSION / INJECTION READINESS NOT PROVEN`

The method-fixed retry satisfied the main-thread requirement to stop before invalid sample collection. It did not verify comment or dynamic behavior, and it did not produce a runtime bug proof.

The run failed before sample navigation because `www.bilibili.com` permission / injection readiness could not be proven after target-script enablement and fresh direct navigation. Since the first required host gate failed, `t.bilibili.com` and the four required samples were not meaningfully sampled.

## Evidence Location Note

The evidence was produced in a repo-external Codex worktree output directory, not in the current main workspace `output/` tree.

Use the run id for cross-thread reference:

```text
v0312-comment-dynamic-safari-method-fixed-20260611-090909
```

Do not publish absolute local worktree paths in public docs. If a later audit thread needs the exact local path, the main thread can provide it in the private thread handoff.

## Accepted Facts

- The run used the isolated Safari/Tampermonkey profile `Codex V0312 Comment Dynamic Clean`.
- No personal-profile fallback was used.
- Sanitized login proof reported `isLogin=true` and did not retain identity values, cookies, tokens, headers or raw responses.
- The target dist SHA-256 and installed Tampermonkey script SHA-256 matched:

```text
ec53876ecda67f51d92faa3d7af6679d4d3b3e04aa65ac48af6ac6f420ae7aa2
```

- The capture reset order was corrected: target script disabled, sample manifest frozen, target script enabled after freeze, dashboard readback confirmed enabled.
- `enabledAt` was recorded as:

```text
2026-06-11T09:17:27.706Z
```

- `www.bilibili.com` was opened by fresh direct navigation after `enabledAt`.
- The post-navigation readiness page state reported:
  - `readyState=complete`;
  - `sentinelPresent=false`;
  - `panelMounted=false`;
  - `configPresent=false`.
- The run stopped before the four required samples.
- Storage final status was `not_checked_no_sample_navigation`; no storage write, restore or cleanup proof is claimed.
- Privacy scan reported `0` concrete forbidden findings.
- No `src/`, repository `dist`, `package.json` or `package-lock.json` changes were made.

## Main-Thread Findings

### F1 - The blocker is valid

The thread followed the G6 stop condition. It did not proceed to sample pages after failing to prove `www.bilibili.com` readiness.

That is the correct behavior. Proceeding would have repeated the prior evidence flaw by collecting badge absence without script exposure.

### F2 - This is not functional evidence

All four sample rows are `BLOCKED_NOT_SAMPLED`. Therefore this bundle does not verify:

- comment goods labeling;
- comment negative safety;
- dynamic goods labeling;
- dynamic negative safety;
- organic comment scanning;
- comment feedback lock behavior;
- Local Learning write or cleanup.

### F3 - This is not yet implementation evidence

The method sentinel was absent and the panel/config markers were absent. Under the G6 exit matrix, that remains an injection / permission / reload readiness failure, not proof that runtime entered and then failed before panel mount.

Do not open an implementation thread from this bundle.

### F4 - Further capture has low expected value without a new permission method

The main thread does not authorize another Safari retry on the same method. A future retry would need a materially stronger Tampermonkey/Safari permission-readiness method, not another repetition of the current sequence.

### F5 - Current target should move toward blocked closure

The `V0312 Comment/Dynamic Sample Governance` task has already produced:

- governance design;
- manifest design;
- personal-profile exploratory partial evidence;
- isolated-profile retry evidence;
- injection failure audit;
- method-fixed isolated blocker evidence.

The remaining question is not whether to keep sampling immediately, but whether the current target should close as `Blocked / Not Verified` with clear future prerequisites.

## Main-Thread Decision

Do not authorize further Safari capture now.

Next authorized thread:

```text
V0312 Comment/Dynamic Method-Fixed Blocker Evidence Audit
```

This is a read-only evidence audit and closure recommendation thread. It must not operate Safari, resample, modify runtime code, modify dist, alter package files, push, tag, release or start integration.

## Next Thread Instructions

Thread name:

```text
V0312 Comment/Dynamic Method-Fixed Blocker Evidence Audit
```

Thread status:

```text
APPROVED TO START - READ-ONLY BLOCKER AUDIT / CLOSURE RECOMMENDATION
```

Goal:

Audit the method-fixed isolated retry and recommend whether the broader `V0312 Comment/Dynamic Sample Governance` target should close as blocked/not verified, require one more materially different method, or route to implementation investigation.

Required inputs:

- `docs/V0312_COMMENT_DYNAMIC_SAMPLE_GOVERNANCE_DESIGN.md`
- `docs/V0312_COMMENT_DYNAMIC_SAMPLING_MANIFEST_PLAN.md`
- `docs/V0312_COMMENT_DYNAMIC_CAPTURE_G3_REVIEW.md`
- `docs/V0312_COMMENT_DYNAMIC_EVIDENCE_AUDIT.md`
- `docs/V0312_COMMENT_DYNAMIC_AUDIT_G4_DECISION.md`
- `docs/V0312_COMMENT_DYNAMIC_ISOLATED_RETRY_G5_REVIEW.md`
- `docs/V0312_COMMENT_DYNAMIC_ISOLATED_INJECTION_AUDIT.md`
- `docs/V0312_COMMENT_DYNAMIC_INJECTION_AUDIT_G6_DECISION.md`
- `docs/V0312_COMMENT_DYNAMIC_METHOD_FIXED_CAPTURE_G7_REVIEW.md`
- evidence run id `v0312-comment-dynamic-safari-method-fixed-20260611-090909`

The main thread will provide the exact local worktree evidence path privately if needed. Do not write absolute local paths into public docs.

Required audit questions:

- Does the method-fixed evidence support `BLOCKED_PERMISSION_READY_NOT_PROVEN`?
- Was the run correct to stop before sample navigation?
- Are all sample rows properly treated as `BLOCKED_NOT_SAMPLED` rather than `Not Verified` functional evidence?
- Does any artifact show page-context runtime entry that would justify `NEEDS_IMPLEMENTATION_INVESTIGATION`?
- Did the run preserve the privacy boundary?
- Does repo-external worktree evidence require a currentness caveat in final docs?
- Should the broader target close as `ACCEPT_BLOCKED_AND_CLOSE`, or is there a genuinely different last method worth trying?

Allowed write:

- `docs/V0312_COMMENT_DYNAMIC_METHOD_FIXED_BLOCKER_AUDIT.md`

Allowed exits:

- `ACCEPT_BLOCKED_AND_CLOSE`: if the blocker is valid and no further immediate capture is justified.
- `NEEDS_LAST_METHOD_RETRY`: only if the audit identifies a materially stronger, privacy-safe permission-readiness method that has not already been tried.
- `NEEDS_IMPLEMENTATION_INVESTIGATION`: only if evidence shows runtime entry but panel/config/controller mount failure.
- `NO-GO`: if privacy or profile constraints cannot be satisfied.

Forbidden:

- no Safari operation or resampling;
- no personal-profile fallback;
- no implementation;
- no `src/`, `dist`, `package.json` or `package-lock.json` changes;
- no raw comment text, dynamic text, comment hash details, identity values, cookies, tokens, request headers, raw API responses or raw storage dumps;
- no screenshots;
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

`V0312 Comment/Dynamic Safari Capture - Method-Fixed Isolated Retry` is accepted as a valid blocked-method evidence bundle.

The broader `V0312 Comment/Dynamic Sample Governance` task remains active and moves to read-only blocker audit / closure recommendation.
