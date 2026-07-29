# SciCommons frontend

## New contributors: start here

You need only this public repository to develop and test the frontend. The
default local configuration uses the public SciCommons test backend; access to
the private `scicomm_infra` repository, GHCR, Cloudflare, SSH keys, and
SciCommons servers is not required.

Application development happens on `sureshDev`. The `main` branch controls
deployments and is not the branch from which to start application work.

### 1. Choose an issue

Review the [possibilities for contributors](notes/Possibilities.md) and the
[contribution guide](notes/CONTRIBUTING.md). Please create or agree on a GitHub
issue before starting a substantial change.

### 2. Clone and create a feature branch

```powershell
git clone https://github.com/m2b3/SciCommons-frontend.git
cd SciCommons-frontend
git switch sureshDev
git pull --ff-only
git switch -c feature/my-change
```

Create feature branches from `sureshDev`, and target contributor pull requests
back to `sureshDev`.

### 3. Configure the public test backend

PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Bash:

```bash
cp .env.example .env.local
```

`.env.example` already contains the browser-visible test API, realtime, UI
skin, and local port settings. `.env.local` is ignored by Git. Never add
passwords, tokens, private keys, or administrative credentials to either file.

### 4. Install and run

Install Node.js 20 and Yarn, then run:

```powershell
yarn install --frozen-lockfile
yarn dev
```

Open <http://localhost:3000>.

### 5. Test before submitting

The repository requires the combined formatting, lint, type, and Jest check
before commits:

```powershell
yarn test:fix
```

If Jest completes but remains active on Windows, use the documented fallback:

```powershell
yarn test --runInBand --forceExit
```

### 6. Optional: test the standalone Docker image

Docker Compose builds the current checkout locally; it does not pull a
deployment image:

```powershell
docker compose --env-file .env.local -f docker-compose.dev.yml up --build
```

Stop only this local project with:

```powershell
docker compose --env-file .env.local -f docker-compose.dev.yml down
```

If port 3000 is occupied, set `FRONTEND_PORT=3001` in `.env.local` and open
<http://localhost:3001>.

## More detail

See [Local frontend development](docs/LOCAL_DEVELOPMENT.md) for prerequisites,
configuration alternatives, Docker behavior, troubleshooting, and the public
frontend/private-infrastructure boundary.
