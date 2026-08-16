# Frontend migration status and remaining work

Last audited: 2026-08-16 UTC

## Current verdict

The frontend runtime cutover to `134.87.11.234` is working, but operational
closeout is not complete.

The new host currently serves all three public sites successfully:

- `https://scicommons.org`
- `https://test.scicommons.org`
- `https://alphatest.scicommons.org`

HTTP redirects to HTTPS with status 301 and all three HTTPS endpoints return
status 200. Direct HTTPS checks against the new origin also return 200 for all
three hostnames.

The destination runs the expected four containers on the
`scicommons_proxy` network:

- `traefik`
- `scicommons-landing`
- `scicommons-test`
- `scicommons-alpha-test`

Only Traefik publishes ports 80 and 443. No frontend database, persistent
application volume, custom system service, or application cron job was found.

## Why Alpha-test works without a new workflow run

Alpha-test was migrated as an existing deployment during initial Ansible
provisioning. The migration copied its runtime environment, pulled the
existing `ghcr.io/m2b3/scicommons-frontend:alphatest` image, started the
`scicommons-alpha-test` container, connected it to Traefik, and configured the
`alphatest.scicommons.org` route.

Therefore, the site being available proves that the runtime migration worked.
It does not prove that the replacement GitHub Actions release path has been
used successfully for Alpha-test.

At audit time the Alpha-test image was approximately five months old and had
no Git revision/provenance labels produced by the replacement release
pipeline. No **Deploy Alpha-Test Frontend** run was present after that workflow
was introduced.

## Whether Test must be redeployed

Test is healthy and does not require a deployment for availability.

The last successful Test deployment began on 2026-07-29 at 02:08 UTC. The
`test` branch was then updated at 02:28 UTC to commit `66f7ace` (`Merge
sureshDev into test for housekeeping`). The running image reports the earlier
revision `7a517e4`.

A Test redeployment is useful only if the running release should be aligned
with the current `test` branch. Because the later commit was housekeeping, it
is reasonable to defer the deployment if that commit is not intended as a new
release.

When the instructions say to deploy "from `main`", `main` supplies the trusted
workflow definition. The workflow itself checks out and builds the hardcoded
`test` branch; it does not deploy application source from `main`.

## How to deploy Alpha-test through GitHub Actions

The current frontend workflow uses the infrastructure-owned deployment command
on the new host. It builds the `alphatest` branch, pushes the
`ghcr.io/m2b3/scicommons-frontend:alphatest` image, updates only the Alpha-test
runtime environment, and invokes:

```text
/usr/local/bin/deploy-frontend alphatest
```

The infrastructure command recreates only the Alpha-test service, performs the
public health check, and rolls back if the new service is unhealthy. It does
not restart Test, Landing, or Traefik.

To dispatch it in the GitHub interface:

1. Open the `SciCommons-frontend` repository.
2. Select **Actions**.
3. Select **Deploy Alpha-Test Frontend**.
4. Select **Run workflow**.
5. Set **Use workflow from** to `main`.
6. Run the workflow and monitor it to completion.

With an authenticated GitHub CLI, the equivalent command is:

```bash
gh workflow run deploy-alphatest.yml --ref main
```

The GitHub CLI credential on the old frontend host was expired at audit time.
It must be reauthenticated before an operator or automation agent can dispatch
and monitor the workflow from that host.

After deployment, verify:

- The workflow completed successfully.
- `https://alphatest.scicommons.org` returns HTTPS 200.
- The Alpha-test container uses the newly built image.
- The Alpha-test image records the expected source revision.
- Test, Landing, and Traefik container start times did not change.
- Login, logout, realtime updates, comments, reviews, notifications, and the
  configured Alpha-test UI skin behave as expected.

## Repositories and active development

Do not copy development repositories to the new frontend host. The host is
correctly deployment-only, and no Git repositories were found there.

The authoritative branch flow is:

```text
sureshDev -> test -> alphatest
landing-page -> independent static landing release
main -> trusted workflow definitions and frontend release control
```

The old host's `SciCommons-frontend` and `scicommons-infrastructure` working
trees were clean but behind their GitHub remotes. No unpublished working-tree
files were found. Four unreachable frontend Git objects were inspected and
were only temporary WIP/index snapshots whose trees exactly matched commits
already pushed.

Use fresh GitHub clones on developer workstations or development servers.
The private `scicomm_infra` repository remains the source of truth for host
provisioning, Compose, Traefik, certificates, routing, and the host-side
deployment command.

## How to continue frontend development

Do normal development on a workstation or dedicated development environment,
not on the old frontend host and not on `newfrontend`. The production host
should remain a deployment target containing no development checkout.

### 1. Start from the active development branch

For a new checkout:

```bash
git clone https://github.com/m2b3/SciCommons-frontend.git
cd SciCommons-frontend
git switch sureshDev
git pull --ff-only origin sureshDev
git switch -c feature/describe-the-change
```

For an existing clean development checkout:

```bash
git fetch origin --prune
git switch sureshDev
git pull --ff-only origin sureshDev
git switch -c feature/describe-the-change
```

Do not start application features from `main`. `main` is the trusted release
workflow and documentation branch; `sureshDev` is the active application
development branch.

### 2. Configure and run the frontend locally

Use Node.js 20 and Yarn, then create the ignored local environment file:

```bash
cp .env.example .env.local
yarn install --frozen-lockfile
yarn dev
```

Open `http://localhost:3000`. The committed example uses the public Test
backend, so ordinary frontend work does not require a local backend, production
credentials, the private infrastructure repository, or access to either
frontend server.

Never commit `.env.local`, tokens, passwords, private keys, ACME data, or
production configuration. `NEXT_PUBLIC_*` values are browser-visible build
configuration and must not contain secrets.

### 3. Validate and publish the feature branch

Before opening a pull request, run:

```bash
yarn test
yarn lint
yarn check-types
git status
git diff --check
```

Commit only the intended files and push the feature branch:

```bash
git add <the-files-you-changed>
git commit -m "Describe the frontend change"
git push -u origin feature/describe-the-change
```

Open a pull request with:

```text
base:    sureshDev
compare: feature/describe-the-change
```

Review and merge normally. Do not force-push shared release branches.

### 4. Promote an accepted change through the environments

Development and deployment are separate operations:

1. Open and merge a reviewed pull request from `sureshDev` into `test`.
2. In GitHub Actions, dispatch **Deploy Test Frontend** using the workflow from
   `main`.
3. Verify the Test site and its backend/realtime behavior.
4. When that exact Test release is accepted, open and merge a reviewed pull
   request from `test` into `alphatest`.
5. Dispatch **Deploy Alpha-Test Frontend** using the workflow from `main`.
6. Verify Alpha-test, including login, realtime behavior, comments, reviews,
   notifications, and its configured UI skin.

Dispatching a workflow does not promote or merge code. Merge the intended
branch first, then dispatch the corresponding release workflow from `main`.
Landing-page development and deployment remain independent and may be handled
only when landing changes are needed.

For more local setup and troubleshooting detail, see
[`docs/LOCAL_DEVELOPMENT.md`](LOCAL_DEVELOPMENT.md). For release ownership and
workflow behavior, see [`docs/DEPLOYMENT.md`](DEPLOYMENT.md).

## Recovery material that must leave the old host

Before the old server is retired, preserve these in secure off-server storage,
not on the new deployment host:

```text
/home/ubuntu/frontend-recovery-manifest.md
/home/ubuntu/scicommons-frontend-recovery-2026-07-27.tar.gz.gpg
```

The encrypted archive uses AES-256 and contains recovery copies of runtime
configuration, ACME state, and the deployment SSH key. Confirm that the
passphrase is known and perform a test decryption before relying on it.

The old host also contains this unencrypted archive:

```text
/home/ubuntu/scicommons-frontend-recovery-2026-07-27.tar.gz
```

It contains secrets and a private SSH key. Do not transfer it through an
untrusted channel. After the encrypted backup has been verified and stored
safely, securely remove the plaintext copy under a separately approved cleanup
operation.

Legacy Compose files, PM2 logs, `.next`, `node_modules`, old environment files,
and stale Git clones do not need to be copied to the new server.

## Remaining closeout tasks

- [ ] Reauthenticate an authorized GitHub CLI session or use the GitHub UI.
- [ ] Dispatch **Deploy Alpha-Test Frontend** from `main`.
- [ ] Perform Alpha-test functional checks after deployment.
- [ ] Optionally redeploy Test if commit `66f7ace` should be released.
- [ ] Landing is non-critical and its workflow verification may be deferred.
- [ ] Explicitly verify that the Cloudflare origin records point to
      `134.87.11.234`.
- [ ] Confirm automatic certificate renewal before the current origin
      certificates expire on 2026-10-25.
- [ ] Move and test the encrypted recovery package in secure off-server
      storage.
- [ ] Review the five authorized SSH keys on the new host and remove any that
      are no longer required.
- [ ] Review the OpenStack/Horizon security group. UFW is inactive and ports
      22, 80, and 443 listen on all interfaces; restrict SSH and consider
      Cloudflare-only origin access for HTTP/HTTPS.
- [ ] Remove expired GitHub Actions authentication state from the deployment
      host's Docker configuration when it is no longer needed.
- [ ] After Alpha-test is proven through the replacement pipeline, stop the
      old frontend stack and confirm all public endpoints remain healthy.
- [ ] Retain a recoverable old-server snapshot for an agreed observation
      period, then decommission the old VM separately.

The old origin at `206.12.91.3` was still reachable at audit time. Its landing
route returned HTTPS 200, while its Test and Alpha-test routes presented
self-signed certificates. Do not treat migration closeout as complete until
the remaining deployment proof, recovery backup, and old-host retirement tasks
above are addressed.
