# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Project: Second Brain

AI-powered academic argument analysis tool for university students. Identifies bias, logical fallacies, and opposition arguments in student writing.

### Features
- Landing page with feature overview and call-to-action
- Sessions dashboard — list, create, and manage argument review sessions
- New session flow — blank, paste from clipboard, or upload .txt file
- Workspace — editable argument editor with auto-save + "Run Challenge" AI analysis via SSE streaming
- Bias / Fallacy / Opposition tabs with accept/reject toggles per item
- Recap page — session summary with bias/fallacy/opposition counts and star rating
- Progress page — stats overview and line chart (Recharts) tracking issues over time

### Accessibility (WCAG 2.1 AA)
- Skip-to-main-content link on all pages
- ARIA landmarks: `role="banner"`, `role="contentinfo"`, `role="navigation"` with `aria-label`, `role="main"` with `id="main-content"`
- `aria-current="page"` on active nav items
- `aria-live` / `role="status"` for analysis streaming state and save status
- `aria-busy` on Run Challenge button and loading skeletons
- Session cards use `<ul><li><button>` structure (not `div` with `onClick`)
- Method selection in new-session uses `<fieldset>/<legend>` with `role="radiogroup"` / `role="radio"` / `aria-checked`
- Star rating uses `role="radiogroup"` with `aria-label` per star
- Analysis stats use `<dl>/<dt>/<dd>` semantic markup
- Chart has `role="img"` with descriptive `aria-label`
- All decorative icons have `aria-hidden="true"`
- `muted-foreground` color darkened to 40% lightness (~5.7:1 contrast ratio on white) — safely above 4.5:1 AA

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS v4 + shadcn/ui (Radix primitives)
- **AI**: OpenAI via `lib/integrations-openai-ai-server` (supports Replit proxy, standard OpenAI, or Azure OpenAI)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Azure Deployment

The project is ready for Docker-based deployment to Azure Container Apps or Azure App Service:

| File | Purpose |
| --- | --- |
| `artifacts/api-server/Dockerfile` | Multi-stage build for the Express API server |
| `artifacts/second-brain/Dockerfile` | Vite build + nginx static server for the React frontend |
| `artifacts/second-brain/nginx.conf` | SPA routing + `/api/` reverse proxy + SSE support |
| `docker-compose.yml` | Full local stack (PostgreSQL + API + Web) |
| `.env.example` | All required environment variables with documentation |

### Required environment variables (production)

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `OPENAI_API_KEY` | OpenAI or Azure OpenAI API key |
| `OPENAI_BASE_URL` | (Optional) Azure OpenAI endpoint |
| `PORT` | API server port (default 8080) |
| `NODE_ENV` | Set to `production` |
| `SESSION_SECRET` | Random secret for session signing |

The OpenAI client (`lib/integrations-openai-ai-server/src/client.ts`) falls back from `AI_INTEGRATIONS_OPENAI_*` (Replit proxy) → `OPENAI_*` (standard/Azure), so no code changes are needed between environments.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
