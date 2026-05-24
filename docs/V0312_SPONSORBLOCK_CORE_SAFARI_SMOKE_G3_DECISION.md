# v0.3.12 SponsorBlock Core Safari Smoke G3 Decision

本文件是主线程在 G1 采样方案、G2 Safari 主窗口采样、G2R 前台重采样和独立证据审计之后的 G3 裁决记录。它不是实现任务，不授权代码改动，不授权 release prep，也不创建 `v0.3.12` runtime release acceptance。

## Verdict

G3: `PASS WITH CAVEAT / PARTIAL - evidence objective complete`

主线程接受 `docs/V0312_SPONSORBLOCK_CORE_SAFARI_SMOKE_EVIDENCE_AUDIT.md` 的结论。当前证据足以收束 SponsorBlock core Safari smoke 的现实边界，但结论必须保持分项口径。

当前支持：

- `segment_load`: `Verified`
- `preview_bar`: `Verified`
- `auto_skip`: `Verified`
- `undo`: `Verified`

当前仅部分支持或未支持：

- `keep_current_segment`: `Partial`
- `mute`: `Not Attempted / Not Verified`
- `POI`: `Not Attempted / Not Verified`
- `v0.3.12 runtime release acceptance`: `Not Authorized`

## Evidence Reviewed

- `docs/V0312_SPONSORBLOCK_CORE_SAFARI_SMOKE_PLAN.md`
- `docs/V0312_SPONSORBLOCK_CORE_SAFARI_SMOKE_EVIDENCE_AUDIT.md`
- `output/safari/v0312-sponsorblock-core-smoke/v0312-sponsorblock-core-safari-smoke-20260523-1348/summary.json`
- `output/safari/v0312-sponsorblock-core-smoke/v0312-sponsorblock-core-safari-smoke-20260523-1348/installed-hash-compare.txt`
- `output/safari/v0312-sponsorblock-core-smoke/v0312-sponsorblock-core-safari-smoke-20260523-1348/sample-url-manifest.json`
- `output/safari/v0312-sponsorblock-core-smoke/v0312-sponsorblock-core-safari-smoke-g2r-20260524-111513/summary.json`
- `output/safari/v0312-sponsorblock-core-smoke/v0312-sponsorblock-core-safari-smoke-g2r-20260524-111513/installed-hash-compare.txt`
- `output/safari/v0312-sponsorblock-core-smoke/v0312-sponsorblock-core-safari-smoke-g2r-20260524-111513/settings-restore-compare.json`
- `output/safari/v0312-sponsorblock-core-smoke/v0312-sponsorblock-core-safari-smoke-g2r-20260524-111513/privacy-scan.txt`

主线程复核要点：

- `dist/bilibili-qol-core.user.js` and Safari Tampermonkey installed script SHA-256 both equal `ec53876ecda67f51d92faa3d7af6679d4d3b3e04aa65ac48af6ac6f420ae7aa2`.
- Runtime metadata remains `0.3.11`; this is supportive metadata, not a new runtime release.
- G2 proved target script mounting, segment load and preview bar, but behavior attempts were blocked by hidden/background-throttled page state.
- G2R repaired that evidence gap for `auto_skip` and `undo` under `visible` / focused Safari foreground state.
- G2R did not modify Tampermonkey settings or script config during the retry.
- G2/G2R did not perform real SponsorBlock vote, submit or upstream feedback.
- Privacy scans did not find retained cookie, token, UID, username, comment text, full request headers or raw storage dump.
- Some raw local evidence contains browser chrome or Tampermonkey local metadata; raw evidence should remain local unless redacted.

## Final Classification

| Capability | Decision | Main-thread boundary |
| --- | --- | --- |
| Target dist identity | `Verified` | Installed Safari Tampermonkey script hash equals target dist hash. |
| Tampermonkey target script enabled | `Verified with caveat` | G2 repaired local Tampermonkey settings before behavior capture; G2R proves no further settings drift. |
| Script config stability | `Verified for G2R` | SponsorBlock relevant settings remained unchanged during G2R. |
| Segment load | `Verified` | Sampled S1 Safari page loaded one real `sponsor` / `skip` segment. |
| Preview bar | `Verified` | Preview markers existed for the sampled `sponsor` / `skip` segment. |
| Auto skip | `Verified` | Foreground Safari playback entered the segment and jumped to the segment end with auto-skip notice and undo action. |
| Undo | `Verified` | Clicking `撤销` returned to segment start and exposed grace actions. |
| Keep current segment | `Partial` | `保留本段` was clicked, but video buffering prevented continuous same-segment playback progression proof. |
| Mute | `Not Attempted / Not Verified` | Candidate existed, but no stable real mute execution evidence was captured. |
| POI | `Not Attempted / Not Verified` | Candidate existed, but no stable real POI execution evidence was captured. |
| Privacy boundary | `Pass with local-publication caveat` | High-risk sensitive data was not retained; raw local UI evidence should not be externally published without redaction. |
| Release acceptance | `Not Authorized` | This is a smoke evidence closure only. |

## Claim Boundary

Allowed wording:

- `SponsorBlock Core Safari smoke is PASS WITH CAVEAT / PARTIAL.`
- `Segment load, preview bar, auto-skip and undo are verified for the sampled Safari S1 page.`
- `Keep-current-segment remains Partial.`
- `Mute and POI were not attempted / not verified.`
- `This is docs-only smoke evidence and not v0.3.12 runtime release acceptance.`

Forbidden wording:

- `核心体验全部通过`
- `SponsorBlock core fully passes Safari`
- `v0.3.12 Safari acceptance`
- `v0.3.12 runtime release acceptance`
- `release accepted`
- `release authorized`
- `keep current segment verified`
- `mute verified`
- `POI verified`
- `all SponsorBlock capabilities verified`

## Implementation Decision

No implementation thread is authorized.

The current evidence does not prove a runtime blocker that requires code changes. It also does not justify:

- changing SponsorBlock defaults;
- changing `src/`, `dist`, version metadata or package files;
- creating `RELEASE_NOTES_V0312.md`;
- creating `SAFARI_ACCEPTANCE_V0312.md`;
- creating a tag or GitHub release;
- upgrading mute, POI or keep-current wording.

## Next Gate

Current gate: `G3 complete`

Allowed next action: docs-only governance closure for this smoke evidence.

Implementation, integration, release/preflight, tag, bump, rebuild and push are not authorized by this G3 decision.
