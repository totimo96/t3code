# Add Design Artifact Store and Sandboxed Canvas

Type: AFK

## What to build

Add Design Artifact events, persistence, projections, contracts, and UI rendering for the current Standalone Design Document. The Design Canvas should render the current artifact in a restricted iframe sandbox.

## Acceptance criteria

- [ ] Design Artifact creation/version state is recorded through orchestration domain events.
- [ ] Projection read models expose the current artifact version for a Design Thread.
- [ ] The Design Canvas renders the current Standalone Design Document in a sandboxed iframe.
- [ ] Generated HTML is not injected directly into the T3 Code DOM.
- [ ] Tests cover artifact projections, snapshot decoding, and sandbox rendering behavior.

## Blocked by

- `002-design-route-empty-thread.md`
