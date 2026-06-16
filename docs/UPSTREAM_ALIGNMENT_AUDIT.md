# Upstream Alignment

This document explains how Bilibili QoL Core v0.3.11 aligns with BilibiliSponsorBlock and SponsorBlock API behavior.

## Summary

The upstream service is not treated as unavailable. Whole-video feedback has a source boundary:

- `skipSegments` can return `actionType: "full"` segments with real UUIDs. Those can be voted on.
- `videoLabels` returns category summaries without votable UUIDs. Those are display-only.
- Local inference labels are written only to local learning data and are not sent upstream.

## Current API Mapping

| Capability | Current code path | Upstream API | Feedback support |
| --- | --- | --- | --- |
| Time segments | `SponsorBlockClient.getSegments()` | `GET /api/skipSegments/{hashPrefix}` | Segments can be processed |
| Community full labels | `resolveWholeVideoLabels()` from `actionType: "full"` segments | Same endpoint | Real UUID can be voted on |
| Whole-video label summaries | `VideoLabelClient.getVideoLabel()` | `GET /api/videoLabels/{hashPrefix}` | Display-only |
| Upstream vote | `SponsorBlockClient.vote()` | `POST /api/voteOnSponsorTime?UUID=...&userID=...&type=...` | Only real full UUIDs |

## Current Behavior

- `429` is handled as a rate-limit or retry-later error and does not write local vote history.
- API requests include `x-ext-version`.
- The script does not manually set `Origin`.
- New user IDs use 36-character base62 values.
- Existing UUID-style user IDs are preserved.
- Title badge wording distinguishes community `full` labels, whole-video label API summaries, and local inference labels.

## Remaining Differences

QoL Core does not currently implement:

- Segment submission.
- Category voting.
- Undo vote `type=20`.
- `/api/viewedVideoSponsorTime` skip-view reporting.
- portVideo binding and voting.

These differences do not block segment skipping or voting on real community `full` labels. They matter only if the project later targets complete upstream extension parity.

## Safari Validation Requirements

Real voting changes community data and should be performed only by a user who intentionally allows it.

Recommended manual check:

1. Find a video with a real community `full` label.
2. Confirm the title badge shows voting controls.
3. After user approval, click either `标记正确` or `标记有误` once.
4. Record the notice result and HTTP status.
5. Confirm that `video-label:*` and local inference labels clearly show that they cannot be voted on upstream.

## References

- [BilibiliSponsorBlock API Wiki](https://github.com/hanydd/BilibiliSponsorBlock/wiki/API)
- [SponsorBlock API Docs](https://wiki.sponsor.ajay.app/w/API_Docs)
- [BilibiliSponsorBlock voteRequest.ts](https://raw.githubusercontent.com/hanydd/BilibiliSponsorBlock/master/src/requests/background/voteRequest.ts)
- [BilibiliSponsorBlock videoLabelRequest.ts](https://raw.githubusercontent.com/hanydd/BilibiliSponsorBlock/master/src/requests/background/videoLabelRequest.ts)
- [BilibiliSponsorBlock background-request-proxy.ts](https://raw.githubusercontent.com/hanydd/BilibiliSponsorBlock/master/src/requests/background-request-proxy.ts)
