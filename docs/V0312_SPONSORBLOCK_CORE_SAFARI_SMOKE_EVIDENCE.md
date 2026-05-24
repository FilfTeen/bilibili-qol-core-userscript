# v0.3.12 SponsorBlock Core Safari Smoke Evidence

本文件是 `v0.3.12 SponsorBlock Core Safari Smoke` 的最终证据报告。它总结 G1 计划、G2 Safari 主窗口采样、G2R 前台重采样、独立审计和主线程 G3 裁决后的稳定结论。

本报告不授权实现，不授权发布，不创建 `v0.3.12` runtime release acceptance。

## Final Verdict

`PASS WITH CAVEAT / PARTIAL`

本轮 smoke 目标完成。证据支持一个分项结论：

- `segment_load`, `preview_bar`, `auto_skip` and `undo` are verified for the sampled Safari S1 page.
- `keep_current_segment` remains partial.
- `mute` and `POI` were not attempted / not verified.

该结论不等于完整 SponsorBlock Safari acceptance，也不等于 v0.3.12 runtime release readiness。

## Evidence Roots

Primary docs:

- `docs/V0312_SPONSORBLOCK_CORE_SAFARI_SMOKE_PLAN.md`
- `docs/V0312_SPONSORBLOCK_CORE_SAFARI_SMOKE_EVIDENCE_AUDIT.md`
- `docs/V0312_SPONSORBLOCK_CORE_SAFARI_SMOKE_G3_DECISION.md`

Primary local evidence:

- `output/safari/v0312-sponsorblock-core-smoke/v0312-sponsorblock-core-safari-smoke-20260523-1348/summary.json`
- `output/safari/v0312-sponsorblock-core-smoke/v0312-sponsorblock-core-safari-smoke-20260523-1348/sample-url-manifest.json`
- `output/safari/v0312-sponsorblock-core-smoke/v0312-sponsorblock-core-safari-smoke-g2r-20260524-111513/summary.json`
- `output/safari/v0312-sponsorblock-core-smoke/v0312-sponsorblock-core-safari-smoke-g2r-20260524-111513/settings-restore-compare.json`
- `output/safari/v0312-sponsorblock-core-smoke/v0312-sponsorblock-core-safari-smoke-g2r-20260524-111513/privacy-scan.txt`

Raw output evidence is local audit material. Some local UI evidence includes browser chrome or Tampermonkey dashboard metadata and must be redacted before any external publication.

## What Was Verified

### Target dist identity

The local `dist/bilibili-qol-core.user.js` and the Safari Tampermonkey installed script used in G2/G2R have the same SHA-256:

`ec53876ecda67f51d92faa3d7af6679d4d3b3e04aa65ac48af6ac6f420ae7aa2`

The installed script metadata version remained `0.3.11`. This smoke did not create a `0.3.12` runtime artifact.

### Segment load

The sampled S1 page loaded one actionable real `sponsor` / `skip` segment:

- sample URL: `https://www.bilibili.com/video/BV1eKdYBXEy3/`
- segment start: `101.934s`
- segment end: `152.919s`
- mode: `auto`

### Preview bar

Preview markers were present for the sampled segment, with `category=sponsor` and `actionType=skip`.

### Auto skip

G2R captured foreground Safari evidence with `document.visibilityState=visible` and `document.hasFocus()=true`. Playback entered the sampled segment from before the start and jumped to the segment end with an auto-skip notice and `撤销` action.

### Undo

G2R captured the `撤销` click. Playback returned to the segment start and showed a grace notice with `保留本段` and `立即跳过`.

## Partial Evidence

`keep_current_segment` is `Partial`.

Evidence supports:

- the grace notice appeared;
- `保留本段` was clicked in foreground;
- no immediate re-skip was observed in the retained observation window.

Evidence does not prove:

- continuous same-segment playback progression far enough to exercise the no-re-skip behavior under normal time advancement.

Reason: the sampled video buffered near `102.434s`. The later continuation started after the player had already left the target segment and was correctly excluded from the keep-current verdict.

## Not Verified

The following are not verified by this pass:

- mute segment behavior;
- POI notice / jump behavior;
- all SponsorBlock action types;
- broad Safari release acceptance;
- upstream vote / submit behavior;
- any `v0.3.12` runtime release readiness.

## Privacy Boundary

Accepted privacy boundary:

- no real SponsorBlock vote, submit or upstream feedback was clicked;
- no cookie retained;
- no token retained;
- no UID or username retained;
- no comment text retained;
- no full request headers retained;
- no raw storage dump retained.

Retained sample identifiers are public Bilibili video IDs and sanitized origin + pathname URLs.

## Allowed Wording

Use this wording if the result must be summarized:

`SponsorBlock Core Safari smoke is PASS WITH CAVEAT / PARTIAL: segment load, preview bar, auto-skip and undo were verified on the sampled Safari S1 page; keep-current-segment remains Partial; mute and POI were not attempted / not verified. This does not authorize a v0.3.12 runtime release.`

## Forbidden Wording

Do not claim:

- `核心体验全部通过`
- `SponsorBlock core fully passes Safari`
- `v0.3.12 Safari acceptance`
- `v0.3.12 runtime release acceptance`
- `keep current segment verified`
- `mute verified`
- `POI verified`
- `all SponsorBlock capabilities verified`
- `release authorized`

## Main-Thread Decision

No implementation is authorized by this evidence pass.

No integration or release/preflight is authorized by this evidence pass.

If stronger proof is desired, it should be opened as a future narrow evidence target rather than silently extending this smoke.
