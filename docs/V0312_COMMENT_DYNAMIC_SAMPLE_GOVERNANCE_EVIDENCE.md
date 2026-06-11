# V0312 Comment / Dynamic Sample Governance Evidence

This is the final evidence summary for the `V0312 Comment/Dynamic Sample Governance` target.

It is a docs-only evidence and governance report. It is not a release note, runtime release artifact, Safari release acceptance, implementation task, integration signal, tag, version bump or dist rebuild authorization.

## Final Verdict

`Blocked / Not Verified`

The target clarified how comment and dynamic samples should be governed, but did not verify comment or dynamic behavior in Safari main-window sampling.

The closure reason is not a privacy failure and not a confirmed runtime bug. The closure reason is that the method-fixed isolated Safari capture could not prove permission / injection readiness before sampling, and no further privacy-safe, non-repeating method remained inside the current target.

## Evidence Chain

| Gate | Artifact | Result |
| --- | --- | --- |
| G1 | `docs/V0312_COMMENT_DYNAMIC_SAMPLE_GOVERNANCE_DESIGN.md` | Governance design accepted with caveat. |
| G1 review | `docs/V0312_COMMENT_DYNAMIC_GOVERNANCE_G1_REVIEW.md` | Authorized manifest design only. |
| G2 | `docs/V0312_COMMENT_DYNAMIC_SAMPLING_MANIFEST_PLAN.md` | Manifest accepted with isolated-profile constraints. |
| G2 review | `docs/V0312_COMMENT_DYNAMIC_MANIFEST_G2_REVIEW.md` | Authorized isolated-profile Safari capture. |
| G3 | `docs/V0312_COMMENT_DYNAMIC_CAPTURE_G3_REVIEW.md` | Personal-profile capture accepted only as exploratory `Partial`; not original acceptance. |
| Audit | `docs/V0312_COMMENT_DYNAMIC_EVIDENCE_AUDIT.md` | Recommended isolated-profile retry. |
| G4 | `docs/V0312_COMMENT_DYNAMIC_AUDIT_G4_DECISION.md` | Authorized isolated retry; no personal fallback. |
| G5 | `docs/V0312_COMMENT_DYNAMIC_ISOLATED_RETRY_G5_REVIEW.md` | Isolated retry accepted as useful `NOT_VERIFIED` injection-failure evidence. |
| Injection audit | `docs/V0312_COMMENT_DYNAMIC_ISOLATED_INJECTION_AUDIT.md` | Recommended one method-fixed retry. |
| G6 | `docs/V0312_COMMENT_DYNAMIC_INJECTION_AUDIT_G6_DECISION.md` | Authorized method-fixed isolated retry only. |
| G7 | `docs/V0312_COMMENT_DYNAMIC_METHOD_FIXED_CAPTURE_G7_REVIEW.md` | Method-fixed retry accepted as `BLOCKED_PERMISSION_READY_NOT_PROVEN`. |
| Blocker audit | `docs/V0312_COMMENT_DYNAMIC_METHOD_FIXED_BLOCKER_AUDIT.md` | Recommended `ACCEPT_BLOCKED_AND_CLOSE`. |
| G8 | `docs/V0312_COMMENT_DYNAMIC_G8_DECISION.md` | Target closed as `Blocked / Not Verified`. |

## What Was Established

- The target has a documented sample governance policy.
- The target has a documented manifest schema and output contract.
- The privacy boundary is explicit: no raw comment text, dynamic text, comment hash details, identity values, cookies, tokens, request headers, raw API responses, screenshots, or raw storage dumps.
- Isolated-profile sampling is the correct default for write-capable or Local Learning adjacent samples.
- Personal-profile sampling is not acceptable for original causality / restore / clean-profile claims.
- Target dist identity was proven in attempted capture paths by matching installed Tampermonkey script hashes to the target dist hash.
- The method-fixed capture stopped correctly before invalid sample collection when permission / injection readiness could not be proven.

## What Was Not Established

- Safari comment goods labeling.
- Safari comment negative-sample safety.
- Safari dynamic goods labeling.
- Safari dynamic negative-sample safety.
- Organic comment scanning.
- Comment feedback lock closure.
- Comment-driven Local Learning write causality.
- Storage equality, restore or cleanup from comment/dynamic samples.
- Broad false-positive safety.
- Hide-mode behavior.
- A runtime implementation bug.

## Final Sample Verdicts

| Sample class | Final status | Reason |
| --- | --- | --- |
| Comment positive / goods | `Blocked / Not Verified` | Sample collection never reached a valid script-exposed state. |
| Comment negative / ordinary | `Blocked / Not Verified` | Negative safety cannot be inferred without script exposure. |
| Dynamic positive / goods | `Blocked / Not Verified` | Dynamic host was not meaningfully sampled after the first host gate failed. |
| Dynamic negative / ordinary | `Blocked / Not Verified` | Dynamic negative safety cannot be inferred without sampling. |

## Claim Boundary

Allowed wording:

- `V0312 comment/dynamic sample governance closed as Blocked / Not Verified.`
- `The target produced governance and privacy boundaries but did not verify Safari comment/dynamic behavior.`
- `Future work requires a separate readiness/instrumentation design before another capture attempt.`

Not allowed:

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
- `recognition accuracy improved`;
- `v0.3.12 runtime release acceptance`.

## Evidence Availability Caveat

The method-fixed run is referenced by run id:

```text
v0312-comment-dynamic-safari-method-fixed-20260611-090909
```

It was produced in a repo-external Codex worktree output directory. The blocker audit privately located the bundle by run id and reviewed only sanitized metadata. Public docs intentionally avoid local absolute paths. Future file-level re-audit requires a private handoff of the evidence path or a sanitized copied bundle.

## Future Work

Do not continue this target with another direct capture retry.

If comment/dynamic evidence becomes a priority again, open a new target for privacy-safe readiness or instrumentation design first. That future target must define what signal proves userscript entry before any Safari capture resumes.
