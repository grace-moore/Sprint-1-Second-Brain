# Second Brain

**Second Brain** is an AI-powered academic argument analysis tool designed to help university students write stronger, more rigorous arguments. Instead of just checking grammar, Second Brain challenges your thinking — identifying hidden biases, logical fallacies, and counter-arguments before you publish or submit.

🌐 **Live app:** [gracessecondbrain.com](https://gracessecondbrain.com)

---

## What It Does

Students paste or type an academic argument into the workspace. With one click, the AI analyzes the writing and surfaces:

- **Biases** — subjective framing, confirmation bias, and emotional appeals
- **Logical Fallacies** — straw man arguments, ad hominem attacks, slippery slopes, and more
- **Opposition Arguments** — the strongest counter-arguments a critic could raise

Each finding includes an explanation, and students can accept or dismiss individual items. A recap page summarizes the session, and a progress page tracks improvement over time.

---

## Features

| Feature | Description |
|---|---|
| Landing page | Overview of the tool with a call-to-action |
| Sessions dashboard | Create and manage multiple argument review sessions |
| New session flow | Start blank, paste from clipboard, or upload a `.txt` file |
| Argument workspace | Editable text editor with auto-save |
| AI analysis | Streaming AI feedback via Server-Sent Events |
| Bias / Fallacy / Opposition tabs | Categorized findings with accept/reject toggles |
| Recap page | Session summary with counts and star rating |
| Progress page | Stats overview and line chart tracking issues over time |
| Accessibility | WCAG 2.1 AA compliant — ARIA landmarks, skip links, semantic markup |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS v4, shadcn/ui |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL + Drizzle ORM |
| AI | OpenAI API (GPT-4o) |
| Deployment | Azure App Service (API + frontend) |
| CI/CD | GitHub Actions |
| DNS & Domain | Namecheap + Azure Custom Domains (HTTPS) |
| Analytics | Google Analytics (GA4) |

---

## Project Structure

```
├── artifacts/
│   ├── api-server/        # Express API server (Node.js)
│   └── second-brain/      # React frontend (Vite)
├── lib/
│   ├── db/                # PostgreSQL schema + Drizzle ORM
│   ├── api-spec/          # OpenAPI specification + codegen
│   └── integrations-openai-ai-server/  # OpenAI client
└── scripts/               # Utility scripts
```

---

## Running Locally

**Prerequisites:** Node.js 22+, pnpm, PostgreSQL

```bash
# Install dependencies
pnpm install

# Set environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL, OPENAI_API_KEY, etc.

# Push database schema
pnpm --filter @workspace/db run push

# Start the API server
pnpm --filter @workspace/api-server run dev

# Start the frontend (in a separate terminal)
pnpm --filter @workspace/second-brain run dev
```

---

## Deployment

The app is deployed to **Azure App Service** with a custom domain and free managed SSL certificate. CI/CD is handled by GitHub Actions — every push to `main` automatically builds and deploys both the frontend and API.

See `.env.example` for all required environment variables.

---

## Why Second Brain?

Most writing tools make your writing *sound* better. Second Brain makes your *thinking* stronger. It is built for students who want to pressure-test their logic before their instructor does.
