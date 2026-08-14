# TanStack Start Demo

A [TanStack Start](https://tanstack.com/start/latest) application: file-based
`@tanstack/react-router` routes, validated search params, route loaders, typed
server functions (`createServerFn`), full-document SSR with streaming, and a
Nitro-based server build that targets any deployment runtime without changing
the application model.

## Project Structure

```text
/
├── public/                  # static assets
├── src/
│   ├── data/                 # server-only modules + createServerFn wrappers
│   ├── routes/                # file-based routes (__root.tsx is the shell)
│   ├── styles/app.css
│   └── router.tsx
├── vite.config.ts
└── package.json
```

- `*.server.ts` files are server-only (enforced at build time via
  `import '@tanstack/react-start/server-only'`) and are only ever imported
  from a `*.functions.ts` file's `createServerFn` handler.
- `*.functions.ts` files are safe to import from client components.

## Commands

| Command       | Action                                              |
| :------------ | :--------------------------------------------------- |
| `pnpm install` | Installs dependencies                                |
| `pnpm dev`     | Starts the dev server at `localhost:3000`             |
| `pnpm build`   | Builds the client + server bundles to `.output/`      |
| `pnpm start`   | Runs the built server (`node .output/server/index.mjs`) |
| `pnpm typecheck` | Type-checks the project                             |

## Deployment target

The server build is produced by [Nitro](https://nitro.build), which supports
many runtimes from the same route/loader/server-function code. Pick the
target at build time:

```sh
DEPLOY_PRESET=node pnpm build       # default: Node.js server
DEPLOY_PRESET=vercel pnpm build
DEPLOY_PRESET=netlify pnpm build
DEPLOY_PRESET=cloudflare pnpm build
DEPLOY_PRESET=deno pnpm build
DEPLOY_PRESET=bun pnpm build
```

See `vite.config.ts` and the [Nitro deployment docs](https://nitro.build/deploy)
for the full preset list.
