# Add Thread Workspace Kind and Workspace Switch

Type: AFK

## What to build

Persist a `coding | design` Thread Workspace Kind on threads and add a sidebar Workspace Switch that filters the existing sidebar between Coding Workspace threads and Design Workspace threads. Existing threads should default to `coding`.

## Acceptance criteria

- [ ] Thread creation and projection state include a persisted Thread Workspace Kind.
- [ ] Existing persisted threads without the field are treated as Coding Workspace threads.
- [ ] The sidebar exposes a Workspace Switch with Code and Design modes.
- [ ] The sidebar lists only threads matching the active workspace.
- [ ] Tests cover migration/defaulting, selectors/projections, and sidebar filtering behavior.

## Blocked by

None - can start immediately.
