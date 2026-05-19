import {
  type EnvironmentId,
  isProviderDriverKind,
  ProjectId,
  type ModelSelection,
  type ProviderDriverKind,
  type ScopedThreadRef,
  type ThreadId,
  type TurnId,
} from "@t3tools/contracts";
import { type ChatMessage, type SessionPhase, type Thread, type ThreadSession } from "../types";
import { type ComposerImageAttachment, type DraftThreadState } from "../composerDraftStore";
import * as Schema from "effect/Schema";
import { selectThreadByRef, useStore } from "../store";
import {
  filterTerminalContextsWithText,
  stripInlineTerminalContextPlaceholders,
  type TerminalContextDraft,
} from "../lib/terminalContext";
import type { DraftThreadEnvMode } from "../composerDraftStore";

export const LAST_INVOKED_SCRIPT_BY_PROJECT_KEY = "t3code:last-invoked-script-by-project";
export const MAX_HIDDEN_MOUNTED_TERMINAL_THREADS = 10;

export const LastInvokedScriptByProjectSchema = Schema.Record(ProjectId, Schema.String);

export function buildLocalDraftThread(
  threadId: ThreadId,
  draftThread: DraftThreadState,
  fallbackModelSelection: ModelSelection,
  error: string | null,
): Thread {
  return {
    id: threadId,
    environmentId: draftThread.environmentId,
    codexThreadId: null,
    projectId: draftThread.projectId,
    title: "New thread",
    modelSelection: fallbackModelSelection,
    runtimeMode: draftThread.runtimeMode,
    interactionMode: draftThread.interactionMode,
    session: null,
    messages: [],
    designBrief: null,
    designArtifact: null,
    designAssets: [],
    error,
    createdAt: draftThread.createdAt,
    archivedAt: null,
    latestTurn: null,
    branch: draftThread.branch,
    worktreePath: draftThread.worktreePath,
    turnDiffSummaries: [],
    activities: [],
    proposedPlans: [],
  };
}

export function shouldWriteThreadErrorToCurrentServerThread(input: {
  serverThread:
    | {
        environmentId: EnvironmentId;
        id: ThreadId;
      }
    | null
    | undefined;
  routeThreadRef: ScopedThreadRef;
  targetThreadId: ThreadId;
}): boolean {
  return Boolean(
    input.serverThread &&
    input.targetThreadId === input.routeThreadRef.threadId &&
    input.serverThread.environmentId === input.routeThreadRef.environmentId &&
    input.serverThread.id === input.targetThreadId,
  );
}

export function reconcileMountedTerminalThreadIds(input: {
  currentThreadIds: ReadonlyArray<string>;
  openThreadIds: ReadonlyArray<string>;
  activeThreadId: string | null;
  activeThreadTerminalOpen: boolean;
  maxHiddenThreadCount?: number;
}): string[] {
  const openThreadIdSet = new Set(input.openThreadIds);
  const hiddenThreadIds = input.currentThreadIds.filter(
    (threadId) => threadId !== input.activeThreadId && openThreadIdSet.has(threadId),
  );
  const maxHiddenThreadCount = Math.max(
    0,
    input.maxHiddenThreadCount ?? MAX_HIDDEN_MOUNTED_TERMINAL_THREADS,
  );
  const nextThreadIds =
    hiddenThreadIds.length > maxHiddenThreadCount
      ? hiddenThreadIds.slice(-maxHiddenThreadCount)
      : hiddenThreadIds;

  if (
    input.activeThreadId &&
    input.activeThreadTerminalOpen &&
    !nextThreadIds.includes(input.activeThreadId)
  ) {
    nextThreadIds.push(input.activeThreadId);
  }

  return nextThreadIds;
}

export function revokeBlobPreviewUrl(previewUrl: string | undefined): void {
  if (!previewUrl || typeof URL === "undefined" || !previewUrl.startsWith("blob:")) {
    return;
  }
  URL.revokeObjectURL(previewUrl);
}

export function revokeUserMessagePreviewUrls(message: ChatMessage): void {
  if (message.role !== "user" || !message.attachments) {
    return;
  }
  for (const attachment of message.attachments) {
    if (attachment.type !== "image") {
      continue;
    }
    revokeBlobPreviewUrl(attachment.previewUrl);
  }
}

export function collectUserMessageBlobPreviewUrls(message: ChatMessage): string[] {
  if (message.role !== "user" || !message.attachments) {
    return [];
  }
  const previewUrls: string[] = [];
  for (const attachment of message.attachments) {
    if (attachment.type !== "image") continue;
    if (!attachment.previewUrl || !attachment.previewUrl.startsWith("blob:")) continue;
    previewUrls.push(attachment.previewUrl);
  }
  return previewUrls;
}

export interface PullRequestDialogState {
  initialReference: string | null;
  key: number;
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Could not read image data."));
    });
    reader.addEventListener("error", () => {
      reject(reader.error ?? new Error("Failed to read image."));
    });
    reader.readAsDataURL(file);
  });
}

export function resolveSendEnvMode(input: {
  requestedEnvMode: DraftThreadEnvMode;
  isGitRepo: boolean;
}): DraftThreadEnvMode {
  return input.isGitRepo ? input.requestedEnvMode : "local";
}

export function cloneComposerImageForRetry(
  image: ComposerImageAttachment,
): ComposerImageAttachment {
  if (typeof URL === "undefined" || !image.previewUrl.startsWith("blob:")) {
    return image;
  }
  try {
    return {
      ...image,
      previewUrl: URL.createObjectURL(image.file),
    };
  } catch {
    return image;
  }
}

export function deriveComposerSendState(options: {
  prompt: string;
  imageCount: number;
  terminalContexts: ReadonlyArray<TerminalContextDraft>;
}): {
  trimmedPrompt: string;
  sendableTerminalContexts: TerminalContextDraft[];
  expiredTerminalContextCount: number;
  hasSendableContent: boolean;
} {
  const trimmedPrompt = stripInlineTerminalContextPlaceholders(options.prompt).trim();
  const sendableTerminalContexts = filterTerminalContextsWithText(options.terminalContexts);
  const expiredTerminalContextCount =
    options.terminalContexts.length - sendableTerminalContexts.length;
  return {
    trimmedPrompt,
    sendableTerminalContexts,
    expiredTerminalContextCount,
    hasSendableContent:
      trimmedPrompt.length > 0 || options.imageCount > 0 || sendableTerminalContexts.length > 0,
  };
}

export function buildExpiredTerminalContextToastCopy(
  expiredTerminalContextCount: number,
  variant: "omitted" | "empty",
): { title: string; description: string } {
  const count = Math.max(1, Math.floor(expiredTerminalContextCount));
  const noun = count === 1 ? "Expired terminal context" : "Expired terminal contexts";
  if (variant === "empty") {
    return {
      title: `${noun} won't be sent`,
      description: "Remove it or re-add it to include terminal output.",
    };
  }
  return {
    title: `${noun} omitted from message`,
    description: "Re-add it if you want that terminal output included.",
  };
}

export interface DesignCanvasIframeProps {
  readonly key: string;
  readonly title: string;
  readonly sandbox: string;
  readonly referrerPolicy: "no-referrer";
  readonly srcDoc: string;
}

export type DesignTargetMode = "click" | "box";

export interface DesignTargetGeometry {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly viewportWidth: number;
  readonly viewportHeight: number;
}

export interface DesignTargetDomContext {
  readonly tagName: string;
  readonly id: string | null;
  readonly className: string | null;
  readonly selector: string;
  readonly text: string | null;
  readonly ariaLabel: string | null;
}

export interface DesignTargetAnchor {
  readonly mode: DesignTargetMode;
  readonly geometry: DesignTargetGeometry;
  readonly domContext: DesignTargetDomContext | null;
}

export interface DesignTargetBridgeMessage {
  readonly source: "t3-design-canvas";
  readonly type: "design-target-selected";
  readonly anchor: DesignTargetAnchor;
}

export interface DesignVariantCandidate {
  readonly id: string;
  readonly title: string;
  readonly html: string;
  readonly parentArtifactVersion: number;
  readonly targetAnchor: DesignTargetAnchor;
  readonly prompt: string;
  readonly createdAt: string;
}

const DESIGN_TARGET_BRIDGE_SCRIPT = String.raw`
(() => {
  const SOURCE = "t3-design-canvas";
  let mode = "click";
  let dragStart = null;
  let dragging = false;

  const round = (value) => Math.round(Number(value || 0) * 100) / 100;
  const geometryFromRect = (rect) => ({
    x: round(rect.x),
    y: round(rect.y),
    width: round(rect.width),
    height: round(rect.height),
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
  });
  const selectorFor = (element) => {
    if (!element || element.nodeType !== 1) return "";
    if (element.id) return "#" + CSS.escape(element.id);
    const parts = [];
    let current = element;
    while (current && current.nodeType === 1 && current !== document.body && parts.length < 5) {
      let part = current.tagName.toLowerCase();
      if (current.classList.length > 0) {
        part += "." + Array.from(current.classList).slice(0, 3).map((name) => CSS.escape(name)).join(".");
      }
      const parent = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter((child) => child.tagName === current.tagName);
        if (siblings.length > 1) part += ":nth-of-type(" + (siblings.indexOf(current) + 1) + ")";
      }
      parts.unshift(part);
      current = parent;
    }
    return parts.join(" > ") || element.tagName.toLowerCase();
  };
  const domContextFor = (element) => {
    if (!element || element.nodeType !== 1) return null;
    const text = (element.innerText || element.textContent || "").replace(/\s+/g, " ").trim();
    const className = typeof element.className === "string" ? element.className.trim() : "";
    return {
      tagName: element.tagName.toLowerCase(),
      id: element.id || null,
      className: className || null,
      selector: selectorFor(element),
      text: text ? text.slice(0, 500) : null,
      ariaLabel: element.getAttribute("aria-label") || null,
    };
  };
  const postAnchor = (anchor) => {
    window.parent.postMessage({ source: SOURCE, type: "design-target-selected", anchor }, "*");
  };
  window.addEventListener("message", (event) => {
    const data = event.data;
    if (!data || data.source !== "t3-design-canvas-host" || data.type !== "set-target-mode") return;
    mode = data.mode === "box" ? "box" : "click";
  });
  document.addEventListener("click", (event) => {
    if (mode !== "click") return;
    event.preventDefault();
    event.stopPropagation();
    const element = event.target;
    postAnchor({
      mode: "click",
      geometry: geometryFromRect(element.getBoundingClientRect()),
      domContext: domContextFor(element),
    });
  }, true);
  document.addEventListener("pointerdown", (event) => {
    if (mode !== "box") return;
    dragStart = { x: event.clientX, y: event.clientY };
    dragging = true;
    event.preventDefault();
  }, true);
  document.addEventListener("pointerup", (event) => {
    if (mode !== "box" || !dragStart || !dragging) return;
    dragging = false;
    const x = Math.min(dragStart.x, event.clientX);
    const y = Math.min(dragStart.y, event.clientY);
    const width = Math.abs(event.clientX - dragStart.x);
    const height = Math.abs(event.clientY - dragStart.y);
    const element = document.elementFromPoint(x + width / 2, y + height / 2);
    postAnchor({
      mode: "box",
      geometry: {
        x: round(x),
        y: round(y),
        width: round(width),
        height: round(height),
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      },
      domContext: domContextFor(element),
    });
    dragStart = null;
    event.preventDefault();
  }, true);
})();`;

function injectDesignTargetBridge(html: string): string {
  const bridge = `<script data-t3-design-target-bridge="true">${DESIGN_TARGET_BRIDGE_SCRIPT}</script>`;
  if (html.includes("data-t3-design-target-bridge=")) {
    return html;
  }
  if (/<\/body\s*>/i.test(html)) {
    return html.replace(/<\/body\s*>/i, `${bridge}</body>`);
  }
  return `${html}${bridge}`;
}

export function designCanvasIframeProps(
  artifact: NonNullable<Thread["designArtifact"]>,
  options?: { readonly targetBridge?: boolean },
): DesignCanvasIframeProps {
  const srcDoc = options?.targetBridge ? injectDesignTargetBridge(artifact.html) : artifact.html;
  return {
    key: `${artifact.version}-${artifact.updatedAt}`,
    title: "Design Artifact",
    sandbox: "allow-scripts",
    referrerPolicy: "no-referrer",
    srcDoc,
  };
}

export function isDesignTargetBridgeMessage(value: unknown): value is DesignTargetBridgeMessage {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<DesignTargetBridgeMessage>;
  return (
    record.source === "t3-design-canvas" &&
    record.type === "design-target-selected" &&
    Boolean(record.anchor) &&
    (record.anchor?.mode === "click" || record.anchor?.mode === "box")
  );
}

export function buildTargetPromptContext(input: {
  readonly artifact: NonNullable<Thread["designArtifact"]>;
  readonly anchor: DesignTargetAnchor;
  readonly designBriefMarkdown: string | null;
}): string {
  const { artifact, anchor } = input;
  const dom = anchor.domContext;
  const brief = input.designBriefMarkdown?.trim();
  return [
    "Target Prompt Context:",
    `- Artifact version: ${artifact.version}`,
    `- Target mode: ${anchor.mode}`,
    `- Render geometry: x=${anchor.geometry.x}, y=${anchor.geometry.y}, width=${anchor.geometry.width}, height=${anchor.geometry.height}, viewport=${anchor.geometry.viewportWidth}x${anchor.geometry.viewportHeight}`,
    dom
      ? `- DOM context: ${dom.selector} (${dom.tagName}${dom.id ? `#${dom.id}` : ""}${dom.className ? `.${dom.className.split(/\s+/).join(".")}` : ""})`
      : "- DOM context: none",
    dom?.ariaLabel ? `- ARIA label: ${dom.ariaLabel}` : null,
    dom?.text ? `- Local text: ${dom.text}` : null,
    "- Visual crop: not captured",
    brief ? ["", "Design Brief:", brief].join("\n") : null,
    "",
    "Current Standalone Design Document:",
    artifact.html,
    "",
    "Revise this target while preserving the rest of the standalone design document.",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

function appendHiddenDesignVariantMetadata(html: string, metadata: string): string {
  const marker = `<template data-t3-design-variant>${metadata}</template>`;
  if (/<\/body\s*>/i.test(html)) {
    return html.replace(/<\/body\s*>/i, `${marker}</body>`);
  }
  return `${html}${marker}`;
}

export function buildDesignVariantGenerationPrompt(input: {
  readonly artifact: NonNullable<Thread["designArtifact"]>;
  readonly anchor: DesignTargetAnchor;
  readonly instruction: string;
  readonly designBriefMarkdown: string | null;
  readonly variantCount?: number;
}): string {
  const variantCount = input.variantCount ?? 3;
  return [
    `Generate ${variantCount} Design Variants as complete Standalone Design Documents.`,
    "Return each variant as a full HTML document, not as a patch or fragment.",
    "Each variant must preserve the overall design and revise only the selected Design Target.",
    "",
    "Instruction:",
    input.instruction.trim() || "Create distinct visual alternatives for the selected target.",
    "",
    buildTargetPromptContext({
      artifact: input.artifact,
      anchor: input.anchor,
      designBriefMarkdown: input.designBriefMarkdown,
    }),
  ].join("\n");
}

export function generateDesignVariantCandidates(input: {
  readonly artifact: NonNullable<Thread["designArtifact"]>;
  readonly anchor: DesignTargetAnchor;
  readonly instruction: string;
  readonly designBriefMarkdown: string | null;
  readonly createdAt: string;
  readonly variantCount?: number;
}): DesignVariantCandidate[] {
  const variantCount = input.variantCount ?? 3;
  const prompt = buildDesignVariantGenerationPrompt(input);
  return Array.from({ length: variantCount }, (_, index) => {
    const ordinal = index + 1;
    const title = `Variant ${ordinal}`;
    const metadata = [
      `parentArtifactVersion=${input.artifact.version}`,
      `targetMode=${input.anchor.mode}`,
      `variant=${ordinal}`,
    ].join("; ");
    return {
      id: `variant-${input.artifact.version}-${input.createdAt}-${ordinal}`,
      title,
      html: appendHiddenDesignVariantMetadata(input.artifact.html, metadata),
      parentArtifactVersion: input.artifact.version,
      targetAnchor: input.anchor,
      prompt,
      createdAt: input.createdAt,
    };
  });
}

export function buildCodingHandoffPrompt(input: {
  readonly artifact: NonNullable<Thread["designArtifact"]>;
  readonly designBriefMarkdown: string | null;
}): string {
  const brief = input.designBriefMarkdown?.trim();
  return [
    "Implement this Design Artifact in the project files.",
    "",
    "Do not treat this as already-applied code. Use the normal coding workflow: inspect the app, edit the relevant files, and leave reviewable diffs.",
    "",
    `Design Artifact version: ${input.artifact.version}`,
    `Design Artifact updated at: ${input.artifact.updatedAt}`,
    brief ? ["", "Design Brief:", brief].join("\n") : null,
    "",
    "Standalone Design Document:",
    input.artifact.html,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

export function threadHasStarted(thread: Thread | null | undefined): boolean {
  return Boolean(
    thread && (thread.latestTurn !== null || thread.messages.length > 0 || thread.session !== null),
  );
}

// `threadProvider` is the open branded driver kind carried by the session.
// Unknown driver kinds degrade to `null` (i.e. "unlocked"), which is the safe
// rollback / fork behavior — the routing layer is the right place to surface
// "driver not installed" errors, not the lock state.
//
// `selectedProvider` takes the same open-string shape because the composer
// now tracks the picker selection as a `ProviderInstanceId` (e.g.
// `codex_personal`). Custom instance ids that don't directly match a
// registered driver resolve to `null` here, which matches the existing
// "unknown driver -> unlocked" semantics. Callers that want the lock to track
// a custom instance's underlying driver kind should resolve the instance id
// upstream and pass the correlated kind.
export function deriveLockedProvider(input: {
  thread: Thread | null | undefined;
  selectedProvider: string | null;
  threadProvider: string | null;
}): ProviderDriverKind | null {
  if (!threadHasStarted(input.thread)) {
    return null;
  }
  const sessionProvider = input.thread?.session?.provider ?? null;
  if (sessionProvider) {
    return sessionProvider;
  }
  const narrowedThreadProvider =
    input.threadProvider && isProviderDriverKind(input.threadProvider)
      ? input.threadProvider
      : null;
  const narrowedSelectedProvider =
    input.selectedProvider && isProviderDriverKind(input.selectedProvider)
      ? input.selectedProvider
      : null;
  return narrowedThreadProvider ?? narrowedSelectedProvider ?? null;
}

export async function waitForStartedServerThread(
  threadRef: ScopedThreadRef,
  timeoutMs = 1_000,
): Promise<boolean> {
  const getThread = () => selectThreadByRef(useStore.getState(), threadRef);
  const thread = getThread();

  if (threadHasStarted(thread)) {
    return true;
  }

  return await new Promise<boolean>((resolve) => {
    let settled = false;
    let timeoutId: ReturnType<typeof globalThis.setTimeout> | null = null;
    const finish = (result: boolean) => {
      if (settled) {
        return;
      }
      settled = true;
      if (timeoutId !== null) {
        globalThis.clearTimeout(timeoutId);
      }
      unsubscribe();
      resolve(result);
    };

    const unsubscribe = useStore.subscribe((state) => {
      if (!threadHasStarted(selectThreadByRef(state, threadRef))) {
        return;
      }
      finish(true);
    });

    if (threadHasStarted(getThread())) {
      finish(true);
      return;
    }

    timeoutId = globalThis.setTimeout(() => {
      finish(false);
    }, timeoutMs);
  });
}

export interface LocalDispatchSnapshot {
  startedAt: string;
  preparingWorktree: boolean;
  latestTurnTurnId: TurnId | null;
  latestTurnRequestedAt: string | null;
  latestTurnStartedAt: string | null;
  latestTurnCompletedAt: string | null;
  sessionOrchestrationStatus: ThreadSession["orchestrationStatus"] | null;
  sessionUpdatedAt: string | null;
}

export function createLocalDispatchSnapshot(
  activeThread: Thread | undefined,
  options?: { preparingWorktree?: boolean },
): LocalDispatchSnapshot {
  const latestTurn = activeThread?.latestTurn ?? null;
  const session = activeThread?.session ?? null;
  return {
    startedAt: new Date().toISOString(),
    preparingWorktree: Boolean(options?.preparingWorktree),
    latestTurnTurnId: latestTurn?.turnId ?? null,
    latestTurnRequestedAt: latestTurn?.requestedAt ?? null,
    latestTurnStartedAt: latestTurn?.startedAt ?? null,
    latestTurnCompletedAt: latestTurn?.completedAt ?? null,
    sessionOrchestrationStatus: session?.orchestrationStatus ?? null,
    sessionUpdatedAt: session?.updatedAt ?? null,
  };
}

export function hasServerAcknowledgedLocalDispatch(input: {
  localDispatch: LocalDispatchSnapshot | null;
  phase: SessionPhase;
  latestTurn: Thread["latestTurn"] | null;
  session: Thread["session"] | null;
  hasPendingApproval: boolean;
  hasPendingUserInput: boolean;
  threadError: string | null | undefined;
}): boolean {
  if (!input.localDispatch) {
    return false;
  }
  if (input.hasPendingApproval || input.hasPendingUserInput || Boolean(input.threadError)) {
    return true;
  }

  const latestTurn = input.latestTurn ?? null;
  const session = input.session ?? null;
  const latestTurnChanged =
    input.localDispatch.latestTurnTurnId !== (latestTurn?.turnId ?? null) ||
    input.localDispatch.latestTurnRequestedAt !== (latestTurn?.requestedAt ?? null) ||
    input.localDispatch.latestTurnStartedAt !== (latestTurn?.startedAt ?? null) ||
    input.localDispatch.latestTurnCompletedAt !== (latestTurn?.completedAt ?? null);

  if (input.phase === "running") {
    if (!latestTurnChanged) {
      return false;
    }
    if (latestTurn?.startedAt === null || latestTurn === null) {
      return false;
    }
    if (
      session?.activeTurnId !== undefined &&
      session.activeTurnId !== null &&
      latestTurn?.turnId !== session.activeTurnId
    ) {
      return false;
    }
    return true;
  }

  return (
    latestTurnChanged ||
    input.localDispatch.sessionOrchestrationStatus !== (session?.orchestrationStatus ?? null) ||
    input.localDispatch.sessionUpdatedAt !== (session?.updatedAt ?? null)
  );
}
