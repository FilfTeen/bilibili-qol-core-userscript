# QoL Core v0.3.11 Release Notes

## Summary

v0.3.11 focuses on Local Learning Management, clearer diagnostic behavior, and conservative capability boundaries. It does not expand SponsorBlock upstream behavior, MBGA blocking claims, or local inference aggressiveness.

## Highlights

- Local Learning Management is available in the QoL Core console `帮助 / 反馈` page.
- Users can inspect local video learning records.
- Users can delete individual local video records or clear all local video learning records after confirmation.
- The console shows comment feedback lock counts and can clear those locks after confirmation without exposing comment text.
- The local learning panel refreshes after manual record actions and after automatic local signals are persisted.
- MBGA records bounded diagnostic summaries, including action counts and recent rule samples.
- Native request guard diagnostics expose bounded snapshots for observed, synthetic, blocked, rewritten, stubbed, skipped, and error-like behavior.
- Diagnostic sample resource URLs are normalized for readability and privacy.

## Caveats

- MBGA remains best-effort, known-rule, and partial cleanup. It is not a complete privacy product, complete telemetry blocker, or complete Bilibili ecosystem cleanup tool.
- PCDN / WebRTC handling remains partial and experimental. New users keep this sub-feature off by default; existing explicit user settings are preserved.
- Native request guard remains a narrow topbar-badge guard, not a general request blocker.
- Local inference and comment promotion detection remain conservative heuristics, not model-grade semantic judgment.
- Local Learning Management only manages records in the current browser and script instance. It cannot delete upstream SponsorBlock or video label records.
- Comment scanning that automatically writes local learning records should remain conservative until more real-page samples confirm behavior.

## Release Validation Requirements

- Rebuild and reload `dist/bilibili-qol-core.user.js` in Tampermonkey before Safari validation.
- Do not judge the loaded script only by `@version`; verify behavior after reloading.
- Confirm the old `dist/bilibili-sponsorblock.user.js` artifact does not reappear.
- Validate core video, comment, dynamic-feed, thumbnail, console, and upstream full-label feedback behavior in Safari before making stronger release claims.

## Short Changelog Summary

QoL Core v0.3.11 adds Local Learning Management and improves diagnostic transparency. MBGA remains best-effort, partial, and experimental where appropriate. Safari validation remains the reference for stronger compatibility claims.
