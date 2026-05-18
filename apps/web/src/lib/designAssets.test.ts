import { describe, expect, it } from "vitest";

import {
  DESIGN_ASSETS_ROUTE_PREFIX,
  designAssetUrlPath,
  isControlledDesignAssetUrl,
  sortDesignAssetsByCreatedAt,
} from "./designAssets";
import { DesignAssetId, ThreadId, type DesignAsset } from "@t3tools/contracts";

const asset = (
  overrides: Partial<Omit<DesignAsset, "id" | "threadId">> & { id: string },
): DesignAsset => ({
  threadId: ThreadId.make("thread-1"),
  name: "hero.png",
  mimeType: "image/png",
  sizeBytes: 5,
  createdAt: "2026-05-19T00:00:00.000Z",
  ...overrides,
  id: DesignAssetId.make(overrides.id),
});

describe("designAssetUrlPath", () => {
  it("builds a URL-encoded path under the controlled prefix", () => {
    expect(designAssetUrlPath("asset id")).toBe(`${DESIGN_ASSETS_ROUTE_PREFIX}/asset%20id`);
    expect(designAssetUrlPath("11111111-1111-4111-8111-111111111111")).toBe(
      `${DESIGN_ASSETS_ROUTE_PREFIX}/11111111-1111-4111-8111-111111111111`,
    );
  });
});

describe("isControlledDesignAssetUrl", () => {
  it("treats /design-assets/ and data URLs as controlled, everything else as external", () => {
    expect(isControlledDesignAssetUrl("/design-assets/asset-1")).toBe(true);
    expect(isControlledDesignAssetUrl("data:image/png;base64,AAAA")).toBe(true);
    expect(isControlledDesignAssetUrl("https://example.com/hero.png")).toBe(false);
    expect(isControlledDesignAssetUrl("//cdn.example.com/hero.png")).toBe(false);
    expect(isControlledDesignAssetUrl("")).toBe(false);
  });
});

describe("sortDesignAssetsByCreatedAt", () => {
  it("sorts by createdAt then id for stable ordering", () => {
    const sorted = sortDesignAssetsByCreatedAt([
      asset({ id: "b", createdAt: "2026-05-19T00:00:02.000Z" }),
      asset({ id: "a", createdAt: "2026-05-19T00:00:01.000Z" }),
      asset({ id: "c", createdAt: "2026-05-19T00:00:01.000Z" }),
    ]);
    expect(sorted.map((entry) => entry.id)).toEqual(["a", "c", "b"]);
  });
});
