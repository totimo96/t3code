// @effect-diagnostics nodeBuiltinImport:off
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { describe, expect, it } from "vitest";

import {
  decodeBase64ByteLength,
  designAssetRelativePath,
  extractImageSourcesFromHtml,
  isAllowedDesignAssetMimeType,
  isControlledDesignAssetUrl,
  resolveDesignAssetPathById,
} from "./designAssetStore.ts";

describe("isAllowedDesignAssetMimeType", () => {
  it("accepts allowed image mime types case-insensitively", () => {
    expect(isAllowedDesignAssetMimeType("image/png")).toBe(true);
    expect(isAllowedDesignAssetMimeType("Image/JPEG")).toBe(true);
    expect(isAllowedDesignAssetMimeType("image/webp")).toBe(true);
    expect(isAllowedDesignAssetMimeType("image/svg+xml")).toBe(true);
  });

  it("rejects non-image and arbitrary mime types", () => {
    expect(isAllowedDesignAssetMimeType("application/octet-stream")).toBe(false);
    expect(isAllowedDesignAssetMimeType("text/html")).toBe(false);
    expect(isAllowedDesignAssetMimeType("video/mp4")).toBe(false);
  });
});

describe("decodeBase64ByteLength", () => {
  it("computes the decoded byte length for valid base64", () => {
    expect(decodeBase64ByteLength("aGVsbG8=")).toBe(5);
    expect(decodeBase64ByteLength("aGk=")).toBe(2);
    expect(decodeBase64ByteLength("YWJjZA==")).toBe(4);
  });

  it("returns 0 for empty input and null for malformed input", () => {
    expect(decodeBase64ByteLength("")).toBe(0);
    expect(decodeBase64ByteLength("not base64!")).toBe(null);
    expect(decodeBase64ByteLength("abc")).toBe(null);
  });
});

describe("designAssetRelativePath", () => {
  it("derives the on-disk filename from id + mime type", () => {
    expect(designAssetRelativePath({ id: "asset-1", mimeType: "image/png" })).toBe("asset-1.png");
    expect(designAssetRelativePath({ id: "asset-2", mimeType: "image/jpeg" })).toBe("asset-2.jpg");
    expect(designAssetRelativePath({ id: "asset-3", mimeType: "image/svg+xml" })).toBe(
      "asset-3.svg",
    );
  });
});

describe("resolveDesignAssetPathById", () => {
  it("returns the resolved path when the asset file exists on disk", () => {
    const designAssetsDir = fs.mkdtempSync(path.join(os.tmpdir(), "t3code-design-assets-"));
    try {
      const assetId = "asset-1";
      const assetPath = path.join(designAssetsDir, `${assetId}.png`);
      fs.writeFileSync(assetPath, Buffer.from("hello"));

      expect(
        resolveDesignAssetPathById({
          designAssetsDir,
          assetId,
        }),
      ).toBe(assetPath);
    } finally {
      fs.rmSync(designAssetsDir, { recursive: true, force: true });
    }
  });

  it("returns null for unknown asset ids", () => {
    const designAssetsDir = fs.mkdtempSync(path.join(os.tmpdir(), "t3code-design-assets-"));
    try {
      expect(
        resolveDesignAssetPathById({
          designAssetsDir,
          assetId: "missing-asset",
        }),
      ).toBe(null);
    } finally {
      fs.rmSync(designAssetsDir, { recursive: true, force: true });
    }
  });

  it("rejects ids that would escape the design assets directory", () => {
    const designAssetsDir = fs.mkdtempSync(path.join(os.tmpdir(), "t3code-design-assets-"));
    try {
      expect(
        resolveDesignAssetPathById({
          designAssetsDir,
          assetId: "../escape",
        }),
      ).toBe(null);
      expect(
        resolveDesignAssetPathById({
          designAssetsDir,
          assetId: "nested/asset",
        }),
      ).toBe(null);
    } finally {
      fs.rmSync(designAssetsDir, { recursive: true, force: true });
    }
  });
});

describe("extractImageSourcesFromHtml + isControlledDesignAssetUrl", () => {
  it("extracts <img src> values and classifies controlled vs uncontrolled URLs", () => {
    const html = `
      <html>
        <body>
          <img src="/design-assets/asset-1" alt="logo">
          <img src='/design-assets/asset-2'/>
          <img src="https://example.com/external.png">
          <img src="data:image/png;base64,AAAA">
        </body>
      </html>
    `;

    const sources = extractImageSourcesFromHtml(html);
    expect(sources).toEqual([
      "/design-assets/asset-1",
      "/design-assets/asset-2",
      "https://example.com/external.png",
      "data:image/png;base64,AAAA",
    ]);

    expect(sources.filter((url) => !isControlledDesignAssetUrl(url))).toEqual([
      "https://example.com/external.png",
    ]);
  });
});
