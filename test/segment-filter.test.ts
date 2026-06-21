import { describe, expect, it } from "vitest";
import { cloneDefaultConfig } from "../src/core/config-store";
import { normalizeSegments } from "../src/core/segment-filter";
import type { SponsorTime } from "../src/types";

const baseSegment: SponsorTime = {
  UUID: "seg-1",
  category: "sponsor",
  actionType: "skip",
  segment: [10, 20]
};

function createSegment(overrides: Partial<SponsorTime> = {}): SponsorTime {
  return {
    ...baseSegment,
    ...overrides
  };
}

describe("segment normalization", () => {
  it("filters segments to the active cid when provided", () => {
    const segments = normalizeSegments(
      [
        {
          ...baseSegment,
          UUID: "same-cid",
          cid: "111"
        },
        {
          ...baseSegment,
          UUID: "other-cid",
          cid: "222"
        },
        {
          ...baseSegment,
          UUID: "cid-agnostic"
        }
      ],
      cloneDefaultConfig(),
      "111"
    );

    expect(segments.map((segment) => segment.UUID)).toEqual(["same-cid", "cid-agnostic"]);
  });

  it("filters segments whose category mode is off", () => {
    const config = cloneDefaultConfig();
    config.categoryModes.sponsor = "off";

    const segments = normalizeSegments([baseSegment], config);

    expect(segments).toEqual([]);
  });

  it("deduplicates repeated UUIDs by keeping the first normalized record", () => {
    const segments = normalizeSegments(
      [
        createSegment({
          UUID: "duplicate-segment",
          segment: [10, 20]
        }),
        createSegment({
          UUID: "duplicate-segment",
          segment: [30, 40]
        })
      ],
      cloneDefaultConfig()
    );

    expect(segments).toHaveLength(1);
    expect(segments[0]).toMatchObject({
      UUID: "duplicate-segment",
      start: 10,
      end: 20
    });
  });

  it("drops short non-POI and non-full segments below the configured minimum duration", () => {
    const config = cloneDefaultConfig();
    config.minDurationSec = 10;

    const segments = normalizeSegments(
      [
        createSegment({
          UUID: "short-skip",
          actionType: "skip",
          segment: [10, 12]
        }),
        createSegment({
          UUID: "short-mute",
          category: "music_offtopic",
          actionType: "mute",
          segment: [20, 22]
        })
      ],
      config
    );

    expect(segments).toEqual([]);
  });

  it("keeps short POI and full records even when minDurationSec is higher", () => {
    const config = cloneDefaultConfig();
    config.minDurationSec = 10;

    const segments = normalizeSegments(
      [
        createSegment({
          UUID: "short-poi",
          category: "poi_highlight",
          actionType: "poi",
          segment: [42]
        }),
        createSegment({
          UUID: "short-full",
          category: "exclusive_access",
          actionType: "full",
          segment: [0, 0]
        })
      ],
      config
    );

    expect(segments.map((segment) => segment.UUID)).toEqual(["short-full", "short-poi"]);
  });

  it("normalizes one-point records to null end and duration", () => {
    const segments = normalizeSegments(
      [
        createSegment({
          UUID: "poi-point",
          category: "poi_highlight",
          actionType: "poi",
          segment: [42]
        })
      ],
      cloneDefaultConfig()
    );

    expect(segments[0]).toMatchObject({
      UUID: "poi-point",
      start: 42,
      end: null,
      duration: null
    });
  });

  it("drops non-finite starts defensively", () => {
    const malformed = {
      ...baseSegment,
      UUID: "nan-start",
      segment: [Number.NaN, 20]
    } as unknown as SponsorTime;

    const segments = normalizeSegments([malformed], cloneDefaultConfig());

    expect(segments).toEqual([]);
  });

  it("sorts normalized output by start time", () => {
    const segments = normalizeSegments(
      [
        createSegment({
          UUID: "late",
          segment: [30, 35]
        }),
        createSegment({
          UUID: "early",
          segment: [5, 10]
        }),
        createSegment({
          UUID: "middle",
          segment: [20, 25]
        })
      ],
      cloneDefaultConfig()
    );

    expect(segments.map((segment) => segment.UUID)).toEqual(["early", "middle", "late"]);
  });
});
