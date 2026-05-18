# Create Design Artifact from Explicit Action

Type: AFK

## What to build

Add an explicit Create Design Artifact action that persists response HTML as a versioned Design Artifact. Artifact creation may come from a structured agent action or a manual user action, but arbitrary HTML code blocks in chat should not be auto-detected as artifacts.

## Acceptance criteria

- [ ] A user can manually create a Design Artifact from visible response HTML.
- [ ] A structured agent action can create a Design Artifact.
- [ ] Artifact creation stores a complete Standalone Design Document plus version metadata.
- [ ] Chat HTML snippets are not automatically persisted without an explicit action.
- [ ] Tests cover manual creation, structured creation, and non-creation from arbitrary code blocks.

## Blocked by

- `004-artifact-store-sandboxed-canvas.md`
