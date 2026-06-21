import { afterEach, describe, expect, it, vi } from "vitest";
import { POI_NOTICE_LEAD_SEC } from "../src/constants";
import { cloneDefaultConfig, ConfigStore, StatsStore } from "../src/core/config-store";
import { PersistentCache } from "../src/core/cache";
import { LocalVideoLabelStore } from "../src/core/local-label-store";
import { VoteHistoryStore } from "../src/core/vote-history-store";
import { ScriptController } from "../src/core/controller";
import { VIDEO_SIGNAL_EVENT, VIDEO_SIGNAL_FEEDBACK_EVENT, createCommentFeedbackToken } from "../src/features/comment-filter";
import * as pageBridge from "../src/platform/page-bridge";
import * as domUtils from "../src/utils/dom";
import { clearDiagnostics, getDiagnosticEvents } from "../src/utils/diagnostics";
import * as localVideoSignal from "../src/utils/local-video-signal";
import * as videoContextUtils from "../src/utils/video-context";
import type { FetchResponse, SegmentRecord, VideoContext } from "../src/types";

function createController(): ScriptController {
  vi.stubGlobal("GM_getValue", vi.fn(async (_key, fallback) => fallback));
  vi.stubGlobal("GM_setValue", vi.fn());
  return new ScriptController(
    new ConfigStore(),
    new StatsStore(),
    new PersistentCache<FetchResponse>(),
    new LocalVideoLabelStore(),
    new VoteHistoryStore()
  );
}

function setDocumentHidden(hidden: boolean): () => void {
  const original = Object.getOwnPropertyDescriptor(document, "hidden");
  Object.defineProperty(document, "hidden", {
    configurable: true,
    value: hidden
  });

  return () => {
    if (original) {
      Object.defineProperty(document, "hidden", original);
      return;
    }

    Reflect.deleteProperty(document, "hidden");
  };
}

async function flushAsyncWork(): Promise<void> {
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await Promise.resolve();
}

const skipSegment: SegmentRecord = {
  UUID: "segment-skip",
  category: "sponsor",
  actionType: "skip",
  segment: [10, 20],
  start: 10,
  end: 20,
  duration: 10,
  mode: "auto"
};

const controllerContext: VideoContext = {
  bvid: "BV1xx411c7mK",
  cid: "12345",
  page: 1,
  title: "测试视频",
  href: "https://www.bilibili.com/video/BV1xx411c7mK"
};

function segmentRecord(overrides: Partial<SegmentRecord> = {}): SegmentRecord {
  return {
    ...skipSegment,
    ...overrides
  };
}

function prepareTickController(segments: SegmentRecord[], currentTime: number, muted = false) {
  const controller = createController();
  const video = document.createElement("video");
  video.currentTime = currentTime;
  video.muted = muted;

  Reflect.set(controller, "currentConfig", cloneDefaultConfig());
  Reflect.set(controller, "currentVideo", video);
  Reflect.set(controller, "currentContext", controllerContext);
  Reflect.set(controller, "currentSegments", segments);
  Reflect.set(controller, "domStructureDirty", false);

  return { controller, video };
}

function prepareRefreshController(controller: ScriptController, context: VideoContext = controllerContext): HTMLVideoElement {
  const video = document.createElement("video");
  window.history.replaceState({}, "", context.href);

  Reflect.set(controller, "currentConfig", cloneDefaultConfig());
  vi.spyOn(pageBridge, "requestPageSnapshot").mockResolvedValue({
    url: context.href,
    initialState: null,
    playerManifest: null,
    playInfo: null
  });
  vi.spyOn(videoContextUtils, "resolveVideoContext").mockReturnValue(context);
  vi.spyOn(domUtils, "findVideoElement").mockReturnValue(video);
  return video;
}

function dispatchVolumeChange(video: HTMLVideoElement): void {
  video.dispatchEvent(new Event("volumechange"));
}

describe("script controller", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    clearDiagnostics();
  });

  it("undoes a skip back to the segment start and opens a grace window", async () => {
    const controller = createController();
    Reflect.set(controller, "currentConfig", cloneDefaultConfig());

    const video = document.createElement("video");
    video.currentTime = 12;
    Reflect.set(controller, "currentVideo", video);

    const notices = Reflect.get(controller, "notices") as { show: (options: unknown) => void };
    const showSpy = vi.spyOn(notices, "show");

    await Reflect.get(controller, "performSkip").call(controller, skipSegment, "自动跳过");

    expect(video.currentTime).toBe(20);

    const resultNotice = showSpy.mock.calls[0]?.[0] as {
      actions?: Array<{ onClick: () => void }>;
    };
    resultNotice.actions?.[0]?.onClick();

    const state = Reflect.get(controller, "getSegmentState").call(controller, skipSegment.UUID) as {
      manualSkipGraceShown: boolean;
      manualSkipGraceUntil: number | null;
    };
    expect(video.currentTime).toBe(10);
    expect(state.manualSkipGraceShown).toBe(true);
    expect(state.manualSkipGraceUntil).toBeTypeOf("number");
    expect(showSpy.mock.calls[1]?.[0]).toMatchObject({
      id: "segment-grace:segment-skip",
      durationMs: 10_000
    });
    expect((showSpy.mock.calls[1]?.[0] as { actions?: Array<{ label: string }> }).actions?.map((action) => action.label)).toEqual([
      "保留本段",
      "立即跳过"
    ]);
  });

  it("keeps the current segment when the user chooses to keep watching", () => {
    const controller = createController();
    const notices = Reflect.get(controller, "notices") as { show: (options: unknown) => void };
    const showSpy = vi.spyOn(notices, "show");
    const state = Reflect.get(controller, "getSegmentState").call(controller, skipSegment.UUID) as {
      manualSkipGraceShown: boolean;
      manualSkipGraceUntil: number | null;
      suppressedUntilExit: boolean;
      noticeShown: boolean;
    };

    Reflect.get(controller, "startSkipGrace").call(
      controller,
      skipSegment,
      state,
      "检测到你主动跳转至该片段，10秒内不会自动跳过。"
    );

    const notice = showSpy.mock.calls[0]?.[0] as {
      actions?: Array<{ label: string; onClick: () => void }>;
    };
    const keepWatching = notice.actions?.find((action) => action.label === "保留本段");
    keepWatching?.onClick();

    expect(state.manualSkipGraceUntil).toBeNull();
    expect(state.suppressedUntilExit).toBe(true);
    expect(state.noticeShown).toBe(true);
  });

  it("does not auto-skip again when the user scrubs inside a kept segment", () => {
    const controller = createController();
    Reflect.set(controller, "currentConfig", cloneDefaultConfig());
    Reflect.set(controller, "currentSegments", [skipSegment]);

    const video = document.createElement("video");
    video.currentTime = 13;
    Reflect.set(controller, "currentVideo", video);

    const state = Reflect.get(controller, "getSegmentState").call(controller, skipSegment.UUID) as {
      actionConsumed: boolean;
      suppressedUntilExit: boolean;
      noticeShown: boolean;
      lastObservedTime: number | null;
      manualSkipGraceUntil: number | null;
      manualSkipGraceShown: boolean;
    };
    state.suppressedUntilExit = true;
    state.noticeShown = true;
    state.manualSkipGraceShown = true;
    state.lastObservedTime = 17;

    const performSkipSpy = vi.spyOn(controller as never, "performSkip" as never);

    Reflect.get(controller, "tick").call(controller);

    expect(state.suppressedUntilExit).toBe(true);
    expect(state.manualSkipGraceUntil).toBeNull();
    expect(performSkipSpy).not.toHaveBeenCalled();
    expect(video.currentTime).toBe(13);
  });

  it("does not raise duplicate grace notices for the same segment session", () => {
    const controller = createController();
    const notices = Reflect.get(controller, "notices") as { show: (options: unknown) => void };
    const showSpy = vi.spyOn(notices, "show");
    const state = Reflect.get(controller, "getSegmentState").call(controller, skipSegment.UUID) as {
      manualSkipGraceShown: boolean;
      manualSkipGraceUntil: number | null;
    };

    Reflect.get(controller, "startSkipGrace").call(
      controller,
      skipSegment,
      state,
      "已回到广告开始处，10 秒内不会再次自动跳过。"
    );
    Reflect.get(controller, "startSkipGrace").call(
      controller,
      skipSegment,
      state,
      "检测到你回到了该片段，10 秒内不会再次自动跳过。"
    );

    expect(showSpy).toHaveBeenCalledTimes(1);
    expect(state.manualSkipGraceShown).toBe(true);
  });

  it("auto-skips from tick when playback enters an auto skip segment", () => {
    const { controller, video } = prepareTickController([skipSegment], 12);
    const notices = Reflect.get(controller, "notices") as { show: (options: unknown) => void };
    const showSpy = vi.spyOn(notices, "show");
    const performSkipSpy = vi.spyOn(controller as never, "performSkip" as never);

    Reflect.get(controller, "tick").call(controller);

    const state = Reflect.get(controller, "getSegmentState").call(controller, skipSegment.UUID) as {
      actionConsumed: boolean;
      noticeShown: boolean;
      suppressedUntilExit: boolean;
    };
    expect(video.currentTime).toBe(20);
    expect(state.actionConsumed).toBe(true);
    expect(state.noticeShown).toBe(true);
    expect(state.suppressedUntilExit).toBe(true);
    expect(showSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "segment-result:segment-skip",
        title: "自动跳过：商单广告"
      })
    );

    video.currentTime = 13;
    Reflect.get(controller, "tick").call(controller);

    expect(performSkipSpy).toHaveBeenCalledTimes(1);
  });

  it("ignores full records during tick segment processing", () => {
    const fullSegment = segmentRecord({
      UUID: "segment-full",
      category: "exclusive_access",
      actionType: "full",
      segment: [0, 0],
      start: 0,
      end: 0,
      duration: 0,
      mode: "notice"
    });
    const { controller, video } = prepareTickController([fullSegment], 0);
    const notices = Reflect.get(controller, "notices") as { show: (options: unknown) => void };
    const showSpy = vi.spyOn(notices, "show");
    const performSkipSpy = vi.spyOn(controller as never, "performSkip" as never);

    Reflect.get(controller, "tick").call(controller);

    expect(video.currentTime).toBe(0);
    expect(performSkipSpy).not.toHaveBeenCalled();
    expect(showSpy).not.toHaveBeenCalled();
  });

  it("keeps current segment suppressed through active ticks and clears suppression after exit", () => {
    const { controller, video } = prepareTickController([skipSegment], 13);
    const state = Reflect.get(controller, "getSegmentState").call(controller, skipSegment.UUID) as {
      actionConsumed: boolean;
      suppressedUntilExit: boolean;
      noticeShown: boolean;
      lastObservedTime: number | null;
      manualSkipGraceShown: boolean;
    };
    state.suppressedUntilExit = true;
    state.noticeShown = true;
    state.manualSkipGraceShown = true;
    state.lastObservedTime = 12;
    const performSkipSpy = vi.spyOn(controller as never, "performSkip" as never);

    Reflect.get(controller, "tick").call(controller);

    expect(performSkipSpy).not.toHaveBeenCalled();
    expect(video.currentTime).toBe(13);
    expect(state.suppressedUntilExit).toBe(true);

    video.currentTime = 20.1;
    Reflect.get(controller, "tick").call(controller);

    expect(state.suppressedUntilExit).toBe(false);
  });

  it("auto-mutes during an auto mute segment and exposes a restore action", () => {
    const muteSegment = segmentRecord({
      UUID: "mute-auto",
      category: "music_offtopic",
      actionType: "mute",
      segment: [30, 35],
      start: 30,
      end: 35,
      duration: 5,
      mode: "auto"
    });
    const { controller, video } = prepareTickController([muteSegment], 31);
    const notices = Reflect.get(controller, "notices") as { show: (options: unknown) => void };
    const showSpy = vi.spyOn(notices, "show");

    Reflect.get(controller, "tick").call(controller);

    const state = Reflect.get(controller, "getSegmentState").call(controller, muteSegment.UUID) as {
      actionConsumed: boolean;
      mutedByScript: boolean;
    };
    const notice = showSpy.mock.calls.find((call) => (call[0] as { id?: string }).id === "segment:mute-auto")?.[0] as
      | { actions?: Array<{ label: string }> }
      | undefined;
    expect(video.muted).toBe(true);
    expect(state.actionConsumed).toBe(true);
    expect(state.mutedByScript).toBe(true);
    expect(notice?.actions?.map((action) => action.label)).toEqual(["恢复声音"]);
  });

  it("restores the previous mute state after leaving an auto mute segment", () => {
    const muteSegment = segmentRecord({
      UUID: "mute-restore",
      category: "music_offtopic",
      actionType: "mute",
      segment: [30, 35],
      start: 30,
      end: 35,
      duration: 5,
      mode: "auto"
    });

    for (const initialMuted of [false, true]) {
      const { controller, video } = prepareTickController([muteSegment], 31, initialMuted);

      Reflect.get(controller, "tick").call(controller);
      expect(video.muted).toBe(true);

      video.currentTime = 35.1;
      Reflect.get(controller, "tick").call(controller);

      const activeMuteOwners = Reflect.get(controller, "activeMuteOwners") as Set<string>;
      expect(video.muted).toBe(initialMuted);
      expect(activeMuteOwners.size).toBe(0);
    }
  });

  it("ignores the script's matching volumechange when auto mute starts", () => {
    const muteSegment = segmentRecord({
      UUID: "mute-script-volumechange",
      category: "music_offtopic",
      actionType: "mute",
      segment: [30, 35],
      start: 30,
      end: 35,
      duration: 5,
      mode: "auto"
    });
    const { controller, video } = prepareTickController([muteSegment], 31, false);
    const volumeChangeSpy = vi.fn();
    video.addEventListener("volumechange", volumeChangeSpy);

    Reflect.get(controller, "tick").call(controller);
    expect(video.muted).toBe(true);
    expect(volumeChangeSpy).toHaveBeenCalled();

    video.currentTime = 35.1;
    Reflect.get(controller, "tick").call(controller);

    expect(video.muted).toBe(false);
  });

  it("restores the latest user mute intent after an active mute owner exits", () => {
    const muteSegment = segmentRecord({
      UUID: "mute-user-intent",
      category: "music_offtopic",
      actionType: "mute",
      segment: [30, 35],
      start: 30,
      end: 35,
      duration: 5,
      mode: "auto"
    });

    for (const { label, userMutedStates, expectedMuted } of [
      { label: "manual unmute", userMutedStates: [false], expectedMuted: false },
      { label: "manual remute", userMutedStates: [false, true], expectedMuted: true }
    ]) {
      const { controller, video } = prepareTickController([muteSegment], 31, true);

      Reflect.get(controller, "tick").call(controller);
      expect(video.muted, label).toBe(true);

      for (const userMutedState of userMutedStates) {
        video.muted = userMutedState;
        dispatchVolumeChange(video);
      }

      video.currentTime = 35.1;
      Reflect.get(controller, "tick").call(controller);

      expect(video.muted, label).toBe(expectedMuted);
    }
  });

  it("activates mute from a manual mute notice action", () => {
    const muteSegment = segmentRecord({
      UUID: "mute-manual",
      category: "music_offtopic",
      actionType: "mute",
      segment: [30, 35],
      start: 30,
      end: 35,
      duration: 5,
      mode: "manual"
    });
    const { controller, video } = prepareTickController([muteSegment], 31);
    const notices = Reflect.get(controller, "notices") as { show: (options: unknown) => void };
    const showSpy = vi.spyOn(notices, "show");

    Reflect.get(controller, "tick").call(controller);

    const notice = showSpy.mock.calls.find((call) => (call[0] as { id?: string }).id === "segment:mute-manual")?.[0] as
      | { actions?: Array<{ label: string; onClick: () => void }> }
      | undefined;
    notice?.actions?.find((action) => action.label === "静音此段")?.onClick();
    const state = Reflect.get(controller, "getSegmentState").call(controller, muteSegment.UUID) as {
      actionConsumed: boolean;
      mutedByScript: boolean;
      noticeShown: boolean;
    };

    expect(state.noticeShown).toBe(true);
    expect(state.actionConsumed).toBe(true);
    expect(state.mutedByScript).toBe(true);
    expect(video.muted).toBe(true);
  });

  it("keeps overlapping mute owners active until the last mute segment exits", () => {
    const firstMute = segmentRecord({
      UUID: "mute-overlap-a",
      category: "music_offtopic",
      actionType: "mute",
      segment: [10, 20],
      start: 10,
      end: 20,
      duration: 10,
      mode: "auto"
    });
    const secondMute = segmentRecord({
      UUID: "mute-overlap-b",
      category: "music_offtopic",
      actionType: "mute",
      segment: [15, 25],
      start: 15,
      end: 25,
      duration: 10,
      mode: "auto"
    });
    const { controller, video } = prepareTickController([firstMute, secondMute], 16);

    Reflect.get(controller, "tick").call(controller);

    let activeMuteOwners = Reflect.get(controller, "activeMuteOwners") as Set<string>;
    expect(video.muted).toBe(true);
    expect(activeMuteOwners.has("mute-overlap-a")).toBe(true);
    expect(activeMuteOwners.has("mute-overlap-b")).toBe(true);

    video.currentTime = 21;
    Reflect.get(controller, "tick").call(controller);

    activeMuteOwners = Reflect.get(controller, "activeMuteOwners") as Set<string>;
    expect(video.muted).toBe(true);
    expect(activeMuteOwners.has("mute-overlap-a")).toBe(false);
    expect(activeMuteOwners.has("mute-overlap-b")).toBe(true);

    video.currentTime = 25.1;
    Reflect.get(controller, "tick").call(controller);

    activeMuteOwners = Reflect.get(controller, "activeMuteOwners") as Set<string>;
    expect(video.muted).toBe(false);
    expect(activeMuteOwners.size).toBe(0);
  });

  it("does not show a POI notice before the lead window", () => {
    const poiSegment = segmentRecord({
      UUID: "poi-before-lead",
      category: "poi_highlight",
      actionType: "poi",
      segment: [42],
      start: 42,
      end: null,
      duration: null,
      mode: "manual"
    });
    const { controller } = prepareTickController([poiSegment], 42 - POI_NOTICE_LEAD_SEC - 0.1);
    const notices = Reflect.get(controller, "notices") as { show: (options: unknown) => void };
    const showSpy = vi.spyOn(notices, "show");

    Reflect.get(controller, "tick").call(controller);

    const state = Reflect.get(controller, "getSegmentState").call(controller, poiSegment.UUID) as { poiShown: boolean };
    expect(state.poiShown).toBe(false);
    expect(showSpy).not.toHaveBeenCalled();
  });

  it("shows a POI lead-window notice and seeks when the jump action is clicked", () => {
    const poiSegment = segmentRecord({
      UUID: "poi-jump",
      category: "poi_highlight",
      actionType: "poi",
      segment: [42],
      start: 42,
      end: null,
      duration: null,
      mode: "manual"
    });
    const { controller, video } = prepareTickController([poiSegment], 41);
    const notices = Reflect.get(controller, "notices") as { show: (options: unknown) => void };
    const showSpy = vi.spyOn(notices, "show");

    Reflect.get(controller, "tick").call(controller);

    const notice = showSpy.mock.calls.find((call) => (call[0] as { id?: string }).id === "segment:poi-jump")?.[0] as
      | { title?: string; actions?: Array<{ label: string; onClick: () => void }> }
      | undefined;
    expect(notice?.title).toBe("高光点提示");

    notice?.actions?.find((action) => action.label === "跳到高光")?.onClick();

    expect(video.currentTime).toBe(42);
  });

  it("dismisses POI notices after the visible window and rearms before the lead window", () => {
    const poiSegment = segmentRecord({
      UUID: "poi-rearm",
      category: "poi_highlight",
      actionType: "poi",
      segment: [42],
      start: 42,
      end: null,
      duration: null,
      mode: "manual"
    });
    const { controller, video } = prepareTickController([poiSegment], 41);
    const notices = Reflect.get(controller, "notices") as {
      show: (options: unknown) => void;
      dismiss: (id: string) => void;
    };
    const showSpy = vi.spyOn(notices, "show");
    const dismissSpy = vi.spyOn(notices, "dismiss");

    Reflect.get(controller, "tick").call(controller);
    expect(showSpy).toHaveBeenCalledTimes(1);

    video.currentTime = 45.1;
    Reflect.get(controller, "tick").call(controller);

    const state = Reflect.get(controller, "getSegmentState").call(controller, poiSegment.UUID) as { poiShown: boolean };
    expect(dismissSpy).toHaveBeenCalledWith("segment:poi-rearm");
    expect(state.poiShown).toBe(true);

    video.currentTime = 42 - POI_NOTICE_LEAD_SEC - 0.1;
    Reflect.get(controller, "tick").call(controller);
    expect(state.poiShown).toBe(false);

    video.currentTime = 42 - POI_NOTICE_LEAD_SEC + 0.1;
    Reflect.get(controller, "tick").call(controller);
    expect(showSpy).toHaveBeenCalledTimes(2);
  });

  it("restores an open settings panel after stop/start", async () => {
    const controller = createController();
    vi.spyOn(controller as any, "refreshCurrentVideo").mockImplementation(async () => {});

    await controller.start();
    controller.openPanel();
    expect(document.querySelector<HTMLElement>(".bsb-tm-panel-backdrop")?.hidden).toBe(false);

    controller.stop();
    expect(document.querySelector(".bsb-tm-panel-backdrop")).toBeNull();

    await controller.start();
    expect(document.querySelector<HTMLElement>(".bsb-tm-panel-backdrop")?.hidden).toBe(false);
    expect(document.querySelector<HTMLElement>("[data-section='overview']")?.hidden).toBe(false);
  });

  it("restores the help tab after stop/start when opened from the menu", async () => {
    const controller = createController();
    vi.spyOn(controller as any, "refreshCurrentVideo").mockImplementation(async () => {});

    await controller.start();
    controller.openHelp();
    expect(document.querySelector<HTMLElement>("[data-section='help']")?.hidden).toBe(false);

    controller.stop();
    await controller.start();

    expect(document.querySelector<HTMLElement>(".bsb-tm-panel-backdrop")?.hidden).toBe(false);
    expect(document.querySelector<HTMLElement>("[data-section='help']")?.hidden).toBe(false);
    expect(document.querySelector<HTMLButtonElement>("[data-tab='help']")?.classList.contains("active")).toBe(true);
  });

  it("does not restore a panel opened via toggle after stop/start", async () => {
    const controller = createController();
    vi.spyOn(controller as any, "refreshCurrentVideo").mockImplementation(async () => {});

    await controller.start();
    controller.togglePanel();
    expect(document.querySelector<HTMLElement>(".bsb-tm-panel-backdrop")?.hidden).toBe(false);

    controller.stop();
    await controller.start();

    expect(document.querySelector<HTMLElement>(".bsb-tm-panel-backdrop")?.hidden).toBe(true);
  });

  it("does not handle MBGA live fallback events while stopped", async () => {
    const controller = createController();
    vi.spyOn(controller as any, "refreshCurrentVideo").mockImplementation(async () => {});
    const notices = Reflect.get(controller, "notices") as { show: (options: unknown) => void };
    const showSpy = vi.spyOn(notices, "show");

    await controller.start();
    controller.stop();
    window.dispatchEvent(new CustomEvent("bsb_mbga_live_fallback"));

    expect(showSpy).not.toHaveBeenCalledWith(expect.objectContaining({ id: "mbga-live-fallback" }));

    await controller.start();
    window.dispatchEvent(new CustomEvent("bsb_mbga_live_fallback"));

    expect(showSpy).toHaveBeenCalledTimes(1);
    expect(showSpy).toHaveBeenCalledWith(expect.objectContaining({ id: "mbga-live-fallback" }));
  });

  it("does not force the panel back to the original menu tab after visibility recovery", async () => {
    const controller = createController();
    vi.spyOn(controller as any, "refreshCurrentVideo").mockImplementation(async () => {});

    await controller.start();
    controller.openHelp();
    document.querySelector<HTMLButtonElement>("[data-tab='filters']")?.click();
    expect(document.querySelector<HTMLButtonElement>("[data-tab='filters']")?.classList.contains("active")).toBe(true);

    const restoreHidden = setDocumentHidden(true);
    document.dispatchEvent(new Event("visibilitychange"));
    restoreHidden();

    const restoreVisible = setDocumentHidden(false);
    document.dispatchEvent(new Event("visibilitychange"));
    restoreVisible();

    expect(document.querySelector<HTMLButtonElement>("[data-tab='filters']")?.classList.contains("active")).toBe(true);
    expect(document.querySelector<HTMLElement>("[data-section='filters']")?.hidden).toBe(false);
  });

  it("restores the current active tab after a system stop/start", async () => {
    const controller = createController();
    vi.spyOn(controller as any, "refreshCurrentVideo").mockImplementation(async () => {});

    await controller.start();
    controller.openHelp();
    document.querySelector<HTMLButtonElement>("[data-tab='filters']")?.click();
    expect(document.querySelector<HTMLButtonElement>("[data-tab='filters']")?.classList.contains("active")).toBe(true);

    controller.stop();
    await controller.start();

    expect(document.querySelector<HTMLButtonElement>("[data-tab='filters']")?.classList.contains("active")).toBe(true);
    expect(document.querySelector<HTMLElement>("[data-section='filters']")?.hidden).toBe(false);
  });

  it("skips local title reasoning when an upstream whole-video label already exists", async () => {
    const controller = createController();
    const context: VideoContext = {
      bvid: "BV1xx411c7mK",
      cid: "12345",
      page: 1,
      title: "测试视频",
      href: "https://www.bilibili.com/video/BV1xx411c7mK"
    };
    const video = document.createElement("video");
    window.history.replaceState({}, "", context.href);

    Reflect.set(controller, "currentConfig", cloneDefaultConfig());
    vi.spyOn(pageBridge, "requestPageSnapshot").mockResolvedValue({
      url: context.href,
      initialState: null,
      playerManifest: null,
      playInfo: null
    });
    vi.spyOn(videoContextUtils, "resolveVideoContext").mockReturnValue(context);
    vi.spyOn(domUtils, "findVideoElement").mockReturnValue(video);
    vi.spyOn(Reflect.get(controller, "client"), "getSegments").mockResolvedValue([]);
    vi.spyOn(Reflect.get(controller, "videoLabelClient"), "getVideoLabel").mockResolvedValue("sponsor");
    const resolveLocalTitleLabelSpy = vi.spyOn(controller as never, "resolveLocalTitleLabel" as never);

    await Reflect.get(controller, "refreshCurrentVideo").call(controller, true);

    expect(resolveLocalTitleLabelSpy).not.toHaveBeenCalled();
    expect((Reflect.get(controller, "currentTitleLabel") as SegmentRecord | null)?.UUID).toBe("video-label:BV1xx411c7mK:sponsor");
  });

  it("keeps SponsorBlock segments active when optional videoLabels fails", async () => {
    const controller = createController();
    const video = prepareRefreshController(controller);
    const panel = Reflect.get(controller, "panel") as { updateRuntimeStatus: (status: unknown) => void };
    const previewBar = Reflect.get(controller, "previewBar") as { setSegments: (segments: SegmentRecord[]) => void };
    const statusSpy = vi.spyOn(panel, "updateRuntimeStatus");
    const previewSpy = vi.spyOn(previewBar, "setSegments");

    vi.spyOn(Reflect.get(controller, "client"), "getSegments").mockResolvedValue([
      {
        UUID: "segment-skip-from-upstream",
        category: "sponsor",
        actionType: "skip",
        segment: [10, 20]
      }
    ]);
    vi.spyOn(Reflect.get(controller, "videoLabelClient"), "getVideoLabel").mockRejectedValue(
      new Error("SponsorBlock API returned 503")
    );

    await Reflect.get(controller, "refreshCurrentVideo").call(controller, true);

    const currentSegments = Reflect.get(controller, "currentSegments") as SegmentRecord[];
    expect(currentSegments.map((segment) => segment.UUID)).toEqual(["segment-skip-from-upstream"]);
    expect(previewSpy).toHaveBeenCalledWith(currentSegments);
    expect(statusSpy.mock.calls.at(-1)?.[0]).toMatchObject({
      kind: "loaded",
      message: "已加载 1 个可处理片段"
    });

    video.currentTime = 12;
    Reflect.get(controller, "tick").call(controller);
    expect(video.currentTime).toBe(20);
    expect(getDiagnosticEvents()).toEqual([
      expect.objectContaining({
        severity: "warn",
        area: "upstream",
        message: expect.stringContaining("upstream/videoLabels"),
        detail: expect.stringContaining("\"endpoint\":\"videoLabels\"")
      })
    ]);
  });

  it("reports segment upstream outages as degraded errors instead of empty data", async () => {
    const controller = createController();
    prepareRefreshController(controller);
    const panel = Reflect.get(controller, "panel") as { updateRuntimeStatus: (status: unknown) => void };
    const notices = Reflect.get(controller, "notices") as { show: (options: unknown) => void };
    const statusSpy = vi.spyOn(panel, "updateRuntimeStatus");
    const showSpy = vi.spyOn(notices, "show");

    vi.spyOn(Reflect.get(controller, "client"), "getSegments").mockRejectedValue(
      new Error("SponsorBlock API returned 503")
    );
    vi.spyOn(Reflect.get(controller, "videoLabelClient"), "getVideoLabel").mockResolvedValue(null);

    await Reflect.get(controller, "refreshCurrentVideo").call(controller, true);

    const lastStatus = statusSpy.mock.calls.at(-1)?.[0] as { kind: string; message: string };
    expect(lastStatus.kind).toBe("error");
    expect(lastStatus.message).toContain("默认上游片段服务暂时不可用");
    expect(lastStatus.message).not.toContain("暂无");
    expect(showSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "bsb-fetch-error",
        message: expect.stringContaining("本地页面增强继续工作")
      })
    );
    expect(getDiagnosticEvents()).toEqual([
      expect.objectContaining({
        severity: "error",
        area: "upstream",
        message: expect.stringContaining("upstream/segments"),
        detail: expect.stringContaining("\"endpoint\":\"segments\"")
      })
    ]);
  });

  it("cooldowns repeated segment outage notices for the same server endpoint", async () => {
    const controller = createController();
    prepareRefreshController(controller);
    const notices = Reflect.get(controller, "notices") as { show: (options: unknown) => void };
    const showSpy = vi.spyOn(notices, "show");

    vi.spyOn(Reflect.get(controller, "client"), "getSegments").mockRejectedValue(
      new Error("Request timed out: GET https://www.bsbsb.top/api/skipSegments/8f9a")
    );
    vi.spyOn(Reflect.get(controller, "videoLabelClient"), "getVideoLabel").mockResolvedValue(null);

    await Reflect.get(controller, "refreshCurrentVideo").call(controller, true);
    await Reflect.get(controller, "refreshCurrentVideo").call(controller, true);

    const segmentOutageNotices = showSpy.mock.calls.filter(
      (call) => (call[0] as { id?: string }).id === "bsb-fetch-error"
    );
    expect(segmentOutageNotices).toHaveLength(1);
    expect(getDiagnosticEvents().at(-1)).toMatchObject({
      severity: "error",
      area: "upstream",
      message: expect.stringContaining("upstream/segments"),
      detail: expect.stringContaining("\"endpoint\":\"segments\"")
    });
  });

  it("does not let automatic signals override a manually kept local title label", () => {
    const controller = createController();
    const rememberSignalSpy = vi.spyOn(Reflect.get(controller, "localVideoLabelStore"), "rememberSignal");

    Reflect.set(controller, "started", true);
    Reflect.set(controller, "currentConfig", cloneDefaultConfig());
    Reflect.set(controller, "currentContext", {
      bvid: "BV1xx411c7mL",
      cid: "12345",
      page: 1,
      title: "测试视频",
      href: "https://www.bilibili.com/video/BV1xx411c7mL"
    } satisfies VideoContext);
    Reflect.set(controller, "currentTitleLabel", {
      UUID: "local-signal:BV1xx411c7mL:manual:sponsor",
      category: "sponsor",
      actionType: "full",
      segment: [0, 0],
      start: 0,
      end: 0,
      duration: 0,
      mode: "auto"
    } satisfies SegmentRecord);

    Reflect.get(controller, "handleVideoSignal").call(
      controller,
      new CustomEvent(VIDEO_SIGNAL_EVENT, {
        detail: {
          category: "sponsor",
          source: "comment-goods",
          confidence: 0.96,
          reason: "评论区命中商品卡广告"
        }
      })
    );

    expect((Reflect.get(controller, "currentTitleLabel") as SegmentRecord | null)?.UUID).toContain(":manual:");
    expect(rememberSignalSpy).not.toHaveBeenCalled();
  });

  it("refreshes local learning records after a runtime local signal is persisted", async () => {
    const controller = createController();
    const store = Reflect.get(controller, "localVideoLabelStore") as LocalVideoLabelStore;
    const panel = Reflect.get(controller, "panel") as { refreshLocalLearningRecords: () => void };
    await flushAsyncWork();
    const refreshSpy = vi.spyOn(panel, "refreshLocalLearningRecords");

    Reflect.set(controller, "started", true);
    Reflect.set(controller, "currentConfig", cloneDefaultConfig());
    Reflect.set(controller, "currentContext", {
      bvid: "BV1xx411c7mR",
      cid: "12345",
      page: 1,
      title: "测试视频",
      href: "https://www.bilibili.com/video/BV1xx411c7mR"
    } satisfies VideoContext);

    Reflect.get(controller, "handleVideoSignal").call(
      controller,
      new CustomEvent(VIDEO_SIGNAL_EVENT, {
        detail: {
          category: "sponsor",
          source: "comment-goods",
          confidence: 0.96,
          reason: "评论区命中商品卡广告"
        }
      })
    );
    await flushAsyncWork();

    expect(store.listRecords()).toEqual([
      expect.objectContaining({
        videoId: "BV1xx411c7mR",
        category: "sponsor",
        source: "comment-goods"
      })
    ]);
    expect(refreshSpy).toHaveBeenCalledTimes(1);
  });

  it("reports diagnostics without refreshing fake records when runtime local signal persistence fails", async () => {
    const controller = createController();
    const store = Reflect.get(controller, "localVideoLabelStore") as LocalVideoLabelStore;
    const panel = Reflect.get(controller, "panel") as { refreshLocalLearningRecords: () => void };
    await flushAsyncWork();
    const refreshSpy = vi.spyOn(panel, "refreshLocalLearningRecords");

    Reflect.set(controller, "started", true);
    Reflect.set(controller, "currentConfig", cloneDefaultConfig());
    Reflect.set(controller, "currentContext", {
      bvid: "BV1xx411c7mE",
      cid: "12345",
      page: 1,
      title: "测试视频",
      href: "https://www.bilibili.com/video/BV1xx411c7mE"
    } satisfies VideoContext);

    vi.mocked(globalThis.GM_setValue).mockRejectedValueOnce(new Error("runtime local save failed"));
    Reflect.get(controller, "handleVideoSignal").call(
      controller,
      new CustomEvent(VIDEO_SIGNAL_EVENT, {
        detail: {
          category: "sponsor",
          source: "comment-goods",
          confidence: 0.96,
          reason: "评论区命中商品卡广告"
        }
      })
    );
    await flushAsyncWork();

    expect(store.listRecords()).toEqual([]);
    expect(refreshSpy).not.toHaveBeenCalled();
    expect(getDiagnosticEvents().some((event) => event.message === "本地视频推理结果写入失败，已保留当前页面临时显示")).toBe(
      true
    );
  });

  it("does not flip an existing local video label from a weaker transient comment signal", () => {
    const controller = createController();
    const rememberSignalSpy = vi.spyOn(Reflect.get(controller, "localVideoLabelStore"), "rememberSignal");

    Reflect.set(controller, "started", true);
    Reflect.set(controller, "currentConfig", cloneDefaultConfig());
    Reflect.set(controller, "currentContext", {
      bvid: "BV1xx411c7mW",
      cid: "12345",
      page: 1,
      title: "测试视频",
      href: "https://www.bilibili.com/video/BV1xx411c7mW"
    } satisfies VideoContext);
    Reflect.set(controller, "currentRuntimeLocalSignal", {
      category: "sponsor",
      source: "page-heuristic",
      confidence: 0.82,
      reason: "标题和标签命中本地商业线索"
    });
    Reflect.set(controller, "currentTitleLabel", {
      UUID: "local-signal:BV1xx411c7mW:page-heuristic:sponsor",
      category: "sponsor",
      actionType: "full",
      segment: [0, 0],
      start: 0,
      end: 0,
      duration: 0,
      mode: "auto"
    } satisfies SegmentRecord);

    Reflect.get(controller, "handleVideoSignal").call(
      controller,
      new CustomEvent(VIDEO_SIGNAL_EVENT, {
        detail: {
          category: "selfpromo",
          source: "comment-suspicion",
          confidence: 0.79,
          reason: "单条评论弱导流线索"
        }
      })
    );

    expect((Reflect.get(controller, "currentTitleLabel") as SegmentRecord | null)?.category).toBe("sponsor");
    expect(rememberSignalSpy).not.toHaveBeenCalled();
  });

  it("accepts comment feedback as an automatic local signal without globally locking the video", async () => {
    const controller = createController();
    const rememberSignalSpy = vi.spyOn(Reflect.get(controller, "localVideoLabelStore"), "rememberSignal");
    const panel = Reflect.get(controller, "panel") as { refreshLocalLearningRecords: () => void };
    await flushAsyncWork();
    const refreshSpy = vi.spyOn(panel, "refreshLocalLearningRecords");

    Reflect.set(controller, "started", true);
    Reflect.set(controller, "currentConfig", cloneDefaultConfig());
    Reflect.set(controller, "currentContext", {
      bvid: "BV1xx411c7mM",
      cid: "12345",
      page: 1,
      title: "测试视频",
      href: "https://www.bilibili.com/video/BV1xx411c7mM"
    } satisfies VideoContext);

    Reflect.get(controller, "handleVideoSignalFeedback").call(
      controller,
      new CustomEvent(VIDEO_SIGNAL_FEEDBACK_EVENT, {
        detail: {
          category: "sponsor",
          decision: "confirm",
          source: "comment-suspicion",
          reason: "评论区用户反馈",
          feedbackToken: createCommentFeedbackToken()
        }
      })
    );
    await flushAsyncWork();

    expect(rememberSignalSpy).toHaveBeenCalledWith(
      "BV1xx411c7mM",
      expect.objectContaining({
        category: "sponsor",
        source: "comment-suspicion"
      })
    );
    expect(refreshSpy).toHaveBeenCalledTimes(1);
    expect((Reflect.get(controller, "currentTitleLabel") as SegmentRecord | null)?.UUID).toContain(":comment-suspicion:sponsor");
  });

  it("refreshes local learning records after initial local title reasoning persists a signal", async () => {
    const controller = createController();
    const panel = Reflect.get(controller, "panel") as { refreshLocalLearningRecords: () => void };
    await flushAsyncWork();
    const refreshSpy = vi.spyOn(panel, "refreshLocalLearningRecords");
    vi.spyOn(localVideoSignal, "inferLocalVideoSignal").mockReturnValue({
      category: "sponsor",
      source: "page-heuristic",
      confidence: 0.86,
      reason: "页面文本出现本地商业线索"
    });

    Reflect.set(controller, "currentConfig", cloneDefaultConfig());
    const label = (await Reflect.get(controller, "resolveLocalTitleLabel").call(controller, {
      bvid: "BV1xx411c7mI",
      cid: "12345",
      page: 1,
      title: "测试视频",
      href: "https://www.bilibili.com/video/BV1xx411c7mI"
    } satisfies VideoContext)) as SegmentRecord | null;

    expect(label?.UUID).toContain("local-signal:BV1xx411c7mI:page-heuristic:sponsor");
    expect(refreshSpy).toHaveBeenCalledTimes(1);
  });

  it("rejects forged comment feedback without a one-time token", async () => {
    const controller = createController();
    const rememberSignalSpy = vi.spyOn(Reflect.get(controller, "localVideoLabelStore"), "rememberSignal");

    Reflect.set(controller, "started", true);
    Reflect.set(controller, "currentConfig", cloneDefaultConfig());
    Reflect.set(controller, "currentContext", {
      bvid: "BV1xx411c7mT",
      cid: "12345",
      page: 1,
      title: "测试视频",
      href: "https://www.bilibili.com/video/BV1xx411c7mT"
    } satisfies VideoContext);

    Reflect.get(controller, "handleVideoSignalFeedback").call(
      controller,
      new CustomEvent(VIDEO_SIGNAL_FEEDBACK_EVENT, {
        detail: {
          category: "sponsor",
          decision: "confirm",
          source: "comment-suspicion",
          reason: "伪造反馈"
        }
      })
    );
    await Promise.resolve();

    expect(rememberSignalSpy).not.toHaveBeenCalled();
  });

  it("does not let comment feedback override an existing manual video decision", async () => {
    const controller = createController();
    const store = Reflect.get(controller, "localVideoLabelStore") as LocalVideoLabelStore;
    const rememberSignalSpy = vi.spyOn(store, "rememberSignal");
    const notices = Reflect.get(controller, "notices") as { show: (options: unknown) => void };
    const showSpy = vi.spyOn(notices, "show");

    Reflect.set(controller, "started", true);
    Reflect.set(controller, "currentConfig", cloneDefaultConfig());
    Reflect.set(controller, "currentContext", {
      bvid: "BV1xx411c7mU",
      cid: "12345",
      page: 1,
      title: "测试视频",
      href: "https://www.bilibili.com/video/BV1xx411c7mU"
    } satisfies VideoContext);

    await store.rememberManual("BV1xx411c7mU", "sponsor", "既有手动保留");
    Reflect.get(controller, "handleVideoSignalFeedback").call(
      controller,
      new CustomEvent(VIDEO_SIGNAL_FEEDBACK_EVENT, {
        detail: {
          category: "sponsor",
          decision: "dismiss",
          source: "comment-suspicion",
          reason: "重复反馈",
          feedbackToken: createCommentFeedbackToken()
        }
      })
    );
    await Promise.resolve();

    expect(rememberSignalSpy).not.toHaveBeenCalled();
    expect(showSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.stringContaining("comment-feedback-dismiss:BV1xx411c7mU")
      })
    );
  });

  it("locks comment feedback after a persisted manual video decision", async () => {
    const controller = createController();
    const store = Reflect.get(controller, "localVideoLabelStore") as LocalVideoLabelStore;
    const availabilitySpy = vi.fn();
    window.addEventListener("bsb:local-video-feedback-availability", availabilitySpy as EventListener);

    Reflect.set(controller, "started", true);
    Reflect.set(controller, "currentConfig", cloneDefaultConfig());
    Reflect.set(controller, "currentContext", {
      bvid: "BV1xx411c7mV",
      cid: "12345",
      page: 1,
      title: "测试视频",
      href: "https://www.bilibili.com/video/BV1xx411c7mV"
    } satisfies VideoContext);

    await store.rememberManual("BV1xx411c7mV", "sponsor", "既有手动保留");
    Reflect.get(controller, "syncLocalFeedbackAvailability").call(controller);

    expect((availabilitySpy.mock.calls[0]?.[0] as CustomEvent).detail).toMatchObject({
      enabled: false,
      locked: true,
      disabledReason: "manual-decision",
      bvid: "BV1xx411c7mV"
    });
    window.removeEventListener("bsb:local-video-feedback-availability", availabilitySpy as EventListener);
  });

  it("persists a title badge local dismiss and blocks later automatic signals", async () => {
    const controller = createController();
    const store = Reflect.get(controller, "localVideoLabelStore") as LocalVideoLabelStore;
    const panel = Reflect.get(controller, "panel") as { refreshLocalLearningRecords: () => void };
    const refreshSpy = vi.spyOn(panel, "refreshLocalLearningRecords");
    const rememberSignalSpy = vi.spyOn(store, "rememberSignal");

    Reflect.set(controller, "started", true);
    Reflect.set(controller, "currentConfig", cloneDefaultConfig());
    Reflect.set(controller, "currentSegments", []);
    Reflect.set(controller, "currentContext", {
      bvid: "BV1xx411c7mD",
      cid: "12345",
      page: 1,
      title: "测试视频",
      href: "https://www.bilibili.com/video/BV1xx411c7mD"
    } satisfies VideoContext);
    Reflect.set(controller, "currentTitleLabel", {
      UUID: "local-signal:BV1xx411c7mD:comment-suspicion:sponsor",
      category: "sponsor",
      actionType: "full",
      segment: [0, 0],
      start: 0,
      end: 0,
      duration: 0,
      mode: "auto"
    } satisfies SegmentRecord);

    await Reflect.get(controller, "handleLocalBadgeDecision").call(
      controller,
      Reflect.get(controller, "currentTitleLabel"),
      "dismiss"
    );

    expect(store.isDismissed("BV1xx411c7mD")).toBe(true);
    expect(store.listRecords()).toEqual([
      expect.objectContaining({
        videoId: "BV1xx411c7mD",
        source: "manual-dismiss",
        category: null,
        confidence: 1
      })
    ]);
    expect(refreshSpy).toHaveBeenCalled();
    expect(Reflect.get(controller, "currentTitleLabel")).toBeNull();
    refreshSpy.mockClear();

    Reflect.get(controller, "handleVideoSignal").call(
      controller,
      new CustomEvent(VIDEO_SIGNAL_EVENT, {
        detail: {
          category: "sponsor",
          source: "comment-suspicion",
          confidence: 0.96,
          reason: "后续评论滚动再次命中"
        }
      })
    );

    expect(Reflect.get(controller, "currentTitleLabel")).toBeNull();
    expect(rememberSignalSpy).not.toHaveBeenCalled();
    expect(refreshSpy).not.toHaveBeenCalled();
  });

  it("rejects local dismiss when the segment bvid no longer matches the current context", async () => {
    const controller = createController();
    const store = Reflect.get(controller, "localVideoLabelStore") as LocalVideoLabelStore;
    const dismissSpy = vi.spyOn(store, "dismiss");
    const notices = Reflect.get(controller, "notices") as { show: (options: unknown) => void };
    const showSpy = vi.spyOn(notices, "show");

    Reflect.set(controller, "started", true);
    Reflect.set(controller, "currentConfig", cloneDefaultConfig());
    Reflect.set(controller, "currentContext", {
      bvid: "BV1xx411c7mA",
      cid: "12345",
      page: 1,
      title: "测试视频 A",
      href: "https://www.bilibili.com/video/BV1xx411c7mA"
    } satisfies VideoContext);

    await expect(
      Reflect.get(controller, "handleLocalBadgeDecision").call(
        controller,
        {
          UUID: "local-signal:BV1xx411c7mB:comment-suspicion:sponsor",
          category: "sponsor",
          actionType: "full",
          segment: [0, 0],
          start: 0,
          end: 0,
          duration: 0,
          mode: "auto"
        } satisfies SegmentRecord,
        "dismiss"
      )
    ).rejects.toThrow("local signal video context mismatch");

    expect(dismissSpy).not.toHaveBeenCalled();
    expect(store.listRecords()).toEqual([]);
    expect(showSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "本地反馈未保存"
      })
    );
  });

  it("does not show local dismiss success when persistence fails", async () => {
    const controller = createController();
    vi.mocked(globalThis.GM_setValue).mockRejectedValueOnce(new Error("local label save failed"));
    const notices = Reflect.get(controller, "notices") as { show: (options: unknown) => void };
    const showSpy = vi.spyOn(notices, "show");

    Reflect.set(controller, "started", true);
    Reflect.set(controller, "currentConfig", cloneDefaultConfig());
    Reflect.set(controller, "currentContext", {
      bvid: "BV1xx411c7mF",
      cid: "12345",
      page: 1,
      title: "测试视频",
      href: "https://www.bilibili.com/video/BV1xx411c7mF"
    } satisfies VideoContext);

    await expect(
      Reflect.get(controller, "handleLocalBadgeDecision").call(
        controller,
        {
          UUID: "local-signal:BV1xx411c7mF:comment-suspicion:sponsor",
          category: "sponsor",
          actionType: "full",
          segment: [0, 0],
          start: 0,
          end: 0,
          duration: 0,
          mode: "auto"
        } satisfies SegmentRecord,
        "dismiss"
      )
    ).rejects.toThrow("local label save failed");

    expect(showSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "本地反馈保存失败"
      })
    );
    expect(showSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({
        title: "已忽略本地标签"
      })
    );
  });

  it("blocks comment feedback when an upstream whole-video label is already present", async () => {
    const controller = createController();
    const rememberSignalSpy = vi.spyOn(Reflect.get(controller, "localVideoLabelStore"), "rememberSignal");
    const notices = Reflect.get(controller, "notices") as { show: (options: unknown) => void };
    const showSpy = vi.spyOn(notices, "show");

    Reflect.set(controller, "started", true);
    Reflect.set(controller, "currentConfig", cloneDefaultConfig());
    Reflect.set(controller, "currentContext", {
      bvid: "BV1xx411c7mN",
      cid: "12345",
      page: 1,
      title: "测试视频",
      href: "https://www.bilibili.com/video/BV1xx411c7mN"
    } satisfies VideoContext);
    Reflect.set(controller, "currentFullVideoLabels", [
      {
        UUID: "video-label:BV1xx411c7mN:sponsor",
        category: "sponsor",
        actionType: "full",
        segment: [0, 0],
        start: 0,
        end: 0,
        duration: 0,
        mode: "auto"
      } satisfies SegmentRecord
    ]);

    Reflect.get(controller, "handleVideoSignalFeedback").call(
      controller,
      new CustomEvent(VIDEO_SIGNAL_FEEDBACK_EVENT, {
        detail: {
          category: "sponsor",
          decision: "confirm",
          source: "comment-suspicion",
          reason: "评论区用户反馈",
          feedbackToken: createCommentFeedbackToken()
        }
      })
    );
    await Promise.resolve();

    expect(rememberSignalSpy).not.toHaveBeenCalled();
    expect(showSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "local-feedback-blocked:BV1xx411c7mN"
      })
    );
  });

  it("sanitizes upstream vote HTML errors before showing a notice", async () => {
    const controller = createController();
    const notices = Reflect.get(controller, "notices") as { show: (options: unknown) => void };
    const showSpy = vi.spyOn(notices, "show");
    vi.spyOn(Reflect.get(controller, "client"), "vote").mockResolvedValue({
      successType: -1,
      statusCode: 500,
      responseText: "<!DOCTYPE html><html lang=\"en\"><body><pre>Internal Server Error</pre></body></html>"
    });
    Reflect.set(controller, "currentConfig", cloneDefaultConfig());

    const result = await Reflect.get(controller, "submitVote").call(
      controller,
      {
        UUID: "real-upstream-full-uuid",
        category: "sponsor",
        actionType: "full",
        segment: [0, 0],
        start: 0,
        end: 0,
        duration: 0,
        mode: "auto"
      } satisfies SegmentRecord,
      1
    );

    expect(result).toBe("error");
    expect(showSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "反馈提交失败",
        message: "SponsorBlock 服务暂时异常（HTTP 500），反馈未提交，请稍后再试。"
      })
    );
    expect(JSON.stringify(showSpy.mock.calls)).not.toContain("<!DOCTYPE html>");
  });

  it("does not remember upstream votes that are rate limited", async () => {
    const controller = createController();
    const notices = Reflect.get(controller, "notices") as { show: (options: unknown) => void };
    const voteHistoryStore = Reflect.get(controller, "voteHistoryStore") as VoteHistoryStore;
    const showSpy = vi.spyOn(notices, "show");
    const rememberSpy = vi.spyOn(voteHistoryStore, "remember");
    vi.spyOn(Reflect.get(controller, "client"), "vote").mockResolvedValue({
      successType: -1,
      statusCode: 429,
      responseText: "rate limited"
    });
    Reflect.set(controller, "currentConfig", cloneDefaultConfig());

    const result = await Reflect.get(controller, "submitVote").call(
      controller,
      {
        UUID: "real-upstream-full-uuid",
        category: "sponsor",
        actionType: "full",
        segment: [0, 0],
        start: 0,
        end: 0,
        duration: 0,
        mode: "auto"
      } satisfies SegmentRecord,
      1
    );

    expect(result).toBe("error");
    expect(rememberSpy).not.toHaveBeenCalled();
    expect(showSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "反馈提交失败",
        message: "SponsorBlock 暂时限制了这次反馈请求，反馈未提交，请稍后再试。"
      })
    );
  });

  it("reports upstream vote failures without remembering votes or leaking userID diagnostics", async () => {
    const controller = createController();
    const voteHistoryStore = Reflect.get(controller, "voteHistoryStore") as VoteHistoryStore;
    const rememberSpy = vi.spyOn(voteHistoryStore, "remember");
    const voteSpy = vi.spyOn(Reflect.get(controller, "client"), "vote");
    Reflect.set(controller, "currentConfig", cloneDefaultConfig());

    for (const response of [
      {
        successType: -1,
        statusCode: 503,
        responseText: "service unavailable"
      },
      {
        successType: -1,
        statusCode: -1,
        responseText:
          "Request timed out: POST https://www.bsbsb.top/api/voteOnSponsorTime?UUID=real-upstream-full-uuid&userID=user-secret&type=1"
      }
    ]) {
      clearDiagnostics();
      voteSpy.mockResolvedValueOnce(response);

      const result = await Reflect.get(controller, "submitVote").call(
        controller,
        {
          UUID: "real-upstream-full-uuid",
          category: "sponsor",
          actionType: "full",
          segment: [0, 0],
          start: 0,
          end: 0,
          duration: 0,
          mode: "auto"
        } satisfies SegmentRecord,
        1
      );

      const events = getDiagnosticEvents();
      const serializedDiagnostics = JSON.stringify(events);
      expect(result).toBe("error");
      expect(rememberSpy).not.toHaveBeenCalled();
      expect(serializedDiagnostics).toContain("upstream/vote");
      expect(events[0]?.detail).toContain("\"endpoint\":\"vote\"");
      expect(serializedDiagnostics).not.toContain("user-secret");
      expect(serializedDiagnostics).not.toContain("userID");
    }
  });

  it("redacts credential-like key value pairs from upstream vote diagnostics", async () => {
    const controller = createController();
    const voteHistoryStore = Reflect.get(controller, "voteHistoryStore") as VoteHistoryStore;
    const rememberSpy = vi.spyOn(voteHistoryStore, "remember");
    vi.spyOn(Reflect.get(controller, "client"), "vote").mockResolvedValue({
      successType: -1,
      statusCode: 503,
      responseText:
        "service unavailable cookie=session-secret token=secret authorization=bearer-secret auth=auth-secret session=session-secret-2 userID=user-secret"
    });
    Reflect.set(controller, "currentConfig", cloneDefaultConfig());

    const result = await Reflect.get(controller, "submitVote").call(
      controller,
      {
        UUID: "real-upstream-full-uuid",
        category: "sponsor",
        actionType: "full",
        segment: [0, 0],
        start: 0,
        end: 0,
        duration: 0,
        mode: "auto"
      } satisfies SegmentRecord,
      1
    );

    const serializedDiagnostics = JSON.stringify(getDiagnosticEvents());
    expect(result).toBe("error");
    expect(rememberSpy).not.toHaveBeenCalled();
    expect(serializedDiagnostics).toContain("upstream/vote");
    expect(serializedDiagnostics).not.toContain("cookie=session-secret");
    expect(serializedDiagnostics).not.toContain("token=secret");
    expect(serializedDiagnostics).not.toContain("authorization=bearer-secret");
    expect(serializedDiagnostics).not.toContain("auth=auth-secret");
    expect(serializedDiagnostics).not.toContain("session=session-secret-2");
    expect(serializedDiagnostics).not.toContain("userID=user-secret");
    expect(serializedDiagnostics).not.toContain("session-secret");
    expect(serializedDiagnostics).not.toContain("bearer-secret");
    expect(serializedDiagnostics).not.toContain("auth-secret");
    expect(serializedDiagnostics).not.toContain("user-secret");
  });
});
