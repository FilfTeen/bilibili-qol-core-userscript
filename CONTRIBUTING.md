# Contributing

## Development Goals

Bilibili QoL Core is not a one-to-one port of every upstream browser extension control. The goal is to deliver the most useful Bilibili quality-of-life features reliably within Tampermonkey userscript constraints.

Development priorities:

1. Real video pages should identify video context consistently and handle segments correctly.
2. High-traffic surfaces such as the home page, dynamic feed, and comment areas should tolerate Bilibili SPA navigation and shadow DOM changes.
3. False positives and accidental hiding must be reversible through explicit controls and fallback paths.
4. New behavior should include focused tests or browser smoke coverage.

## Local Development

```bash
npm ci
npm run check
npm test
npm run build
```

Build artifact:

- `dist/bilibili-qol-core.user.js`

## Browser Smoke Checks

The repository includes a local Bilibili smoke helper:

```bash
npm run smoke:bilibili
```

This smoke check is useful for sampling and quick observation, but it is not the final release signal for QoL Core runtime behavior.

By default it uses the local Chrome executable:

- `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`

Set `BSB_SMOKE_BROWSER_PATH` to use a different browser path.

Current smoke coverage includes:

- home-page floating entry button
- home and dynamic-feed style content filtering
- video-page SponsorBlock request flow
- top-level comment filtering
- comment reply filtering

## Safari Release Validation

Safari with Tampermonkey is the primary runtime environment for this userscript.

Before a runtime release, contributors should run:

```bash
npm run check
npm test
npm run build
npm run validate:safari
```

Automated checks are useful compatibility signals. A runtime release should also receive a manual Safari main-window smoke pass with the userscript installed and enabled in Tampermonkey, using a logged-in browser profile when the behavior depends on Bilibili account state. This manual pass should cover the main supported surfaces touched by the change, especially video pages, comment areas, dynamic-feed filtering, settings access, and visible fallback controls.

## Test Expectations

- `test/video-context.test.ts` covers video ID, `cid`, and `page` parsing.
- `test/navigation.test.ts` covers SPA route-change handling.
- `test/comment-filter.test.ts` covers top-level comments and comment replies.
- `test/dynamic-filter.test.ts` covers dynamic-feed commercial-content recognition.

Before submitting changes, at minimum run:

```bash
npm run check
npm test
npm run build
```

For changes involving live page behavior, Bilibili DOM structure, comments, player behavior, or MBGA cleanup, also run:

```bash
npm run smoke:bilibili
npm run validate:safari
```

## Release Flow

1. Confirm `main` passes `check`, `test`, and `build`.
2. Update the version when a new runtime version is intentionally being prepared.
3. Build `dist/bilibili-qol-core.user.js`.
4. Create the matching `v*` tag.
5. Push the tag to trigger the GitHub Actions release workflow.

## Code Style

- Prefer testable pure functions before DOM controllers.
- Isolate Bilibili page selectors and shadow DOM access behind small helpers.
- Validate remote payloads through explicit allowlists.
- For behavior with high false-positive risk, prefer `label` mode before `hide` mode.
