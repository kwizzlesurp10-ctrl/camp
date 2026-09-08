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
| **MCP** | Streamable HTTP connector at `/api/mcp` to list, search, and **chat with camp staff** personas |

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

1. **Home (`/`)** — Full-viewport **bio-swarm staff room**. Twelve counsellor orbs plus a `YOU` dock. Drag orbs to rearrange; click an orb to open the persona drawer. Ask the staff room to send directed reply pulses.
2. **Archive (`/personas`)** — Clustered cards, search, trait chips, compare (max 3), and an embedded swarm card. Link **Bio-swarm home** returns to `/`.
3. **Card / orb click** — Opens the detail drawer. URL updates to `/?persona=wide-eyed-rookie` or `/personas?persona=…`.
4. **Compare** — Toggle **Compare** on archive cards (max 3). Review the amber bar at the bottom.
5. **Copy agent JSON** — In the drawer, copies structured JSON for prompts and tools.
6. **Training guide** — Link from the drawer or go to `/training/print`. Add `?persona=<id>` for a single-archetype handout.

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

## MCP connector (chat with camp staff)

The app hosts a **remote MCP server** (Streamable HTTP) so agents can talk to counsellor personas.

| | |
|--|--|
| **Endpoint** | `https://camp-swart.vercel.app/api/mcp` (or `http://localhost:3000/api/mcp`) |
| **Transport** | Streamable HTTP (MCP 2025 + 2026-era clients) |
| **Auth** | None locally. If `MCP_AUTH_SECRET` is set, send `Authorization: Bearer <secret>`. |

### Tools

| Tool | Purpose |
|------|---------|
| `list_camp_staff` | List staff personas (optional cluster filter) |
| `list_staff_ids` | Quick id + title lookup |
| `get_camp_staff` | Full agent-export card for one persona |
| `search_camp_staff` | Free-text / cluster / trait search |
| `chat_with_camp_staff` | In-character chat packet (system prompt + draft reply) |

### Connect from Grok

**Production** (after a successful deploy):

```toml
[mcp_servers.camp]
url = "https://camp-swart.vercel.app/api/mcp"
enabled = true
```

**Local** (while `npm run dev` / `npm run start` is up):

```toml
[mcp_servers.camp]
url = "http://127.0.0.1:3000/api/mcp"
enabled = true
```

Or CLI:

```bash
grok mcp add --transport http camp https://camp-swart.vercel.app/api/mcp
```

> **Deploy note:** Vercel may mark CLI deploys as `BLOCKED` (spending / deployment protection). If `/api/mcp` 404s on production, push a git commit or approve the deployment in the Vercel dashboard, then flip the Grok URL back to production.

### Connect from Cursor / Claude

```json
{
  "mcpServers": {
    "camp": {
      "url": "https://camp-swart.vercel.app/api/mcp"
    }
  }
}
```

stdio-only clients can use [mcp-remote](https://www.npmjs.com/package/mcp-remote):

```bash
npx -y mcp-remote https://camp-swart.vercel.app/api/mcp
```

### Example agent flow

1. `search_camp_staff` with `query: "homesick"` or `list_camp_staff`
2. `chat_with_camp_staff` with `staff_id`, `message`, optional `scenario`
3. Reply to the user in character using the returned system prompt / draft

## Project structure

```
src/
├── app/
│   ├── page.tsx              # Home (Suspense + CampSwarmApp staff room)
│   ├── personas/page.tsx     # Archive explorer (PersonaLanding)
│   ├── layout.tsx            # Geist fonts, metadata
│   ├── actions/staff-room.ts # Ask-the-staff-room server action
│   ├── api/mcp/              # MCP Streamable HTTP connector
│   ├── api/personas/         # List + detail API routes
│   ├── api/deployments/      # Operator-only Vercel list/redeploy
│   └── training/print/       # Printable training guide
├── components/
│   ├── persona/              # Swarm, landing, cards, drawer, compare bar
│   └── training/             # Print layout + controls
├── data/personas.ts          # 12 personas, 4 clusters (static)
├── hooks/use-persona-deep-link.ts
└── lib/
    ├── camp-swarm.ts             # Orb layout, cyan tones, staff-room links
    ├── camp-swarm-talk.ts        # Directed ask / reply / handoff beats
    ├── camp-swarm-placement.ts   # Drag/drop plane ↔ world placement
    ├── camp-staff-chat.ts        # System prompts + draft replies
    ├── camp-staff-mcp.ts         # MCP tool service layer
    ├── persona-filters.ts        # Search / cluster / trait filtering
    ├── persona-export.ts         # Agent JSON serialization
    ├── persona-api.ts            # API validation + response builders
    ├── persona-url.ts            # ?persona= deep link helpers
    ├── route-secret.ts           # Bearer gates for operator/MCP routes
    ├── accent-styles.ts          # Tag colour → Tailwind classes
    └── result.ts                 # Result<T, E> helper
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

Deploy on [Vercel](https://vercel.com/new) or any host that supports Next.js 16. The static persona dataset needs no environment variables.

Operator routes:
- `GET`/`POST /api/deployments` stay **404** until `DEPLOYMENTS_API_SECRET` is set. Then send `Authorization: Bearer <secret>`. Also requires `VERCEL_TOKEN` + `VERCEL_PROJECT_ID`.
- `/api/mcp` stays open locally. Set `MCP_AUTH_SECRET` in production and send the same Bearer header from MCP clients.

Copy `env.example` → `.env.local` for local secrets.

Optional live probe (not part of `npm test`; needs Playwright installed separately):

```bash
npx playwright install chromium
node scripts/playwright-verify-camp.mjs
```

[Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying)

## License

Private project (`"private": true` in `package.json`).
