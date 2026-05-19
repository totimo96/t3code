import { describe, expect, it } from "vitest";

import { isHtmlFenceLanguage, isStandaloneDesignDocumentHtml } from "./designArtifacts";

describe("design artifact helpers", () => {
  it("accepts complete standalone HTML documents", () => {
    expect(
      isStandaloneDesignDocumentHtml(
        "<!doctype html><html><head><title>x</title></head><body>x</body></html>",
      ),
    ).toBe(true);
  });

  it("rejects arbitrary HTML snippets", () => {
    expect(isStandaloneDesignDocumentHtml("<div>snippet</div>")).toBe(false);
  });

  it("recognizes html markdown fences", () => {
    expect(isHtmlFenceLanguage("language-html")).toBe(true);
    expect(isHtmlFenceLanguage("language-ts")).toBe(false);
  });
});
