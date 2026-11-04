# TypeScript and React guidance

- Keep TypeScript strict. Avoid `any`; use an explicit, documented type at an
  external boundary when one is unavoidable.
- Prefer the `@/*` alias for imports from `src/` and keep imports easy to trace.
- Use named exports and named imports. Default exports are allowed only where a
  framework requires them (`src/app/**` route files, `src/i18n/request.ts`, root
  `*.config.*`); `import/no-default-export` enforces this. A `next/dynamic` or
  `React.lazy` target that is a named export needs
  `.then((m) => ({ default: m.Name }))`.
- In the App Router, keep components server-rendered by default. Add `"use
  client"` only for interactivity, browser APIs, or client-side state that
  genuinely requires it.
- Keep pure domain calculations, validation, registries, and transformations
  outside presentational components so they can be tested directly.
- Use semantic HTML and accessible names/states for interactive UI. Do not
  trade accessibility for a shorter component implementation.
- Keep application-owned copy in `messages/`; do not translate user-entered
  content.
- Derive application types from authoritative contracts or generated types when
  available. Do not create parallel hand-maintained copies of database types.
