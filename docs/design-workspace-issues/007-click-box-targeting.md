# Add Click and Box Design Targeting

Type: AFK

## What to build

Add Click Targeting and Box Targeting for selecting Design Targets inside the rendered Design Artifact. Store enough target anchor context to support variant prompts and future restoration.

## Acceptance criteria

- [ ] Users can create a Design Target by clicking an element in the sandboxed artifact preview.
- [ ] Users can create a Design Target by drawing a rectangular region over the artifact preview.
- [ ] Target anchors include render geometry and DOM context.
- [ ] Target Prompt Context includes the current artifact, target anchor, local DOM/text/geometry, optional visual crop, and Design Brief when present.
- [ ] Tests cover selection state, iframe bridge messaging, and Target Prompt Context construction.

## Blocked by

- `004-artifact-store-sandboxed-canvas.md`
