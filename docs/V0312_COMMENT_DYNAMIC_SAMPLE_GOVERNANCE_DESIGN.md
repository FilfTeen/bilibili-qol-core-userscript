# V0312 Comment / Dynamic Sample Governance Design

Thread: `V0312 Comment/Dynamic Sample Governance Design`

Status: `DOCS-ONLY RESEARCH`

This document designs the governance layer for future real comment / dynamic samples. It does not authorize capture, implementation, integration, Safari acceptance, release wording, MBGA work, new recognition rules, default changes, or stronger filtering behavior.

## Recommendation

Recommended exit: `READY_FOR_SAFARI_SAMPLING`, conditional.

Meaning:

- Ready only for a separately authorized Safari main-window sampling pass that follows this governance document.
- Write-touching samples must use an isolated Safari/Tampermonkey profile by default.
- Current-profile sampling is allowed only for non-writing observation. If a sample can trigger `bsb_tm_local_video_labels_v1` or `bsb_tm_comment_feedback_v1`, the current profile is blocked under this brief unless the main thread first approves a stronger restore protocol.
- Dynamic samples are adjacent capability evidence. They must not be counted as proof of video-page Local Learning closure.

If the main thread intends to sample the user's existing profile while allowing write-capable comment feedback or automatic local labels, downgrade the exit to `NEEDS_POLICY_TIGHTENING`.

## Evidence Basis

Allowed files reviewed:

- `README.md`
- `docs/BLUEPRINT.md`
- `docs/CAPABILITIES.md`
- `docs/TECHNICAL.md`
- `docs/RELIABILITY.md`
- `docs/V0311_FUNCTION_COMPLETENESS_MATRIX.md`
- `docs/V0312_LOCAL_LEARNING_*.md`
- `src/features/comment-filter.ts`
- `src/features/dynamic-filter.ts`
- `src/knowledge/commercial-intent.ts`
- `src/utils/local-learning.ts`
- `test/comment-filter.test.ts`
- `test/dynamic-filter.test.ts`
- `test/recognition-samples.test.ts`
- `test/fixtures/recognition-samples.ts`
- `scripts/evaluate-recognition.mjs`

The design intentionally treats implementation, tests, and existing Safari evidence as three different evidence classes. Code paths and unit tests can justify expected observations, but they cannot by themselves prove current Safari DOM behavior or privacy cleanliness in a logged-in browser.

## Current Capability Summary

### Comment Surface

Current implementation supports:

- Shadow DOM comment renderer scanning under `bili-comments`.
- Structural goods-link detection from goods/product/commodity data attributes, e-commerce hosts, or visible price anchors.
- Text-based commercial intent classification for strong purchase, coupon, owned-surface, invitation, self-promo, and exclusive-access style signals.
- Suspicious shill classification when product-use detail, endorsement, media attachment, marketing reply, problem-solution testimonial, or account-state補证 crosses the current conservative threshold.
- Comment IP location display from Bilibili payload or legacy DOM fallback.
- Inline badge insertion.
- Optional comment content hiding with restore toggle.
- Local video signal dispatch for top-level comment matches.
- Comment feedback menu when local feedback is available and not owned by upstream or an existing manual local decision.

Important boundary:

- A top-level comment match can dispatch `bsb:video-signal`.
- The initial page-level comment scan can return a comment-derived local video signal.
- The inline reply processing path does not dispatch the same automatic event in `applyTargetMatch`; reply persistence must therefore be proven through either initial scan evidence or an explicit feedback keep path, not inferred from a reply badge.

### Reply Surface

Current implementation supports:

- Nested `bili-comment-reply-renderer` and flat reply renderer handling.
- Reply badge insertion.
- Reply content hiding with restore toggle when filtering mode is `hide`.
- Reply location badge insertion.
- Feedback menu insertion when local feedback is available.

Governance boundary:

- `reply_badge_only` proves reply-layer UI recognition only.
- `reply_feedback_keep` can prove user-confirmed feedback flow if storage and panel evidence are complete.
- `initial_comment_scan_reply` can prove automatic persistence only when before/after storage, panel, delete, and cleanup evidence show a write caused by the reply being visible to the page-level scan.

### Dynamic Surface

Current implementation supports:

- `.bili-dyn-item` scanning on supported dynamic pages.
- Direct goods-card and forwarded goods-card classification.
- Text classification for strong closure or owned-surface leads.
- Conservative suppression for quoted/mocking context and ordinary event coverage without actionable closure.
- Inline dynamic badge insertion.
- Optional dynamic content hiding with restore toggle.

Governance boundary:

- Dynamic detection does not write Local Learning records.
- Dynamic samples can validate dynamic UI behavior and false-positive boundaries, but they cannot prove video-page local label persistence, panel management, or comment feedback lock behavior.

### Space / Home Adjacent Surface

Documented page support includes:

- `t.bilibili.com/*`: dynamic recognition and comment capability best effort.
- `space.bilibili.com/*`: dynamic recognition, comment capability best effort, and thumbnail labels.
- `www.bilibili.com/*`: video pages and other supported pages; home-like cards may expose thumbnail labels or dynamic-adjacent content depending on Bilibili DOM.

Governance boundary:

- Space/home adjacent samples must be labeled separately from video-page comment samples.
- A space/home dynamic card is not a video comment sample.
- A thumbnail label observed near a card is not comment/dynamic classifier evidence unless the sample table links it to the expected surface and side-effect check.

## Default / Configuration Boundary

Allowed documents confirm that comment and dynamic surfaces support label or hide modes, and the reliability guide recommends using label-only behavior before hiding. The v0.3.11 completeness matrix also records a historical recommendation to keep comment filtering conservative and add Safari samples.

This thread did not read `src/constants.ts`, so it must not claim exact `DEFAULT_CONFIG` values. Any future capture should record the effective config snapshot in a redacted way, limited to:

- `enabled`
- `commentFilterMode`
- `commentLocationEnabled`
- `commentHideReplies`
- `dynamicFilterMode`
- `dynamicRegexKeywordMinMatches`
- label transparency booleans

Do not store custom regex text if it contains private notes. Store only `default`, `custom-present`, or an approved abstract regex profile id.

## Automated Test Coverage

Comment tests cover:

- goods-link detection and ordinary-link suppression;
- rich-text extraction;
- suspicious promo classification;
- benign ad-adjacent and quoted/mocking suppression;
- invitation-style boundary classification;
- shill classification and negative-warning suppression;
- account-gated candidate upgrade and probe failure fallback;
- page comment scan returning a reusable local signal;
- approved shared comment corpus evaluation;
- location extraction and injection;
- delayed rescan;
- nested and flat reply renderer processing;
- feedback menu enabled/disabled/submitted states;
- per-comment feedback lock behavior after re-render;
- feedback lock summary and clear behavior without exposing text;
- structured feedback event dispatch;
- pending idle refresh cancellation.

Dynamic tests cover:

- direct goods card;
- suspicious promo copy;
- benign marketing-adjacent suppression;
- ordinary event coverage suppression;
- quoted/mocking suppression;
- approved shared dynamic corpus evaluation;
- pending refresh cancellation after stop.

Recognition fixtures include 29 comment sample ids, 7 dynamic sample ids, and 6 local-learning sample ids. They include confirmed positive, confirmed negative, boundary, and pending trap rows.

Coverage caveat:

- These tests are not Safari DOM evidence.
- They do not prove that Bilibili's current logged-in main-window comment tree exposes the same nodes.
- They do not prove current-profile restore safety.
- They do not prove broad false-positive safety.

## Historical Evidence Gaps

The V0312 Local Learning evidence closed only a narrow isolated-profile page-heuristic path:

- local video label write;
- panel visibility;
- delete control;
- final cleanup;
- panel-derived refresh empty state.

Still not proven by that closure:

- current-profile restore;
- raw restore;
- natural comment-originated automatic write stability;
- comment feedback lock write/delete/restore;
- broad classifier quality;
- broad false-positive safety;
- user's existing profile exact restoration.

The current design must preserve these gaps instead of smoothing them over.

## Surface Taxonomy

| Surface | Page types | Runtime touch | Local Learning touch | Valid evidence claim |
| --- | --- | --- | --- | --- |
| `comment` | `video`, `opus` best effort | top-level comment renderer, goods/text/shill/location, badge/hide/feedback | possible automatic local signal; possible feedback lock | comment UI and, if storage proves it, comment-derived local label |
| `reply` | `video`, `opus` best effort | reply renderer, badge/hide/location/feedback | possible via initial scan or feedback keep only | reply UI; local persistence only with storage and panel proof |
| `dynamic` | `dynamic`, `space`, possible home-like feed | dynamic item, goods card/text, badge/hide | none expected | dynamic UI and dynamic false-positive boundary |
| `space_home_adjacent` | `space`, `home`, `search`, recommendation cards | cards, dynamic-like items, thumbnail labels | none expected unless it navigates into a video page | adjacent UI only; not Local Learning closure |

## Sample Classification Table

Each future `sample-classification.csv` or `.md` row must include at least:

| Field | Required values / meaning |
| --- | --- |
| `sample_id` | Stable id such as `comment-goods-01`, `reply-feedback-01`, `dynamic-negative-01`. No UID, username, or raw text fragments. |
| `surface` | `comment`, `reply`, `dynamic`, `space_home_adjacent`. |
| `page_type` | `video`, `opus`, `dynamic`, `space`, `home`, `search`, `unknown`. |
| `sanitized_url_origin_path` | `origin + pathname` only, for example `https://www.bilibili.com/video/BV...`; query omitted unless approved and redacted. |
| `source_type` | `real_safari_main_window`, `isolated_profile_safari`, `fixture_regression`, `operator_note_redacted`, `diagnostic_summary`. |
| `abstract_features` | Short labels only, such as `goods-card-structural`, `coupon-cta`, `owned-surface-lead`, `quoted-mocking`, `ordinary-discussion`, `reply-layer`, `dynamic-goods-card`. |
| `expected_qol_action` | `none`, `badge_only`, `badge_and_hide`, `location_only`, `feedback_menu`, `feedback_keep_optional`, `local_label_write_expected`, `no_write_expected`. |
| `false_positive_risk` | `none`, `low`, `medium`, `high`, `triggered`. `triggered` requires stop handling. |
| `local_learning_touch` | `none`, `read_summary`, `possible_write`, `write_observed`, `feedback_lock_possible`, `feedback_lock_observed`. |
| `privacy_grade` | `P0_shareable`, `P1_redacted_review`, `P2_private_transient`, `P3_blocked`. |
| `side_effect_check` | Required checks: `ui_only`, `storage_absent`, `storage_present_then_cleaned`, `feedback_count_unchanged`, `feedback_count_changed_then_cleaned`, `layout_restore`, or combined labels. |
| `observed_by` | Thread/operator role id, for example `safari-sampler`, `audit-thread`; never Bilibili account identity. |
| `verdict` | `Verified`, `Partial`, `Not Verified`, `False Positive Risk`, `Blocked`. |

Recommended additional fields:

| Field | Meaning |
| --- | --- |
| `expected_storage_source` | `comment-goods`, `comment-suspicion`, `page-heuristic`, `manual`, `manual-dismiss`, or `none`. |
| `observed_storage_source` | Same values, or `not_checked`. |
| `expected_category` | `sponsor`, `selfpromo`, `exclusive_access`, or `none`. |
| `observed_category` | Same values, or `not_checked`. |
| `evidence_paths` | Redacted screenshots, page-state JSON, storage summaries, diagnostic summaries. |
| `restore_status` | `not-needed`, `verified-isolated`, `partial-panel-derived`, `failed`, `blocked-by-policy`. |
| `claim_boundary` | One-line permitted claim, or `none`. |
| `review_notes` | Abstract caveats only. |

Do not merge `surface`, `expected_qol_action`, and `verdict`. A sample can be a strong goods-card shape and still be `Not Verified` if storage or panel proof is missing. A negative sample can become `False Positive Risk` if it gets a badge, title label, or persisted record without enough basis.

## Sample Classes

### Positive Samples

Use positive samples only when the sample has abstract, independently visible strong features:

- `comment_goods_positive`: structural goods link/card, e-commerce anchor, or price anchor in a top-level comment.
- `comment_cta_positive`: top-level comment with strong purchase/coupon/link/owned-surface/invitation closure represented by abstract feature labels.
- `reply_positive`: reply-layer goods or strong closure, with separate lane recorded as `reply_badge_only`, `reply_feedback_keep`, or `initial_comment_scan_reply`.
- `dynamic_positive`: dynamic item with goods card, forwarded goods card, or strong actionable closure.

Positive success requirements:

- Badge/UI proof must be redacted.
- If Local Learning is expected, before/after storage summary must show sample state transition.
- Panel evidence must show only BVID/source/category/confidence summary, not comment details.
- Delete/cleanup proof is required for any write-touching positive.

### Negative Samples

Use negative samples to protect ordinary discussion:

- normal video review or discussion without purchase/coupon/link closure;
- ordinary event coverage without actionable closure;
- anti-ad or warning context;
- quoted or mocking ad-copy context;
- buyer-style question only when the page context is ordinary review and lacks product-use endorsement cluster;
- dynamic event/news/update without goods card or action closure.

Passing negative result:

- no commercial comment badge on the ordinary node;
- no dynamic badge on ordinary dynamic item;
- no local title pill from the sample;
- sample BVID absent from local video label summary;
- comment feedback count unchanged unless the operator intentionally clicked feedback in an approved sample lane.

### Boundary Samples

Boundary samples are useful for audit but cannot be used to upgrade claims:

- light praise with unknown account state;
- owned-surface lead without purchase closure;
- invitation/experience-code context;
- product-use question in ambiguous review context;
- space/home adjacent cards where page type or renderer is unclear;
- dynamic posts with brand/event terms but unclear action closure.

Boundary verdict defaults to `Partial` or `Not Verified` unless storage, UI, privacy, and cleanup evidence are complete and the main thread accepts the claim boundary.

### Do-Not-Sample Samples

Block the sample if any of these are true:

- The only way to justify the classification is to save raw comment text.
- The sample requires saving comment hash details.
- The sample requires saving UID, username, avatar, cookie, token, request headers, auth values, or raw API/storage dumps.
- The sample is from private messages, non-public account areas, creator backend pages, payment pages, or account/security settings.
- The sample depends on a rare phrase that would identify a specific user if stored.
- The sample needs the operator to reveal or preserve account identity.
- The sample can write Local Learning data in the user's current profile and no separately approved restore proof exists.
- The sample is MBGA-related, PCDN/WebRTC-related, or Safari release acceptance disguised as comment/dynamic sampling.

If the sample enters this class mid-run, stop immediately and classify `Blocked`.

## Privacy Protocol

Hard rules:

- Do not save raw comment text.
- Do not save comment hash details.
- Do not save UID values.
- Do not save usernames.
- Do not save avatars.
- Do not save cookies.
- Do not save tokens.
- Do not save request headers.
- Do not save raw storage dumps.
- Do not save raw Bilibili API responses.

Allowed shareable evidence:

- sanitized URL origin + path;
- BVID when needed as sample id;
- abstract feature labels;
- surface/page type;
- QoL UI state labels;
- storage summary counts and source/category buckets;
- sample-present boolean for the approved BVID;
- redacted screenshots showing QoL badge or controls only.

Screenshots must redact:

- comment body;
- username;
- avatar;
- UID or profile link;
- visible cookie/token/header/debug payload;
- unrelated feed content.

If a reviewer says "the raw text is necessary to understand this sample", the correct response is `BLOCK`, not a lower privacy grade. The sample is not suitable for this evidence target.

Privacy grades:

| Grade | Meaning | Handling |
| --- | --- | --- |
| `P0_shareable` | Abstract fields and sanitized URL only | Can be committed under docs/output if authorized. |
| `P1_redacted_review` | Redacted screenshots or page-state summaries | Can be audited if redaction scan passes. |
| `P2_private_transient` | Human operator saw raw page content but did not save it | Allowed only during capture; no artifact should contain it. |
| `P3_blocked` | Requires storing forbidden values | Stop and do not use the sample. |

## Local Learning Pollution Protection

Storage keys in scope:

- `bsb_tm_local_video_labels_v1`
- `bsb_tm_comment_feedback_v1`

Default rule:

- Use an isolated Safari/Tampermonkey profile for any sample with `local_learning_touch` other than `none` or `read_summary`.
- The isolated profile should start with known empty or documented scoped summaries for the two keys.
- The sample table must include before summary, after summary, panel evidence, cleanup evidence, and restore status.

Current-profile rule:

- Do not run write-capable comment or feedback samples in the user's current profile under this brief.
- Non-writing dynamic UI observation may be done only if evidence remains `P0` or `P1`, and only after main-thread authorization.
- If a sample BVID already exists in the current profile, do not delete or alter it for causality. Mark the sample `Not Verified` or switch to an isolated profile.

Write-touching sample requirements:

1. Capture a before summary that has no forbidden values.
2. Trigger exactly one approved sample URL.
3. Capture after summary.
4. Capture panel summary/screenshot with redaction.
5. Delete or clean the sample write if applicable.
6. Refresh from a neutral page or panel context.
7. Capture final summary.
8. Classify restore as `verified-isolated`, `partial-panel-derived`, `failed`, or `blocked-by-policy`.

If cleanup fails, stop the run and hand the issue to the main thread. Do not continue collecting positive samples.

## Safari Sampling Gate

Gate 0: Main-thread authorization

- A new Safari sampling thread must be explicitly authorized.
- Scope must say whether the profile is isolated or current.
- Scope must say whether Local Learning writes are permitted.

Gate 1: Sample manifest

- Every URL appears before capture.
- Every row has surface, page type, expected action, privacy grade, and stop conditions.
- No raw comment snippets are in the manifest.

Gate 2: Runtime identity

- Safari main window is used.
- Login state is proven only with sanitized booleans if login is needed.
- Installed Tampermonkey script identity is matched to the target dist hash.
- The effective config summary is captured without private custom regex content.

Gate 3: Storage isolation

- Isolated profile is required for write-touching samples.
- Before summary for the two scoped keys exists.
- If current profile is requested for write-touching samples, gate fails under this brief.

Gate 4: Per-sample evidence

- Capture only redacted UI evidence and structured page-state summaries.
- Record actual observed path rather than inferring from source code.
- Dynamic evidence remains dynamic-only.

Gate 5: Cleanup

- Any write must be cleaned or explicitly marked failed.
- Same-page retrigger must be recorded as retrigger, not as delete failure.
- Failed cleanup stops the run.

Gate 6: Audit handoff

- Audit receives manifest, classification table, redacted evidence paths, storage summaries, and privacy scan.
- Audit must be able to reproduce each verdict without trusting sampler prose.

## Stop Conditions

Stop the whole sampling run if:

- Any artifact contains forbidden private values.
- Raw comment text would be required to justify a sample.
- Safari main-window identity or installed script identity cannot be proven.
- Login proof is required but cannot be proven without exposing identity values.
- A write-capable sample is running in the current profile.
- Storage before summary is missing.
- Cleanup or restore fails.
- A dynamic sample is being used to support a video-page Local Learning claim.
- An unapproved page type or MBGA-related path enters the run.
- The operator must inspect or save request headers, cookies, tokens, or raw API bodies.

Stop positive collection and mark `False Positive Risk` if:

- an ordinary negative comment gets a commercial badge without strong abstract basis;
- an ordinary negative dynamic item gets a dynamic badge without strong abstract basis;
- a negative video sample writes a local commercial label;
- a quoted/mocking or anti-ad warning context is persisted;
- comment feedback count changes without an intentional approved feedback action;
- hiding breaks restore behavior for the sampled comment/reply/dynamic item.

## Side-Effect Checks

For comment/reply samples:

- Badge is inserted near the expected anchor and does not replace native text.
- Hide toggle restores content.
- Reply hiding, if enabled, restores replies.
- Location badge only reflects Bilibili payload/DOM, not inferred identity.
- Feedback menu disabled states match upstream/manual/pending states.
- Feedback lock count changes only after approved operator action.

For dynamic samples:

- Badge is inserted near the dynamic anchor.
- Hide toggle restores content.
- Ordinary event or quoted/mocking samples remain unmodified.
- No Local Learning storage change is expected.

For space/home adjacent samples:

- Claim remains adjacent UI only.
- Thumbnail or card behavior is not recast as comment/dynamic persistence.
- Navigation into a video page starts a new `comment` sample row.

## Verdict Semantics

`Verified`

- All expected UI/storage/privacy/cleanup evidence exists.
- No forbidden values are stored.
- Side effects are checked and pass.

`Partial`

- One or more non-critical legs are missing, or cleanup proof is panel-derived rather than exact.
- Can support caveat wording only.

`Not Verified`

- Sample did not load, did not expose the expected surface, did not trigger expected UI, or causality cannot be proven.

`False Positive Risk`

- Negative/boundary sample crosses an unsafe UI or storage boundary.
- Requires main-thread decision before further collection.

`Blocked`

- Privacy, profile, restore, authorization, or scope gate failed.

## Main-Thread Decision Matrix

| Exit | Use when | Current recommendation |
| --- | --- | --- |
| `READY_FOR_SAFARI_SAMPLING` | Main thread accepts isolated-profile-first sampling, no raw text, no raw storage dump, dynamic evidence kept adjacent | Yes, conditional |
| `NEEDS_POLICY_TIGHTENING` | Main thread wants current-profile write-touching samples or exact restore while raw storage dumps remain forbidden | Fallback if current-profile writes are required |
| `DEFER_TO_P3_DOCS_SWEEP` | Main thread only wants docs consistency and no real samples yet | Not necessary for this design |
| `NO-GO` | Privacy protocol cannot be met or sample purpose depends on forbidden evidence | Not current recommendation |

## Main Caveats

- This document does not authorize Safari capture.
- It does not verify current Safari comment/dynamic DOM.
- It does not validate exact default config values.
- It does not strengthen recognition behavior.
- It does not update release wording.
- It does not close current-profile restore or comment feedback lock closure.
- It blocks current-profile write-touching sampling under the current privacy constraints.

## Final Recommendation To Main Thread

Approve a follow-up Safari sampling thread only if it is scoped as:

- isolated Safari/Tampermonkey profile;
- redacted sample manifest first;
- no raw comment text;
- no raw storage dump;
- no account identity values;
- dynamic samples recorded as adjacent evidence only;
- write-touching samples cleaned with audited summaries;
- immediate stop on privacy leak, cleanup failure, or ordinary negative write.

Recommended label: `READY_FOR_SAFARI_SAMPLING`.

If the intended capture target is the user's existing profile with possible Local Learning writes, use `NEEDS_POLICY_TIGHTENING` instead.
