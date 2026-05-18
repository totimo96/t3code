# Add Design Route and Empty Design Thread Surface

Type: AFK

## What to build

Add a Design Route for opening Design Threads directly, with the Design Canvas as the primary detail surface. A new Design Thread may start without a Design Artifact and should show an empty design workflow using the existing composer.

## Acceptance criteria

- [ ] `/design/$environmentId/$threadId` opens a Design Thread directly.
- [ ] Route navigation preserves reload and deep-link behavior for Design Threads.
- [ ] Sidebar thread links navigate to chat routes for Coding Workspace threads and design routes for Design Workspace threads.
- [ ] Empty Design Threads show a design-specific empty state with the existing composer available.
- [ ] Tests cover route helpers and route-aware sidebar navigation.

## Blocked by

- `001-thread-workspace-kind-and-switch.md`
