# Reliability

Bilibili QoL Core is an auxiliary tool. It is not an official platform judgment, ad-disclosure authority, or privacy product. This page explains which signals are stronger and which should be treated carefully.

## Stronger Signals

- SponsorBlock recorded time segments.
- SponsorBlock community `full` labels.
- Bilibili payload fields that the page already exposes, such as comment IP-location text.
- User-kept or user-ignored local whole-video records.

These signals have clearer sources or explicit user intent. They can still be affected by API state, page context, browser behavior, and script version.

In v0.3.12, optional whole-video label request failures are handled separately from core segment loading. This makes valid segment results more reliable during partial upstream failures.

## Medium-Confidence Signals

- Whole-video label API summaries.
- Whole-video thumbnail badges on home, search, history, and recommendation cards.
- Comment product-card detection.
- Strong purchase-flow or promotion signals in comments and dynamic posts.
- MBGA known-rule cleanup for selected URL, host, UI, and PCDN/WebRTC paths.

Whole-video label API summaries are display-only and do not include a votable community UUID.

MBGA only means that the script tries to reduce selected known page noise. It does not guarantee full telemetry blocking, complete PCDN disabling, or complete Bilibili page cleanup.

## Heuristic Signals

These features can produce false positives or false negatives:

- Local page title, description, and tag inference.
- Comment text promotion and suspicious-reply detection.
- Dynamic-feed commercial-content detection.
- Local learning after automatic inference.

QoL Core prioritizes reducing false positives over maximizing recall.

## Common Error Types

- **False positive**: ordinary reviews, event notes, borrowed products, quoted ad language, or jokes can look commercial.
- **False negative**: new promotion phrasing, subtle steering, and joking ads may be missed.
- **Temporary mismatch**: title badges, thumbnail badges, comment hints, and local records may not update at exactly the same moment.
- **Page compatibility issue**: Bilibili DOM, Shadow DOM, APIs, or experiment changes can temporarily break selectors.
- **Environment issue**: login state, permission, API rate limit, Safari isolation, or browser policy can affect behavior.

## Local Learning Boundary

Local learning affects only the current browser and current script instance.

It does not represent:

- SponsorBlock community consensus.
- Bilibili official classification.
- A creator's actual sponsorship status.
- Results reproducible by other users.

If you keep or ignore the wrong local label, the script will respect that record until you delete it or change the relevant setting.

## Upstream Feedback Boundary

- Real community `full` labels can be voted on.
- `video-label:*` summaries cannot be voted on directly.
- `local-signal:*` labels are local and are not sent upstream.
- `429` means the request was rate-limited and is not treated as success.

## Upstream Availability Boundary

The default SponsorBlock service remains `https://www.bsbsb.top`. v0.3.12 does not add a fallback server, change the default server, or promise current live health for the default server. Controlled mock-server validation covers client behavior during outage-like responses: segment outages should surface as degraded/error, while optional label outages should not suppress valid segments.

## Recommended Use

- Start comment and dynamic-feed features in marking mode.
- Treat local labels as suggestions, not facts.
- Use video context, creator notes, and actual comment context for disputed cases.
- If a feature breaks native page behavior, disable the related setting first and retest.

## Safari Validation

Safari is the primary validation environment. Automated browser checks and non-Safari browsers can catch compatibility issues, but logged-in Safari main-window behavior remains the reference for release confidence.
