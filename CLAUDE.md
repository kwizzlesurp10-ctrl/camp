# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<!-- BEGIN:nextjs-agent-rules -->
## This is NOT the Next.js you know

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
- `persona-api.ts` — API validation (`parsePersonasListQuery`) and response builders (`buildPersonasListResponse`, `buildPersonaDetailResponse`, `getPersonaForApi`). All API routes delegate to this module.
- `persona-url.ts` — `?persona=<id>` deep link helpers (validated with Zod).
- `accent-styles.ts` — maps accent colour names (strings stored on tag objects) to Tailwind class strings via `tagAccentClass()`.
- `result.ts` — minimal `Result<T, E>` type with `ok()` / `err()` constructors.

**UI** (`src/components/persona/`): All components are Client Components (`"use client"`). State lives entirely in `PersonaLanding`, which owns filter state, selected persona, and the compare list (max 3). Child components receive callbacks — nothing is co-located.

**State flow in `PersonaLanding`**:

1. `filter` (query + clusterId + trait) → `filterPersonas` → `filtered` list
2. `selectedId` → opens `PersonaDetailPanel` (slide-in drawer)
3. `compareIds` → populates `PersonaCompareBar` (fixed bottom bar)

**HTTP API** (`src/app/api/personas/`): Read-only routes cached for one hour. `GET /api/personas` (optional `?cluster=` filter) and `GET /api/personas/[id]`. Responses use the `AgentPersonaExport` shape with `version`, `generatedAt`, and persona fields. Returns `400` on bad query params and `404` with `{ error, code: "NOT_FOUND" }` on unknown ids.

**Animation system** (`lib/animations.ts`, `hooks/useViewTransition.ts`): Centralised View Transitions API wrapper. Use `useViewTransition` and `TRANSITION_NAMES` from `@/lib/animations` — not the hook file directly. All transitions respect `prefers-reduced-motion`. See `docs/animations.md` for usage and the named transitions (`persona-card`, `persona-panel`, `persona-backdrop`).

**Path alias**: `@/` resolves to `src/` (configured in both `tsconfig.json` and `vitest.config.ts`). Note that `lib/animations.ts` and `hooks/useViewTransition.ts` sit at the project root (not under `src/`) and are not covered by this alias.

**Styling**: Tailwind CSS v4, dark-only palette (`zinc-950` backgrounds). Tag colours are driven by the `accent` string on each tag and resolved via `tagAccentClass()`.

**Testing**: Vitest with `environment: "node"`. Tests live next to the code they test (`*.test.ts`). Only pure logic in `src/lib/` is tested — no component tests exist yet.

## Troubleshooting

**Wrong Turbopack root / multiple lockfiles** — If a `package-lock.json` exists in a parent folder, Next may warn about the workspace root. Remove stray parent lockfiles or rely on `turbopack.root` in `next.config.ts`.

**Lockfile permission denied (WSL)** — Avoid running `npm run dev` as root on `/mnt/c/…`. Use a normal user, delete `.next`, or run from Windows / a native Linux path.
