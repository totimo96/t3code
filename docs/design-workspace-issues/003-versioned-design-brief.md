# Add Versioned Design Brief

Type: AFK

## What to build

Add a visible, editable Design Brief to Design Threads. The Design Brief is a thread-owned versioned Markdown document used as prompt context for future artifact and variant generation.

## Acceptance criteria

- [ ] Design Brief updates are represented as orchestration domain events.
- [ ] Server projections expose the current Design Brief and its version metadata for a Design Thread.
- [ ] The Design Workspace includes a secondary panel for viewing and editing the Design Brief.
- [ ] Updating the Design Brief affects future prompt context but does not mutate existing Design Artifact versions.
- [ ] Tests cover event handling, projection snapshots, and UI edit/save behavior.

## Blocked by

- `002-design-route-empty-thread.md`
