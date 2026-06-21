# QoL Core v0.3.12 Release Notes

v0.3.12 is a narrow SponsorBlock upstream-resilience runtime release. It carries the v0.3.11 Local Learning Management baseline forward and fixes a client-side failure mode where optional whole-video label requests could block otherwise valid segment results.

## What Changed

- SponsorBlock `skipSegments` is treated as the core video-page path.
- Optional `videoLabels` lookup now degrades independently when it fails.
- Segment loading can remain alive when `videoLabels` returns 5xx, times out, returns invalid JSON, or returns an unexpected shape.
- Non-404 `skipSegments` failures enter a visible degraded/error state instead of being folded into a false no-data result.
- Upstream outage diagnostics separate segment failures from optional label failures while keeping display data bounded.

## User Impact

On videos where SponsorBlock segments are available, QoL Core should continue to show and apply segment behavior even if optional whole-video label metadata is unavailable. When segment loading itself fails because the upstream service is unavailable or slow, the UI should make that degraded state visible instead of saying the video has no SponsorBlock data.

## Boundaries

- MBGA behavior, defaults, rules, and claims are unchanged.
- The default SponsorBlock service remains `https://www.bsbsb.top`.
- No fallback server, automatic server migration, or retry-to-alternate-origin behavior is introduced.
- This release does not promise that `bsbsb.top` is currently healthy or unhealthy.
- Controlled mock-server validation proves the client degradation behavior; it is not a live availability guarantee for any public upstream service.

## Safari Validation Summary

Safari with Tampermonkey remains the primary validation environment. The v0.3.12 validation covered the installed userscript bytes, controlled segment outage scenarios, optional label outage scenarios with valid segments, normal recovery, and 404 no-data behavior.

Accepted caveat: repeated outage and retry scenarios can accumulate duplicate diagnostics up to the retained cap. The latest visible diagnostic surface remains bounded, and captured notices stayed bounded.

## Candidate Artifact

- File: `dist/bilibili-qol-core.user.js`
- Expected metadata: `@version 0.3.12`
- Candidate SHA-256: `928ee8ba1eddc3725fca15b1250f5f7b2638b17ceb4613b2d7aea6c86de5d4f7`

## Validation Commands

```bash
npm run check
npm test
npm run build
npm run verify:compat
```
