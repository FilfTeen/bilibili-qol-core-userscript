# Technical Overview

Bilibili QoL Core v0.3.11 is a Tampermonkey userscript that enhances supported Bilibili pages with SponsorBlock segment handling, whole-video labels, local learning controls, comment and dynamic-feed hints, compact UI, and optional MBGA cleanup.

## Project Goals

- Keep the page enhancement low-intrusion.
- Preserve clear boundaries between upstream data, local inference, and user choices.
- Avoid broad network blocking.
- Keep user-visible data local unless an upstream feedback action is explicitly submitted.
- Validate browser behavior in Safari for release confidence.

## Directory Layout

- `src/api`: SponsorBlock segment client and whole-video label client.
- `src/core`: config, cache, controller, segment filtering, whole-video label resolution, local labels, user id, and vote history.
- `src/features`: comment filter, dynamic-feed filter, thumbnail labels, and MBGA.
- `src/platform`: Tampermonkey API wrapper, page bridge, and native request guard.
- `src/runtime`: lifecycle and menu registration.
- `src/ui`: console, notices, title badge, compact header, preview bar, inline feedback, icons, and styles.
- `src/utils`: page detection, BVID parsing, URL handling, DOM helpers, navigation, local learning, and video context.
- `test`: Vitest unit and regression tests.
- `scripts`: build, compatibility verification, recognition evaluation, browser smoke, and Safari validation helpers.

## Runtime Model

1. `src/main.ts` starts at `document-start`.
2. The script runs only in the top-level window and supported page scope.
3. The native request guard is installed early and observes by default.
4. Styles and the page bridge are injected.
5. Config, statistics, caches, local labels, and vote history are loaded.
6. MBGA, video, comment, dynamic-feed, and thumbnail controllers start according to config.
7. Tampermonkey menu commands are registered.
8. Runtime lifecycle handles start, stop, `pageshow`, `pagehide`, and Safari BFCache behavior.

## Segment Flow

1. Resolve the current video context.
2. Request SponsorBlock segments.
3. Normalize segments by category mode, `cid`, and minimum duration.
4. Bind the controller to the video element.
5. Drive skip, mute, notice, and point-of-interest behavior from playback time.
6. Render timeline preview markers and notices.

## Whole-Video Label Flow

1. Prefer SponsorBlock `full` segments.
2. Use the whole-video label API summary when available.
3. Use local page or comment signals only when upstream data is absent.
4. Apply local learning rules for persistence and user overrides.
5. Render title and thumbnail labels.

## Upstream Voting Flow

1. Only real community `full` segment UUIDs can be voted on.
2. `2xx` responses count as success.
3. `405` is treated as a duplicate submission.
4. `429`, `400/403`, `5xx`, and network failures do not write vote history.
5. Requests include `x-ext-version`.
6. New user IDs use 36-character base62 values; old UUID-style IDs are preserved.

## Native Request Guard

The native request guard works through the page bridge at the fetch/XHR layer. It returns synthetic responses only when all of these are true:

- QoL Core is enabled.
- The current page supports the compact video header.
- The compact header has mounted.
- The request matches a narrow topbar badge path such as `/x/msgfeed/unread` or `/x/web-interface/nav/stat`.

It does not block `/x/web-interface/nav`, search, playback, comments, dynamic-feed, login, or risk-control requests.

## Comment And Dynamic-Feed Flow

1. Page controllers observe supported DOM regions.
2. Comment handling extracts renderer data, product cards, text, author hints, and exposed location text.
3. Dynamic-feed handling extracts post text, product structure, and forward context.
4. Text and structure signals pass through shared commercial-intent logic.
5. The UI renders labels, fold notices, restore actions, or local feedback events.

## MBGA Flow

MBGA uses explicit rules from `MBGA_RULES`. Rules are enabled by page type and user config. Some rules access `unsafeWindow`, so they must stay bounded, testable, and reversible.

MBGA should be understood as a best-effort known-rule feature. It should not be presented as complete telemetry blocking, complete PCDN disabling, or full privacy protection.

`disable-pcdn` is experimental and defaults to off for new users. Existing explicit user settings are preserved.

## Storage

Tampermonkey keys:

- `bsb_tm_config_v1`
- `bsb_tm_stats_v1`
- `bsb_tm_cache_v1`
- `bsb_tm_user_id_v1`
- `bsb_tm_local_video_labels_v1`
- `bsb_tm_comment_feedback_v1`
- `bsb_tm_vote_history_v1`

The local learning UI shows a sanitized summary of local video labels and allows deletion or clearing. It does not expose comment text.

Cache defaults:

- TTL: 1 hour.
- Maximum entries: 1000.
- Maximum size: 500 KiB.

## Low-Intrusion UI Rules

- Append independent nodes instead of rewriting native content.
- Avoid broad layout CSS on Bilibili containers.
- Anchor thumbnail labels to cover geometry.
- Put comment and dynamic-feed labels near the matched item.
- Hide the compact header during fullscreen modes.
- Keep the console isolated as a fixed overlay.

## Safety Rules

- Prefer `textContent`, `createElement`, and event listeners.
- Do not use dynamic code execution.
- Prefer `GM_xmlhttpRequest` for Tampermonkey network requests, with fetch fallback where needed.
- Keep page-bridge messages internal and correlated by random request IDs.
- Keep request guard rules narrow.
- Treat `@connect *` as a visible permission boundary caused by configurable service URLs.
- Keep `unsafeWindow` use limited to the MBGA rule module.

## Validation

Recommended local order:

```bash
npm run evaluate:recognition
npm test
npm run check
npm run build
npm run verify:compat
git diff --check
npm run validate:safari
```

Release validation should include Safari main-window coverage for video pages, comments, dynamic pages, home/search cards, the console, and upstream full-label feedback when the user intentionally permits a real vote.
