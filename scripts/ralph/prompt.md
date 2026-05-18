# Ralph Agent Instructions

You are an autonomous Codex coding agent working on T3 Code.

## Task

1. Read the PRD at `scripts/ralph/prd.json`.
2. Read the progress log at `scripts/ralph/progress.txt`, especially `## Codebase Patterns`.
3. Check you are on the branch from PRD `branchName`. If not, create it from the current branch or check it out.
4. Pick the highest-priority user story where `passes: false`.
5. Implement that single user story end to end.
6. Run all required project checks: `bun fmt`, `bun lint`, and `bun typecheck`.
7. Never run `bun test`; if tests are needed, use `bun run test`.
8. If the story changes UI, verify it in browser if the local app can be run in the environment.
9. If checks pass, update `scripts/ralph/prd.json` to set that story's `passes` to `true`.
10. Append progress to `scripts/ralph/progress.txt`.
11. Commit all changes for the story with message `feat: [Story ID] - [Story Title]`.

## Context To Read

- `AGENTS.md`
- `CONTEXT.md`
- `docs/design-workspace-plan.md`
- `docs/adr/0001-design-workspace-artifacts.md`
- `docs/adr/0002-design-artifacts-use-orchestration-events.md`
- `docs/adr/0003-render-design-artifacts-in-sandboxed-iframes.md`
- The matching local issue in `docs/design-workspace-issues/`

## Progress Report Format

Append to `scripts/ralph/progress.txt`:

```md
## [Date/Time] - [Story ID]

- What was implemented
- Files changed
- Checks run and result
- Learnings for future iterations:
  - Reusable patterns discovered
  - Gotchas encountered

---
```

## Codebase Patterns

If you discover a reusable pattern that future iterations should know, add it to the `## Codebase Patterns` section near the top of `scripts/ralph/progress.txt`.

Only add durable, reusable facts. Do not add story-specific implementation notes to AGENTS.md unless the learning belongs there for future developers.

## Stop Condition

After completing one story, check whether all stories have `passes: true`.

If all stories are complete and checks pass, reply with:

`<promise>COMPLETE</promise>`

Otherwise end normally so the next Ralph iteration can pick up the next story.

## Constraints

- Work on one story per iteration.
- Keep changes focused.
- Do not revert user changes.
- Follow existing repo patterns.
- Prefer correctness and predictable recovery behavior over shortcut implementations.
