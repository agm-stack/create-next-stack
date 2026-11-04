# Implementation workflow

For every implementation request:

1. Read only the relevant sections of the specs in `docs/`; do not load every
   project document by default.
2. Read only the agent-rule documents that match the prompt or files being
   changed.
3. Implement only what was asked and keep the diff small. Avoid unrelated
   cleanup or speculative architecture.
4. Run the checks the repository supports: `__PM_RUN__ lint`,
   `__PM_RUN__ lint:styles` (CSS changes), `__PM_RUN__ typecheck` and
   `__PM_RUN__ test`.
5. Summarize the changed files and checks, then stop. Do not start follow-up
   work that was not requested.
6. Update the affected doc in the same change when behavior, limits, routes or
   architecture change.
