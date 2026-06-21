# User Guide

This guide covers daily use of Bilibili QoL Core v0.3.12.

## 1. Install

1. Install Tampermonkey for Safari.
2. Open [bilibili-qol-core.user.js](https://github.com/FilfTeen/bilibili-qol-core-userscript/raw/main/dist/bilibili-qol-core.user.js).
3. Confirm installation in Tampermonkey.
4. Open a supported Bilibili page.
5. Use the Tampermonkey menu item `打开 QoL Core 控制台` to open settings.

If Safari opens the script as plain text, import the raw URL in `Tampermonkey Dashboard -> Utilities -> Import from URL`.

## 2. Supported Pages

- Bilibili video pages.
- Bilibili list, bangumi, festival, and opus pages on a best-effort basis.
- Search pages.
- Dynamic-feed pages.
- Space pages.

Some non-standard page layouts may only receive part of the feature set.

## 3. SponsorBlock Segment Controls

Open the QoL Core console and adjust category actions:

- `skip`: automatically skip the segment.
- `mute`: mute during the segment.
- `poi_highlight`: show a point-of-interest marker.
- `full`: show whole-video nature labels.
- Disabled categories are ignored.

During playback, notices may offer:

- Undo skip.
- Keep current segment.
- Open settings.

If optional whole-video label metadata is unavailable, segment controls can still work when valid SponsorBlock segments are returned. If segment loading itself fails, QoL Core should show a degraded/error state rather than a false no-data result.

## 4. Whole-Video Labels

Labels may appear near the video title or on thumbnails. They can come from community `full` segments, whole-video label summaries, page signals, comment signals, or local records.

Use label feedback carefully:

- Community `full` labels can be voted on when a real UUID is available.
- API summary labels are display-only.
- Local labels affect only your browser.

## 5. Comment And Dynamic-Feed Modes

For comments and dynamic posts, start with marking mode. Folding mode is more aggressive and should be enabled only after you are comfortable with the recognition behavior.

If a comment or post is wrongly folded, use the restore control near the item when available.

## 6. Local Learning

Local learning can remember your choices for a video.

In the console's help and feedback area, you can:

- Review local video learning records.
- Delete one local video record.
- Clear all local video records after confirmation.
- See the count and update time for comment feedback locks.
- Clear comment feedback locks after confirmation.

Deleting a local video record does not block future automatic local inference. If the same signals appear again, the script may infer the label again.

## 7. MBGA Settings

MBGA is optional best-effort cleanup for selected page noise.

Recommended defaults:

- Keep the main MBGA switch enabled only if you find the cleanup useful.
- Keep experimental PCDN / WebRTC handling off unless you understand the tradeoff.
- Re-check behavior after Bilibili page changes.

MBGA is not a full privacy or network-control product.

## 8. Compact Header

The compact header is intended to reduce visual noise on video pages while preserving common search and account actions. It hides during fullscreen modes.

If you see login, search, playback, or comment issues after enabling it, disable the compact header first and retest.

## 9. Troubleshooting

Try these steps first:

1. Confirm Tampermonkey is enabled on the current page.
2. Reload the page after updating the userscript.
3. Check that the page URL is in the supported scope.
4. Temporarily disable aggressive comment or dynamic-feed folding.
5. Temporarily disable MBGA or compact header if a native page feature behaves oddly.
6. Reinstall the current raw userscript if Tampermonkey appears to run an old copy.

## 10. Data And Privacy Notes

- Local learning records stay in the current browser's Tampermonkey storage.
- Comment IP-location display only shows data already exposed by the current Bilibili page or payload.
- Local inference is an auxiliary signal and should not be treated as a factual decision about a creator or video.
- Configurable SponsorBlock service URLs require broad userscript connect permissions.

For more detail, read [Reliability](./RELIABILITY.md).
