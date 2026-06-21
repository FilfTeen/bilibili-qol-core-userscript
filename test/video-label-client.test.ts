import { beforeEach, describe, expect, it, vi } from "vitest";
import { VideoLabelClient } from "../src/api/video-label-client";
import { DEFAULT_CONFIG } from "../src/constants";
import type { FetchResponse, StoredConfig } from "../src/types";
import { clearDiagnostics, getDiagnosticEvents } from "../src/utils/diagnostics";

type CacheLike = {
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
};

function createClient(cache?: Partial<CacheLike>) {
  const fakeCache = {
    get: vi.fn<() => Promise<FetchResponse | undefined>>().mockResolvedValue(undefined),
    set: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
    ...cache
  };

  return {
    client: new VideoLabelClient(fakeCache as never),
    cache: fakeCache
  };
}

beforeEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  clearDiagnostics();
  vi.stubGlobal("fetch", vi.fn(async () => {
    throw new Error("disable fetch in video-label-client tests");
  }));
});

describe("video label client", () => {
  it("returns null on 404 and caches the response", async () => {
    vi.stubGlobal("GM_xmlhttpRequest", (options: { onload?: (response: { status: number; responseText: string }) => void }) => {
      options.onload?.({ status: 404, responseText: "" });
    });

    const { client, cache } = createClient();
    const category = await client.getVideoLabel("BV17x411w7KC", DEFAULT_CONFIG as StoredConfig);

    expect(category).toBeNull();
    expect(cache.set).toHaveBeenCalled();
    expect(getDiagnosticEvents()).toEqual([]);
  });

  it("reads the first category from the label payload", async () => {
    vi.stubGlobal("GM_xmlhttpRequest", (options: { onload?: (response: { status: number; responseText: string }) => void }) => {
      options.onload?.({
        status: 200,
        responseText: JSON.stringify([
          {
            videoID: "BV17x411w7KC",
            segments: [{ category: "sponsor" }]
          }
        ])
      });
    });

    const { client } = createClient();
    const category = await client.getVideoLabel("BV17x411w7KC", DEFAULT_CONFIG as StoredConfig);

    expect(category).toBe("sponsor");
  });

  it("returns null and reports a videoLabels diagnostic on invalid JSON", async () => {
    vi.stubGlobal("GM_xmlhttpRequest", (options: { onload?: (response: { status: number; responseText: string }) => void }) => {
      options.onload?.({
        status: 200,
        responseText: "not-json"
      });
    });

    const { client } = createClient();
    const category = await client.getVideoLabel("BV17x411w7KC", DEFAULT_CONFIG as StoredConfig);

    expect(category).toBeNull();
    expect(getDiagnosticEvents()).toEqual([
      expect.objectContaining({
        severity: "warn",
        area: "upstream",
        message: expect.stringContaining("upstream/videoLabels"),
        detail: expect.stringContaining("\"endpoint\":\"videoLabels\"")
      })
    ]);
    expect(getDiagnosticEvents()[0]?.detail).toContain("\"server\":\"https://www.bsbsb.top\"");
    expect(getDiagnosticEvents()[0]?.detail).toContain("\"reason\":\"invalid-json\"");
  });

  it("returns null and reports a videoLabels diagnostic on unexpected payload shape", async () => {
    vi.stubGlobal("GM_xmlhttpRequest", (options: { onload?: (response: { status: number; responseText: string }) => void }) => {
      options.onload?.({
        status: 200,
        responseText: JSON.stringify({ videoID: "BV17x411w7KC", segments: [] })
      });
    });

    const { client } = createClient();
    const category = await client.getVideoLabel("BV17x411w7KC", DEFAULT_CONFIG as StoredConfig);

    expect(category).toBeNull();
    expect(getDiagnosticEvents()).toEqual([
      expect.objectContaining({
        severity: "warn",
        area: "upstream",
        message: expect.stringContaining("upstream/videoLabels"),
        detail: expect.stringContaining("\"endpoint\":\"videoLabels\"")
      })
    ]);
    expect(getDiagnosticEvents()[0]?.detail).toContain("\"server\":\"https://www.bsbsb.top\"");
    expect(getDiagnosticEvents()[0]?.detail).toContain("\"reason\":\"unexpected-payload-shape\"");
  });

  it("returns null and reports a videoLabels diagnostic on upstream 5xx", async () => {
    vi.stubGlobal("GM_xmlhttpRequest", (options: { onload?: (response: { status: number; responseText: string }) => void }) => {
      options.onload?.({ status: 503, responseText: "service unavailable" });
    });

    const { client } = createClient();
    const category = await client.getVideoLabel("BV17x411w7KC", DEFAULT_CONFIG as StoredConfig);

    expect(category).toBeNull();
    expect(getDiagnosticEvents()).toEqual([
      expect.objectContaining({
        severity: "warn",
        area: "upstream",
        message: expect.stringContaining("upstream/videoLabels"),
        detail: expect.stringContaining("\"endpoint\":\"videoLabels\"")
      })
    ]);
  });

  it("returns null and reports a videoLabels diagnostic on request timeout", async () => {
    vi.stubGlobal("fetch", undefined);
    vi.stubGlobal("GM_xmlhttpRequest", (options: { ontimeout?: () => void }) => {
      options.ontimeout?.();
    });

    const { client } = createClient();
    const category = await client.getVideoLabel("BV17x411w7KC", DEFAULT_CONFIG as StoredConfig);

    expect(category).toBeNull();
    expect(getDiagnosticEvents()).toEqual([
      expect.objectContaining({
        severity: "warn",
        area: "upstream",
        message: expect.stringContaining("upstream/videoLabels"),
        detail: expect.stringContaining("\"endpoint\":\"videoLabels\"")
      })
    ]);
  });
});
