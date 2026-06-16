# Capabilities

This page describes what Bilibili QoL Core v0.3.11 does, where the boundaries are, and what users should not expect from the script.

## 1. SponsorBlock Segments

QoL Core requests SponsorBlock segments for the current video context and applies the configured action per category.

Supported action types:

- `skip`: jump over a segment.
- `mute`: mute during a segment and restore audio afterward.
- `poi_highlight`: show and jump to a point of interest.
- `full`: show whole-video nature; it is not treated as a timed skip segment.

Related UI:

- Preview bars on the player timeline.
- Skip notices, undo, and keep-current actions.
- Player control-bar shield button.

Boundary: page structure, player behavior, login state, and API availability can affect segment behavior. Validate behavior in Safari after installing or updating the userscript.

## 2. Whole-Video Labels

Whole-video labels combine:

- SponsorBlock community `full` segments.
- Whole-video label API summaries.
- Local page title, description, and tag signals.
- Comment product cards and promotion signals.
- User-kept or user-ignored local records.

Display locations:

- Video title badge.
- Thumbnail badges on supported list, search, history, and recommendation cards.

Feedback boundary:

- Only real community `full` segments from `skipSegments` include a votable UUID.
- Whole-video label API summaries are display-only.
- Local labels affect only the current browser and script instance.

## 3. Comment Enhancements

QoL Core can mark or fold comments that look like:

- Product-card comments.
- Strong promotion or purchase guidance.
- Suspicious promotional replies.
- Commercial phrases matched by local heuristics.

It can also show IP-location text that Bilibili already exposes in the current page payload.

Boundary: comment recognition is conservative heuristic logic. It can miss subtle promotion and can misread jokes, quotes, reviews, or event descriptions. Start with marking mode before enabling folding.

## 4. Dynamic-Feed Enhancements

Dynamic-feed support marks or folds likely commercial dynamic posts on supported feed pages.

Boundary: dynamic-feed recognition is heuristic and should be used as an aid, not as a factual judgment about the author or content.

## 5. Local Learning Management

Local learning helps fill gaps when upstream whole-video data is unavailable.

Users can:

- Keep a local label.
- Ignore a local label.
- View local video learning records.
- Delete one local video record.
- Clear all local video learning records after confirmation.
- Clear comment feedback locks after confirmation.

Boundary: local learning data is stored only in the current browser's Tampermonkey storage. It does not change upstream SponsorBlock data or Bilibili data.

## 6. QoL Core Console

The console provides:

- Category behavior and color settings.
- Comment and dynamic-feed settings.
- MBGA and compact-header controls.
- Local learning management.
- Diagnostic summaries for advanced troubleshooting.

The console is a page overlay. It does not replace Bilibili settings.

## 7. Compact Video Header

The compact header preserves common search and account actions on supported video pages with a smaller footprint.

Boundary: it hides during fullscreen modes and must not interfere with login, search, playback, comments, or Bilibili risk-control flows.

## 8. MBGA Cleanup

MBGA applies a limited set of known rules for selected network, UI, and behavior noise.

It may:

- Remove selected URL noise parameters.
- Simplify selected page UI elements.
- Observe or synthesize responses for a narrow list of topbar badge requests when the compact header is active.
- Apply optional experimental PCDN / WebRTC handling when enabled.

It does not:

- Guarantee complete telemetry blocking.
- Guarantee complete PCDN disabling.
- Provide a full privacy product.
- Replace browser-level privacy, network, or extension controls.

## 9. Not Implemented

QoL Core does not currently provide:

- SponsorBlock segment submission.
- Full upstream category voting.
- Undo vote support.
- Viewed-sponsor-time reporting.
- portVideo binding and voting.
- Cloud sync for local learning records.
- A guarantee that Bilibili interface changes will not break selectors.
