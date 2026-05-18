# T3 Code

T3 Code is a local web GUI for working with coding agents across coding and design workflows while preserving predictable provider session behavior.

## Language

**Coding Workspace**:
The primary workspace for normal agentic coding conversations.
_Avoid_: normal tab, coding tab

**Design Workspace**:
An alternate workspace for creating and revising visual HTML designs with agents.
_Avoid_: design extension, design tab

**Design Route**:
The app route that opens a Design Thread with the Design Canvas as its primary detail surface.
_Avoid_: chat route query mode

**Workspace Switch**:
The sidebar control that chooses whether the app presents Coding Workspace threads or Design Workspace threads.
_Avoid_: tab bar, second sidebar

**Thread Workspace Kind**:
The persisted classification that says whether a thread belongs to the Coding Workspace or the Design Workspace.
_Avoid_: UI mode, temporary filter

**Design Thread**:
A design-focused agent thread with its own conversation and design artifacts.
_Avoid_: design mode on a coding thread

**Design Artifact**:
A versioned HTML design snapshot produced or revised during a Design Thread.
_Avoid_: HTML output, design file

**Design Brief**:
A versioned Markdown brief that captures goals, style rules, constraints, and design decisions for a Design Thread.
_Avoid_: automatic repo DESIGN.md, loose prompt notes

**Update Design Brief**:
An explicit agent or user action that creates a new Design Brief version.
_Avoid_: implicit prompt memory

**Design Artifact Store**:
The server-owned persistence boundary for Design Artifacts and their versions.
_Avoid_: browser cache, local storage

**Standalone Design Document**:
A complete HTML document that can render in isolation without project build dependencies.
_Avoid_: component snippet, partial HTML

**Design Asset**:
A server-stored visual asset referenced by a Design Artifact.
_Avoid_: arbitrary remote image URL

**Design Preview Sandbox**:
The restricted iframe environment used to render Standalone Design Documents.
_Avoid_: raw DOM injection, unsandboxed preview

**Design Target**:
A user-selected region inside a rendered Design Artifact that should be revised.
_Avoid_: component, React component, selected element

**Click Targeting**:
A Design Target selection mode that anchors to the clicked rendered element and nearby DOM context.
_Avoid_: component click

**Box Targeting**:
A Design Target selection mode that anchors to a rectangular region in the rendered artifact.
_Avoid_: crop, screenshot selection

**Freehand Targeting**:
A future Design Target selection mode that anchors to an arbitrary drawn region.
_Avoid_: lasso in v1

**Design Variant**:
A complete Design Artifact candidate produced as an alternative revision for a Design Target.
_Avoid_: patch, fragment, option snippet

**Accept Design Variant**:
The user action that promotes a Design Variant to the current Design Artifact version.
_Avoid_: apply to code, save to project

**Design Canvas**:
The pan-and-zoom work surface that renders the current Design Artifact for a Design Thread.
_Avoid_: whiteboard, artboard editor

**Manual Style Controls**:
Future structured controls for coarse visual changes such as color, typography, spacing, and radius.
_Avoid_: direct DOM tweaks, inspector edits in v1

**Create Design Artifact**:
An explicit agent or UI action that persists a Standalone Design Document as a versioned Design Artifact.
_Avoid_: auto-detected HTML block

**Apply Design Artifact**:
The explicit user action that turns the current Design Artifact into project file changes or a coding handoff.
_Avoid_: accept variant, confirm option

**Coding Handoff**:
A handoff from a Design Thread to a Coding Thread that asks an agent to implement the current Design Artifact in project files.
_Avoid_: direct apply, file patch

**Target Prompt Context**:
The structured context sent to an agent when asking for Design Variants for a Design Target.
_Avoid_: raw user prompt

## Relationships

- A **Design Workspace** contains one or more **Design Threads**.
- A **Design Route** addresses a **Design Thread** directly for reloads and deep links.
- A **Design Thread** owns one or more **Design Artifacts**.
- A **Design Thread** owns a **Design Brief** that is included in artifact and variant prompts.
- A new **Design Thread** may start without a **Design Artifact**.
- The first design workflow should create or update the **Design Brief** before creating the initial **Design Artifact**.
- **Update Design Brief** changes future prompt context but does not rewrite existing **Design Artifact** versions.
- A **Coding Workspace** and a **Design Workspace** share provider infrastructure but present different primary work surfaces.
- The **Workspace Switch** filters the sidebar to either **Coding Workspace** threads or **Design Workspace** threads.
- Every thread has exactly one **Thread Workspace Kind**: Coding Workspace or Design Workspace.
- A **Design Artifact** is the source of truth for design canvas state until the user explicitly exports or applies it to project files.
- The **Design Artifact Store** is the source of truth for persisted **Design Artifacts**.
- The **Design Artifact Store** records Design Artifact changes through orchestration domain events and projection read models.
- A **Design Artifact** stores a **Standalone Design Document** plus version metadata.
- A **Design Artifact** may reference **Design Assets** through controlled T3 Code asset URLs.
- A **Design Asset** may be created by user upload, agent generation, or explicit remote import.
- A **Standalone Design Document** renders inside a **Design Preview Sandbox**.
- A **Design Target** belongs to exactly one **Design Artifact** version and is anchored by render geometry and DOM context.
- **Click Targeting** and **Box Targeting** are the first supported ways to create a **Design Target**.
- **Freehand Targeting** is intentionally outside the first implementation slice.
- A **Design Variant** is produced from one **Design Target** and may become the current **Design Artifact** when the user accepts it.
- A target prompt should create three **Design Variants** by default unless the user requests a different count.
- In the first implementation slice, artifact changes are prompt-first; **Manual Style Controls** are a future capability.
- **Manual Style Controls** must create versioned **Design Artifact** changes rather than untracked preview-only edits.
- **Target Prompt Context** includes the current artifact, target anchor, local DOM/text/geometry, and optional visual crop.
- **Target Prompt Context** includes the **Design Brief** when one exists.
- **Accept Design Variant** changes the current **Design Artifact** version but does not write project files.
- **Apply Design Artifact** is separate from **Accept Design Variant** and is the only design action that targets project file changes.
- In the first implementation slice, **Apply Design Artifact** creates a **Coding Handoff** instead of writing files directly.
- A **Design Canvas** shows one current **Design Artifact** as the primary editable preview for a **Design Thread**.
- A **Design Thread** keeps the normal agent conversation and composer, but its primary detail surface is the **Design Canvas**.
- The **Design Brief** is visible and editable in the Design Workspace, but secondary to the **Design Canvas**.
- **Create Design Artifact** may be triggered by a structured agent action or a manual user action.
- **Create Design Artifact** is the only way response HTML becomes a persisted **Design Artifact**.

## Example Dialogue

> **Dev:** "When the user switches to the Design Workspace, do we keep editing the same coding conversation?"
> **Domain expert:** "No. A Design Workspace uses Design Threads so design artifacts can be restored, versioned, and revised independently."
>
> **Dev:** "Is a Design Thread just the chat route with a query parameter?"
> **Domain expert:** "No. A Design Route addresses the Design Thread directly so canvas state and search parameters can evolve independently."
>
> **Dev:** "Does the Design Workspace need a second sidebar next to the existing thread list?"
> **Domain expert:** "No. The Workspace Switch reuses the sidebar and filters it to the active workspace."
>
> **Dev:** "Can we infer design threads from whether they currently have artifacts?"
> **Domain expert:** "No. Thread Workspace Kind is persisted so empty Design Threads and restored sessions stay unambiguous."
>
> **Dev:** "When an agent produces HTML, do we immediately treat the project file as the design source?"
> **Domain expert:** "No. The Design Artifact remains the source of truth until the user applies it to project files."
>
> **Dev:** "Can the browser local state be the source of truth for a Design Artifact?"
> **Domain expert:** "No. The Design Artifact Store persists artifacts server-side; the browser only renders or caches them."
>
> **Dev:** "Should Design Artifacts use a separate CRUD service outside orchestration?"
> **Domain expert:** "No. Artifact changes are orchestration domain events projected into read models, like the rest of thread state."
>
> **Dev:** "Can a Design Artifact depend on the target app's React build?"
> **Domain expert:** "No. It must be a Standalone Design Document so the canvas can restore and render it independently."
>
> **Dev:** "Can a Design Artifact include images?"
> **Domain expert:** "Yes, but images are stored as Design Assets or inline data so previews remain reproducible."
>
> **Dev:** "Can a saved Design Artifact depend on a third-party image staying online?"
> **Domain expert:** "No. Remote images must be imported as Design Assets before they become durable artifact dependencies."
>
> **Dev:** "Can generated HTML run directly in the T3 Code DOM?"
> **Domain expert:** "No. It renders in the Design Preview Sandbox and communicates with the app through a controlled bridge."
>
> **Dev:** "When the user clicks a button-looking thing, is that always a source component?"
> **Domain expert:** "No. It is a Design Target: a visual target anchored in a rendered artifact, even if the underlying HTML is not componentized."
>
> **Dev:** "Do we need click, box, and freehand selection in the first version?"
> **Domain expert:** "No. Click Targeting and Box Targeting are enough for V1; Freehand Targeting can come later."
>
> **Dev:** "Does a target prompt produce a tiny patch for the selected region?"
> **Domain expert:** "No. It produces Design Variants as complete artifact candidates so each option can be rendered, accepted, and restored independently."
>
> **Dev:** "How many variants should a normal target prompt produce?"
> **Domain expert:** "Three by default: enough to compare, not so many that cost and review overhead dominate."
>
> **Dev:** "Can a target prompt contain only the user's typed instruction?"
> **Domain expert:** "No. The agent needs Target Prompt Context so variants preserve the whole design while changing the intended region."
>
> **Dev:** "Is DESIGN.md automatically written into the project repo?"
> **Domain expert:** "No. The Design Brief is thread-owned Markdown that can be handed to a Coding Thread when applying the artifact."
>
> **Dev:** "If the Design Brief changes, do old artifact versions mutate?"
> **Domain expert:** "No. Brief updates affect future generation context only."
>
> **Dev:** "Does a new Design Thread need a placeholder design?"
> **Domain expert:** "No. It can start empty; the first workflow creates the brief and initial artifact."
>
> **Dev:** "Is the Design Brief hidden system prompt state?"
> **Domain expert:** "No. It is visible and editable, but the Canvas remains the primary surface."
>
> **Dev:** "When the user accepts a variant, does it immediately edit the repository?"
> **Domain expert:** "No. Accepting a variant updates the Design Artifact; applying it to project files is a separate action."
>
> **Dev:** "Does Apply Design Artifact directly patch files in V1?"
> **Domain expert:** "No. It creates a Coding Handoff so normal coding-thread review and diff workflows handle repository changes."
>
> **Dev:** "Is the Design Canvas a full whiteboard with many independent objects?"
> **Domain expert:** "No. In the first version it is a pan-and-zoom surface for the current Design Artifact."
>
> **Dev:** "Can users manually tweak styles directly on the canvas in V1?"
> **Domain expert:** "No. V1 is prompt-first, but future Manual Style Controls can create versioned artifact changes."
>
> **Dev:** "Does the Design Workspace replace chat entirely?"
> **Domain expert:** "No. Chat remains the agent control surface, but the Design Canvas is the primary detail view."
>
> **Dev:** "If the agent posts an HTML code block, is that automatically a Design Artifact?"
> **Domain expert:** "No. Artifact creation is explicit so persistence and versioning stay predictable."
>
> **Dev:** "Can the user still save useful HTML if the agent only posted it in chat?"
> **Domain expert:** "Yes. The user may manually create a Design Artifact from visible response HTML."

## Flagged Ambiguities

- "design extension" and "design tab" were used for the same concept; resolved: the canonical term is **Design Workspace**.
- "two tabs in the sidebar" was ambiguous between navigation tabs and separate sidebars; resolved: this is a **Workspace Switch** that filters one sidebar.
- "design mode" could mean a temporary UI state; resolved: workspace ownership is a persisted **Thread Workspace Kind**.
- A design workflow could have been an alternate view on a normal coding thread; resolved: design work uses **Design Threads** while sharing provider infrastructure.
- "HTML file" could mean either a persisted design snapshot or a project file; resolved: design work uses **Design Artifacts**, and project files are updated only through an explicit apply/export step.
- "component" could mean a visual region, DOM node, or source component; resolved: the selectable unit is a **Design Target**.
- "design option" could mean a partial patch or a complete candidate; resolved: a **Design Variant** is a complete artifact candidate.
- "infinite canvas" could imply a general whiteboard; resolved: the **Design Canvas** is a pan-and-zoom surface for the current artifact.
- "HTML in chat" could mean an example, explanation, or persisted design; resolved: only structured or manual **Create Design Artifact** persists a Design Artifact.
- "DESIGN.md" could mean a repo file or prompt notes; resolved: the domain term is **Design Brief**, a thread-owned Markdown artifact.
