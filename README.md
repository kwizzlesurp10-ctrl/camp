# Northern Camp Staff Personas

Interactive archetype map for northern teenage summer camp staff. Browse twelve counsellor personas across four clusters, filter and compare staff mixes, share deep links, copy agent-ready JSON, and print training guides for onboarding and AI simulations.

Built with [Next.js 16](https://nextjs.org) (App Router, Turbopack), React 19, and TypeScript.

## Features

| Area | What you can do |
| --- | --- |
| **Explore** | Search by text; filter by cluster (`experience`, `motivation`, `engagement`, `domain`) or trait |
| **Detail** | Open a slide-in panel with essence, motivations, pain points, teen communication style, and traits |
| **Compare** | Pin up to **3** personas in a fixed bottom bar for side-by-side review |
| **Share** | `?persona=<id>` deep links (validated with Zod); copy link from the detail panel |
| **Export** | **Copy agent JSON** — flat `AgentPersonaExport` shape for LLM / multi-agent prompts |
| **Training** | Printable guide at `/training/print` (all personas or `?persona=<id>` for one); browser print / PDF |
| **API** | Read-only JSON routes for integrations and agents |

## Prerequisites

- **Node.js 20+** (required by Next.js 16 and `import.meta.dirname` in `next.config.ts`)
- npm (or pnpm / yarn / bun)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (once) |
| `npm run test:watch` | Vitest watch mode |
| `npm run ai:gateway:demo` | AI Gateway smoke test (requires `vc env pull .env.local`) |

Run a single test file:

```bash
npx vitest run src/lib/persona-filters.test.ts
```

## Using the app

1. **Home (`/`)** — Personas grouped by cluster. Use the search box and chips to narrow the list.
2. **Card click** — Opens the detail drawer. URL updates to `/?persona=wide-eyed-rookie` (example).
3. **Compare** — Toggle **Compare** on cards (max 3). Review the amber bar at the bottom.
4. **Copy agent JSON** — In the drawer, copies structured JSON for prompts and tools.
5. **Training guide** — Link from the drawer or go to `/training/print`. Add `?persona=<id>` for a single-archetype handout.

### Persona IDs

`wide-eyed-rookie`, `seasoned-sentinel`, `northern-lifer`, `impact-driven-mentor`, `adventure-escapee`, `professional-developer`, `heart-centered-listener`, `energy-architect`, `boundary-guardian`, `waterfront-sentinel`, `wilderness-steward`, `expressive-catalyst`

Source of truth: [`src/data/personas.ts`](src/data/personas.ts).

## HTTP API

Read-only routes return the agent export shape (`version`, `generatedAt`, and persona fields). Responses are cached for one hour.

### List personas

```http
GET /api/personas
GET /api/personas?cluster=experience
```

`cluster` is optional: `experience` | `motivation` | `engagement` | `domain`.

Example response (truncated):

```json
{
  "version": "1",
  "generatedAt": "2026-05-17T12:00:00.000Z",
  "count": 12,
  "personas": [{ "id": "wide-eyed-rookie", "title": "The Wide-Eyed Rookie", "cluster": "By Experience Level", "tags": ["First Summer", "High Optimism"], "essence": "…", "motivations": [], "painPoints": "…", "teenCommunication": "…", "traits": [] }]
}
```

### Get one persona

```http
GET /api/personas/wide-eyed-rookie
```

`404` with `{ "error": "…", "code": "NOT_FOUND" }` if the id is unknown. `400` on invalid list query params.

## Project structure

```
src/
├── app/
│   ├── page.tsx              # Home (Suspense + PersonaLanding)
│   ├── layout.tsx            # Geist fonts, metadata
│   ├── api/personas/         # List + detail API routes
│   └── training/print/       # Printable training guide
├── components/
│   ├── persona/              # Landing, cards, drawer, compare bar
│   └── training/             # Print layout + controls
├── data/personas.ts          # 12 personas, 4 clusters (static)
├── hooks/use-persona-deep-link.ts
└── lib/
    ├── persona-filters.ts    # Search / cluster / trait filtering
    ├── persona-export.ts     # Agent JSON serialization
    ├── persona-api.ts        # API validation + response builders
    ├── persona-url.ts        # ?persona= deep link helpers
    ├── accent-styles.ts      # Tag colour → Tailwind classes
    └── result.ts             # Result<T, E> helper
```

Path alias: `@/` → `src/`.

## Stack

- **UI**: Tailwind CSS v4, dark zinc palette, client components for interactive state
- **Fonts**: [Geist](https://vercel.com/font) sans + mono via [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
- **Validation**: Zod (API query params, persona ids in URLs)
- **Compiler**: React Compiler enabled (`reactCompiler: true`)
- **Bundler**: Turbopack (default); `turbopack.root` pinned to this repo in `next.config.ts`

Deeper architecture and Next.js 16 notes: **[AGENTS.md](./AGENTS.md)**.

## Troubleshooting

**Wrong Turbopack root / multiple lockfiles** — If a `package-lock.json` exists in a parent folder (e.g. `C:\Users\Keith\`), Next may warn about the workspace root. Remove stray parent lockfiles or rely on `turbopack.root` in `next.config.ts`.

**Lockfile permission denied (WSL)** — Avoid running `npm run dev` as **root** on `/mnt/c/…`. Use a normal user, delete `.next`, or run from Windows / a native Linux path (`~/camp`).

## Deploy

Deploy on [Vercel](https://vercel.com/new) or any host that supports Next.js 16. No environment variables are required for the static persona dataset.

[Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying)

## License

Private project (`"private": true` in `package.json`).
