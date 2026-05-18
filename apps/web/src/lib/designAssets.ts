import type { DesignAsset, DesignAssetId } from "@t3tools/contracts";

export const DESIGN_ASSETS_ROUTE_PREFIX = "/design-assets";

export function designAssetUrlPath(assetId: DesignAssetId | string): string {
  return `${DESIGN_ASSETS_ROUTE_PREFIX}/${encodeURIComponent(assetId)}`;
}

export interface ReadFileAsBase64Result {
  readonly mimeType: string;
  readonly dataBase64: string;
  readonly sizeBytes: number;
}

export function readFileAsBase64(file: File): Promise<ReadFileAsBase64Result> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Could not read file data."));
        return;
      }
      const commaIndex = result.indexOf(",");
      if (commaIndex < 0) {
        reject(new Error("Unexpected file data format."));
        return;
      }
      const header = result.slice(0, commaIndex);
      const base64 = result.slice(commaIndex + 1);
      const mimeMatch = /data:([^;,]+)/i.exec(header);
      const mimeType = mimeMatch?.[1]?.toLowerCase() ?? file.type ?? "application/octet-stream";
      resolve({
        mimeType,
        dataBase64: base64,
        sizeBytes: file.size,
      });
    });
    reader.addEventListener("error", () => {
      reject(reader.error ?? new Error("Failed to read file."));
    });
    reader.readAsDataURL(file);
  });
}

export function isControlledDesignAssetUrl(url: string): boolean {
  const trimmed = url.trim();
  if (trimmed.length === 0) {
    return false;
  }
  if (trimmed.startsWith("data:")) {
    return true;
  }
  return trimmed.startsWith(`${DESIGN_ASSETS_ROUTE_PREFIX}/`);
}

export function sortDesignAssetsByCreatedAt(
  assets: ReadonlyArray<DesignAsset>,
): ReadonlyArray<DesignAsset> {
  return assets.toSorted(
    (left, right) =>
      left.createdAt.localeCompare(right.createdAt) || left.id.localeCompare(right.id),
  );
}
