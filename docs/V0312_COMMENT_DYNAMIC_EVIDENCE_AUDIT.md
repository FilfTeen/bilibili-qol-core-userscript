# V0312 Comment / Dynamic Evidence Audit

Thread: `V0312 Comment/Dynamic Evidence Audit - Personal PARTIAL Capture`

Status: `AUDIT ONLY - NO RECAPTURE`

Evidence directory:

```text
output/v0312-comment-dynamic-sampling/v0312-comment-dynamic-safari-personal-authorized-20260611-004905/
```

## Exit Recommendation

`RETRY_ISOLATED_PROFILE_CAPTURE`

The personal-profile bundle is useful enough to retain as a caveated exploratory
artifact, but it should not close the original capture objective. The original
contract required an isolated Safari/Tampermonkey profile, frozen sample URLs
before target-script exposure on sample pages, and storage/cleanup evidence for
write-capable samples. This bundle does not satisfy those gates.

This is not a `NO-GO`: I did not find evidence that the package retained raw
comment text, identity values, cookies, tokens, request headers, raw API
responses, raw storage dumps, or screenshots. It also does not require a policy
rewrite before retry: the existing plan already states the relevant isolated
profile, URL freeze, privacy, storage, and stop-condition gates.

## Reviewed Artifacts

- `docs/V0312_COMMENT_DYNAMIC_CAPTURE_G3_REVIEW.md`
- `docs/V0312_COMMENT_DYNAMIC_SAMPLING_MANIFEST_PLAN.md`
- `summary.json`
- `sample-url-manifest.json`
- `sample-classification.csv`
- `sample-classification.md`
- `dist/installed-hash-compare.txt`
- `dist/installed-browser-hash-personal.json`
- `dist/installed-userscript.txt`
- `dist/installed-userscript-sha256.txt`
- `login/safari-main-window-login-proof.json`
- `privacy/privacy-scan.txt`
- `privacy/privacy-scan-review.md`
- `storage/before-summary.json`
- `storage/final-summary.json`
- `storage/cleanup-compare.json`
- sample `page-state.json` and `operator-notes.md` files
- profile caveat and routing notes where they directly explain the deviation

## Findings

### F1 - Installed Hash Proof Is Sufficient For Personal-Profile Dist Identity

The target repository dist file independently recomputes to:

```text
ec53876ecda67f51d92faa3d7af6679d4d3b3e04aa65ac48af6ac6f420ae7aa2
```

The local file size is `562044` bytes. These match `summary.json`,
`dist/installed-hash-compare.txt`, and
`dist/installed-browser-hash-personal.json`. The browser hash proof records the
Tampermonkey editor title/name/version, byte length, match patterns, CodeMirror
source, and the same SHA-256. `dist/installed-userscript.txt` is only a
`not_retained` placeholder, not the raw installed script.

Accepted scope: the personal Safari profile had the target dist installed and
enabled. Limitation: this does not prove anything about an isolated profile.

### F2 - Personal-Profile Deviation Is Blocking For Original Contract

The sampling plan required:

- `profile_scope = isolated-safari-tampermonkey`
- `current_profile_write_capable = false`
- no current-profile write-capable sampling

The evidence bundle instead records:

- `profile.scope = user-authorized-personal-safari-profile`
- `currentProfileWriteCapable = true`
- `policyDeviationFromOriginalManifest = true`
- the clean profile existed but could not complete logged-in sampling

Audit judgment: this is `PARTIAL` only as a personal-profile exploratory bundle.
It is `BLOCKED` for satisfying the original isolated-profile contract, and it is
not eligible for an overall pass-style caveat.

### F3 - URL Freeze Violation Prevents Positive Causality

`sample-url-manifest.json` records
`freeze_policy = violated_preexisting_script_enabled_before_freeze`, and the
profile caveat states that the target script was already running before sample
URL freeze.

This violation does not make every byte in the bundle useless, but it does
invalidate any claim that sample selection was independent of target-script
execution. Positive sample causality is not recoverable from this package.

### F4 - Privacy Scan False Positives Are Correctly Classified

The scan hits are schema field names or denial/presence booleans such as
`unamePresent`, `unameIncluded`, `avatarIncluded`, `cookieSaved`,
`tokenSaved`, `usernameIncluded`, `rawStorageSaved`, and `surface` containing
the substring `face`.

Manual audit agrees with `privacy/privacy-scan-review.md`:

- login proof stores presence booleans, not actual `mid`, `uname`, or avatar
  values;
- page-state files set raw text, username, UID, avatar, and raw API response
  inclusion flags to `false`;
- no screenshots exist in the bundle;
- raw installed source was not saved;
- raw personal-profile storage was not exported.

I found no retained raw text, identity value, cookie, token, request header, raw
API response, raw storage dump, or screenshot in the reviewed package.

### F5 - Sample Verdicts Mostly Match The Local Evidence

`comment-goods-01`: `Not Verified` is correct. The page loaded with
`targetScriptPresent = true`, but the trigger/after state shows
`commentBadgeCount = 0`, `commentFeedbackMenuCount = 0`, and no sample delete
button. Expected UI was not observed.

`comment-negative-ordinary-01`: `Partial` is acceptable only as a narrow
personal-profile observation that no unsafe UI was seen. The trigger state shows
`commentBadgeCount = 0`, `dynamicBadgeCount = 0`,
`commentFeedbackMenuCount = 0`, and no sample delete button. The proof is weak:
`commentRendererCount = 0`, no screenshot exists, and storage was not checked.
This row must not be promoted beyond the stated caveat.

`dynamic-goods-01`: `Not Verified` is correct. The dynamic surface loaded
(`dynamicItemCount = 1`), but `dynamicBadgeCount = 0`; expected UI was not
observed.

`dynamic-negative-ordinary-01`: `Not Verified` / not sampled is correct, but the
evidence path in `summary.json` and `sample-classification.csv` is invalid.
There is no corresponding
`samples/dynamic-negative-ordinary-01/trigger/operator-notes.md` in the bundle.
This row cannot count as sampled evidence.

### F6 - Storage `not_checked` Must Not Be Over-Interpreted

`storage/before-summary.json` and `storage/final-summary.json` use
`source = not_checked_personal_profile_no_raw_storage_export`, with raw hashes,
record counts, sample feedback lock counts, and non-sample digests all `null`.
`cleanup-compare.json` likewise has null before/final counts and null restore
booleans.

The `sampleStates[].present = false` fields are paired with
`reasonClass = not_checked_no_raw_storage_export`; they must not be treated as
proof that no sample state existed. The correct reading is: storage was not
exported to avoid exposing personal-profile data, so no storage absence,
write-causality, feedback-lock stability, non-sample equality, or cleanup
restore proof is available.

The cleanup label `not-needed-no-write-proven` should be read as "no write was
proven by the retained evidence", not as "absence of write was proven".

## Decision Matrix

| Question | Audit Result |
| --- | --- |
| Installed hash proof enough? | Yes, for personal-profile installed-dist identity only. |
| Personal-profile deviation | `BLOCKED` for original isolated contract; `PARTIAL` for exploratory artifact. |
| URL freeze violation | Blocks selection independence and positive causality; does not create privacy `NO-GO`. |
| Privacy scan classification | Correct schema/boolean false positives; no retained forbidden private values found. |
| Sample verdict consistency | Mostly consistent; dynamic negative evidence path is missing. |
| Storage interpretation | Must remain `not_checked`; no storage proof or cleanup proof. |
| Isolated retry needed? | Yes, if the project still needs closure-grade evidence. |

## Retry Requirements

A retry should keep the existing policy gates and execute them strictly:

- use only the isolated Safari/Tampermonkey profile for write-capable rows;
- freeze `sample-url-manifest.json` before target-script exposure on sample
  pages;
- scout with the target script absent or disabled and retain only abstract
  features;
- provide valid evidence paths for every required sample row, or explicitly mark
  the row not sampled without a fake path;
- capture storage summaries in the isolated profile without raw storage dumps;
- treat dynamic rows as adjacent UI evidence only;
- keep raw text, identities, cookies, tokens, request headers, raw API
  responses, raw storage dumps, screenshots, release/preflight, integration, and
  MBGA work out of scope.
