# Frontend deployment

Ansible provisions the host (operating-system packages, Docker, directories,
and the initial container state). GitHub Actions performs subsequent
application and Traefik deployments. The migrated host is already running; the
workflow changes in this repository make future deployments use the same
layout.

`main` is the deployment control branch. CI on `main` validates the GitHub
Actions workflows, canonical Compose configuration, required deployment files,
and secret-file hygiene. It intentionally does not run Jest or build the stale
application snapshot on `main`.

Development and promotion follow this path:

1. Active frontend development happens on `sureshDev`.
2. When a version is ready for testing, promote it to `test`, then dispatch
   **Deploy Test Frontend**.
3. When that version is ready for alpha testing, promote it to `alphatest`,
   then dispatch **Deploy Alpha-Test Frontend**.

The landing page is separate static content:

| Workflow   | Source         | Image tag      | Compose service |
| ---------- | -------------- | -------------- | --------------- |
| Test       | `test`         | `test`         | `test`          |
| Alpha-test | `alphatest`    | `alphatest`    | `alphatest`     |
| Landing    | `landing-page` | `landing-page` | `landing`       |

Always dispatch these workflows from `main`. Their paths were deliberately
renamed during the server migration so the obsolete workflow definitions on
the divergent environment branches are not selectable from the default branch.
Dispatching a deployment does not merge or modify any branch; it checks out and
builds the source branch shown above.

The canonical server definition is `compose.yml`. Application workflows never
run `docker compose down`; they pull and replace only their own service.

## Repository variables

- `SERVER_HOST`: `134.87.11.234`
- `SERVER_USER`: `ubuntu`
- `SSH_KNOWN_HOSTS`:
  `134.87.11.234 ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIP/swRhwBbRRb9rEc3JSCXXdaS/fRG5N7VMVWw20EoV6`

The host key was read from the migrated host and checked independently during
migration. The workflows deliberately do not use `ssh-keyscan` at deployment
time.

## Repository secrets

- `SSH_PRIVATE_KEY`
- `CF_DNS_API_TOKEN` (infrastructure only)
- `NEXT_PUBLIC_BACKEND_URL_TEST`
- `NEXT_PUBLIC_REALTIME_URL_TEST`
- `NEXT_PUBLIC_UI_SKIN_TEST`
- `NEXT_PUBLIC_BACKEND_URL_ALPHA_TEST`
- `NEXT_PUBLIC_REALTIME_URL_ALPHA_TEST`
- `NEXT_PUBLIC_UI_SKIN_ALPHA_TEST`

Create these under **Settings → Secrets and variables → Actions → Secrets**.
The caller workflows explicitly pass these named repository secrets to the
reusable workflow. The `test`, `alphatest`, `landing`, and `infrastructure`
GitHub environments may be used for approval and branch protection rules.

The `NEXT_PUBLIC_*` values are embedded into the browser bundle at build time
and are therefore configuration, not confidential browser-side secrets.

## Initial infrastructure deployment

Run **Deploy Frontend Infrastructure** after provisioning a host or changing
`compose.yml` or `traefik/traefik.yml`. It transfers the canonical files,
creates the protected Traefik environment file, and updates only Traefik.

The server itself is provisioned separately with Ansible. The workflow assumes
Docker, Compose v2, `/home/ubuntu/deployment`, and `/home/ubuntu/traefik`
already exist.

## Migration cutover

1. Commit these deployment files to `main` and push `main`.
2. Set the three repository variables and repository secrets above.
3. Dispatch **Deploy Frontend Infrastructure** from `main` once. This aligns
   the host's canonical Compose file with the repository without stopping the
   application containers.
4. Dispatch Test, Alpha-Test, or Landing from `main` only when a new image
   should be built and deployed.
