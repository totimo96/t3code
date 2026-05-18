# Defer Manual Style Controls Behind Versioned Artifact Changes

Type: HITL

## What to build

Create a follow-up design/spec decision for Manual Style Controls. These future controls should support coarse visual changes such as color, typography, spacing, and radius, and must create versioned Design Artifact changes rather than untracked preview-only DOM edits.

## Acceptance criteria

- [ ] Decide the first supported Manual Style Controls.
- [ ] Define how manual changes become versioned Design Artifact changes.
- [ ] Confirm how manual edits interact with Design Brief, Target Prompt Context, and variants.
- [ ] Document any resulting domain terms or ADRs.
- [ ] No V1 implementation relies on untracked direct DOM edits.

## Blocked by

- `008-generate-accept-variants.md`
