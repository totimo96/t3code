// @effect-diagnostics nodeBuiltinImport:off
import { existsSync } from "node:fs";

import {
  normalizeAttachmentRelativePath,
  resolveAttachmentRelativePath,
} from "./attachmentPaths.ts";
import { inferImageExtension, SAFE_IMAGE_FILE_EXTENSIONS } from "./imageMime.ts";

export const DESIGN_ASSET_MAX_BYTES = 5 * 1024 * 1024;
export const DESIGN_ASSETS_ROUTE_PREFIX = "/design-assets";

export const ALLOWED_DESIGN_ASSET_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/avif",
]);

const DESIGN_ASSET_FILENAME_EXTENSIONS = [...SAFE_IMAGE_FILE_EXTENSIONS, ".bin"];

export function isAllowedDesignAssetMimeType(mimeType: string): boolean {
  return ALLOWED_DESIGN_ASSET_MIME_TYPES.has(mimeType.toLowerCase());
}

export function decodeBase64ByteLength(dataBase64: string): number | null {
  const sanitized = dataBase64.replace(/\s+/g, "");
  if (sanitized.length === 0) {
    return 0;
  }
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(sanitized)) {
    return null;
  }
  if (sanitized.length % 4 !== 0) {
    return null;
  }
  const padding = sanitized.endsWith("==") ? 2 : sanitized.endsWith("=") ? 1 : 0;
  return (sanitized.length / 4) * 3 - padding;
}

export function designAssetRelativePath(input: {
  readonly id: string;
  readonly mimeType: string;
  readonly name?: string | undefined;
}): string {
  const extension = inferImageExtension({
    mimeType: input.mimeType,
    ...(input.name !== undefined ? { fileName: input.name } : {}),
  });
  return `${input.id}${extension}`;
}

export function resolveDesignAssetPathById(input: {
  readonly designAssetsDir: string;
  readonly assetId: string;
}): string | null {
  const normalizedId = normalizeAttachmentRelativePath(input.assetId);
  if (!normalizedId || normalizedId.includes("/") || normalizedId.includes(".")) {
    return null;
  }
  for (const extension of DESIGN_ASSET_FILENAME_EXTENSIONS) {
    const candidate = resolveAttachmentRelativePath({
      attachmentsDir: input.designAssetsDir,
      relativePath: `${normalizedId}${extension}`,
    });
    if (candidate && existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

export function designAssetUrlPath(assetId: string): string {
  return `${DESIGN_ASSETS_ROUTE_PREFIX}/${encodeURIComponent(assetId)}`;
}

const IMG_SRC_PATTERN = /<img[^>]*\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)')/gi;

export function extractImageSourcesFromHtml(html: string): string[] {
  const sources: string[] = [];
  for (const match of html.matchAll(IMG_SRC_PATTERN)) {
    const value = match[1] ?? match[2];
    if (value) {
      sources.push(value);
    }
  }
  return sources;
}

export function isControlledDesignAssetUrl(url: string): boolean {
  const trimmed = url.trim();
  if (trimmed.length === 0) {
    return false;
  }
  if (trimmed.startsWith("data:")) {
    return true;
  }
  if (trimmed.startsWith(`${DESIGN_ASSETS_ROUTE_PREFIX}/`)) {
    return true;
  }
  return false;
}
