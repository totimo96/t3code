const HTML_DOCUMENT_DOCTYPE_REGEX = /^\s*<!doctype\s+html[\s>]/i;
const HTML_DOCUMENT_TAG_REGEX = /<html(?:\s|>)[\s\S]*<\/html>\s*$/i;

export function isStandaloneDesignDocumentHtml(html: string): boolean {
  const trimmed = html.trim();
  return HTML_DOCUMENT_DOCTYPE_REGEX.test(trimmed) && HTML_DOCUMENT_TAG_REGEX.test(trimmed);
}

export function isHtmlFenceLanguage(className: string | undefined): boolean {
  return /(?:^|\s)language-html(?:\s|$)/.test(className ?? "");
}
