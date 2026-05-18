# Apply Design Artifact as Coding Handoff

Type: AFK

## What to build

Implement Apply Design Artifact as a Coding Handoff. Applying should create or update a Coding Thread with the current artifact, Design Brief, and relevant version/target context so normal coding-thread review and diff workflows handle repository changes.

## Acceptance criteria

- [ ] Apply Design Artifact does not directly write project files.
- [ ] Applying creates or routes to a Coding Thread.
- [ ] The Coding Handoff includes the current Design Artifact, Design Brief, and useful version context.
- [ ] The generated Coding Thread prompt asks the agent to implement the artifact in project files.
- [ ] Tests cover handoff creation, route behavior, and prompt/context construction.

## Blocked by

- `008-generate-accept-variants.md`
