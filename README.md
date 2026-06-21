# Bilibili QoL Core (v0.3.12)

> A low-intrusion Bilibili enhancement userscript for Safari + Tampermonkey. It combines SponsorBlock segment handling, whole-video labels, comment and dynamic-feed hints, local learning controls, best-effort MBGA cleanup, and a compact settings console.

Bilibili QoL Core is designed to add useful signals without taking over the original Bilibili page. Local inference stays local, explainable, and reversible. Safari with Tampermonkey is the primary validation environment; Chromium-based Tampermonkey browsers are compatibility targets.

`v0.3.12` focuses on SponsorBlock upstream-resilience behavior. It keeps the v0.3.11 Local Learning Management baseline and fixes a client-side failure mode where optional whole-video label requests could block otherwise valid segment results. MBGA remains a known-rule, best-effort cleanup feature. Experimental PCDN / WebRTC handling stays off by default for new users.

## Core Features

- **SponsorBlock segment handling**: fetches segments by BVID hash prefix and supports skip, mute, point-of-interest highlights, preview bars, skip notices, undo, and keeping the current segment. Segment loading remains the core path even when optional whole-video label metadata is unavailable.
- **Whole-video labels**: combines community `full` segments, video-label API summaries, page signals, comment signals, and local user choices to show title and thumbnail labels.
- **Comment enhancements**: marks or folds likely commercial comments, product-card comments, suspicious promotion patterns, and reply-layer ads. It can also show Bilibili-provided IP location text when the page exposes it.
- **Dynamic-feed enhancements**: marks or folds likely commercial dynamic posts on supported home, dynamic, and space pages while prioritizing false-positive reduction.
- **Local inference and learning**: fills gaps when upstream data is unavailable and lets users keep, ignore, delete, or clear local video learning records.
- **Low-intrusion UI**: title badges, thumbnail badges, compact video header, notices, inline feedback, and the QoL Core console are added with minimal layout disruption.
- **MBGA cleanup**: applies a small set of known rules to reduce selected network, UI, and behavior noise. It is not a complete privacy product, telemetry blocker, or PCDN disabling tool.

## Installation

### Safari + Tampermonkey

1. Install Tampermonkey for Safari from the App Store.
2. Open the install link: [bilibili-qol-core.user.js](https://github.com/FilfTeen/bilibili-qol-core-userscript/raw/main/dist/bilibili-qol-core.user.js).
3. Click `Install` on the Tampermonkey confirmation page.
4. Open a supported Bilibili page and confirm that the userscript is enabled.
5. Open settings through the Tampermonkey menu item `打开 QoL Core 控制台`, the video title badge, or the player shield button.

If Safari opens the script as text, import the raw URL manually from `Tampermonkey Dashboard -> Utilities -> Import from URL`.

### Other Tampermonkey Browsers

Chrome and other Tampermonkey browsers can use the same userscript link. Safari remains the primary validation environment.

## Supported Pages

- `https://www.bilibili.com/*`
- `https://search.bilibili.com/*`
- `https://t.bilibili.com/*`
- `https://space.bilibili.com/*`

Video features focus on `/video/*`, `/list/*`, `/medialist/play/*`, `/bangumi/*`, `/festival/*`, and `/opus/*`. Non-standard video pages are handled on a best-effort basis.

## Documentation

- [Blueprint](./docs/BLUEPRINT.md): product structure, implemented capabilities, data boundaries, and validation entry points.
- [User Guide](./docs/USER_GUIDE.md): installation, configuration, and daily use.
- [Capabilities](./docs/CAPABILITIES.md): what QoL Core does and does not provide.
- [Technical Overview](./docs/TECHNICAL.md): module layout, runtime model, storage, and safety constraints.
- [Reliability](./docs/RELIABILITY.md): which signals are stronger, which are heuristic, and how to use them carefully.
- [Upstream Alignment](./docs/UPSTREAM_ALIGNMENT_AUDIT.md): differences from BilibiliSponsorBlock and SponsorBlock API behavior.
- v0.3.12 release notes: user-facing changes and caveats for the current release line.
- [v0.3.11 Release Notes](./docs/RELEASE_NOTES_V0311.md): previous Local Learning Management release notes.

## Configuration And Local Data

Main configuration is stored in Tampermonkey under `bsb_tm_config_v1`. The historical `bsb_tm_*` prefix is preserved for compatibility.

Configurable areas include:

- SponsorBlock service URL, cache, notice duration, and minimum segment length.
- Segment category actions and colors.
- Title, thumbnail, comment, and dynamic-feed label opacity.
- Comment filtering, comment IP-location display, and dynamic-feed filtering.
- Compact video header and grey-keyword search behavior.
- MBGA known-rule cleanup, experimental PCDN / WebRTC handling, URL cleanup, and UI simplification.

Other local data includes skip statistics, TTL caches, local whole-video labels, comment feedback locks, and whole-video vote history. Local learning data affects only the current browser and script instance.

## Main Differences From The Upstream Extension

| Area | Upstream extension | Bilibili QoL Core |
| --- | --- | --- |
| Distribution | Browser extension | Tampermonkey userscript |
| Runtime model | Background + content scripts | In-page script + page bridge |
| Settings entry | Popup / options page | QoL Core console, title badge, player button, Tampermonkey menu |
| Segment submission | Supported | Not supported |
| Voting | Full upstream flow | Only real community `full` labels can be voted on |
| Bilibili comments and dynamics | Not core scope | Local heuristic labels and folding controls |
| MBGA cleanup | Not applicable | Optional, known-rule, best-effort cleanup |

## Development And Verification

```bash
npm ci
npm run evaluate:recognition
npm test
npm run check
npm run build
npm run verify:compat
npm run validate:safari
```

Build artifact:

- `dist/bilibili-qol-core.user.js`

Real browser validation should be performed in a logged-in Safari main window after reloading the userscript in Tampermonkey. Automated browser checks are useful compatibility signals but do not replace Safari validation for release decisions.

## Disclaimer

Read [DISCLAIMER.md](./DISCLAIMER.md) before use. In short:

- This project is not an official product of Bilibili, SponsorBlock, Tampermonkey, or the upstream extension.
- Comment IP-location display only shows fields already exposed by the current Bilibili page or payload.
- Local commercial-content judgment is an auxiliary signal, not SponsorBlock community consensus or a Bilibili official conclusion.
- Page structure, APIs, login state, permissions, experiments, and browser policy changes can affect behavior.

## Credits

Bilibili QoL Core is maintained by Hush_. It is based on and inspired by [hanydd/BilibiliSponsorBlock](https://github.com/hanydd/BilibiliSponsorBlock) and public userscript adaptation ideas. See [NOTICE.md](./NOTICE.md) for source and license details.

## License

`GPL-3.0-only`. See [LICENSE](./LICENSE).
