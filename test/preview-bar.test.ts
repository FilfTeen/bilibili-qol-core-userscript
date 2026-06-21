import { describe, expect, it } from "vitest";
import { PreviewBar } from "../src/ui/preview-bar";
import type { SegmentRecord } from "../src/types";

function createSegment(overrides: Partial<SegmentRecord> = {}): SegmentRecord {
  const start = overrides.start ?? 10;
  const end = overrides.end ?? 20;

  return {
    UUID: "segment-1",
    category: "sponsor",
    actionType: "skip",
    segment: end === null ? [start] : [start, end],
    start,
    end,
    duration: end === null ? null : end - start,
    mode: "auto",
    ...overrides
  };
}

function setupBoundPreviewBar(duration = 100): {
  previewBar: PreviewBar;
  main: HTMLElement;
  shadow: HTMLElement;
  video: HTMLVideoElement;
} {
  document.body.innerHTML = `
    <div class="bpx-player-control-wrap">
      <div class="bpx-player-progress-area">
        <div class="bpx-player-progress-wrap"></div>
      </div>
      <div class="bpx-player-shadow-progress-area"></div>
    </div>
    <div class="bpx-player-container">
      <video></video>
    </div>
  `;

  const main = document.querySelector(".bpx-player-progress-wrap") as HTMLElement;
  const shadow = document.querySelector(".bpx-player-shadow-progress-area") as HTMLElement;
  const video = document.querySelector("video") as HTMLVideoElement;
  Object.defineProperty(video, "duration", {
    configurable: true,
    value: duration
  });

  const previewBar = new PreviewBar();
  previewBar.bind(video);

  return { previewBar, main, shadow, video };
}

function markerPayloads(selector: string): Array<{ category: string | undefined; actionType: string | undefined }> {
  return Array.from(document.querySelectorAll<HTMLLIElement>(selector), (marker) => ({
    category: marker.dataset.category,
    actionType: marker.dataset.actionType
  }));
}

describe("preview bar", () => {
  it("renders overlay bars into the player progress areas", () => {
    const { previewBar } = setupBoundPreviewBar();
    previewBar.setSegments([
      createSegment({
        UUID: "segment-1"
      })
    ]);

    expect(document.querySelectorAll("#previewbar .previewbar").length).toBe(1);
    expect(document.querySelectorAll("#shadowPreviewbar .previewbar").length).toBe(1);
  });

  it("re-resolves progress parents when they appear after the initial bind", () => {
    document.body.innerHTML = `
      <div class="bpx-player-container">
        <video></video>
      </div>
    `;

    const video = document.querySelector("video") as HTMLVideoElement;
    Object.defineProperty(video, "duration", {
      configurable: true,
      value: 100
    });

    const previewBar = new PreviewBar();
    previewBar.bind(video);

    const controls = document.createElement("div");
    controls.className = "bpx-player-control-wrap";
    controls.innerHTML = `
      <div class="bpx-player-progress-wrap"></div>
      <div class="bpx-player-shadow-progress-area"></div>
    `;
    document.body.appendChild(controls);

    previewBar.bind(video);
    previewBar.setSegments([
      createSegment({
        UUID: "segment-2",
        start: 5,
        end: 10
      })
    ]);

    expect(document.querySelectorAll("#previewbar .previewbar").length).toBe(1);
  });

  it("renders category and action-type attributes for skip mute and POI markers", () => {
    const { previewBar } = setupBoundPreviewBar();
    previewBar.setSegments([
      createSegment({
        UUID: "segment-skip",
        category: "sponsor",
        actionType: "skip",
        segment: [10, 25],
        start: 10,
        end: 25,
        duration: 15
      }),
      createSegment({
        UUID: "segment-mute",
        category: "music_offtopic",
        actionType: "mute",
        segment: [30, 40],
        start: 30,
        end: 40,
        duration: 10
      }),
      createSegment({
        UUID: "segment-poi",
        category: "poi_highlight",
        actionType: "poi",
        segment: [60],
        start: 60,
        end: null,
        duration: null,
        mode: "manual"
      })
    ]);

    const expectedMarkers = [
      { category: "sponsor", actionType: "skip" },
      { category: "music_offtopic", actionType: "mute" },
      { category: "poi_highlight", actionType: "poi" }
    ];

    const mainMarkers = markerPayloads("#previewbar .previewbar");
    const shadowMarkers = markerPayloads("#shadowPreviewbar .previewbar");
    expect(mainMarkers).toHaveLength(3);
    expect(shadowMarkers).toHaveLength(3);
    expect(mainMarkers).toEqual(expect.arrayContaining(expectedMarkers));
    expect(shadowMarkers).toEqual(expect.arrayContaining(expectedMarkers));
  });

  it("excludes full records from preview markers", () => {
    const { previewBar } = setupBoundPreviewBar();
    previewBar.setSegments([
      createSegment({
        UUID: "segment-skip"
      }),
      createSegment({
        UUID: "segment-full",
        category: "exclusive_access",
        actionType: "full",
        segment: [0, 0],
        start: 0,
        end: 0,
        duration: 0,
        mode: "manual"
      })
    ]);

    expect(markerPayloads("#previewbar .previewbar")).toEqual([{ category: "sponsor", actionType: "skip" }]);
    expect(markerPayloads("#shadowPreviewbar .previewbar")).toEqual([{ category: "sponsor", actionType: "skip" }]);
  });

  it("renders POI markers with visible minimum width and POI opacity", () => {
    const { previewBar } = setupBoundPreviewBar(1000);
    previewBar.setSegments([
      createSegment({
        UUID: "segment-poi",
        category: "poi_highlight",
        actionType: "poi",
        segment: [100],
        start: 100,
        end: null,
        duration: null,
        mode: "manual"
      })
    ]);

    const marker = document.querySelector<HTMLLIElement>("#previewbar .previewbar");
    const minimumRightPercent = 100 - ((100 + 0.6) / 1000) * 100;
    expect(marker?.dataset.actionType).toBe("poi");
    expect(marker?.style.left).toBe("10%");
    expect(Number.parseFloat(marker?.style.right ?? "100")).toBeLessThanOrEqual(minimumRightPercent);
    expect(marker?.style.opacity).toBe("0.9");
  });

  it("removes markers when disabled or cleared while keeping preview hosts mounted", () => {
    const { previewBar, main, shadow } = setupBoundPreviewBar();
    previewBar.setSegments([
      createSegment({
        UUID: "segment-skip"
      })
    ]);

    previewBar.setEnabled(false);

    expect(document.querySelectorAll("#previewbar .previewbar")).toHaveLength(0);
    expect(document.querySelectorAll("#shadowPreviewbar .previewbar")).toHaveLength(0);
    expect(document.querySelector("#previewbar")?.parentElement).toBe(main);
    expect(document.querySelector("#shadowPreviewbar")?.parentElement).toBe(shadow);

    previewBar.setEnabled(true);
    expect(document.querySelectorAll("#previewbar .previewbar")).toHaveLength(1);

    previewBar.clear();

    expect(document.querySelectorAll("#previewbar .previewbar")).toHaveLength(0);
    expect(document.querySelectorAll("#shadowPreviewbar .previewbar")).toHaveLength(0);
    expect(document.querySelector("#previewbar")?.parentElement).toBe(main);
    expect(document.querySelector("#shadowPreviewbar")?.parentElement).toBe(shadow);
  });
});
