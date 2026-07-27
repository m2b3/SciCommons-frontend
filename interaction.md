# Frontend migration and deployment handoff

## Do this first: update the GitHub repository workflows

The deployment changes exist only in the local working tree of
`/home/ubuntu/SciCommons-frontend`. Nothing has been committed, pushed, or
deployed from these new workflows.

The intended deployment model is:

```text
sureshDev    development branch; never deployed directly
test         test.scicommons.org
alphatest    alphatest.scicommons.org
landing-page static scicommons.org
main         stores the deployment workflows and canonical server configuration
```

There is no separate full-frontend production deployment. The public
`scicommons.org` service is the static landing page.

### 1. Review and commit the local changes

From `/home/ubuntu/SciCommons-frontend`:

```bash
git status
git diff --check
git diff
```

Prefer putting the current uncommitted changes on a review branch:

```bash
git switch -c chore/newfrontend-deployment
git add -A
git diff --cached
git commit -m "Migrate frontend deployment to new server"
git push -u origin chore/newfrontend-deployment
```

Open a pull request from `chore/newfrontend-deployment` into `main`, review it,
and merge it. If direct commits to `main` are the established repository
practice, the review branch is optional.

The important new files are:

```text
.github/workflows/deploy-test.yml
.github/workflows/deploy-alphatest.yml
.github/workflows/deploy-landing.yml
.github/workflows/deploy-infrastructure.yml
.github/workflows/reusable-deploy.yml
compose.yml
docs/DEPLOYMENT.md
```

The old per-environment deployment workflows and Compose files are deleted.
The new application workflows build an explicit source branch and image tag,
then update only the corresponding service. They do not run
`docker compose down`.

### 2. Configure GitHub Actions repository variables

In the GitHub repository, open:

**Settings → Secrets and variables → Actions → Variables**

Create:

```text
SERVER_HOST=134.87.11.234
SERVER_USER=ubuntu
SSH_KNOWN_HOSTS=134.87.11.234 ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIP/swRhwBbRRb9rEc3JSCXXdaS/fRG5N7VMVWw20EoV6
```

`SSH_KNOWN_HOSTS` is the verified public host key from the new server. The new
workflows intentionally do not trust a key obtained dynamically with
`ssh-keyscan`.

The old workflows treated `SERVER_HOST` and `SERVER_USER` as secrets. The new
workflows treat them as non-sensitive repository variables. Keep any old
secret copies until the first successful new deployment, then they may be
removed.

### 3. Configure GitHub Actions repository secrets

In:

**Settings → Secrets and variables → Actions → Secrets**

Ensure these secrets exist:

```text
SSH_PRIVATE_KEY
CF_DNS_API_TOKEN

NEXT_PUBLIC_BACKEND_URL_TEST
NEXT_PUBLIC_REALTIME_URL_TEST
NEXT_PUBLIC_UI_SKIN_TEST

NEXT_PUBLIC_BACKEND_URL_ALPHA_TEST
NEXT_PUBLIC_REALTIME_URL_ALPHA_TEST
NEXT_PUBLIC_UI_SKIN_ALPHA_TEST
```

The URL values currently deployed on the new server are:

```text
NEXT_PUBLIC_BACKEND_URL_TEST=https://backendtest.scicommons.org
NEXT_PUBLIC_REALTIME_URL_TEST=https://backendtest.scicommons.org

NEXT_PUBLIC_BACKEND_URL_ALPHA_TEST=https://backend.scicommons.org
NEXT_PUBLIC_REALTIME_URL_ALPHA_TEST=https://backend.scicommons.org
```

Preserve the existing UI-skin values from GitHub. UI-skin support is present
for both test and alpha-test.

The alpha-test frontend currently talks to `backend.scicommons.org`; this is
the configuration copied from the old server. Change it only if that behavior
is no longer intended.

The generic secrets below are no longer needed by these corrected deployment
workflows:

```text
NEXT_PUBLIC_BACKEND_URL
NEXT_PUBLIC_REALTIME_URL
NEXT_PUBLIC_UI_SKIN
```

Do not delete them until the new workflows have been verified, because another
unreviewed workflow or integration could still reference them.

### 4. Optionally configure GitHub environments

The workflows refer to these GitHub environments:

```text
test
alphatest
landing
infrastructure
```

They can be created under **Settings → Environments** for deployment history,
approval requirements, or branch restrictions. There is no `production`
environment in the corrected design.

The named secrets above should remain repository secrets with the current
reusable-workflow structure.

### 5. Perform the workflow cutover

After the deployment pull request is merged into `main`:

1. In GitHub Actions, select **Deploy Frontend Infrastructure**.
2. Run it from `main` once.
3. Confirm that Traefik remains healthy and all existing containers remain
   running.
4. Run **Deploy Test Frontend** only when a test rebuild is wanted.
5. Run **Deploy Alpha-Test Frontend** only when an alpha rebuild is wanted.
6. Run **Deploy Landing Page** only when the static landing page changes.

Test and alpha-test are independent:

```text
Deploy Test Frontend
  source: test
  image:  ghcr.io/m2b3/scicommons-frontend:test
  service restarted: scicommons-test only

Deploy Alpha-Test Frontend
  source: alphatest
  image:  ghcr.io/m2b3/scicommons-frontend:alphatest
  service restarted: scicommons-alpha-test only
```

Deploying one does not rebuild or restart the other, the landing page, or
Traefik.

### 6. Verify after the first workflow runs

```bash
ssh newfrontend 'docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"'

curl -I https://scicommons.org
curl -I https://test.scicommons.org
curl -I https://alphatest.scicommons.org
```

Expected public results:

```text
HTTP redirects to HTTPS: 301
HTTPS application responses: 200
```

Keep the old server available until infrastructure, test, alpha-test, and
landing deployments have each succeeded at least once from the new pipeline.

## Do this second: promote `sureshDev` through test and alpha-test

The normal promotion path is:

```text
sureshDev
    ↓ pull request and normal merge
test
    ↓ deploy and verify
    ↓ pull request and normal merge
alphatest
    ↓ deploy and verify
```

Do not use a force push as the first option. Although the test and alpha-only
commit counts consist of synchronization/merge commits rather than independent
feature commits, rewriting a shared branch is still destructive.

### Promote `sureshDev` to `test`

1. Fetch the latest remote state:

   ```bash
   git fetch origin --prune
   ```

2. Open a GitHub pull request:

   ```text
   base:    test
   compare: sureshDev
   ```

3. Review and resolve conflicts. The last audit found 17 modified files
   between their current trees, mainly article/review/discussion/comment UI,
   navigation/profile behavior, validation, and BrowserStack typing.
4. Merge normally.
5. Dispatch **Deploy Test Frontend** from `main`.
6. Verify `https://test.scicommons.org`, including login, realtime behavior,
   comments, reviews, navigation, and the configured UI skin.

### Promote `test` to `alphatest`

Only after test is accepted:

1. Open a GitHub pull request:

   ```text
   base:    alphatest
   compare: test
   ```

2. Review and merge normally. Alpha-test was substantially behind test during
   the audit, including generated API clients, authentication, realtime,
   notification, UI, and accessibility-test changes.
3. Dispatch **Deploy Alpha-Test Frontend** from `main`.
4. Verify `https://alphatest.scicommons.org`.
5. Confirm that alpha-test still intentionally uses:

   ```text
   https://backend.scicommons.org
   ```

If GitHub cannot produce an acceptable normal merge and exact branch
replacement is deliberately required, create backup tags first and use only
`--force-with-lease`, never an unrestricted `--force`. That is a fallback, not
the recommended promotion procedure.

## Migration and audit summary

### Server migration

- Old and new frontend hosts run Ubuntu 22.04.
- The new host is available through SSH alias `newfrontend`.
- New public IP: `134.87.11.234`.
- Ansible provisioning is stored in:
  `/home/ubuntu/scicommons-infrastructure`.
- Ansible installed/configured Docker and Compose, created the deployment
  directories, transferred the required configuration, and started the
  migrated services.
- Existing authorized SSH deployment keys were copied to the new host while
  preserving the Nova-provided key.
- The current environment files were copied with mode `600`:

  ```text
  /home/ubuntu/deployment/.env.traefik
  /home/ubuntu/deployment/.env.test
  /home/ubuntu/deployment/.env.alphatest
  ```

- The Traefik ACME file is protected with mode `600`.
- No database, persistent application volume, cron job, or additional custom
  service was found on the frontend host.

### Services running on the new host

```text
traefik               traefik:v3.6.2
scicommons-landing     ghcr.io/m2b3/scicommons-frontend:landing-page
scicommons-test        ghcr.io/m2b3/scicommons-frontend:test
scicommons-alpha-test  ghcr.io/m2b3/scicommons-frontend:alphatest
```

All use the `scicommons_proxy` Docker network. Only Traefik publishes ports 80
and 443; application containers are reached internally through Traefik.

The Traefik image is pinned to `v3.6.2`. This avoided the Docker 29 API
compatibility problem encountered with the older Traefik version.

### Horizon security group

The new instance currently permits:

```text
22/tcp  from 0.0.0.0/0
80/tcp  from 0.0.0.0/0
443/tcp from 0.0.0.0/0
IPv4 egress to 0.0.0.0/0
IPv6 egress to ::/0
```

The old host additionally restricted HTTP/HTTPS at UFW to Cloudflare address
ranges. The new origin is therefore more directly exposed. Consider restoring
Cloudflare-only origin restrictions after confirming all required access
paths.

### Repository and branch audit

- All remote branches and tags were fetched before the audit.
- At the time of the audit:

  ```text
  main       10e3140
  sureshDev  ae0472e
  test       1869437
  alphatest  6375849
  ```

- `sureshDev` and `test` had byte-identical `.github` directories.
- Alpha-test had identical active workflows and templates.
- The only `.github` difference was:

  ```text
  sureshDev/test: .github/workflows/playwright.yml.disabled exists
  alphatest:      that disabled file is absent
  ```

- Playwright is not active on any of these branches. The `.yml.disabled` file
  is ignored by GitHub. The legacy application-branch CI uses `yarn test`,
  which maps to Jest; the new deployment-only CI on `main` does not.
- UI-skin support is present in the test and alpha-test source-branch
  Dockerfiles and deployment configuration.
- The old `main` alpha workflow was older and omitted alpha UI-skin values.
  The new reusable workflow preserves the newer branch behavior.
- `docker-compose.landing.yml` existed only on `landing-page`. The new workflow
  explicitly checks out `landing-page` for its build and uses the canonical
  server Compose file for deployment.

### Legacy realtime-secret inconsistency

The old test workflow used two different GitHub secrets for the same
application variable:

```text
Docker build:
  NEXT_PUBLIC_REALTIME_URL_TEST

Runtime .env.test:
  NEXT_PUBLIC_REALTIME_URL
```

The deployed test value is `https://backendtest.scicommons.org`, while the
generic secret was likely the `https://backend.scicommons.org` value. Since
Next.js embeds `NEXT_PUBLIC_*` values into browser code at build time, this
could produce confusing build/runtime disagreement.

The corrected test workflow consistently obtains
`NEXT_PUBLIC_REALTIME_URL` from `NEXT_PUBLIC_REALTIME_URL_TEST`. Alpha-test
consistently uses `NEXT_PUBLIC_REALTIME_URL_ALPHA_TEST`.

`NEXT_PUBLIC_*` values are public browser configuration despite being stored
in GitHub Secrets.

### Deployment repository changes

- Replaced separate server Compose definitions with canonical `compose.yml`.
- Removed the obsolete full-frontend production workflow and service.
- Removed the obsolete SSH-key-adding workflow containing a hard-coded public
  key.
- Replaced runtime `ssh-keyscan` with the verified pinned host key.
- Updated only one Compose service per application deployment.
- Added post-deployment HTTPS health checks.
- Added rollback to the previously running image when a service health check
  fails.
- Kept test, alpha-test, and landing deployments independently dispatchable.
- Restricted Cloudflare DNS credentials to the Traefik infrastructure
  workflow instead of writing them into application environment files.
- Expanded `.gitignore` and `.dockerignore` protection for `.env`, private key,
  PEM, and ACME files.
- Added `docs/DEPLOYMENT.md` and linked it from the README.

### Validation completed

- Deployment workflows passed Actionlint.
- All workflow, Compose, and Traefik YAML parsed successfully.
- Canonical Compose validation passed.
- The normalized repository Compose configuration exactly matched the
  normalized configuration on `newfrontend`.
- Dockerfile build checks passed.
- TypeScript checking passed.
- ESLint passed with existing warnings.
- New-server health checks returned HTTP 301 and HTTPS 200 for:

  ```text
  scicommons.org
  test.scicommons.org
  alphatest.scicommons.org
  ```

### Existing unrelated project issues

- The stale application snapshot on `main` lacks `ts-node`, so Jest cannot
  load `jest.config.ts` there. The application branches already include
  `ts-node`. Because `main` is now the deployment control branch, its
  replacement CI validates deployment configuration and does not run Jest.
- A full local Next.js build compiled successfully but was killed with exit
  code 137 during later processing because of host memory pressure.
- The repository contains both `yarn.lock` and `package-lock.json`.
- Existing lint warnings remain in application code.

### Current safety state

- The deployment migration was committed and pushed as `15badb3`.
- The deployment-only CI adjustment was committed and pushed as `03bab59`.
- Local `main`, `origin/main`, and `origin/HEAD` currently point to `03bab59`,
  and the working tree is clean.
- No new GitHub Actions workflow was dispatched.
- No source branch was merged, reset, or force-pushed.
- The migrated websites are currently running independently of whether a new
  deployment workflow is dispatched.

### Decision about making `main` deployment-files-only

Do not destructively remove the application snapshot, `package.json`, or lock
files from `main` yet.

Removing them would not affect the new deployment workflows:

- Test explicitly builds the `test` branch.
- Alpha-test explicitly builds the `alphatest` branch.
- Landing explicitly builds the `landing-page` branch.
- The running containers would not be changed merely by deleting files from
  `main`.

However, `main` is the repository's default branch. GitHub normally builds its
dependency graph by reading supported manifest and lock files from the default
branch. If `package.json`, `yarn.lock`, and `package-lock.json` are removed
from `main`:

- The GitHub dependency graph may become empty or stale.
- Dependabot vulnerability alerts may stop covering the frontend packages.
- Dependabot security-update pull requests may no longer be generated for the
  frontend dependencies.
- Dependency review may no longer identify vulnerable dependency changes.
- Default CodeQL/code-scanning coverage may also be reduced if the application
  code is absent from the default branch.

Ordinary Dependabot version-update pull requests can be configured to target a
non-default branch such as `sureshDev`. Dependabot security updates, however,
remain tied to the repository's default branch.

Current recommendation:

- Keep `main` as the default deployment-control branch.
- Leave its existing application snapshot and dependency manifests in place
  for now. They are untidy but do not participate in deployments.
- Continue application development on `sureshDev`.
- Promote application code through `sureshDev` → `test` → `alphatest`.
- Never merge a future deployment-only deletion commit from `main` into an
  application branch.
- If a strict separation is wanted later, consider separate application and
  infrastructure/deployment repositories, or redesign security scanning and
  default-branch handling first.

References:

- https://docs.github.com/en/code-security/concepts/supply-chain-security/dependency-graph-data
- https://docs.github.com/en/code-security/tutorials/secure-your-dependencies/customizing-dependabot-prs

---

Additional copied interaction transcript may be appended below this line.
