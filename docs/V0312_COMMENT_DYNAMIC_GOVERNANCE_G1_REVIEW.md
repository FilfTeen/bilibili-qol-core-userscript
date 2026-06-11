# V0312 Comment / Dynamic Governance G1 Review

This document is the main-thread G1 review for `docs/V0312_COMMENT_DYNAMIC_SAMPLE_GOVERNANCE_DESIGN.md`.

It is not a sampling report, implementation task, release acceptance record, or runtime release authorization.

## Verdict

`G1 PASS WITH CAVEAT`

The research design is accepted as the governance boundary for a future comment / dynamic evidence lane. It correctly keeps the goal as sample governance and false-positive protection, not recognition expansion.

The design is not sufficient to authorize immediate Safari capture because it does not yet provide a concrete sample URL manifest, target dist hash, profile setup/recovery instructions, or per-sample capture order. The next gate must be a docs-only sampling manifest / capture-plan thread, not Safari execution.

## Evidence Reviewed

- `docs/V0312_COMMENT_DYNAMIC_SAMPLE_GOVERNANCE_DESIGN.md`
- Current git state and private asset boundary checks
- Current engineering index
- Existing comment / dynamic references in project docs, source and tests

## Accepted Boundaries

- Future comment / dynamic work remains an evidence / governance lane.
- No implementation is authorized.
- No new recognition rule is authorized.
- No filtering aggressiveness increase is authorized.
- No release, tag, version bump, dist rebuild, integration or Safari acceptance is authorized.
- MBGA remains out of scope.
- Dynamic samples are adjacent capability evidence and cannot prove video-page Local Learning closure.
- Current-profile write-touching samples are blocked unless the main thread first approves a stronger restore policy.

## Findings

### F1 - Governance design preserves privacy boundaries

The design blocks raw comment text, comment hash details, UID, username, avatar, cookie, token, request headers, raw API responses and raw storage dumps. It also treats "raw text needed for explanation" as `Blocked`, which is the correct evidence standard for this project.

### F2 - Local Learning pollution risk is correctly separated

The design distinguishes non-writing observation from write-capable samples and defaults write-touching evidence to an isolated Safari/Tampermonkey profile. This prevents a repeat of current-profile ambiguity seen in earlier Local Learning work.

### F3 - Surface taxonomy is usable for later audit

The design separates `comment`, `reply`, `dynamic` and `space_home_adjacent`, and prevents dynamic or adjacent card observations from being recast as video-page persistence evidence.

### F4 - Tests are not overclaimed as Safari evidence

The design correctly states that implementation and unit tests can justify expected observations but cannot prove current Safari DOM behavior or logged-in privacy cleanliness.

### F5 - Immediate capture remains premature

The document lacks:

- concrete sample URL manifest;
- target dist hash;
- isolated profile setup and reset details;
- exact sample order;
- per-sample screenshot/page-state/storage-summary filenames;
- redaction/privacy scan procedure;
- final output directory contract.

Those omissions are acceptable for G1 research, but they block direct Safari sampling.

## Main-Thread Decision

Accepted exit:

`READY_FOR_SAMPLING_PLAN_REVIEW`

Not accepted yet:

`READY_FOR_SAFARI_CAPTURE`

The next task must produce a concrete sampling manifest and capture plan. Only after the main thread reviews that plan can a Safari main-window sampling thread be authorized.

## Next Thread Authorization

`V0312 Comment/Dynamic Sampling Manifest Design` is authorized as a docs-only research/planning thread.

It must remain narrower than Safari capture and must not collect live samples.

## Forbidden Wording

Do not write:

- `comment/dynamic Safari sampling verified`;
- `organic comment scanning verified`;
- `comment feedback lock closure verified`;
- `dynamic samples prove Local Learning closure`;
- `false positives ruled out broadly`;
- `recognition accuracy improved`;
- `v0.3.12 runtime release acceptance`.

## Status

`V0312 Comment/Dynamic Sample Governance Design` is closed at G1.

The broader `V0312 Comment/Dynamic Sample Governance` task remains active and moves to sampling manifest design.
