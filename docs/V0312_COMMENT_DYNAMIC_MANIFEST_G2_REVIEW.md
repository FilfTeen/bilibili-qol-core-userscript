# V0312 Comment / Dynamic Manifest G2 Review

This document is the main-thread G2 review for `docs/V0312_COMMENT_DYNAMIC_SAMPLING_MANIFEST_PLAN.md`.

It is not a Safari capture report, implementation task, release acceptance record, or runtime release authorization.

## Verdict

`G2 PASS WITH CAVEAT`

The manifest plan is accepted as sufficient to create a tightly scoped Safari main-window capture thread. The acceptance is conditional: capture is allowed only in an isolated Safari/Tampermonkey profile, with exact sanitized sample URLs frozen before enabling the target userscript on any sample page.

The plan does not authorize current-profile write-capable sampling, hide-mode evidence, raw storage export, raw comment text capture, recognition rule changes, release wording, integration, version bump, dist rebuild, tag, or release.

## Target Dist For Capture

Current target dist:

```text
dist/bilibili-qol-core.user.js
```

Current target SHA-256:

```text
ec53876ecda67f51d92faa3d7af6679d4d3b3e04aa65ac48af6ac6f420ae7aa2
```

Current target size:

```text
562044 bytes
```

Current metadata version:

```text
0.3.11
```

This is still the `v0.3.11` runtime artifact. It does not create or imply a `v0.3.12` runtime release.

## Evidence Reviewed

- `docs/V0312_COMMENT_DYNAMIC_SAMPLE_GOVERNANCE_DESIGN.md`
- `docs/V0312_COMMENT_DYNAMIC_GOVERNANCE_G1_REVIEW.md`
- `docs/V0312_COMMENT_DYNAMIC_SAMPLING_MANIFEST_PLAN.md`
- current git state and private asset boundary checks
- current target dist hash, size and metadata header

## Accepted Conditions

Future Safari capture may proceed only if all of these remain true:

- isolated Safari/Tampermonkey profile only;
- user credentials are handled only by the user, not by the capture thread;
- exact sanitized sample URLs are frozen before enabling the target userscript on sample pages;
- scouting uses target userscript disabled or absent and stores only abstract features;
- installed Tampermonkey script hash equals target dist hash;
- login proof is boolean / presence-only and does not store identity values;
- core samples are label-only;
- no raw comment text, comment hash detail, UID, username, avatar, cookie, token, request header, raw API response or raw storage dump is saved;
- Local Learning and comment feedback summaries are aggregate / sample-state only;
- dynamic and space/home adjacent samples remain adjacent UI evidence only;
- any write is cleaned in the isolated profile, or the run stops as `Blocked`;
- privacy scan and manual screenshot review complete before reporting.

## Main Findings

### F1 - Manifest schema is audit-ready

The manifest defines stable sample ids, surface/page type separation, sanitized URL policy, abstract features, expected actions, local-learning touch, privacy grade, side-effect checks, evidence paths and verdict semantics. This is sufficient for a later audit thread to evaluate sampler output without trusting prose alone.

### F2 - Privacy policy remains strict

The plan blocks raw comments, comment hashes, identity values, request headers, raw API responses and raw storage dumps. It also requires screenshot redaction and a privacy scan with manual review.

### F3 - Current-profile writes remain blocked

The plan correctly downgrades current-profile write-capable sampling to `NEEDS_POLICY_TIGHTENING`. Main thread does not authorize current-profile writes.

### F4 - Capture is still not evidence until executed

The plan is a capture contract. It does not prove current Safari DOM behavior, organic comment scanning, comment feedback lock closure, dynamic false-positive safety, or Local Learning closure.

### F5 - Raw hash wording needs runtime discipline

The storage summary schema allows `rawSha256`, but the same plan forbids saved raw storage dumps. The future capture thread may compute hashes transiently, but it must not persist raw storage content. If this cannot be done safely, the digest must be omitted and cleanup proof downgraded.

## Main-Thread Decision

Accepted exit:

`READY_FOR_SAFARI_CAPTURE`

Scope is limited to:

- isolated-profile Safari main-window evidence;
- comment/dynamic UI and false-positive boundary sampling;
- possible isolated-profile Local Learning write/cleanup evidence only if it arises from approved comment samples;
- dynamic evidence as adjacent UI only.

Not accepted:

- current-profile write-capable sampling;
- hide-mode testing;
- raw restore equality;
- raw comment explanation samples;
- broad false-positive safety claims;
- runtime implementation or release path.

## Next Thread Authorization

`V0312 Comment/Dynamic Safari Capture - Isolated Profile` is authorized to start.

It must obey this review, the governance design and the manifest plan. It must return `BLOCKED` rather than lowering privacy or profile standards.

## Forbidden Wording

Do not write:

- `comment/dynamic Safari sampling verified`;
- `organic comment scanning verified`;
- `comment feedback lock closure verified`;
- `dynamic samples prove Local Learning closure`;
- `false positives ruled out broadly`;
- `recognition accuracy improved`;
- `v0.3.12 runtime release acceptance`.

These strings may appear only as forbidden wording examples in governance documents.

## Status

`V0312 Comment/Dynamic Sampling Manifest Design` is closed at G2.

The broader `V0312 Comment/Dynamic Sample Governance` task remains active and moves to isolated-profile Safari capture.
