# Project architecture guidance

- Treat `AGENTS.md` as the portable baseline.
- The project uses the Next.js App Router, `src/`, strict TypeScript, and the
  `@/*` alias. Do not introduce a Pages Router.
- Keep domain logic and external-service boundaries understandable and
  testable. Avoid hiding business behavior inside generic UI primitives.
<!-- @if supabase -->
- Browser code talks to the backend only through the application API
  (`/api/...`); it never queries Supabase tables directly. Database rows are
  mapped to DTOs in the server repository layer.
- Database changes go through `supabase/migrations/`, followed by
  `__PM_RUN__ db:types`.
<!-- @endif -->

## Source layout

```text
src/app/                 Routes, route groups and metadata routes (thin files)
src/components/ui/       shadcn-derived primitives (application-owned code)
src/components/common/   Providers, error screen, shared app widgets
src/components/layout/   Shared page chrome (footer)
src/features/<feature>/  Product features (see below)
src/lib/                 Infrastructure: api (route handler, rate limit), http, logger, storage
src/hooks/               Cross-feature hooks
src/i18n/ messages/en/   Message registry and copy
src/utils/               Small pure helpers (routes, brand, styles)
src/types/               Shared types
```

## Feature folders

Each feature owns its UI, data access and logic:

```text
src/features/<feature>/
  api/service.ts      Browser HTTP calls over browserHttpClient
  api/queries.ts      queryOptions factories (<feature>Queries) and query hooks
  api/mutations.ts    Mutation hooks, each with a mutationKey
  api/context.ts      Server route context (server-only)
  api/db.ts           Server repository: rows to DTOs (server-only)
  api/errors.ts       Feature error codes, when needed
  components/         Feature UI
  pages/<name>.tsx    Page components; src/app route files re-export them
  types.ts            Feature types
  <logic>.ts          Pure, client-safe logic, with a colocated *.test.ts
```

- File names are kebab-case. Group hooks by kind in `queries.ts` and
  `mutations.ts` instead of one file per hook.
- A feature may import another feature only along a clear dependency (for
  example, `account` uses `requireUser` from `auth`). Infrastructure
  (`src/lib`, `src/components/ui`) never imports from a feature.
- Shared infrastructure belongs in `src/lib`, not in a feature.
- Route files in `src/app` stay thin: pages re-export a component from
  `features/<feature>/pages/`, and route handlers call feature services.
