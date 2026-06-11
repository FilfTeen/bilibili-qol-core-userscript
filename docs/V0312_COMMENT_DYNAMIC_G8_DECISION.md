# V0312 Comment / Dynamic G8 Decision

This document is the main-thread final decision for the `V0312 Comment/Dynamic Sample Governance` target.

It is not an implementation task, release acceptance record, runtime release authorization, integration signal, or MBGA task.

## Verdict

`BLOCKED_AND_CLOSED - NOT VERIFIED`

The main thread accepts `docs/V0312_COMMENT_DYNAMIC_METHOD_FIXED_BLOCKER_AUDIT.md` and closes the current target as `Blocked / Not Verified`.

The target produced useful governance, privacy, manifest and blocker evidence, but it did not verify comment or dynamic behavior in Safari main-window sampling.

## Accepted Final Findings

- The G1 governance design and G2 manifest design were useful and should be retained.
- The personal-profile evidence bundle is only exploratory `Partial`; it cannot satisfy the isolated-profile contract.
- The isolated-profile retry corrected the profile and URL-freeze policy, but target script exposure was not observed on the required sample pages.
- The injection-failure audit found no current basis for implementation work and recommended one method-fixed retry.
- The method-fixed retry corrected the reset order and proved target-script enablement, but stopped at the first host readiness gate because `www.bilibili.com` permission / injection readiness could not be proven after enablement and fresh navigation.
- The method-fixed blocker audit found no privacy-safe, non-repeating final capture method inside the current target.
- No source, dist, package, integration, release, tag, version bump, or MBGA work is authorized from this target.

## Final Capability State

Verified by this target:

- sample governance design;
- privacy protocol;
- manifest and evidence field design;
- target dist identity in the attempted Safari capture paths;
- isolated-profile blocker behavior;
- absence of retained concrete forbidden findings in the reported evidence summaries.

Not verified by this target:

- comment goods labeling in Safari;
- comment negative-sample safety in Safari;
- dynamic goods labeling in Safari;
- dynamic negative-sample safety in Safari;
- organic comment scanning;
- comment feedback lock closure;
- Local Learning write causality from comments;
- broad false-positive safety;
- hide-mode behavior;
- runtime implementation bug.

## Evidence Availability Caveat

The method-fixed run was produced in a repo-external Codex worktree output directory and is referenced publicly only by run id:

```text
v0312-comment-dynamic-safari-method-fixed-20260611-090909
```

Public docs must not include local absolute paths for that evidence. Final conclusions should cite the run id, G7 accepted facts, and the blocker audit's sanitized-metadata review, not a public local path.

## Main-Thread Decision

The current `V0312 Comment/Dynamic Sample Governance` task block is closed.

No further Safari capture is authorized in this target.

No implementation thread is authorized.

No integration thread is authorized.

No release/preflight, version bump, dist rebuild, tag, release or push is authorized by this decision.

## Future Route

If the project needs to revisit comment/dynamic Safari reality evidence, it must start a new target, not extend this one.

Allowed future target shape:

```text
Comment/Dynamic Readiness Instrumentation Design
```

That future target would need to design a privacy-safe readiness signal before any capture retry. It must not begin with direct Safari resampling, personal-profile fallback, raw evidence export, or runtime code edits.

Possible future exits:

- design-only `NO-GO`;
- privacy-safe instrumentation proposal;
- explicit implementation target, if and only if the main thread separately authorizes it;
- revised Safari capture plan after instrumentation exists.

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

`V0312 Comment/Dynamic Method-Fixed Blocker Evidence Audit` is accepted.

`V0312 Comment/Dynamic Sample Governance` is closed as `Blocked / Not Verified`.
