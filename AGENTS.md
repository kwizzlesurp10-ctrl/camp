<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Commands

```bash
npm run dev        # start dev server (Turbopack, outputs to .next/dev)
npm run build      # production build (Turbopack by default)
npm run start      # serve the production build
npm run lint       # run ESLint directly (not next lint — that was removed in v16)
npm run test       # run vitest once
npm run test:watch # vitest in watch mode
```

Run a single test file:

```bash
npx vitest run src/lib/persona-filters.test.ts
```

## Next.js 16 — key breaking changes from earlier versions

- **Async Request APIs**: `cookies()`, `headers()`, `draftMode()`, `params`, and `searchParams` are now **async only** — always `await` them. The synchronous fallback from v15 is gone.
- **`middleware` → `proxy`**: The `middleware.ts` convention and the `middleware` named export are deprecated. Use `proxy.ts` / `export function proxy(request)`.
- **`next lint` removed**: The `next lint` command no longer exists. Run `eslint` directly (see script above). Linting is also no longer part of `next build`.
- **Turbopack is the default** for both `next dev` and `next build`. Custom `webpack` configs will break builds — migrate to `turbopack` options or pass `--webpack` to opt out.
- **`serverRuntimeConfig` / `publicRuntimeConfig` removed**: Use `process.env` and `NEXT_PUBLIC_` prefixes instead.
- **`revalidateTag` requires a second `cacheLife` argument**: `revalidateTag('tag', 'max')`. Single-arg form is a TypeScript error.
- **`cacheLife` / `cacheTag`**: No longer prefixed with `unstable_` — import from `next/cache` directly.
- **PPR**: `experimental.ppr` is gone. Use `cacheComponents: true` in `next.config.ts` instead.
- **Parallel routes**: All `@slot` folders need an explicit `default.js`; builds fail without them.
- **React 19.2** is bundled — `ViewTransition`, `useEffectEvent`, and `Activity` are available.
- **React Compiler** (`reactCompiler: true`) is stable and already enabled in this project.

## Architecture

This is a **camp counsellor persona explorer** built with the Next.js 16 App Router.

**Data layer** (`src/data/personas.ts`): Static in-memory dataset — 12 `Persona` objects organised into 4 `PersonaCluster` groups (`experience`, `motivation`, `engagement`, `domain`). No database or API calls; all data is imported at build time.

**Business logic** (`src/lib/`):

- `persona-filters.ts` — filter/search logic (`filterPersonas`, `parseFilterState` with Zod validation, `getAllTraits`, `countByCluster`). The `Result<T,E>` type from `result.ts` is used for validated input parsing.
- `persona-export.ts` — serialises a `Persona` to a flat `AgentPersonaExport` shape for clipboard copy (used when integrating persona data with AI agents).
- `accent-styles.ts` — maps accent colour names (strings stored on tag objects) to Tailwind class strings.

**UI** (`src/components/persona/`): All components are Client Components (`"use client"`). State lives entirely in `PersonaLanding`, which owns filter state, selected persona, and the compare list (max 3). Child components receive callbacks — nothing is co-located.

**State flow in `PersonaLanding`**:

1. `filter` (query + clusterId + trait) → `filterPersonas` → `filtered` list
2. `selectedId` → opens `PersonaDetailPanel` (slide-in drawer)
3. `compareIds` → populates `PersonaCompareBar` (fixed bottom bar)

**Path alias**: `@/` resolves to `src/` (configured in both `tsconfig.json` and `vitest.config.ts`).

**Styling**: Tailwind CSS v4, dark-only palette (`zinc-950` backgrounds). Tag colours are driven by the `accent` string on each tag and resolved via `tagAccentClass()`.

**Testing**: Vitest with `environment: "node"`. Tests live next to the code they test (`*.test.ts`). Only pure logic in `src/lib/` is tested — no component tests exist yet.
