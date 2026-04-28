# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /workspace

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace manifests
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY artifacts/second-brain/package.json ./artifacts/second-brain/

RUN pnpm install --frozen-lockfile

# Copy source
COPY lib/api-zod/ ./lib/api-zod/
COPY lib/api-client-react/ ./lib/api-client-react/
COPY artifacts/second-brain/ ./artifacts/second-brain/

# Build the static site
# PORT is only used by the dev server but the vite config validates it at startup;
# BASE_PATH sets the HTML base (use / for a root-mounted deployment).
WORKDIR /workspace/artifacts/second-brain
RUN PORT=3000 BASE_PATH=/ pnpm run build

# ── Stage 2: serve with nginx ─────────────────────────────────────────────────
FROM nginx:alpine AS runner

COPY --from=builder /workspace/artifacts/second-brain/dist/public /usr/share/nginx/html
COPY artifacts/second-brain/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
