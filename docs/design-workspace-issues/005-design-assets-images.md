# Add Design Assets for Images

Type: AFK

## What to build

Add server-stored Design Assets so Design Artifacts can include images reproducibly. Assets may come from user upload, agent generation, or explicit remote import, and artifacts should reference them through controlled T3 Code asset URLs.

## Acceptance criteria

- [ ] Design Assets are persisted server-side and associated with a Design Thread or Design Artifact.
- [ ] The UI supports adding an image asset through at least one explicit path.
- [ ] Standalone Design Documents can reference stored Design Assets through controlled asset URLs.
- [ ] Saved artifacts do not depend on arbitrary third-party image URLs.
- [ ] Tests cover asset persistence, URL access control, and artifact rendering with images.

## Blocked by

- `004-artifact-store-sandboxed-canvas.md`
