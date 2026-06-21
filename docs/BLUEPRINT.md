# Bilibili QoL Core v0.3.12 Blueprint

This blueprint is the public product map for Bilibili QoL Core. It describes the runtime shape, implemented features, data boundaries, and validation entry points for contributors and advanced users.

`v0.3.12` is the current release line. It focuses on SponsorBlock upstream-resilience behavior while carrying forward Local Learning Management, diagnostic transparency, conservative MBGA cleanup, and clear upstream behavior boundaries.

## 1. Runtime Environment

| Area | Current shape |
| --- | --- |
| Distribution | Tampermonkey single-file userscript |
| Primary validation browser | Safari main window with Tampermonkey |
| Entry file | `src/main.ts` |
| Build script | `scripts/build.mjs` |
| Build artifact | `dist/bilibili-qol-core.user.js` |
| Settings entries | Tampermonkey menu, title badge, and player shield button |

Startup flow:

1. Install the page bridge and native request guard at `document-start`.
2. Confirm top-level window and supported page scope.
3. Inject styles and runtime bridge.
4. Load config, statistics, caches, local labels, and vote history.
5. Mount MBGA when enabled.
6. Start video, comment, dynamic-feed, and thumbnail controllers.
7. Register Tampermonkey menu commands.
8. Hand lifecycle events to the runtime lifecycle manager.

## 2. Capability Index

| Capability | User value | Main implementation | Key tests | Validation focus |
| --- | --- | --- | --- | --- |
| SponsorBlock segments | Skip ads, mute sections, show POI highlights | `src/core/controller.ts`, `src/api/sponsorblock-client.ts`, `src/core/segment-filter.ts` | `test/controller.test.ts`, `test/segment-filter.test.ts` | Segment load, optional label outage resilience, preview bar, skip, undo, keep-current, mute, POI |
| Whole-video labels | Show commercial nature for the whole video | `src/core/whole-video-label.ts`, `src/api/video-label-client.ts`, `src/ui/title-badge.ts` | `test/whole-video-label.test.ts`, `test/title-badge.test.ts` | Unique title badge, clear popover, correct feedback entry |
| Thumbnail labels | Show video nature before opening videos | `src/features/thumbnail-labels.ts` | `test/thumbnail-labels.test.ts` | Home, search, history, and recommendation cards stay readable |
| Comment enhancements | Mark or fold ads and suspicious promotion | `src/features/comment-filter.ts`, `src/utils/commercial-intent.ts` | `test/comment-filter.test.ts`, `test/commercial-intent.test.ts` | Product cards, promotion language, reply layer, restore action |
| Comment IP location | Display Bilibili-provided location text | `src/features/comment-filter.ts`, `src/ui/inline-feedback.ts` | `test/comment-filter.test.ts`, `test/inline-feedback.test.ts` | No fabricated location when payload does not expose it |
| Dynamic-feed enhancements | Mark or fold likely commercial dynamic posts | `src/features/dynamic-filter.ts` | `test/dynamic-filter.test.ts` | Supported feed pages, false-positive protection, restore action |
| Local learning | Let users manage local whole-video learning | `src/utils/local-video-signal.ts`, `src/utils/local-learning.ts`, `src/core/local-label-store.ts`, `src/ui/panel.ts` | `test/local-video-signal.test.ts`, `test/local-learning.test.ts`, `test/local-label-store.test.ts`, `test/panel.test.ts` | Keep, ignore, delete, clear, and refresh behavior |
| QoL Core console | Configuration and local maintenance | `src/ui/panel.ts`, `src/ui/styles.ts` | `test/panel.test.ts`, `test/styles.test.ts` | Color editing, confirmations, scrolling, responsive layout |
| Compact header | Search and account access on video pages | `src/ui/compact-header.ts`, `src/platform/native-request-guard.ts`, `src/utils/page.ts` | `test/compact-header.test.ts`, `test/native-request-guard.test.ts`, `test/page.test.ts` | Fullscreen behavior, search continuity, login-safe guard behavior |
| Notice center | Low-noise feedback and actions | `src/ui/notice-center.ts` | `test/notice-center.test.ts` | Animation, player avoidance, cleanup |
| MBGA | Best-effort cleanup for known page noise | `src/features/mbga/core.ts` | `test/mbga.test.ts` | Known-rule behavior, no broad blocking, no visible breakage |

## 3. Page Scope

| Page | Detected type | Supported features |
| --- | --- | --- |
| `www.bilibili.com/video/*` | `video` | Segments, title label, comments, thumbnails, compact header, MBGA |
| `www.bilibili.com/list/*` | `list` | Video features on a best-effort basis |
| `www.bilibili.com/medialist/play/*` | `list` | Video features on a best-effort basis |
| `www.bilibili.com/bangumi/*` | `anime` | Video features on a best-effort basis |
| `www.bilibili.com/festival/*` | `festival` | Video features on a best-effort basis |
| `www.bilibili.com/opus/*` | `opus` | Video and comment features on a best-effort basis |
| `search.bilibili.com/*` | `search` | Thumbnail labels |
| `t.bilibili.com/*` | `dynamic` | Dynamic-feed enhancements and comment features on a best-effort basis |
| `space.bilibili.com/*` | `channel` | Dynamic-feed enhancements and thumbnail labels on a best-effort basis |

## 4. Whole-Video Label Priority

Whole-video judgment uses this order:

1. SponsorBlock `full` segment.
2. Whole-video label API summary.
3. User-kept or user-ignored local record.
4. Local page signal.
5. Local comment signal.

When upstream data is present, local inference does not override it. Manual local records have priority over automatic local signals.

## 5. Configuration And Storage

Main config comes from `DEFAULT_CONFIG` in `src/constants.ts`.

Primary Tampermonkey storage keys:

- `bsb_tm_config_v1`
- `bsb_tm_stats_v1`
- `bsb_tm_cache_v1`
- `bsb_tm_user_id_v1`
- `bsb_tm_local_video_labels_v1`
- `bsb_tm_comment_feedback_v1`
- `bsb_tm_vote_history_v1`

The `bsb_tm_*` prefix is kept for compatibility and does not follow the visible project name.

## 6. Network And Safety Boundaries

- The SponsorBlock service URL is configurable and defaults to `https://www.bsbsb.top`.
- API requests include `x-ext-version` and do not manually forge `Origin`.
- `skipSegments` is the core segment path. Optional `videoLabels` failures must not suppress valid segment results.
- No fallback server, default server change, or automatic server migration is part of v0.3.12.
- The native request guard only returns synthetic responses for a narrow list of topbar badge requests after the compact header is mounted.
- It does not block avatar, search, login, playback, comment, dynamic-feed, or risk-control requests.
- Comment author profile requests are used only as optional promotion-detection hints and fail silently.
- MBGA is a known-rule, best-effort feature. It is not a complete privacy shield or complete PCDN disabling tool.

Safety boundaries:

- Runtime code avoids dynamic code execution.
- DOM output prefers `createElement` and `textContent`.
- `@connect *` exists because the SponsorBlock service URL is configurable and should remain visible to users.
- `unsafeWindow` is limited to the MBGA rule module.

## 7. Validation Entry Points

Basic validation:

```bash
npm run evaluate:recognition
npm test
npm run check
npm run build
npm run verify:compat
git diff --check
```

Safari validation helpers:

```bash
npm run validate:safari
npm run investigate:safari-player -- --sample-id <id> --window-type existing_logged_in_window --login-state logged_in
```

Automated browser smoke checks are useful compatibility signals, but release confidence still requires a logged-in Safari main-window pass for the features being shipped.

## 8. Iteration Notes

- High-conflict files include `src/core/controller.ts`, `src/core/config-store.ts`, `src/types.ts`, `src/ui/styles.ts`, and `src/ui/panel.ts`.
- Recognition changes should update sample evaluation and false-positive protections.
- UI changes should avoid taking over native Bilibili layout.
- Network interception changes require request attribution and rollback behavior.
- `dist` is generated by the build and should not be hand-edited.
