# LIUM Energy — Asset Onboarding Platform

A Next.js web application for onboarding distributed energy assets (BESS, Microgrids, DER Clusters) onto the LIUM network. Project developers register assets, upload compliance documents, and connect telemetry in a three-step flow.

---

## Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js 15 (App Router) | `params` and `searchParams` are `Promise<>` — must be awaited in server pages |
| Language | TypeScript | Strict mode |
| Styling | Tailwind CSS v4 | All design tokens live in `app/globals.css @theme`, **not** `tailwind.config.ts` |
| Icons | Google Material Symbols | Loaded via CDN in `app/layout.tsx`; use `material-symbols-outlined` class |
| Maps | Leaflet | Dynamic import inside `useEffect` — never import at module top-level (SSR breaks) |
| Data | In-memory store | `lib/store.ts` — replace with a real DB for production |

---

## Directory Map

```
lium-energy-app/
├── app/
│   ├── globals.css              ← ALL design tokens (@theme block) + base styles
│   ├── layout.tsx               ← Root HTML shell; loads fonts and icon CDN
│   ├── page.tsx                 ← Root redirect → /projects
│   │
│   ├── onboard/                 ← 3-step asset onboarding flow
│   │   ├── layout.tsx           ← TopNav + SideNav + Stepper + Footer shell
│   │   ├── project-details/     ← Step 1: name, type, jurisdiction, location (map picker)
│   │   ├── document-vault/      ← Step 2: upload compliance documents
│   │   └── telemetry/           ← Step 3: connect telemetry endpoint; test live connection
│   │
│   ├── projects/                ← Asset registry (post-onboarding)
│   │   ├── layout.tsx           ← TopNav + SideNav + Footer shell
│   │   ├── page.tsx             ← Grid of all assets with stats bar
│   │   └── [id]/page.tsx        ← Single asset detail: overview, documents, telemetry, progress
│   │
│   └── api/projects/            ← REST API (JSON)
│       ├── route.ts             ← GET /api/projects, POST /api/projects
│       └── [id]/
│           ├── route.ts         ← GET /api/projects/:id
│           ├── documents/       ← POST /api/projects/:id/documents
│           └── telemetry/
│               ├── route.ts     ← POST /api/projects/:id/telemetry
│               └── test/        ← POST /api/projects/:id/telemetry/test (simulated)
│
├── components/
│   ├── layout/
│   │   ├── top-nav.tsx          ← Header bar with LIUM logo and user avatar
│   │   ├── side-nav.tsx         ← 'use client' — active state via usePathname()
│   │   └── footer.tsx
│   ├── onboard/
│   │   ├── project-details-form.tsx  ← Controlled form; calls POST /api/projects
│   │   ├── map-picker.tsx            ← Leaflet map; dynamic import; overlay pattern for SSR
│   │   ├── document-vault-form.tsx   ← File list with type selector; calls documents API
│   │   ├── telemetry-form.tsx        ← Connection method selector; test + submit flow
│   │   └── stepper.tsx              ← Step indicator used in onboard layout
│   ├── projects/
│   │   └── project-card.tsx     ← Card with progress bar; links to /projects/[id]
│   └── ui/
│       ├── badge.tsx            ← StatusBadge component for ProjectStatus enum
│       ├── button.tsx
│       ├── card.tsx
│       └── input.tsx
│
├── lib/
│   ├── store.ts                 ← In-memory Map<id, Project>; listProjects / getProject / upsertProject
│   ├── api.ts                   ← Typed fetch helpers used by client components
│   └── utils.ts                 ← cn() (clsx + tailwind-merge)
│
├── types/
│   └── index.ts                 ← All shared types: Project, AssetType, DocumentRecord,
│                                   TelemetryConfig, ApiResponse<T>, ONBOARD_STEPS
│
└── docs/
    └── actor-data-index.md      ← Field-level data spec for all 12 LIUM platform actors
                                    (PD, FN, SA, PM, RIF, UTL, DC, OP, TEL, RA, CUS, EDGE)
```

---

## Design System

**All tokens are in `app/globals.css` inside the `@theme {}` block.** There is no `tailwind.config.ts` theme extension — Tailwind v4 reads `@theme` directly.

Key token categories:

| Prefix | Examples | Usage |
|--------|----------|-------|
| `text-*` | `text-on-surface`, `text-on-surface-variant`, `text-secondary` | Text colors |
| `bg-*` | `bg-surface`, `bg-surface-container-lowest`, `bg-primary` | Backgrounds |
| `border-*` | `border-outline-variant` | Borders |
| `text-display-lg`, `text-headline-md`, `text-body-base`, `text-caption`, `text-label-caps` | — | Typography scale |
| `shadow-card`, `shadow-card-hover` | — | Elevation |
| `py-gutter` | — | Page-level vertical padding |

Do **not** add tokens to `tailwind.config.ts` — they will be ignored.

---

## Data Layer

`lib/store.ts` is a plain in-memory `Map`. Data resets on server restart. It is intentionally simple for prototyping.

```
listProjects()       → Project[]   (sorted by createdAt desc)
getProject(id)       → Project | undefined
upsertProject(p)     → void
```

**To replace with a real database**: swap only these three functions. All API routes and pages call through this interface; nothing else touches storage directly.

**API envelope**: every route returns `{ ok: true, data: T }` or `{ ok: false, error: { code, message } }`. The discriminated union type is `ApiResponse<T>` in `types/index.ts`.

---

## Project Status Flow

```
DRAFT → DOCUMENTS_PENDING → TELEMETRY_PENDING → SUBMITTED
```

- `DRAFT`: project created, no documents uploaded
- `DOCUMENTS_PENDING`: documents saved, telemetry not yet connected
- `TELEMETRY_PENDING`: telemetry configured but not verified live
- `SUBMITTED`: telemetry verified; asset fully onboarded

---

## What Is Built

- [x] 3-step onboarding flow (project details → documents → telemetry)
- [x] Leaflet map picker for project location
- [x] Document vault with type tagging
- [x] Telemetry connection with simulated live test
- [x] Asset registry listing page with stats
- [x] Asset detail page with onboarding progress tracker
- [x] Success banner after first submission
- [x] REST API (`/api/projects` + sub-routes)
- [x] Responsive layout with side nav, top bar, footer
- [x] Dynamic active state in side nav

## What Is Not Built Yet

- [ ] Authentication / user sessions
- [ ] Persistent database (currently in-memory)
- [ ] Credit Pack step (Step 4 in ONBOARD_STEPS — route exists as placeholder)
- [ ] Final Submission review step (Step 5)
- [ ] Marketplace / catalog discovery
- [ ] Financier, Rating Agent, and other actor flows
- [ ] Real telemetry ingestion (currently simulated)
- [ ] File upload to object storage (documents are metadata-only)

---

## Key Conventions

1. **Async params in server pages** — Next.js 15 makes `params` and `searchParams` async. Always `await` them:
   ```ts
   export default async function Page({ params }: { params: Promise<{ id: string }> }) {
     const { id } = await params
   ```

2. **`force-dynamic`** — pages that read from the in-memory store must export `export const dynamic = 'force-dynamic'` so Next.js doesn't cache a stale snapshot at build time.

3. **Client components** — only components that use browser APIs, hooks (`useState`, `useEffect`, `usePathname`), or event handlers need `'use client'`. Keep the surface small.

4. **Leaflet SSR pattern** — import Leaflet inside `useEffect`, check `typeof window !== 'undefined'`, never at module top-level. The map container must always be in the DOM (use absolute-positioned overlay for loading state, not `display:none`).

5. **Icons** — use `<span className="material-symbols-outlined">icon_name</span>`. For filled variant add `style={{ fontVariationSettings: "'FILL' 1" }}`.

---

## Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root redirects to `/projects`.

---

## Platform Context

This app implements the **Project Developer (PD)** onboarding flow for the LIUM platform — a decentralised energy finance network built on NFH Fabric.

For the full actor data specification (all 12 actors, ~476 fields, ONBOARD vs CATALOG, PUSH vs PULL), see [`docs/actor-data-index.md`](./docs/actor-data-index.md).

For architecture diagrams and sequence flows between actors, see `lium_sequence_flows.html` and `lium_payload_architecture_map.html` in the parent directory.
