# Testing guidance

- Tests use Vitest (`__PM_RUN__ test`) and React Testing Library, colocated
  with the code as `*.test.ts(x)`. Do not add tooling that is not installed.
- Prefer deterministic tests for pure logic: calculations, validation,
  parsing, mapping and registry contracts.
- Use React Testing Library for meaningful DOM behavior, not for pure functions
  that can be tested without rendering.
- Keep external services behind application boundaries. Use small in-test
  fakes for repositories and clients; do not invent provider protocol mocks.
- Make loading, error, empty and success states explicit where a feature has
  those states.
