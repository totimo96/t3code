# Generate and Accept Design Variants

Type: AFK

## What to build

Generate Design Variants from a Design Target and prompt, preview them, and let the user accept one as the current Design Artifact version. Variants are complete artifact candidates, not isolated patches.

## Acceptance criteria

- [ ] A target prompt generates three Design Variants by default.
- [ ] Each Design Variant references its parent artifact version and Design Target.
- [ ] Variant previews render as complete Standalone Design Documents.
- [ ] Accept Design Variant promotes the chosen variant to the current artifact version without writing project files.
- [ ] Tests cover variant generation requests, projection updates, preview rendering, and accept behavior.

## Blocked by

- `007-click-box-targeting.md`
