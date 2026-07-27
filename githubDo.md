# GitHub and frontend deployment to-do list

This file is intentionally outside the `SciCommons-frontend` repository. It
will not be included in the deployment commit.

## Deployment model

Use this model throughout:

```text
sureshDev     Working/development branch; never deployed directly
test          Source for test.scicommons.org
alphatest     Source for alphatest.scicommons.org
landing-page  Source for the static scicommons.org landing page
main          Stores the GitHub Actions workflows and server configuration
```

There is no separate full-frontend production deployment. The public
`scicommons.org` site is the static landing page.

All new workflows must be run using the workflow definition from `main`.
The Test, Alpha-Test, and Landing workflows select their source branches
internally.

## Phase 1: put the new deployment workflows into GitHub

- [ ] Go to the local repository:

  ```bash
  cd /home/ubuntu/SciCommons-frontend
  ```

- [ ] Confirm that the current branch is `main` and review the uncommitted
      changes:

  ```bash
  git branch --show-current
  git status
  git diff --check
  git diff
  ```

- [ ] Confirm that `/home/ubuntu/interaction.md` and
      `/home/ubuntu/githubDo.md` are outside the repository and do not appear
      in `git status`.

- [ ] Put the changes on a review branch:

  ```bash
  git switch -c chore/newfrontend-deployment
  git add -A
  git diff --cached
  git commit -m "Migrate frontend deployment to new server"
  git push -u origin chore/newfrontend-deployment
  ```

- [ ] On GitHub, create a pull request:

  ```text
  base:    main
  compare: chore/newfrontend-deployment
  ```

- [ ] Review and merge the pull request into `main`.

The deployment pull request should contain these new files:

```text
.github/workflows/deploy-test.yml
.github/workflows/deploy-alphatest.yml
.github/workflows/deploy-landing.yml
.github/workflows/deploy-infrastructure.yml
.github/workflows/reusable-deploy.yml
compose.yml
docs/DEPLOYMENT.md
```

It also deliberately removes the old per-environment deployment workflows and
Compose files. The new workflows deploy one service at a time and do not run
`docker compose down`.

### What CI on `main` now checks

`main` is a deployment control branch, not the authoritative application
branch. Its CI no longer runs Jest, application linting, TypeScript checks, or
a Next.js build against the stale application snapshot.

The replacement CI validates:

```text
all GitHub Actions workflows with Actionlint
canonical compose.yml with placeholder environment values
presence of all required deployment files
absence of obsolete deployment files
absence of tracked .env, ACME, PEM, private-key, and key files
```

Therefore, `main` does not need `ts-node`. Application testing should follow
the `sureshDev` development process, while deployment image builds happen in
the explicitly dispatched Test and Alpha-Test workflows.

## Phase 2: configure GitHub Actions

### Repository variables

- [ ] Open the GitHub repository.
- [ ] Go to **Settings → Secrets and variables → Actions → Variables**.
- [ ] Create or update:

  ```text
  SERVER_HOST
  134.87.11.234

  SERVER_USER
  ubuntu

  SSH_KNOWN_HOSTS
  134.87.11.234 ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIP/swRhwBbRRb9rEc3JSCXXdaS/fRG5N7VMVWw20EoV6
  ```

`SERVER_HOST` and `SERVER_USER` may currently exist as repository secrets
because the old workflows used them that way. The new workflows read them from
repository variables. Keep the old secret copies until the new pipeline has
worked successfully once.

`SSH_KNOWN_HOSTS` is a public, verified host-key line. It prevents a deployment
runner from trusting an unverified server key.

### Repository secrets

- [ ] Go to **Settings → Secrets and variables → Actions → Secrets**.
- [ ] Confirm that these secrets exist:

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

- [ ] Set or verify these URL values:

  ```text
  NEXT_PUBLIC_BACKEND_URL_TEST
  https://backendtest.scicommons.org

  NEXT_PUBLIC_REALTIME_URL_TEST
  https://backendtest.scicommons.org

  NEXT_PUBLIC_BACKEND_URL_ALPHA_TEST
  https://backend.scicommons.org

  NEXT_PUBLIC_REALTIME_URL_ALPHA_TEST
  https://backend.scicommons.org
  ```

- [ ] Preserve the existing values of:

  ```text
  NEXT_PUBLIC_UI_SKIN_TEST
  NEXT_PUBLIC_UI_SKIN_ALPHA_TEST
  ```

The alpha-test frontend currently communicates with
`https://backend.scicommons.org`. This was confirmed from the environment
copied from the old server. Do not change it unless alpha-test is supposed to
use a different backend.

The old test workflow inconsistently used:

```text
NEXT_PUBLIC_REALTIME_URL_TEST at build time
NEXT_PUBLIC_REALTIME_URL at container runtime
```

The corrected workflow uses `NEXT_PUBLIC_REALTIME_URL_TEST` consistently.

These generic secrets are not used by the corrected Test or Alpha-Test
workflows:

```text
NEXT_PUBLIC_BACKEND_URL
NEXT_PUBLIC_REALTIME_URL
NEXT_PUBLIC_UI_SKIN
```

Keep them temporarily until all new workflows have succeeded and other
repository integrations have been checked.

### What the Cloudflare token is

`CF_DNS_API_TOKEN` is used only by Traefik. It allows Traefik to create
temporary Cloudflare DNS TXT records so Let’s Encrypt can issue and renew HTTPS
certificates.

It is not a SciCommons backend token. Do not print, paste, or commit it. Ideally
it should be restricted to DNS editing for the `scicommons.org` Cloudflare
zone.

### GitHub environments

- [ ] Go to **Settings → Environments**.
- [ ] Create these environments if they do not already exist:

  ```text
  infrastructure
  test
  alphatest
  landing
  ```

- [ ] Add approval rules if desired.

There is no `production` GitHub environment in this deployment design.
Keep the named deployment values as repository secrets; use environments for
deployment history, approvals, and branch restrictions.

## Phase 3: run the infrastructure workflow once

Only do this after the workflow pull request is merged into `main` and the
GitHub variables/secrets have been configured.

- [ ] In GitHub, open **Actions**.
- [ ] Select **Deploy Frontend Infrastructure**.
- [ ] Click **Run workflow**.
- [ ] Set **Use workflow from** to `main`.
- [ ] Run the workflow.

This workflow:

1. Validates the GitHub host, SSH, and Cloudflare settings.
2. Connects to `134.87.11.234`.
3. Copies:

   ```text
   compose.yml
     → /home/ubuntu/deployment/compose.yml

   traefik/traefik.yml
     → /home/ubuntu/traefik/traefik.yml

   generated .env.traefik
     → /home/ubuntu/deployment/.env.traefik
   ```

4. Preserves `/home/ubuntu/traefik/acme.json`.
5. Pulls `traefik:v3.6.2`.
6. Runs only the `traefik` Compose service.
7. Performs a Traefik health check.

It does not:

- Build or restart Test
- Build or restart Alpha-Test
- Build or restart Landing
- Modify `.env.test` or `.env.alphatest`
- Modify Horizon security groups or DNS
- Reinstall Docker or Linux packages
- Delete existing TLS certificates

Ansible already placed an equivalent configuration on the new server. This
first run primarily proves that GitHub can safely manage the new host.

Before running it, be certain that `CF_DNS_API_TOKEN` is correct because the
workflow replaces `/home/ubuntu/deployment/.env.traefik`.

### Verify infrastructure

- [ ] Check the workflow result in GitHub.
- [ ] From a trusted machine, run:

  ```bash
  ssh newfrontend \
    'docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"'
  ```

- [ ] Confirm that these containers are running:

  ```text
  traefik
  scicommons-landing
  scicommons-test
  scicommons-alpha-test
  ```

- [ ] Check all public endpoints:

  ```bash
  curl -I http://scicommons.org
  curl -I https://scicommons.org

  curl -I http://test.scicommons.org
  curl -I https://test.scicommons.org

  curl -I http://alphatest.scicommons.org
  curl -I https://alphatest.scicommons.org
  ```

Expected:

```text
HTTP:  301 redirect
HTTPS: 200 response
```

## Phase 4: understand how application workflows are run

Always select `main` in GitHub’s **Use workflow from** dropdown.

```text
Workflow definition: main
Application source:  selected internally by the workflow
```

### Test

```text
GitHub workflow: Deploy Test Frontend
Run workflow from: main
Source checked out: test
Image built: ghcr.io/m2b3/scicommons-frontend:test
Service updated: scicommons-test only
Public URL: https://test.scicommons.org
```

### Alpha-Test

```text
GitHub workflow: Deploy Alpha-Test Frontend
Run workflow from: main
Source checked out: alphatest
Image built: ghcr.io/m2b3/scicommons-frontend:alphatest
Service updated: scicommons-alpha-test only
Public URL: https://alphatest.scicommons.org
```

### Landing page

```text
GitHub workflow: Deploy Landing Page
Run workflow from: main
Source checked out: landing-page
Build context: landing-page/
Image built: ghcr.io/m2b3/scicommons-frontend:landing-page
Service updated: scicommons-landing only
Public URL: https://scicommons.org
```

Do not select `test`, `alphatest`, or `landing-page` in **Use workflow from**.
Those branches contain legacy workflow definitions. The new workflows on
`main` select the intended source branch explicitly.

Test, Alpha-Test, and Landing can be run separately. Running one does not
rebuild or restart the others or Traefik.

## Phase 5: promote `sureshDev` to Test

Use a normal pull request. Do not begin with a force push.

- [ ] Fetch the latest remote refs:

  ```bash
  git fetch origin --prune
  ```

- [ ] On GitHub, create:

  ```text
  base:    test
  compare: sureshDev
  ```

- [ ] Review the changes and resolve any merge conflicts.
- [ ] Merge the pull request normally.
- [ ] In GitHub Actions, select **Deploy Test Frontend**.
- [ ] Set **Use workflow from** to `main`.
- [ ] Run it.
- [ ] Verify:

  ```text
  https://test.scicommons.org
  backend/realtime calls use https://backendtest.scicommons.org
  expected UI skin is active
  login and logout
  realtime updates
  comments and reviews
  navigation and profile links
  ```

At the time of the audit, `test` differed from `sureshDev` in 17 modified
files. The commits reachable only through Test were synchronization and merge
commits, not independent feature commits.

## Phase 6: promote Test to Alpha-Test

Do this only after the Test deployment has been accepted.

- [ ] On GitHub, create:

  ```text
  base:    alphatest
  compare: test
  ```

- [ ] Review and resolve any merge conflicts.
- [ ] Merge normally.
- [ ] In GitHub Actions, select **Deploy Alpha-Test Frontend**.
- [ ] Set **Use workflow from** to `main`.
- [ ] Run it.
- [ ] Verify:

  ```text
  https://alphatest.scicommons.org
  backend/realtime calls use https://backend.scicommons.org
  expected alpha UI skin is active
  login and logout
  realtime updates
  comments and reviews
  notifications
  ```

At the time of the audit, Alpha-Test was substantially behind Test. Its
branch-only commits were also merge/synchronization commits rather than
independent feature work.

## Branch and workflow facts established during the audit

```text
sureshDev .github directory = test .github directory
alphatest active workflows = the same active workflows
```

The only difference was:

```text
sureshDev and test:
  .github/workflows/playwright.yml.disabled exists

alphatest:
  that disabled file is absent
```

Playwright is not running on any of these branches:

- Files ending in `.yml.disabled` are ignored by GitHub Actions.
- Alpha-Test has no Playwright workflow.
- The legacy `ci.yml` copies on the application branches use `yarn test`,
  which maps to Jest; the new deployment-only CI on `main` does not.

UI-skin support is present in the Test and Alpha-Test Dockerfiles and
deployment inputs.

The `.github` directories in `sureshDev`, `test`, and `alphatest` do not
control the new deployments. Deployment definitions come from `main`; the
application source and Dockerfile come from the explicitly selected source
branch.

## Force-push fallback—not the normal procedure

Only consider exact branch replacement if a normal pull request cannot produce
the deliberately desired result.

Before any forced update:

- [ ] Confirm no open work depends on the existing target branch.
- [ ] Confirm branch protection permits the operation.
- [ ] Create and push backup tags.
- [ ] Use `--force-with-lease`, never unrestricted `--force`.

Example shape only:

```bash
git fetch origin --prune
git tag backup/test-before-promotion origin/test
git push origin backup/test-before-promotion
git push --force-with-lease origin sureshDev:test
```

Do not run that command merely because histories have diverged. A normal
pull-request merge is the recommended path.

## Final cleanup—only after successful deployments

- [ ] Confirm infrastructure deployment succeeded from `main`.
- [ ] Confirm Test deployment succeeded from `main`.
- [ ] Confirm Alpha-Test deployment succeeded from `main`.
- [ ] Confirm Landing deployment succeeded from `main`.
- [ ] Confirm all three public sites return HTTPS 200.
- [ ] Confirm automatic HTTPS certificate renewal can use Cloudflare.
- [ ] Remove obsolete `SERVER_HOST` and `SERVER_USER` secret copies if nothing
      else uses them.
- [ ] Review whether the generic `NEXT_PUBLIC_*` secrets are still used
      elsewhere before removing them.
- [ ] Keep the old server available until every new workflow has successfully
      deployed to the new server at least once.
- [ ] After confidence is established, plan the old-server shutdown separately.

## Security follow-up

The new Horizon security group currently exposes ports 80 and 443 directly to
the public internet. The old host additionally used UFW rules that allowed
those ports only from Cloudflare address ranges.

- [ ] After deployment testing, decide whether to restore Cloudflare-only
      origin restrictions on the new server.
- [ ] Keep SSH access controlled and review whether port 22 should remain open
      to `0.0.0.0/0`.
