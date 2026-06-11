# V0312 Comment / Dynamic Audit G4 Decision

This document is the main-thread decision after reviewing `docs/V0312_COMMENT_DYNAMIC_EVIDENCE_AUDIT.md`.

It is not a final evidence report, implementation task, release acceptance record, or runtime release authorization.

## Verdict

`AUDIT ACCEPTED - RETRY_ISOLATED_PROFILE_CAPTURE`

The main thread accepts the audit conclusion. The personal-profile evidence bundle is useful as a caveated exploratory artifact, but it does not close the original isolated-profile capture objective.

## Accepted Audit Findings

- Installed hash proof is sufficient only for personal-profile installed-dist identity.
- Personal-profile fallback blocks the original isolated-profile contract.
- URL freeze violation blocks sample-selection independence and positive causality.
- Privacy scan false positives are correctly classified; no retained raw text, identity value, cookie, token, request header, raw API response, raw storage dump or screenshot was found by audit.
- `comment-goods-01` and `dynamic-goods-01` remain `Not Verified`.
- `comment-negative-ordinary-01` is only narrow personal-profile `Partial`.
- `dynamic-negative-ordinary-01` was not sampled and has an invalid evidence path in the personal-profile bundle.
- Storage `not_checked` must not be interpreted as no-write or restore proof.

## Main-Thread Decision

The active `V0312 Comment/Dynamic Sample Governance` lane remains open.

Next action:

`V0312 Comment/Dynamic Safari Capture - Isolated Profile Retry`

This retry is a continuation of the Safari capture lane, not a new product target and not a release path.

## Retry Preconditions

Before target-script exposure on sample pages:

- Use only the isolated Safari/Tampermonkey profile named `Codex V0312 Comment Dynamic Clean`.
- The user must complete any Bilibili login manually in that isolated profile if login is required.
- The capture thread must prove login using sanitized boolean / presence fields.
- The target userscript must be absent or disabled during scout.
- Exact sanitized sample URLs must be frozen before the target script is enabled on those sample pages.
- If isolated login cannot be proven, return `BLOCKED_NOT_LOGGED_IN`.
- If the target script is already enabled before URL freeze, return `BLOCKED_PRE_FREEZE_SCRIPT_ENABLED`.
- Do not fall back to the user's personal profile.

## Retry Scope

Allowed:

- isolated Safari main-window capture;
- target dist install / hash proof;
- redacted page-state and diagnostic evidence;
- aggregate isolated-profile storage summaries;
- label-only core samples;
- dynamic evidence as adjacent UI only.

Forbidden:

- personal-profile fallback;
- current-profile write-capable sampling;
- raw comment text;
- comment hash detail;
- UID, username, avatar or profile identity values;
- cookie, token, request header or raw API response capture;
- raw storage dump persistence;
- screenshots unless fully redacted and manually reviewed;
- hide-mode evidence;
- implementation, integration, release/preflight, version bump, dist rebuild, tag or release;
- MBGA work.

## Required Retry Outputs

The retry evidence must use a fresh run directory:

```text
output/v0312-comment-dynamic-sampling/<new-isolated-run-id>/
```

Required artifacts:

- `summary.json`
- `sample-url-manifest.json`
- `sample-classification.csv`
- `sample-classification.md`
- `dist/installed-hash-compare.txt`
- sanitized login proof
- profile setup proof
- config snapshots
- storage before/final/cleanup summaries
- privacy scan and redaction log
- per-sample page-state and operator notes
- explicit `BLOCKED_*` status if a gate fails

## Stop Conditions

Stop and return `BLOCKED` if:

- isolated profile cannot log in without exposing identity values;
- target script is not absent/disabled during scout;
- sample URLs are not frozen before enabling target script on sample pages;
- installed hash does not match the target dist hash;
- any artifact would need raw comment text or identity values;
- storage summary requires persistent raw storage dump;
- cleanup fails after any write;
- negative sample triggers unsafe badge or write;
- dynamic evidence is being used to support video-page Local Learning closure.

## Status

`V0312 Comment/Dynamic Evidence Audit - Personal PARTIAL Capture` is accepted.

The broader `V0312 Comment/Dynamic Sample Governance` task remains active and moves to an isolated-profile retry.
