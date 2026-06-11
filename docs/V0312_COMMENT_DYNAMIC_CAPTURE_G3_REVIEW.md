# V0312 Comment / Dynamic Capture G3 Review

This document is the main-thread review for the first `V0312 Comment/Dynamic Safari Capture - Isolated Profile` evidence bundle.

It is not a final evidence report, implementation task, release acceptance record, or runtime release authorization.

## Verdict

`PARTIAL - POLICY DEVIATION / AUDIT REQUIRED`

The capture bundle is accepted as a personal-profile exploratory evidence package, not as the originally authorized isolated-profile Safari capture.

The original isolated profile condition was not met because the clean profile could not complete logged-in sampling. The later personal-profile path was user-authorized, but the target userscript was already enabled before sample URL freeze. That violates the original capture contract and prevents this run from being treated as `READY_FOR_SAFARI_CAPTURE` fulfillment.

## Evidence Directory

```text
output/v0312-comment-dynamic-sampling/v0312-comment-dynamic-safari-personal-authorized-20260611-004905/
```

Primary evidence:

- `summary.json`
- `sample-url-manifest.json`
- `sample-classification.csv`
- `privacy/privacy-scan.txt`
- `privacy/privacy-scan-review.md`
- `storage/cleanup-compare.json`
- `dist/installed-hash-compare.txt`
- `dist/installed-browser-hash-personal.json`
- `login/safari-main-window-login-proof.json`
- `profile/profile-policy-caveat.md`

## Accepted Facts

- Target dist SHA-256 matched the installed Tampermonkey script hash.
- Installed script metadata version remained `0.3.11`.
- Safari main-window login proof was captured with boolean / presence-only fields.
- Privacy scan review states no raw comment text, UID values, username values, avatar values, cookies, tokens, request headers, raw API responses, raw storage dumps or screenshots were retained.
- No sample write was proven, so no destructive restore was performed.
- The run did not modify `src/`, repository `dist/`, `package.json` or `package-lock.json`.

## Blocking Caveats

### C1 - Not isolated-profile acceptance

The run used a user-authorized personal Safari profile. This is outside the original isolated-profile-only authorization. It cannot prove isolated-profile behavior, clean-profile causality, or clean-profile restore.

### C2 - URL freeze contract was violated

The target script was already enabled before sample URL freeze in the personal profile. Therefore the run cannot prove that sample selection was independent of target-script execution.

### C3 - Storage proof is not available

The storage summaries are intentionally `not_checked` because raw personal-profile storage was not exported. That protects user data, but it also means the run cannot prove before/after storage absence, write causality, feedback lock stability, or non-sample equality.

### C4 - UI evidence is count-based only

No screenshots were retained. Page-state JSON gives useful count/boolean evidence, but it cannot support strong UI layout claims or badge-placement claims.

### C5 - Positive samples did not verify target behavior

`comment-goods-01` and `dynamic-goods-01` were `Not Verified`. The negative comment sample is at most `Partial` because it observed no unsafe badge/write under personal-profile caveats, without storage proof.

## Main-Thread Decision

Accepted for independent audit:

`V0312 Comment/Dynamic Evidence Audit - Personal PARTIAL Capture`

Not accepted:

- `READY_FOR_FINAL_EVIDENCE`
- `READY_FOR_DOCS_CLOSURE`
- `READY_FOR_RELEASE`
- `isolated-profile capture passed`
- `organic comment scanning verified`
- `comment feedback lock closure verified`
- `dynamic samples verified`
- `broad false-positive safety verified`

The independent audit must decide whether this PARTIAL bundle is useful enough to preserve as a caveated evidence artifact, whether it should be followed by a revised isolated-profile capture attempt, or whether the task should be downgraded / paused.

## Next Thread Authorization

The audit thread is authorized to start.

Scope:

- Review the evidence bundle listed above.
- Recompute or independently verify target dist hash proof where possible without saving raw installed source in public docs.
- Check whether privacy scan false positives are correctly classified.
- Check whether sample verdicts match page-state and classification evidence.
- Check whether personal-profile deviation requires `BLOCK`, `PARTIAL`, or `PASS WITH CAVEAT`.
- Recommend one of:
  - `ACCEPT_PARTIAL_AND_CLOSE_WITH_CAVEAT`;
  - `RETRY_ISOLATED_PROFILE_CAPTURE`;
  - `NEEDS_POLICY_TIGHTENING`;
  - `NO-GO`.

Non-goals:

- no resampling;
- no Safari operation;
- no implementation;
- no release/preflight;
- no integration;
- no MBGA work.

## Forbidden Wording

Do not write:

- `comment/dynamic Safari sampling verified`;
- `organic comment scanning verified`;
- `comment feedback lock closure verified`;
- `dynamic samples prove Local Learning closure`;
- `false positives ruled out broadly`;
- `recognition accuracy improved`;
- `v0.3.12 runtime release acceptance`;
- `isolated profile capture passed`.

These strings may appear only as forbidden wording examples in governance documents.

## Status

`V0312 Comment/Dynamic Safari Capture - Isolated Profile` is not closed as a pass.

The broader `V0312 Comment/Dynamic Sample Governance` task remains active and moves to independent evidence audit.
