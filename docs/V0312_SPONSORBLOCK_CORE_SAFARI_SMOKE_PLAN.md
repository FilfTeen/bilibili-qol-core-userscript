# V0312 SponsorBlock Core Safari Smoke Plan

Status: `G1 PLAN ONLY`

This document is an execution plan for a later Safari main-window sampling thread. It is not Safari evidence, not a release acceptance record, and does not authorize a `v0.3.12` runtime release.

## Scope

Goal: sample the minimum real SponsorBlock core chain in an already logged-in Safari main window:

- segment load
- preview bar marker visibility
- auto skip
- undo
- keep current segment
- mute reachability
- POI reachability

Out of scope:

- new SponsorBlock features
- real upstream vote or submit
- MBGA validation
- Local Learning validation
- comment or dynamic recognition validation
- release, tag, publish, or runtime acceptance

Do not click any real SponsorBlock vote, submit, or feedback action that sends an upstream vote. If a UI path requires real upstream mutation, stop that subcase and mark it `Blocked`.

## Source Baseline

The plan is based on the current documented and tested behavior:

- `README.md` claims SponsorBlock segment processing supports automatic skip, manual notice, mute, POI, and preview bar.
- `docs/BLUEPRINT.md` identifies the core implementation path as `src/core/controller.ts`, `src/core/segment-filter.ts`, `src/api/sponsorblock-client.ts`, and `src/ui/preview-bar.ts`, with Safari acceptance still required for real playback.
- `docs/TECHNICAL.md` describes the video chain: resolve video context, request SponsorBlock segments, normalize segments by category mode / `cid` / duration, bind `ScriptController`, render `PreviewBar`, and show `NoticeCenter` prompts.
- `docs/SAFARI_ACCEPTANCE_V0311.md` requires logged-in Safari main-window acceptance and warns that script version alone is not enough; behavior, panel state, and diagnostic report must also be checked.
- `docs/V0311_FUNCTION_COMPLETENESS_MATRIX.md` marks SponsorBlock skip/undo/keep and mute/POI/preview as needing current logged-in Safari sampling.
- `test/controller.test.ts` covers skip undo, skip grace, keep current segment, and no repeated auto skip while the current segment is kept.
- `test/segment-filter.test.ts` covers `cid` filtering. The implementation also filters disabled category modes, short non-POI/non-full segments, duplicate UUIDs, and sorts by start time.
- `src/core/controller.ts` implements segment loading, runtime status, preview binding, auto skip, undo, keep-current-segment suppression, mute, and POI notice behavior.
- `src/ui/preview-bar.ts` renders `#previewbar` and `#shadowPreviewbar` markers, excludes `full` segments, and marks action type / category on each `.previewbar` item.

Known evidence gap: automated tests are not Safari playback evidence. This smoke must keep unit-test confidence separate from real Safari results.

## Status Vocabulary

Use exactly these statuses for every capability:

- `Verified`: the Safari main-window evidence proves the expected behavior for the sampled real page.
- `Partial`: the feature is reachable or partially visible, but the evidence is incomplete, ambiguous, or missing one required observation.
- `Not Verified`: no suitable stable sample or observable condition was available; no failing behavior was proven.
- `Blocked`: execution could not continue because of a stop condition, privacy boundary, environment mismatch, page breakage, or required upstream mutation.

## Preflight Proof

The Safari sampling thread must capture these fields before opening the sample video:

| Field | Required Evidence | Pass Rule |
| --- | --- | --- |
| `target_dist_sha256` | Main thread supplied SHA-256 for the intended `dist/bilibili-qol-core.user.js` release candidate. | Non-empty and tied to the intended commit/build. |
| `installed_userscript_sha256` | SHA-256 computed from the script currently installed in Tampermonkey for Safari. Use Tampermonkey export/editor text, write only to a temporary local file if needed, compute hash, then delete the temporary file. | Equals `target_dist_sha256`. |
| `tampermonkey_script_name` | Tampermonkey dashboard shows `Bilibili QoL Core`. | Exact script is enabled. |
| `script_reload_proof` | Screenshot or note showing Tampermonkey script was saved/reloaded after installing the target script, plus a fresh Safari page reload. | No reliance on a stale tab or old userscript cache. |
| `page_url` | Sanitized URL as `origin + pathname`; no query, hash, cookies, username, or UID. | Page is a supported Bilibili video page. |
| `sampling_started_at` | ISO timestamp with timezone. | Recorded before first behavior check. |
| `diagnostic_report` | QoL Core diagnostic report copied from the control panel. | Shows expected runtime version and no obvious script-not-running state. |
| `panel_config_snapshot` | Minimal screenshot or text summary of relevant SponsorBlock settings: script enabled, preview bar setting, category modes for sampled categories, service URL origin only. | Explains why the sampled segment should be auto skip / mute / notice. |

If `installed_userscript_sha256` does not match `target_dist_sha256`, stop the entire smoke and mark all capabilities `Blocked`.

## Sample Matrix

The sampling thread must maintain a manifest. Do not include cookies, account names, UID, private recommendations, comments, query strings, or hash fragments.

```json
{
  "run_id": "v0312-sponsorblock-core-safari-smoke-YYYYMMDD-HHMM",
  "target_dist_sha256": "<provided-by-main-thread>",
  "installed_userscript_sha256": "<computed-from-tampermonkey-installed-script>",
  "samples": [
    {
      "sample_id": "S1-skip-required",
      "url": "https://www.bilibili.com/video/<BV...>",
      "page_type": "ordinary_video",
      "required": true,
      "expected_segments": ["skip"],
      "selection_rule": "ordinary playable video with at least one real SponsorBlock skip segment",
      "privacy_notes": "origin + pathname only; no query/hash"
    },
    {
      "sample_id": "S2-mute-optional",
      "url": "https://www.bilibili.com/video/<BV...>",
      "page_type": "ordinary_video",
      "required": false,
      "expected_segments": ["mute"],
      "selection_rule": "only use if a stable real mute segment is available",
      "not_verified_exit": "if no stable sample is found, mark mute as Not Verified"
    },
    {
      "sample_id": "S3-poi-optional",
      "url": "https://www.bilibili.com/video/<BV...>",
      "page_type": "ordinary_video",
      "required": false,
      "expected_segments": ["poi"],
      "selection_rule": "only use if a stable real POI segment is available",
      "not_verified_exit": "if no stable sample is found, mark POI as Not Verified"
    }
  ]
}
```

Minimum matrix:

| Sample | Required | Capability Target | Exit If Unavailable |
| --- | --- | --- | --- |
| `S1-skip-required` | Yes | segment load, preview bar, auto skip, undo, keep current segment | If no real skip segment can be loaded, stop behavior checks and mark dependent capabilities `Not Verified` or `Blocked` according to the root cause. |
| `S2-mute-optional` | No | mute reachability / behavior | If no stable mute sample is available, mark mute `Not Verified`; do not synthesize segments. |
| `S3-poi-optional` | No | POI reachability / behavior | If no stable POI sample is available, mark POI `Not Verified`; do not synthesize segments. |

Sample discovery is part of G2, not this G1 plan. If main thread already has known sample URLs, pass them into the G2 brief. Otherwise the sampling thread may search for public playable candidates, but must record only sanitized URL manifests.

## Evidence Schema

Store evidence outside release docs unless the main thread explicitly asks for a docs-only evidence report. Suggested local evidence directory: `output/safari/v0312-sponsorblock-core-smoke/<run_id>/`.

Required per-run evidence:

```json
{
  "run_id": "v0312-sponsorblock-core-safari-smoke-YYYYMMDD-HHMM",
  "status": "Verified | Partial | Not Verified | Blocked",
  "sampling_started_at": "YYYY-MM-DDTHH:mm:ss+08:00",
  "sampling_finished_at": "YYYY-MM-DDTHH:mm:ss+08:00",
  "target_dist_sha256": "<sha256>",
  "installed_userscript_sha256": "<sha256>",
  "tampermonkey_script_name": "Bilibili QoL Core",
  "script_reload_proof": {
    "screenshot": "preflight-tampermonkey-reloaded.png",
    "notes": "script enabled and page freshly reloaded"
  },
  "diagnostic_report": {
    "file": "diagnostic-report.txt",
    "must_not_contain": ["cookie", "authorization", "token", "uid", "username", "comment text"]
  },
  "panel_config_snapshot": {
    "file": "panel-config-sponsorblock.png",
    "fields": ["enabled", "showPreviewBar", "categoryModes", "minDurationSec", "serviceOrigin"]
  },
  "samples": []
}
```

Required per-sample evidence:

```json
{
  "sample_id": "S1-skip-required",
  "url": "https://www.bilibili.com/video/<BV...>",
  "page_url_sanitized": "https://www.bilibili.com/video/<BV...>",
  "played_in_logged_in_safari_main_window": true,
  "diagnostic_runtime_status": {
    "kind": "loaded | empty | error | pending",
    "message": "<copied from diagnostic report or panel>"
  },
  "segments_observed": [
    {
      "category": "sponsor",
      "actionType": "skip",
      "start": 10.0,
      "end": 20.0,
      "mode": "auto"
    }
  ],
  "screenshots": [
    "sample-s1-preload.png",
    "sample-s1-previewbar.png",
    "sample-s1-skip-notice.png",
    "sample-s1-undo-grace.png",
    "sample-s1-keep-current-segment.png"
  ],
  "console_state_snapshots": [
    {
      "label": "before-skip",
      "currentTime": 9.7,
      "muted": false,
      "previewMarkers": 1,
      "noticeText": []
    },
    {
      "label": "after-auto-skip",
      "currentTime": 20.0,
      "noticeText": ["自动跳过", "撤销"]
    }
  ],
  "capability_results": {
    "segment_load": "Verified | Partial | Not Verified | Blocked",
    "preview_bar": "Verified | Partial | Not Verified | Blocked",
    "auto_skip": "Verified | Partial | Not Verified | Blocked",
    "undo": "Verified | Partial | Not Verified | Blocked",
    "keep_current_segment": "Verified | Partial | Not Verified | Blocked",
    "mute": "Verified | Partial | Not Verified | Blocked",
    "poi": "Verified | Partial | Not Verified | Blocked"
  },
  "notes": []
}
```

Safe console snapshot helper for G2:

```js
(() => {
  const video = document.querySelector("video");
  const previewMarkers = [...document.querySelectorAll("#previewbar .previewbar, #shadowPreviewbar .previewbar")]
    .map((node) => ({
      category: node.getAttribute("data-category"),
      actionType: node.getAttribute("data-action-type"),
      left: node.style.left,
      right: node.style.right,
      opacity: node.style.opacity
    }));
  const notices = [...document.querySelectorAll(".bsb-tm-notice")]
    .map((node) => node.textContent?.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  return {
    url: location.origin + location.pathname,
    hasVideo: Boolean(video),
    currentTime: video?.currentTime ?? null,
    duration: video?.duration ?? null,
    paused: video?.paused ?? null,
    muted: video?.muted ?? null,
    previewMarkers,
    notices
  };
})();
```

Do not paste full page HTML, cookies, storage dumps, account information, comment text, network request headers, or raw private recommendation lists.

## Capability Procedures

### 1. Segment Load

Steps:

1. Complete preflight proof.
2. Open `S1-skip-required` in the already logged-in Safari main window.
3. Reload the page after confirming Tampermonkey is enabled.
4. Wait for video element and page context to settle.
5. Open QoL Core panel or diagnostic report and record runtime status.
6. Confirm the page reports a loaded SponsorBlock state, such as `已加载 N 个可处理片段`, or equivalent diagnostic data.

Judgement:

- `Verified`: diagnostic/panel status shows loaded real segments for the current sanitized page URL, and at least one observed segment is `actionType: "skip"`.
- `Partial`: script runs and reaches SponsorBlock loading, but the loaded segment list cannot be confidently tied to the current page or category mode.
- `Not Verified`: page plays but no segment exists for the sample.
- `Blocked`: hash mismatch, script not running, context cannot resolve, fetch error prevents segment loading, page cannot play, or evidence would require privacy export.

### 2. Preview Bar

Steps:

1. Use the same loaded `S1-skip-required` page.
2. Confirm `showPreviewBar` is enabled in the panel config snapshot.
3. Pause outside the target segment and capture the player progress bar.
4. Run the safe console snapshot and record marker count and `data-action-type`.

Judgement:

- `Verified`: screenshot shows a visible marker on the Bilibili progress bar, and console snapshot shows `.previewbar` marker(s) under `#previewbar` or `#shadowPreviewbar` with the expected category/action type.
- `Partial`: marker exists in DOM but is visually hidden, overlapped, or not confidently aligned with the segment.
- `Not Verified`: no real segment or no preview-enabled condition was available.
- `Blocked`: player DOM changed enough that marker evidence is not interpretable.

### 3. Auto Skip

Steps:

1. Ensure the sampled skip category mode is `auto`.
2. Seek to a point shortly before the skip segment start.
3. Record `currentTime` before the segment.
4. Let playback enter the segment without manual intervention.
5. Record `currentTime` after the expected skip and capture the notice.

Judgement:

- `Verified`: `currentTime` moves from inside/before the segment to at least the segment end, and the notice text includes an auto-skip result with a `撤销` action.
- `Partial`: time jumps to the expected range but the notice is missing or the starting point was not captured.
- `Not Verified`: no auto skip sample was available.
- `Blocked`: playback cannot be controlled, script not running, sample is no longer a skip segment, or page behavior prevents reliable time evidence.

### 4. Undo

Steps:

1. After a verified or partially verified auto skip, click the `撤销` action in the notice.
2. Record `currentTime` immediately after undo.
3. Capture the skip-grace notice.

Judgement:

- `Verified`: `currentTime` returns to the segment start within a reasonable playback tolerance, and the grace notice offers `保留本段` and `立即跳过`.
- `Partial`: time returns near the start but grace actions are missing or not captured.
- `Not Verified`: no skip result notice was available.
- `Blocked`: clicking undo would require unrelated page mutation or the notice is not actionable.

### 5. Keep Current Segment

Steps:

1. From the undo grace notice, click `保留本段`.
2. Keep playback inside the same segment or scrub within that same segment.
3. Record `currentTime` over several seconds.
4. Confirm the same segment is not automatically skipped again until playback exits the segment.
5. After exiting, do not treat later segment behavior as part of this subcase.

Judgement:

- `Verified`: after `保留本段`, playback remains in the same segment without another auto skip until the segment is exited.
- `Partial`: no re-skip is observed, but evidence does not prove the player remained in the same segment.
- `Not Verified`: no undo grace notice was available.
- `Blocked`: player seeking/playback cannot be controlled reliably.

### 6. Mute Reachability

Use `S2-mute-optional` only if a stable real mute segment is available.

Steps:

1. Confirm the sample has a real `actionType: "mute"` segment.
2. Confirm the sampled category mode is `auto`, `manual`, or `notice`, and record it.
3. Enter the mute segment.
4. Record `video.muted` before, during, and after the segment.
5. Capture the notice text and any action button such as `恢复声音` or `静音此段`.

Judgement:

- `Verified`: for `auto`, `video.muted` becomes `true` during the segment and restores afterward or after `恢复声音`; for `manual`, the mute action is visible and works when clicked.
- `Partial`: mute notice/action is reachable but final muted-state restoration is not captured.
- `Not Verified`: no stable real mute segment sample was available.
- `Blocked`: executing the subcase would require synthetic data or unsafe state export.

### 7. POI Reachability

Use `S3-poi-optional` only if a stable real POI segment is available.

Steps:

1. Confirm the sample has a real `actionType: "poi"` segment.
2. Seek to the lead window before the POI start.
3. Capture notice text and any `跳到高光` action.
4. If an action is available and does not mutate upstream state, click it and record `currentTime`.
5. Capture preview marker evidence if present.

Judgement:

- `Verified`: POI notice appears near the POI time, and the optional `跳到高光` action reaches the POI timestamp when clicked.
- `Partial`: POI marker or notice is visible, but the action/time proof is incomplete.
- `Not Verified`: no stable real POI sample was available.
- `Blocked`: player control or evidence is not reliable.

## Stop Conditions

Stop the whole smoke:

- `target_dist_sha256` and `installed_userscript_sha256` differ.
- Tampermonkey does not show the expected enabled `Bilibili QoL Core` script.
- QoL Core diagnostic report or page state shows the script is not running.
- The page cannot play video in the logged-in Safari main window.
- Evidence collection would require cookies, tokens, UID, username, comment text, private recommendation export, request headers, or storage dumps.
- Bilibili page changes make the player, notice, or progress bar evidence uninterpretable.

Stop only the affected subcase:

- Required real upstream vote or submit would be needed.
- `S1-skip-required` has no real skip segment after refresh.
- No stable mute or POI sample can be found.
- The sampled category is disabled and changing local settings would make the run no longer representative; record the setting and mark the subcase `Not Verified` or `Blocked`.
- The notice disappears before capture; retry once from a clean page reload, then mark `Partial` if time evidence still exists.

## Final Result Rules

Overall `Verified` requires:

- preflight proof passes,
- `segment_load`, `preview_bar`, `auto_skip`, `undo`, and `keep_current_segment` are all `Verified`,
- no privacy or upstream mutation boundary was crossed.

Overall `Partial` is acceptable for G2 smoke if:

- the required skip chain is mostly proven but one visual/notice artifact is incomplete,
- optional mute/POI are `Not Verified` due to lack of stable samples,
- all limitations are explicitly recorded.

Overall `Not Verified` applies when:

- Safari environment is usable but real SponsorBlock sample data cannot be obtained.

Overall `Blocked` applies when:

- preflight fails,
- script/runtime cannot be proven current,
- page playback cannot be evaluated,
- or evidence collection would violate privacy/scope constraints.

This smoke must not be summarized as v0.3.12 release acceptance. It may only be used as a SponsorBlock core Safari smoke input for a later main-thread review.

## G2 Safari Sampling Thread Brief Draft

Thread type: Safari main-window sampling / evidence capture.

Status: `PENDING MAIN THREAD APPROVAL`. Do not start until the main thread explicitly approves G2.

Mission:

- Execute `docs/V0312_SPONSORBLOCK_CORE_SAFARI_SMOKE_PLAN.md` in an already logged-in Safari main window.
- Produce a sanitized evidence bundle and a concise result summary.
- Do not edit `src/`, `dist/`, `package.json`, or `package-lock.json`.
- Do not click real upstream vote or submit actions.
- Do not publish, tag, release, or represent results as v0.3.12 runtime acceptance.

Inputs required from main thread:

- target commit/build identity
- `target_dist_sha256`
- optional known public sample URLs for skip/mute/POI
- explicit permission to use Safari main-window sampling

Execution outline:

1. Prove target dist and Tampermonkey installed script hash match.
2. Prove the script was reloaded and the Safari page is freshly loaded.
3. Capture diagnostic report and relevant panel config snapshot.
4. Execute `S1-skip-required` for segment load, preview bar, auto skip, undo, and keep current segment.
5. Execute `S2-mute-optional` and `S3-poi-optional` only if stable real samples are available.
6. Save only sanitized screenshots, safe console snapshots, diagnostic report, currentTime comparisons, notice text, panel config snapshot, and sample URL manifest.
7. Return `Verified / Partial / Not Verified / Blocked` per capability and overall.

Required G2 response:

- conclusion
- per-capability status table
- evidence bundle location
- blockers and caveats
- clear statement that no real upstream vote/submit was performed
- clear statement that this smoke does not authorize v0.3.12 runtime release
