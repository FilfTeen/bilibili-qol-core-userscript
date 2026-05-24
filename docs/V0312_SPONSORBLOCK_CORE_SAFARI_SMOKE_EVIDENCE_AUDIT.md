# V0312 SponsorBlock Core Safari Smoke Evidence Audit

Thread: `V0312 SponsorBlock Core Safari Smoke Evidence Audit`

Verdict: `PASS WITH CAVEAT / PARTIAL`

This is an independent evidence audit only. It reviewed the G1 plan and the retained G2/G2R Safari evidence bundles. It did not resample Safari, did not change `output/`, did not change runtime code or package files, did not click SponsorBlock vote/submit actions, and does not authorize a `v0.3.12` runtime release.

## Inputs Reviewed

- Plan: `docs/V0312_SPONSORBLOCK_CORE_SAFARI_SMOKE_PLAN.md`
- G2 evidence: `output/safari/v0312-sponsorblock-core-smoke/v0312-sponsorblock-core-safari-smoke-20260523-1348/`
- G2R evidence: `output/safari/v0312-sponsorblock-core-smoke/v0312-sponsorblock-core-safari-smoke-g2r-20260524-111513/`

## Decision

The smoke can enter docs governance closure as `PASS WITH CAVEAT / PARTIAL`.

No blocker was found for the already captured core S1 evidence chain. A new sampling action is not required unless the main thread wants to upgrade `keep_current_segment` from `Partial` to `Verified`, or wants new claims for optional mute / POI behavior. Those upgrades would require fresh, narrow evidence and are outside this audit authorization.

The safe public/documentation envelope is:

- `segment_load`: verified on the sampled Safari video page.
- `preview_bar`: verified on the sampled Safari video page.
- `auto_skip`: verified by G2R foreground playback evidence.
- `undo`: verified by G2R foreground click and grace-notice evidence.
- `keep_current_segment`: partial only.
- `mute`: not attempted / not verified.
- `POI`: not attempted / not verified.
- This is SponsorBlock core Safari smoke evidence only, not release acceptance.

## Identity And Preflight

Target identity is sufficiently proven for this smoke:

- Local `dist/bilibili-qol-core.user.js` at commit `1f790de8dfe6d469972eeff1ad95e0bdbdc2c25c` hashes to `ec53876ecda67f51d92faa3d7af6679d4d3b3e04aa65ac48af6ac6f420ae7aa2` and is `562044` bytes.
- G2 records the same `target_dist_sha256` and `installed_browser_sha256` in `installed-hash-compare.txt`.
- G2R independently records the same match in `installed-hash-compare.txt` and `installed-hash-browser.json`.
- The installed script name is `Bilibili QoL Core`; metadata version remains `0.3.11`, which is supportive metadata only and is not the identity proof.

Caveat: G2 included target Tampermonkey settings repair before behavior capture. Therefore G2 should not be described as an unchanged-settings run. G2R does provide before/after stability evidence for the retry: `settings-restore-compare.json` reports no Tampermonkey settings change and no script config change across the retry.

## Capability Status

| Capability | Audit Status | Evidence Basis | Audit Notes |
| --- | --- | --- | --- |
| `installed_hash_target_dist` | `Verified` | local `dist/bilibili-qol-core.user.js`; G2/G2R `installed-hash-compare.txt`; G2R `installed-hash-browser.json` | Installed browser script hash equals the target dist hash. |
| `tampermonkey_script_enabled` | `Verified with caveat` | G2 `preflight/tampermonkey-dashboard-target-enabled-20260524.json`; G2R `tampermonkey-settings-before.json`; G2R `tampermonkey-settings-after.json`; G2R `settings-restore-compare.json` | Target script is enabled and configured for the run. G2 repaired settings first; G2R proves no further drift. |
| `script_config_stability` | `Verified for G2R` | G2R `script-config-before.json`; G2R `script-config-after.json`; G2R `settings-restore-compare.json` | Relevant SponsorBlock settings are unchanged before/after G2R. |
| `segment_load` | `Verified` | G2 `samples/S1-skip-required/page-state-after-run-mode-reload-20260524.json`; G2R `samples/S1-skip-required/s1-segment-load.json`; G2R `samples/S1-skip-required/s1-segment-load-poll-latest.json` | Current page is sanitized to origin + pathname. Evidence shows one actionable real `sponsor` / `skip` segment for S1. |
| `preview_bar` | `Verified` | G2 `panel-config-snapshot.json`; G2 `samples/S1-skip-required/page-state-after-run-mode-reload-20260524.json`; G2R `samples/S1-skip-required/s1-segment-load-after-behavior-reload.json` | Preview markers exist with `category=sponsor` and `actionType=skip`. At least one marker is visible in the relevant snapshots. |
| `auto_skip` | `Verified` | G2R `samples/S1-skip-required/s1-before-segment-entry.json`; G2R `samples/S1-skip-required/s1-auto-skip-verified.json` | Foreground, focused playback entered the segment from before start and jumped to the segment end with auto-skip notice and undo action. G2 alone was not sufficient because the tab was hidden/background-throttled. |
| `undo` | `Verified` | G2R `samples/S1-skip-required/click-撤销.json`; G2R `samples/S1-skip-required/s1-after-undo-click.json` | The undo action was clicked from the auto-skip notice; current time returned to the segment start and the grace notice exposed keep / immediate-skip actions. |
| `keep_current_segment` | `Partial` | G2R `samples/S1-skip-required/click-保留本段.json`; G2R `samples/S1-skip-required/s1-after-keep-current-segment-click.json`; G2R `samples/S1-skip-required/s1-keep-current-observation-00.json` through `s1-keep-current-observation-29.json`; G2R `samples/S1-skip-required/s1-keep-current-segment-nudge-result.json` | The keep action was clicked and no immediate re-skip was observed. However, the video buffered/stalled near the segment start, so the evidence does not prove continuous in-segment playback through a meaningful interval without re-skip. The later nudge started after exiting the segment and is correctly excluded. |
| `mute` | `Not Attempted / Not Verified` | G2 `sample-url-manifest.json`; G2R `summary.json` | A candidate was listed in G2, but no stable real mute execution evidence was captured. No synthetic segment was used. |
| `poi` | `Not Attempted / Not Verified` | G2 `sample-url-manifest.json`; G2R `summary.json` | A candidate was listed in G2, but no stable real POI execution evidence was captured. No synthetic segment was used. |
| `privacy_boundary` | `Pass with local-publication caveat` | G2 `privacy-scan.txt`; G2R `privacy-scan.txt`; G2 `panel-config-sponsorblock.png`; G2R `tampermonkey-settings-before.json`; G2R `tampermonkey-settings-after.json` | No cookie/token/account UID/comment/private recommendation dump was found in the retained evidence scans. Caveat: some retained local UI captures include browser chrome or local Tampermonkey dashboard metadata; do not publish those raw files externally without redaction. |
| `release_acceptance` | `Not Authorized` | G1 plan final rules; G2/G2R `summary.json` safety fields | The evidence is only a SponsorBlock core Safari smoke input. It is not release acceptance and does not authorize tag/release/bump/rebuild. |

## Findings

### P1 - `keep_current_segment` must remain `Partial`

The G2R keep-current chain proves the grace action was reachable and clicked in a foreground Safari page. It also shows no immediate re-skip during the retained observation window.

That is still below the plan's `Verified` threshold. The observation window remains near the segment start while the player reports low readiness / network activity, so the evidence does not show continuous same-segment playback progressing far enough to exercise the no-re-skip behavior under normal time advancement. The later nudge evidence explicitly starts after the player has already exited the target segment, so it cannot be used to upgrade this capability.

No blocker is implied. This is a caveat on claim strength.

### P2 - G2 segment load and preview bar can be retained as `Verified`

G2 is weak for behavior because the page became hidden/background-throttled during skip attempts, but it is still valid for segment loading and preview bar state. The relevant G2 evidence ties the sampled sanitized URL to a loaded real `sponsor` / `skip` segment and visible preview markers. G2R independently repeats the segment/marker evidence in a visible, focused page.

### P2 - G2R is sufficient to upgrade `auto_skip` and `undo` to `Verified`

G2R records a visible, focused foreground chain:

- before-segment state at the S1 sample, before the segment start;
- auto-skip result at the segment end with a notice containing an undo action;
- clicked undo action;
- post-undo state at the segment start with grace actions.

This satisfies the G1 plan criteria for `auto_skip` and `undo`. No upstream vote/submit mutation is involved.

### P2 - Optional mute and POI must not be claimed

Mute and POI were not executed in G2R. G2 only lists public candidates and says optional execution was skipped. Therefore:

- `mute` is `Not Attempted / Not Verified`.
- `poi` is `Not Attempted / Not Verified`.

No documentation should imply either feature was sampled successfully in Safari.

### P3 - Privacy scans pass for high-risk data, but raw publication should stay constrained

The retained scans report no cookies, auth tokens, UID/account names, full request headers, raw storage dump, comment text, or private recommendation dump.

However, some raw evidence files include local browser or Tampermonkey UI metadata beyond the minimal capability proof. This does not block local docs governance closure, but it means raw evidence should be treated as local audit material. If any artifact is published externally, redact browser chrome and non-target local dashboard metadata first.

## Required Wording Guardrails

Allowed:

- "SponsorBlock Core Safari smoke is `PASS WITH CAVEAT / PARTIAL`."
- "Segment load, preview bar, auto-skip, and undo are verified for the sampled S1 Safari page."
- "Keep-current-segment remains `Partial`."
- "Mute and POI were not attempted / not verified."
- "This evidence may enter docs governance closure."

Forbidden:

- "核心体验全部通过"
- "SponsorBlock core fully passes Safari"
- "v0.3.12 Safari acceptance"
- "v0.3.12 runtime release acceptance"
- "release accepted / release authorized"
- "mute 已验证"
- "POI 已验证"
- "keep current segment 已验证"
- "all SponsorBlock capabilities verified"

## Follow-up Recommendation

Do not continue sampling for the current governance closure. Close the smoke as `PASS WITH CAVEAT / PARTIAL`.

Only authorize a future narrow evidence action if the main thread explicitly wants one of these claim upgrades:

- upgrade `keep_current_segment` to `Verified` with continuous same-segment playback progression and no re-skip before segment exit;
- verify optional mute behavior on a stable real mute segment;
- verify optional POI behavior on a stable real POI segment.

Until then, implementation, integration, release/preflight, tag, bump, rebuild, and runtime acceptance remain unauthorized.
