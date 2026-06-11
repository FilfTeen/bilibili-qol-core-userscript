# V0312 Comment / Dynamic Sampling Manifest Plan

Thread: `V0312 Comment/Dynamic Sampling Manifest Design`

Status: `DOCS-ONLY PLAN - NO CAPTURE`

This document converts the accepted G1 governance design into a concrete
manifest and capture-plan contract for a later Safari sampling thread. It does
not authorize Safari capture, implementation, integration, release wording,
MBGA work, new recognition rules, default changes, or stronger filtering
behavior.

## Decision

Recommended main-thread exit: `READY_FOR_SAFARI_CAPTURE`, conditional.

Conditions:

- The main thread accepts isolated Safari/Tampermonkey profile capture as the
  only write-capable path.
- Exact sample URLs are frozen in the future capture bundle before the target
  userscript is enabled on any sample page.
- The capture thread uses this manifest schema, output directory contract,
  privacy scan, storage summary, stop conditions, and verdict matrix.
- The capture thread treats dynamic and space/home adjacent samples as adjacent
  UI evidence only, not as video-page Local Learning closure.

Fallback exits:

- `NEEDS_POLICY_TIGHTENING`: use if the main thread wants current-profile
  write-capable comment/feedback sampling, raw storage restore proof, hide-mode
  evidence, or exact sample explanations that require raw comment text.
- `NO-GO`: use if candidate samples cannot be justified without storing raw
  comment text, usernames, UID values, comment hash details, cookies, tokens,
  request headers, raw API responses, or raw storage dumps.

## Scope

Allowed for the future Safari capture thread, only after main-thread approval:

- Use an isolated Safari profile with Tampermonkey enabled for that profile.
- Install or update the target `dist/bilibili-qol-core.user.js` in that isolated
  profile.
- Prove installed Tampermonkey script bytes match the target dist hash.
- Capture redacted UI, diagnostic, page-state, config, storage-summary, and
  cleanup evidence for approved manifest rows.
- Store local evidence under an ignored `output/` directory.

Forbidden in this planning thread and in the future capture unless separately
authorized:

- No sampling in this thread.
- No Safari evidence collection in this thread.
- No `src/`, `dist/`, `package.json`, or `package-lock.json` changes.
- No new rules or more aggressive filtering.
- No release wording.
- No MBGA work.
- No current-profile write-capable design.
- No raw comment snippets in manifests, screenshots, notes, page-state JSON, or
  classifications.

## Profile Policy

The whole comment/dynamic capture should run in an isolated profile:

```text
profile_scope = isolated-safari-tampermonkey
current_profile_write_capable = false
```

The user's existing Safari/Tampermonkey profile is not part of this evidence
lane. Do not open write-capable samples there. Do not delete, clear, or restore
any current-profile Local Learning or feedback data.

If the main thread asks for current-profile write-capable sampling, this plan
must be downgraded to `NEEDS_POLICY_TIGHTENING`.

## Initial Manifest

This docs-only thread does not provide real sample URLs. The future capture
thread must fill `sample_url_sanitized` before capture, using only `origin +
pathname` and omitting query/hash unless the main thread explicitly approves a
redacted query marker.

Initial manifest rows:

| Sample ID | Required | Surface | Page Type | URL Placeholder | Selection Criteria | Expected Action | Local Learning Touch |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `comment-goods-01` | yes | `comment` | `video` | `https://www.bilibili.com/video/<BV_COMMENT_GOODS>` | Top-level comment has abstract structural goods evidence such as goods card, e-commerce anchor, or visible price anchor. Must not need raw comment text. | `badge_only`; `local_label_write_expected` only if storage proves it | `possible_write` |
| `comment-negative-ordinary-01` | yes | `comment` | `video` | `https://www.bilibili.com/video/<BV_COMMENT_NEGATIVE>` | Ordinary discussion/review, anti-ad warning, or quoted/mocking ad-copy context. Must not contain actionable purchase closure. | `none` | `possible_write` only as false-positive guard |
| `reply-positive-01` | optional | `reply` | `video` | `https://www.bilibili.com/video/<BV_REPLY_POSITIVE>` | Reply-layer goods or strong closure visible without storing raw text. | `badge_only`; optional `feedback_keep_optional` only if main thread accepts local feedback write | `feedback_lock_possible` |
| `reply-negative-ordinary-01` | optional | `reply` | `video` | `https://www.bilibili.com/video/<BV_REPLY_NEGATIVE>` | Ordinary reply thread or warning/quoted context. | `none` | `possible_write` only as false-positive guard |
| `dynamic-goods-01` | yes | `dynamic` | `dynamic` | `https://t.bilibili.com/<DYNAMIC_ID>` | Dynamic item has goods card, forwarded goods card, or strong actionable closure. | `badge_only` | `none` |
| `dynamic-negative-ordinary-01` | yes | `dynamic` | `dynamic` | `https://t.bilibili.com/<DYNAMIC_ID>` or `https://t.bilibili.com/` | Ordinary event/update/discussion, quoted/mocking context, or brand-adjacent text without actionable closure. | `none` | `none` |
| `space-adjacent-01` | optional | `space_home_adjacent` | `space` | `https://space.bilibili.com/<SPACE_ID>` | Public space page with dynamic/card-adjacent UI, no private areas. | `adjacent_ui_only` | `none` |

Manifest fill rules:

- Each URL must be selected and frozen before enabling the target script on that
  sample page.
- Scout only after future Safari capture authorization. Scout with the target
  userscript disabled or absent, and record only abstract features.
- If a candidate requires raw text to justify classification, reject it.
- If an approved sample URL already appears in isolated-profile storage before
  capture, reject it for positive causality.
- Do not use dynamic or space/home adjacent rows to support Local Learning
  closure.

## Sample Manifest Schema

The future capture bundle must include both `sample-url-manifest.json` and
`sample-classification.csv` or `sample-classification.md`.

`sample-url-manifest.json`:

```json
{
  "run_id": "v0312-comment-dynamic-safari-YYYYMMDD-HHMM",
  "plan_doc": "docs/V0312_COMMENT_DYNAMIC_SAMPLING_MANIFEST_PLAN.md",
  "governance_doc": "docs/V0312_COMMENT_DYNAMIC_SAMPLE_GOVERNANCE_DESIGN.md",
  "profile_scope": "isolated-safari-tampermonkey",
  "current_profile_write_capable": false,
  "target_dist_sha256": "<filled-by-capture-preflight>",
  "installed_userscript_sha256": "<filled-by-capture-preflight>",
  "installed_equals_dist": null,
  "samples": [
    {
      "sample_id": "comment-goods-01",
      "required": true,
      "surface": "comment",
      "page_type": "video",
      "sample_url_sanitized": "https://www.bilibili.com/video/<BV...>",
      "url_query_policy": "none",
      "source_type": "isolated_profile_safari",
      "selection_rule": "top-level comment with abstract structural goods evidence; no raw text needed",
      "abstract_features": ["goods-card-structural"],
      "expected_qol_action": ["badge_only", "local_label_write_expected_if_observed"],
      "expected_storage_source": "comment-goods",
      "expected_category": "sponsor",
      "local_learning_touch": "possible_write",
      "feedback_touch": "none",
      "privacy_grade": "P1_redacted_review",
      "side_effect_checks": [
        "ui_badge_anchor",
        "storage_present_then_cleaned_if_written",
        "panel_redacted",
        "layout_restore"
      ],
      "stop_conditions": [
        "raw_text_required",
        "forbidden_private_value_seen",
        "cleanup_failed",
        "current_profile_detected"
      ],
      "not_verified_exit": "surface_not_loaded_or_no_badge_or_causality_not_proven"
    }
  ]
}
```

Required sample row fields:

| Field | Required Values |
| --- | --- |
| `sample_id` | Stable manifest id, no raw text. |
| `required` | `true` or `false`. |
| `surface` | `comment`, `reply`, `dynamic`, `space_home_adjacent`. |
| `page_type` | `video`, `opus`, `dynamic`, `space`, `home`, `search`, `unknown`. |
| `sample_url_sanitized` | `origin + pathname` only. |
| `url_query_policy` | `none`, `redacted-marker-approved`, or `blocked`. |
| `source_type` | `isolated_profile_safari`; do not use current profile for write-capable rows. |
| `selection_rule` | Abstract criteria only. |
| `abstract_features` | Labels such as `goods-card-structural`, `coupon-cta`, `quoted-mocking`, `ordinary-discussion`, `dynamic-goods-card`. |
| `expected_qol_action` | `none`, `badge_only`, `feedback_menu`, `feedback_keep_optional`, `local_label_write_expected_if_observed`, `adjacent_ui_only`. |
| `expected_storage_source` | `comment-goods`, `comment-suspicion`, `manual`, `manual-dismiss`, `page-heuristic`, `none`, or `not-applicable`. |
| `expected_category` | `sponsor`, `selfpromo`, `exclusive_access`, `none`, or `not-applicable`. |
| `local_learning_touch` | `none`, `read_summary`, `possible_write`, `write_observed`, `feedback_lock_possible`, `feedback_lock_observed`. |
| `feedback_touch` | `none`, `menu_visible`, `operator_keep_clicked`, `lock_observed`. |
| `privacy_grade` | `P0_shareable`, `P1_redacted_review`, `P2_private_transient`, `P3_blocked`. |
| `side_effect_checks` | List of approved checks from this plan. |
| `stop_conditions` | List of sample-specific stop conditions. |
| `not_verified_exit` | One-line downgrade path. |

`sample-classification.csv` must add observed fields:

| Field | Meaning |
| --- | --- |
| `observed_qol_action` | What actually appeared. |
| `observed_storage_source` | Redacted source bucket or `not_checked`. |
| `observed_category` | Redacted category bucket or `not_checked`. |
| `storage_clean_before` | `true`, `false`, or `not_checked`. |
| `sample_feedback_locks_before` | Count only; no hash details. |
| `sample_feedback_locks_after` | Count only; no hash details. |
| `non_sample_digest_equal_after` | `true`, `false`, `not_available`, or `not_applicable`. |
| `cleanup_status` | `not-needed`, `verified-isolated`, `panel-derived`, `failed`, `blocked`. |
| `false_positive_risk` | `none`, `low`, `medium`, `high`, `triggered`. |
| `evidence_paths` | Relative paths under the run directory. |
| `verdict` | `Verified`, `Partial`, `Not Verified`, `False Positive Risk`, or `Blocked`. |
| `claim_boundary` | Conservative allowed claim, or `none`. |

## Output Directory Contract

All raw/local evidence for the future capture must stay under ignored output:

```text
output/v0312-comment-dynamic-sampling/<run_id>/
  README.md
  environment.json
  summary.json
  sample-url-manifest.json
  sample-manifest.schema.json
  sample-classification.csv
  sample-classification.md
  dist/
    dist-sha256.txt
    dist-size.txt
    dist-head.txt
    tampermonkey-install-source.txt
    tampermonkey-update-redacted.png
    installed-userscript.txt
    installed-userscript-sha256.txt
    installed-hash-compare.txt
  profile/
    isolated-profile-setup.md
    tampermonkey-extension-enabled-redacted.png
    tampermonkey-script-enabled-redacted.png
  login/
    safari-main-window-login-proof.json
    safari-account-ui-redacted.png
  config/
    config-snapshot-before.json
    config-snapshot-before-redacted.png
    config-snapshot-after.json
    config-compare.json
  storage/
    before-summary.json
    after-comment-goods-01-summary.json
    after-comment-negative-ordinary-01-summary.json
    after-reply-positive-01-summary.json
    after-dynamic-goods-01-summary.json
    final-summary.json
    cleanup-compare.json
  samples/
    comment-goods-01/
      before/
        page-state.json
        storage-summary.json
      trigger/
        page-state.json
        screenshot-redacted.png
        diagnostic.txt
        operator-notes.md
      after/
        page-state.json
        storage-summary.json
        panel-redacted.png
      cleanup/
        storage-summary.json
        panel-after-delete-redacted.png
        reload-page-state.json
    comment-negative-ordinary-01/
      before/
      trigger/
      after/
      cleanup/
    reply-positive-01/
      before/
      trigger/
      after/
      cleanup/
    reply-negative-ordinary-01/
      before/
      trigger/
      after/
      cleanup/
    dynamic-goods-01/
      before/
      trigger/
      after/
      cleanup/
    dynamic-negative-ordinary-01/
      before/
      trigger/
      after/
      cleanup/
    space-adjacent-01/
      before/
      trigger/
      after/
      cleanup/
  privacy/
    privacy-scan.txt
    screenshot-review.md
    redaction-log.md
```

Per-sample phase folder rules:

- `before/` captures sanitized page state and storage summary before the target
  script can write sample data.
- `trigger/` captures the redacted UI observation after the sample page loads.
- `after/` captures storage and panel state after any possible write.
- `cleanup/` captures delete/reset/reload evidence.
- If a phase is not applicable, keep `operator-notes.md` with `not-applicable`
  and the reason.

Do not commit files from `output/` unless a later main-thread instruction
explicitly asks for a sanitized docs-only evidence report.

## Isolated Safari / Tampermonkey Setup

Future capture setup:

1. Create a new Safari profile named:

   ```text
   Codex V0312 Comment Dynamic Clean
   ```

2. Enable Tampermonkey for Safari in that profile only.
3. Confirm the profile has no existing `Bilibili QoL Core` userscript, or remove
   only the script from this isolated profile.
4. The user must log in to Bilibili manually if login is required. The capture
   operator must not handle credentials.
5. Capture login proof only as sanitized booleans.
6. Do not copy Safari bookmarks, cookies, local storage, Tampermonkey storage, or
   userscript settings from the user's current profile.
7. Keep the isolated profile open until cleanup and privacy scan complete.
8. After main-thread/audit acceptance, delete the isolated profile or remove the
   userscript and clear the two scoped storage keys inside that profile.

If Bilibili login cannot be proven in the isolated profile without exposing
identity values, stop as `Blocked` or `BLOCKED_NOT_LOGGED_IN`.

## Target Dist Hash And Install Proof

This plan intentionally does not compute a current dist hash.

Future capture placeholder:

```text
target_dist_sha256 = <TO_BE_FILLED_BY_CAPTURE_PREFLIGHT>
target_dist_path = dist/bilibili-qol-core.user.js
```

Required proof steps:

1. From repository root, before changing anything:

```bash
mkdir -p output/v0312-comment-dynamic-sampling/<run_id>/dist
git status --short --branch
git rev-parse HEAD
shasum -a 256 dist/bilibili-qol-core.user.js \
  | tee output/v0312-comment-dynamic-sampling/<run_id>/dist/dist-sha256.txt
wc -c dist/bilibili-qol-core.user.js \
  | tee output/v0312-comment-dynamic-sampling/<run_id>/dist/dist-size.txt
sed -n '1,30p' dist/bilibili-qol-core.user.js \
  > output/v0312-comment-dynamic-sampling/<run_id>/dist/dist-head.txt
```

2. Serve the repository dist from loopback and record the command/port in
   `environment.json`:

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

3. In the isolated Safari profile, open:

```text
http://127.0.0.1:8765/dist/bilibili-qol-core.user.js
```

4. Install or update `Bilibili QoL Core` in Tampermonkey. Save a redacted
   screenshot as `dist/tampermonkey-update-redacted.png`.
5. Open Tampermonkey Dashboard -> `Bilibili QoL Core` -> editor. Export or copy
   the full installed script to `dist/installed-userscript.txt`.
6. Hash and compare:

```bash
shasum -a 256 output/v0312-comment-dynamic-sampling/<run_id>/dist/installed-userscript.txt \
  | tee output/v0312-comment-dynamic-sampling/<run_id>/dist/installed-userscript-sha256.txt
awk '{print $1}' output/v0312-comment-dynamic-sampling/<run_id>/dist/dist-sha256.txt \
  > output/v0312-comment-dynamic-sampling/<run_id>/dist/dist-sha256.hex
awk '{print $1}' output/v0312-comment-dynamic-sampling/<run_id>/dist/installed-userscript-sha256.txt \
  > output/v0312-comment-dynamic-sampling/<run_id>/dist/installed-userscript-sha256.hex
if cmp -s \
  output/v0312-comment-dynamic-sampling/<run_id>/dist/dist-sha256.hex \
  output/v0312-comment-dynamic-sampling/<run_id>/dist/installed-userscript-sha256.hex; then
  echo "installedEqualsDist=true" \
    | tee output/v0312-comment-dynamic-sampling/<run_id>/dist/installed-hash-compare.txt
else
  echo "installedEqualsDist=false" \
    | tee output/v0312-comment-dynamic-sampling/<run_id>/dist/installed-hash-compare.txt
fi
```

7. Open a supported Bilibili page in the same isolated Safari main window and
   capture QoL Core diagnostic output as the first runtime proof.

If installed script bytes cannot be copied/exported or hashes differ, stop the
whole capture as `Blocked`.

## Login Proof

Run in the isolated Safari main window:

```javascript
fetch("https://api.bilibili.com/x/web-interface/nav", { credentials: "include" })
  .then((response) => response.json())
  .then((payload) => {
    const data = payload && payload.data ? payload.data : {};
    console.log(JSON.stringify({
      code: payload && payload.code,
      isLogin: Boolean(data.isLogin),
      midPresent: Boolean(data.mid),
      unamePresent: Boolean(data.uname),
      vipStatusPresent: Object.prototype.hasOwnProperty.call(data, "vipStatus"),
      capturedAt: new Date().toISOString(),
      page: location.origin + location.pathname,
      userAgentFamily: navigator.userAgent.includes("Safari") && !navigator.userAgent.includes("Chrome") ? "Safari" : "other",
      webdriver: Boolean(navigator.webdriver)
    }, null, 2));
  });
```

Save only the sanitized JSON to `login/safari-main-window-login-proof.json`.

Passing criterion:

- `code === 0`
- `isLogin === true`
- `midPresent === true` or `unamePresent === true`
- `userAgentFamily === "Safari"`
- `webdriver === false`

Do not save `mid`, `uname`, avatar, cookie, token, raw response body, account
name, notifications, or private feed data.

## Config Snapshot Fields

Capture effective config before sampling and after cleanup. Do not store custom
regex text or private notes.

Required `config-snapshot-*.json` shape:

```json
{
  "capturedAt": "ISO-8601",
  "profile_scope": "isolated-safari-tampermonkey",
  "recordingMethod": "qol-panel-or-diagnostic-summary",
  "fields": {
    "enabled": true,
    "commentFilterMode": "label | hide | off | unknown",
    "commentLocationEnabled": "true | false | unknown",
    "commentHideReplies": "true | false | unknown",
    "dynamicFilterMode": "label | hide | off | unknown",
    "dynamicRegexKeywordMinMatches": "number | unknown",
    "labelTransparency": "default | custom-present | unknown",
    "customRegexProfile": "default | custom-present | approved-profile-id | unknown"
  },
  "policy": {
    "core_samples_label_only": true,
    "hide_mode_capture_authorized": false,
    "current_profile_write_capable": false
  },
  "redaction": {
    "customRegexTextIncluded": false,
    "privateNotesIncluded": false
  }
}
```

Policy:

- Core samples should run label-only if the UI allows it.
- Do not switch to hide mode to make evidence more dramatic.
- If the main thread specifically wants hide/restore evidence, that is a
  separate policy decision and this plan should be downgraded to
  `NEEDS_POLICY_TIGHTENING` until the stop and restore rules are expanded.

## Safe Page-State Snapshot

Use a page-state helper that records counts, labels, and QoL markers only. It
must not copy raw comment text. If label text could include user content, record
counts and data attributes only.

Suggested safe snapshot:

```javascript
(() => {
  const allDeep = (selector, root = document) => {
    const found = [];
    const visit = (node) => {
      if (!node) return;
      if (node.querySelectorAll) {
        found.push(...node.querySelectorAll(selector));
        for (const child of node.querySelectorAll("*")) {
          if (child.shadowRoot) visit(child.shadowRoot);
        }
      }
    };
    visit(root);
    return found;
  };
  const count = (selector) => allDeep(selector).length;
  const bvid = location.pathname.match(/BV[a-zA-Z0-9]+/)?.[0] ?? null;
  console.log(JSON.stringify({
    capturedAt: new Date().toISOString(),
    page: location.origin + location.pathname,
    bvid,
    surfaceHints: {
      commentRootCount: count("bili-comments"),
      commentBadgeCount: count("[data-bsb-comment-badge='true']"),
      commentFeedbackMenuCount: count("[data-bsb-comment-feedback-menu='true']"),
      dynamicItemCount: count(".bili-dyn-item"),
      dynamicBadgeCount: count("[data-bsb-dynamic-badge='true']"),
      localLearningManagerPresent: Boolean(document.querySelector("[data-bsb-local-learning-manager='true']"))
    },
    sampleDeleteButtonPresent: bvid
      ? Boolean(document.querySelector(`[data-bsb-local-label-delete='${CSS.escape(bvid)}']`))
      : false,
    redaction: {
      commentTextIncluded: false,
      usernameIncluded: false,
      uidIncluded: false
    }
  }, null, 2));
})();
```

If the actual DOM attributes differ, the capture thread may adjust selectors,
but the output must remain count/boolean based and must not include raw content.

## Storage Summary And Cleanup Protocol

Storage keys in scope:

- `bsb_tm_local_video_labels_v1`
- `bsb_tm_comment_feedback_v1`

Rules:

- Do not save raw storage dumps.
- Do not save feedback hash keys.
- Do not save raw `reason` text.
- Do not save non-sample BVID lists.
- Public summaries may include canonical digests, counts, category/source
  buckets, sample BVID state, and sample feedback lock counts.
- If a digest cannot be computed without saving raw storage, omit the digest and
  downgrade cleanup proof to `Partial`.

Required public summary shape:

```json
{
  "capturedAt": "ISO-8601",
  "source": "tampermonkey-storage-summary",
  "profile_scope": "isolated-safari-tampermonkey",
  "keys": {
    "bsb_tm_local_video_labels_v1": {
      "exists": true,
      "rawSha256": "hex-or-null",
      "recordCount": 0,
      "categoryCounts": {},
      "sourceCounts": {},
      "manualDismissCount": 0,
      "sampleStates": [
        {
          "sample_id": "comment-goods-01",
          "bvid": "BV...",
          "present": false,
          "category": null,
          "source": null,
          "confidenceBucket": null,
          "updatedAtPresent": false,
          "reasonClass": "not-present"
        }
      ],
      "nonSampleSha256": "hex-or-null"
    },
    "bsb_tm_comment_feedback_v1": {
      "exists": true,
      "rawSha256": "hex-or-null",
      "count": 0,
      "sampleBvidLockCounts": {
        "BV...": 0
      },
      "nonSampleSha256": "hex-or-null"
    }
  },
  "redaction": {
    "rawStorageDumpSaved": false,
    "commentTextIncluded": false,
    "commentHashIncluded": false,
    "nonSampleBvidsIncluded": false,
    "userIdentifiersIncluded": false
  }
}
```

Cleanup protocol:

1. Before capture, record `storage/before-summary.json`.
2. For each positive or possible-write sample, record a before phase summary
   immediately before opening the sample URL with the target script enabled.
3. After trigger, record an after summary.
4. If a local label appears, delete it through the QoL panel control.
5. Reload a neutral page or the panel context and record cleanup summary.
6. If a feedback lock was intentionally created, record only count changes. If
   no UI cleanup exists for that lock, either reset the isolated profile after
   the run or mark feedback cleanup as `panel-derived` or `Partial`.
7. Record `storage/final-summary.json` after all samples.
8. Record `storage/cleanup-compare.json`:

```json
{
  "profile_scope": "isolated-safari-tampermonkey",
  "beforeRecordCount": 0,
  "finalRecordCount": 0,
  "sampleStatesRestored": true,
  "sampleFeedbackLocksRestored": true,
  "rawRestoreEqual": "true | false | null",
  "cleanupStatus": "verified-isolated | panel-derived | failed | blocked",
  "notes": []
}
```

If cleanup fails for any write-capable sample, stop the run and hand the bundle
to the main thread. Do not continue collecting positives.

## Per-Sample Capture Order

General order:

1. Verify isolated profile, login, target dist, installed hash, runtime
   diagnostic, and config snapshot.
2. Freeze `sample-url-manifest.json`.
3. Capture `storage/before-summary.json`.
4. Run required positive and negative samples in this order:
   - `comment-goods-01`
   - `comment-negative-ordinary-01`
   - `dynamic-goods-01`
   - `dynamic-negative-ordinary-01`
5. Run optional samples only if stable candidates exist and the required samples
   did not trigger stop conditions.
6. Cleanup and final storage summary.
7. Privacy scan.
8. Fill `summary.json` and classification tables.

Comment/reply sample required evidence:

- `before/page-state.json`
- `before/storage-summary.json`
- `trigger/page-state.json`
- `trigger/screenshot-redacted.png`
- `trigger/diagnostic.txt`
- `after/storage-summary.json`
- `after/panel-redacted.png` if storage or panel evidence is relevant
- `cleanup/storage-summary.json`
- `cleanup/reload-page-state.json`
- `cleanup/panel-after-delete-redacted.png` if a delete occurred

Dynamic sample required evidence:

- `before/page-state.json`
- `trigger/page-state.json`
- `trigger/screenshot-redacted.png`
- `trigger/diagnostic.txt`
- `after/storage-summary.json` proving no Local Learning change expected
- `cleanup/operator-notes.md`

Space/home adjacent sample required evidence:

- `trigger/page-state.json`
- `trigger/screenshot-redacted.png`
- `trigger/operator-notes.md`
- Explicit claim boundary: `adjacent UI only`.

## Redaction And Privacy Scan

Hard privacy rules:

- No raw comment text.
- No comment hash details.
- No UID values.
- No usernames.
- No avatars.
- No cookies.
- No tokens.
- No request headers.
- No raw API responses.
- No raw storage dumps.
- No private messages, backend, payment, account/security, or non-public pages.

Screenshot review:

1. Crop to the QoL badge, panel control, or dynamic badge area.
2. Blur or block comment body, username, avatar, UID/profile link, visible
   notifications, unrelated feed content, browser account UI, and Tampermonkey
   dashboard metadata not needed for proof.
3. Save only redacted PNGs under the evidence bundle.
4. Record every redaction in `privacy/redaction-log.md`.

Text scan:

```bash
run_dir="output/v0312-comment-dynamic-sampling/<run_id>"
{
  echo "privacy_scan_started_at=$(date -Iseconds)"
  rg -n --hidden --glob '!**/*.png' --glob '!**/*.jpg' --glob '!**/*.jpeg' \
    '(SESSDATA|bili_jct|DedeUserID|cookie|authorization|csrf|token|passwd|password|uid=|mid=|uname|username|avatar|face|comment hash|BVID:hash|raw comment|request headers)' \
    "$run_dir" || true
  echo "privacy_scan_finished_at=$(date -Iseconds)"
} | tee "$run_dir/privacy/privacy-scan.txt"
```

Manual review is still required. A clean `rg` scan does not prove screenshots
are safe.

If any artifact contains forbidden private values:

1. Stop capture.
2. Remove or redact the artifact inside the local output bundle.
3. Record the incident in `summary.json`.
4. Return `Blocked` unless the evidence can be fully sanitized without losing
   the proof basis.

If raw text is necessary to justify a verdict, mark that sample `Blocked`.

## Stop Conditions

Stop the whole run:

- Main-thread Safari capture authorization is absent.
- The run is using the current profile for any write-capable sample.
- Isolated Safari profile identity cannot be proven.
- Tampermonkey installed script hash does not match target dist hash.
- QoL Core runtime diagnostic cannot be produced from the isolated Safari main
  window.
- Login proof is required but cannot be captured without exposing identity
  values.
- `sample-url-manifest.json` is not frozen before enabling the target script on
  samples.
- Any artifact contains forbidden private values.
- Any sample requires raw comment text, raw hash, UID, username, avatar, cookie,
  token, request header, raw API body, or raw storage dump.
- Storage before summary is missing for a write-capable sample.
- Cleanup fails after a write.
- Dynamic or space/home adjacent evidence is being used to support video-page
  Local Learning closure.
- A page is MBGA, PCDN/WebRTC, release acceptance, payment, backend, private
  message, account/security, or otherwise out of scope.

Stop positive collection and mark `False Positive Risk`:

- An ordinary negative comment receives a commercial badge without strong
  abstract basis.
- An ordinary negative dynamic item receives a dynamic badge without strong
  abstract basis.
- A negative video sample writes a local commercial label.
- A quoted/mocking or anti-ad warning context is persisted.
- Feedback count changes without an intentional approved feedback action.
- Hide behavior is observed despite core samples being label-only.
- UI changes make comment/reply/dynamic layout restore impossible to judge.

## Verdict Matrix

Per-sample verdicts:

| Verdict | Required Meaning |
| --- | --- |
| `Verified` | UI/storage/privacy/cleanup evidence exists; no forbidden values; sample claim stays within surface boundary. |
| `Partial` | Non-critical proof is missing, cleanup is panel-derived, or storage digest is unavailable, but privacy and scope are intact. |
| `Not Verified` | Sample did not load, expected surface was absent, expected UI did not appear, or causality cannot be proven. |
| `False Positive Risk` | Negative/boundary sample crosses unsafe UI or storage boundary; main-thread review required before continuing positives. |
| `Blocked` | Privacy, profile, dist identity, authorization, cleanup, or scope gate failed. |

Overall verdict:

| Overall | Use When |
| --- | --- |
| `PASS_WITH_CAVEAT` | Required samples are `Verified` or acceptable `Partial`; all writes are cleaned in isolated profile; no privacy violations. |
| `PARTIAL` | Environment and privacy pass, but one or more required sample claims are only partial or not causally proven. |
| `NOT_VERIFIED` | Safari environment works, but stable sample surfaces are unavailable or do not trigger expected UI. |
| `FALSE_POSITIVE_RISK` | Any negative sample triggers unsafe badge/write behavior. Stop and ask main thread. |
| `BLOCKED` | Preflight, privacy, profile, dist identity, manifest, or cleanup gate fails. |

Main-thread exit matrix:

| Exit | Use When | This Plan's Recommendation |
| --- | --- | --- |
| `READY_FOR_SAFARI_CAPTURE` | Main thread accepts isolated-profile-only capture, placeholder manifest fill-before-capture rule, no raw text, no raw storage dump, label-only core samples, and dynamic-adjacent boundaries. | Recommended |
| `NEEDS_POLICY_TIGHTENING` | Main thread wants current-profile writes, hide-mode evidence, private raw export, stronger feedback lock closure, or exact current-profile restore. | Fallback |
| `NO-GO` | The evidence purpose depends on forbidden private data or cannot be separated from MBGA/release/runtime changes. | Not current recommendation |

## Summary JSON Requirements

The future capture bundle must finish with:

```json
{
  "target": "V0312 Comment/Dynamic Safari Sampling",
  "run_id": "v0312-comment-dynamic-safari-YYYYMMDD-HHMM",
  "status": "PASS_WITH_CAVEAT | PARTIAL | NOT_VERIFIED | FALSE_POSITIVE_RISK | BLOCKED",
  "capturedAt": "ISO-8601",
  "repository": {
    "path": "<repo-root>",
    "head": "git sha",
    "branch": "branch name"
  },
  "profile": {
    "scope": "isolated-safari-tampermonkey",
    "name": "Codex V0312 Comment Dynamic Clean",
    "currentProfileWriteCapable": false
  },
  "dist": {
    "path": "dist/bilibili-qol-core.user.js",
    "targetSha256": "hex",
    "installedScriptSha256": "hex",
    "installedEqualsDist": true
  },
  "safari": {
    "window": "main",
    "loggedIn": true,
    "loginProofFile": "login/safari-main-window-login-proof.json"
  },
  "config": {
    "before": "config/config-snapshot-before.json",
    "after": "config/config-snapshot-after.json",
    "compare": "config/config-compare.json"
  },
  "storage": {
    "before": "storage/before-summary.json",
    "final": "storage/final-summary.json",
    "cleanupCompare": "storage/cleanup-compare.json"
  },
  "samples": [
    {
      "sampleId": "comment-goods-01",
      "surface": "comment",
      "pageType": "video",
      "result": "Verified | Partial | Not Verified | False Positive Risk | Blocked",
      "evidencePaths": []
    }
  ],
  "privacy": {
    "scanFile": "privacy/privacy-scan.txt",
    "forbiddenValuesFound": false,
    "rawCommentTextSaved": false,
    "rawStorageDumpSaved": false
  },
  "blockingIssues": [],
  "caveats": [
    "isolated profile only",
    "current-profile restore not exercised",
    "dynamic samples are adjacent UI evidence only",
    "no release acceptance"
  ]
}
```

## Audit Handoff

The future capture thread should hand the main thread or audit thread:

- `summary.json`
- `sample-url-manifest.json`
- `sample-classification.csv`
- `sample-classification.md`
- dist hash and installed-script hash evidence
- isolated profile setup proof
- sanitized login proof
- config snapshots
- page folders with redacted screenshots and page-state JSON
- storage summaries and cleanup comparison
- privacy scan and redaction log

The audit must be able to reproduce each verdict from local evidence paths
without trusting sampler prose.

## Final Recommendation

Proceed to main-thread review as `READY_FOR_SAFARI_CAPTURE`, with the strict
condition that the capture thread uses an isolated Safari/Tampermonkey profile
and freezes exact sanitized sample URLs before enabling the target script on
those pages.

Do not authorize Safari capture if the main thread wants current-profile
write-capable evidence, hide-mode behavior, raw storage restore equality, or
sample explanations that require raw comment text. Those needs require
`NEEDS_POLICY_TIGHTENING` before any browser work.
