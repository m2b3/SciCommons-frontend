# Frontend deployment

`SciCommons-frontend` owns application source, image builds, release selection,
and application runtime configuration. The private
[`scicomm_infra`](https://github.com/m2b3/scicomm_infra) repository exclusively
owns host provisioning, production Compose, Traefik, certificates, routing,
and the host-side deployment implementation.

Routine frontend releases never run Ansible, transfer Compose or Traefik
configuration, restart Traefik, or recreate an unrelated application service.
Neither deployment path depends on the retired frontend server.

## Branch and release model

`main` is the trusted deployment-control branch. Always dispatch deployment
workflows from `main`; the caller hardcodes which application branch is built.

1. Active frontend development happens on `sureshDev`.
2. Promote a chosen snapshot to `test`, then dispatch **Deploy Test
   Frontend**.
3. Promote a chosen test snapshot deliberately to `alphatest`, then dispatch
   **Deploy Alpha-Test Frontend**.
4. Deploy the independent landing page with **Deploy Landing Page**.

| Workflow   | Source         | Image tag      | Infra service | Runtime env      |
| ---------- | -------------- | -------------- | ------------- | ---------------- |
| Test       | `test`         | `test`         | `test`        | `.env.test`      |
| Alpha-test | `alphatest`    | `alphatest`    | `alphatest`   | `.env.alphatest` |
| Landing    | `landing-page` | `landing-page` | `landing`     | none             |

Dispatching a deployment does not merge or modify a branch. The reusable
workflow checks out the hardcoded source, builds and pushes its image, securely
updates that application's env file when needed, logs the deployment host into
GHCR, and invokes:

```text
/usr/local/bin/deploy-frontend <test|alphatest|landing>
```

That root-owned command is installed and versioned by `scicomm_infra`. It
allowlists services, serializes each service's deployments, uses the
infra-owned Compose definition, recreates only the selected service with
`--no-deps`, checks the correct public HTTPS endpoint, and rolls back the image
on failure. Its nonzero exit is surfaced as a failed GitHub Actions run.

## Frontend GitHub configuration

The deployment environments use these variables:

- `SERVER_HOST`: explicit new-frontend hostname or IP.
- `SERVER_USER`: application deployment SSH user.
- `SSH_KNOWN_HOSTS`: independently verified pinned host entry.

They use these secrets:

- `SSH_PRIVATE_KEY`
- `NEXT_PUBLIC_BACKEND_URL_TEST`
- `NEXT_PUBLIC_REALTIME_URL_TEST`
- `NEXT_PUBLIC_UI_SKIN_TEST`
- `NEXT_PUBLIC_BACKEND_URL_ALPHA_TEST`
- `NEXT_PUBLIC_REALTIME_URL_ALPHA_TEST`
- `NEXT_PUBLIC_UI_SKIN_ALPHA_TEST`

The caller workflows pass the named secrets to the reusable workflow. Protect
the `test`, `alphatest`, and `landing` GitHub environments with the desired
review and branch rules. Values may be repository-level or environment-level,
but reusable-workflow resolution must be confirmed before changing the
existing model.

`NEXT_PUBLIC_*` settings are embedded in browser bundles at build time. Treat
them as public configuration even if they are stored in the GitHub Secrets
interface. Never commit actual environment files or private keys.

The Cloudflare token, infrastructure SSH key, Compose, and Traefik settings do
not belong in this repository.

## Required rollout order

The deployment command must exist before these limited frontend workflows are
used:

1. Validate and merge the `scicomm_infra` changes.
2. Manually run its protected **Apply Frontend Infrastructure** workflow.
3. Confirm `/usr/local/bin/deploy-frontend` exists and current services remain
   healthy.
4. Merge these frontend workflow changes into `main`.
5. Dispatch **Deploy Test Frontend** from `main`.
6. Confirm only the test container changed and all public sites remain
   healthy.

Infrastructure apply is rare and separately approved. A frontend workflow
must never call it.

## Local development

Fast development remains frontend-only:

```powershell
Copy-Item .env.example .env.local
yarn dev
```

For a standalone production-container build of the current checkout:

```powershell
docker compose --env-file .env.local -f docker-compose.dev.yml up --build
```

Both modes serve at `http://localhost:3000` and require neither GHCR nor the
infrastructure checkout.

For cross-repository integration, keep sibling clones named
`SciCommons-frontend` and `scicomm_infra`, then run the infra repository's
`scripts/dev-up.ps1` or `scripts/dev-up.sh`. Those helpers build this checkout
through `scicomm_infra/compose.local.yml` under the isolated
`scicommons-local` Compose project.

The example uses `host.docker.internal` to reach a backend on a Windows Docker
Desktop host. Native Linux may need an explicit host-gateway mapping or a
backend service on the same Compose network. Adjust `.env.local`, never the
committed template, for a different local topology.

Local development does not use production Traefik, Cloudflare, production
hostnames, ACME state, or the new frontend server.

## Operational verification

After a test deployment, verify:

- `https://test.scicommons.org/` is healthy.
- The test container uses the expected image.
- Alpha-test, landing, and Traefik container start times did not change.
- The workflow reports the infra command's success or rollback failure.

Do not change DNS or dispatch production deployment as part of this ownership
split.
