# Local frontend development

SciCommons frontend development is self-contained in this public repository.
The default contributor configuration uses the public test backend, so a
frontend contributor does not need to run a backend locally.

The private `scicomm_infra` repository is an operator concern. It is not a
dependency of either local workflow in this document. You do not need GHCR or
Cloudflare credentials, SSH keys, or access to the `newfrontend` server.

## Prerequisites

For the fast development workflow:

- Git
- Node.js 20
- Yarn

For the standalone-container workflow, install Docker with Compose v2 instead
of installing Node.js and Yarn on the host.

## Create a feature branch

`main` is the deployment-control branch. Application work starts from
`sureshDev` and pull requests normally target `sureshDev`.

```powershell
git clone https://github.com/m2b3/SciCommons-frontend.git
cd SciCommons-frontend
git switch sureshDev
git switch -c feature/my-change
```

The equivalent branch commands work in Bash.

## Configure the public test backend

Copy the committed example to the ignored local file:

```powershell
Copy-Item .env.example .env.local
```

```bash
cp .env.example .env.local
```

The example contains:

```dotenv
NEXT_PUBLIC_BACKEND_URL=https://backendtest.scicommons.org
NEXT_PUBLIC_REALTIME_URL=https://backendtest.scicommons.org
NEXT_PUBLIC_UI_SKIN=default
FRONTEND_PORT=3000
```

All `NEXT_PUBLIC_*` settings are compiled into browser-visible JavaScript.
They are configuration, not a place for tokens, passwords, private keys, or
administrative credentials. `.env.local` is ignored by Git; keep it untracked.

## Run the development server

```powershell
yarn install --frozen-lockfile
yarn dev
```

Open <http://localhost:3000>. Changes to frontend source should be reflected by
the Next.js development server.

Run the application tests before submitting a pull request:

```powershell
yarn test
yarn lint
yarn check-types
```

## Build and run the standalone container

From the frontend repository root:

```powershell
docker compose --env-file .env.local -f docker-compose.dev.yml up --build
```

Open <http://localhost:3000>. This Compose file:

- builds the current checkout instead of pulling an image from GHCR;
- supplies all three public settings as build arguments;
- creates an isolated `scicommons-frontend-local` Compose project;
- exposes only the frontend on local port 3000; and
- does not start Traefik, use Cloudflare, contact `newfrontend`, or read the
  private infrastructure repository.

Stop only this local project with:

```powershell
docker compose --env-file .env.local -f docker-compose.dev.yml down
```

Rebuild after changing source or public build configuration:

```powershell
docker compose --env-file .env.local -f docker-compose.dev.yml up --build
```

## Custom backend configuration

The committed defaults are suitable for ordinary frontend contribution. To
test against another non-production backend, edit only your untracked
`.env.local`.

For a backend running directly on the same computer:

```dotenv
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_REALTIME_URL=http://localhost:8888
```

When the frontend runs in Docker but the backend runs on the host, use
`host.docker.internal` on Docker Desktop:

```dotenv
NEXT_PUBLIC_BACKEND_URL=http://host.docker.internal:8000
NEXT_PUBLIC_REALTIME_URL=http://host.docker.internal:8888
```

Linux Docker Engine may require an explicit host-gateway mapping. That
optional integration is outside the default test-backend workflow.

## Troubleshooting

- **Compose reports a missing variable:** recreate `.env.local` from
  `.env.example` and include `--env-file .env.local` in the command.
- **`yarn test` cannot find Jest:** run `yarn install --frozen-lockfile` in the
  same checkout first. Jest is a development dependency in `package.json`.
- **Jest finishes but remains active on Windows:** use
  `yarn test --runInBand --forceExit` as a local fallback. The test suites
  should still be allowed to finish and report their results.
- **Port 3000 is already in use:** set `FRONTEND_PORT=3001` (or another free
  port) in `.env.local`, rerun Compose, and open that port in the browser.
- **The API is unreachable:** confirm
  <https://backendtest.scicommons.org/api/openapi.json> is reachable in a
  browser and check the values in `.env.local`.

## Full-stack local orchestration

A future one-command full-stack development environment should live in a
public, development-only repository or public Compose definition. It must not
make private production infrastructure a prerequisite for contributing to the
frontend.
