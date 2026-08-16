# New developer setup: local frontend through deployment

This guide connects the existing SciCommons frontend documentation into one
onboarding path. It assumes the backend and its database are already running
locally.

Ordinary frontend contributors do not need Ansible, production credentials,
the private infrastructure repository, or access to a SciCommons server.
GitHub Actions releases and Ansible are separate maintainer/operator paths.

## Detailed references

Use this page as the sequence and these documents for the details:

| Topic                                                                    | Canonical documentation                                                                       |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Prerequisites, local environment, Node/Yarn, Docker, and troubleshooting | [`LOCAL_DEVELOPMENT.md`](LOCAL_DEVELOPMENT.md)                                                |
| Connecting to a local backend                                            | [Custom backend configuration](LOCAL_DEVELOPMENT.md#custom-backend-configuration)             |
| Feature branches, validation, pushing, and promotion                     | [How to continue frontend development](migrationtodo.md#how-to-continue-frontend-development) |
| Branch and release ownership                                             | [Branch and release model](DEPLOYMENT.md#branch-and-release-model)                            |
| GitHub variables, secrets, and environments                              | [Frontend GitHub configuration](DEPLOYMENT.md#frontend-github-configuration)                  |
| Infrastructure rollout boundary                                          | [Required rollout order](DEPLOYMENT.md#required-rollout-order)                                |
| Post-release checks                                                      | [Operational verification](DEPLOYMENT.md#operational-verification)                            |
| Issue and pull-request expectations                                      | [`CONTRIBUTING.md`](../CONTRIBUTING.md)                                                       |

## 1. Understand the development flow

The repositories and branches have different responsibilities:

```text
feature/* --PR--> sureshDev --PR--> test --PR--> alphatest
                   development       Test         Alpha-test

main          trusted frontend workflow definitions and documentation
landing-page  independent static landing source
scicomm_infra private host configuration and Ansible automation
```

`main` is not the application development branch. Application work starts
from `sureshDev` unless a maintainer explicitly requests another base.

Pushing, promoting, and deploying are separate actions:

- Pushing a feature branch publishes it for review; it does not deploy.
- Merging a pull request promotes source; it does not deploy.
- A release maintainer manually dispatches the supported GitHub Actions
  workflow from `main` after promotion.
- Frontend release workflows never run Ansible.

## 2. Verify the local backend handoff

The frontend never connects directly to the database. Database credentials,
migrations, and seed data remain backend concerns. The frontend needs only the
backend and realtime base URLs.

The documented local defaults are:

```text
Backend API:      http://127.0.0.1:8000
Realtime service: http://127.0.0.1:8888
Frontend:         http://localhost:3000
```

Verify the API schema before starting the frontend:

```bash
curl --fail http://127.0.0.1:8000/api/openapi.json >/dev/null
```

PowerShell:

```powershell
Invoke-WebRequest http://127.0.0.1:8000/api/openapi.json -UseBasicParsing
```

Also confirm that backend migrations are complete, required development users
or seed data exist, the realtime service is running, and the backend permits
the local frontend origin. If the backend uses other ports, use its actual
values below.

## 3. Clone and branch from `sureshDev`

Install Git, Node.js 20, and Yarn, then create a feature branch:

```bash
git clone https://github.com/m2b3/SciCommons-frontend.git
cd SciCommons-frontend
git switch sureshDev
git pull --ff-only origin sureshDev
git switch -c feature/describe-the-change
```

For issue selection, branch conventions, and pull-request expectations, read
[`CONTRIBUTING.md`](../CONTRIBUTING.md).

## 4. Point the frontend at the local backend

Create the ignored local configuration:

```bash
cp .env.example .env.local
```

PowerShell:

```powershell
Copy-Item .env.example .env.local
```

For a frontend and backend both running directly on the same computer, use:

```dotenv
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
NEXT_PUBLIC_REALTIME_URL=http://127.0.0.1:8888
NEXT_PUBLIC_UI_SKIN=default
FRONTEND_PORT=3000
```

Use the backend's actual ports if they differ. The values are base URLs; do
not append `/api/openapi.json`.

All `NEXT_PUBLIC_*` values are browser-visible build configuration. Never put
database URLs, passwords, tokens, private keys, or administrative credentials
in them. Keep `.env.local` untracked.

For Docker Desktop host networking, native Linux considerations, and
container-to-backend configuration, follow
[Custom backend configuration](LOCAL_DEVELOPMENT.md#custom-backend-configuration).

## 5. Run and test the frontend

Install locked dependencies and start Next.js:

```bash
yarn install --frozen-lockfile
yarn dev
```

Open <http://localhost:3000>. Confirm in browser developer tools that requests
target the local backend rather than `backendtest.scicommons.org`.

Smoke-test at least:

- Home, Communities, and Articles;
- registration or login with a local development account;
- one authenticated page after refresh;
- the feature being changed; and
- realtime behavior against the configured service.

Run the current `sureshDev` application checks:

```bash
yarn test:all
```

When changing dependencies, routing, Next.js configuration, environment
handling, or deployment-sensitive code, also run:

```bash
yarn build
```

The optional production-style local container workflow and teardown commands
are documented in
[Build and run the standalone container](LOCAL_DEVELOPMENT.md#build-and-run-the-standalone-container).

## 6. Commit, push, and open the pull request

Review the exact change and confirm no local environment or secret file is
included:

```bash
git status
git diff --check
git diff
git add <file-or-directory-you-changed>
git diff --cached
git commit -m "Describe the frontend change"
git push -u origin feature/describe-the-change
```

Open the pull request with:

```text
base:    sureshDev
compare: feature/describe-the-change
```

List the tests actually run and include screenshots for visual changes. Do
not force-push shared release branches. See
[Validate and publish the feature branch](migrationtodo.md#3-validate-and-publish-the-feature-branch)
for the maintained checklist.

Application branches retain historical workflow files. They are not the
supported release definitions. Supported releases always use the workflow
definitions from `main`.

## 7. Release through GitHub Actions

This section is for release maintainers. A contributor normally stops after
the feature pull request is accepted.

### Test

1. Merge the reviewed feature into `sureshDev`.
2. Open and merge a reviewed pull request from `sureshDev` into `test`.
3. In frontend GitHub Actions, select **Deploy Test Frontend**.
4. Run the workflow from `main`.
5. Verify <https://test.scicommons.org> and confirm unrelated services did not
   restart.

### Alpha-test

After that exact Test release is accepted:

1. Open and merge a reviewed pull request from `test` into `alphatest`.
2. Select **Deploy Alpha-Test Frontend** in GitHub Actions.
3. Run the workflow from `main`.
4. Verify <https://alphatest.scicommons.org>, including authentication,
   realtime behavior, comments, reviews, notifications, and the UI skin.

Landing is independent and uses `landing-page` plus **Deploy Landing Page**.

The supported workflow checks out the hardcoded source branch, builds and
pushes its GHCR image, writes the selected public runtime configuration, and
invokes:

```text
/usr/local/bin/deploy-frontend <test|alphatest|landing>
```

The infrastructure-owned command updates only the selected service, performs
the public health check, and rolls back on failure. Full behavior and required
GitHub configuration are maintained in [`DEPLOYMENT.md`](DEPLOYMENT.md).

## 8. Ansible is an operator-only path

The private `scicomm_infra` repository exclusively owns host provisioning,
production Compose, Traefik, certificates, routing, and the host-side
deployment command. Ordinary development and application releases do not run
Ansible.

Authorized operators must start with a fresh authenticated clone of the
current private default branch:

```bash
git clone https://github.com/m2b3/scicomm_infra.git
cd scicomm_infra
git status
git log -1 --oneline
```

Do not provision from an old frontend checkout or migration archive. Read the
current private README and workflow definitions first; they are authoritative.

Where the current private repository retains `requirements.yml`,
`inventory.yml`, and `provision.yml`, the local validation shape is:

```bash
ansible-galaxy collection install -r requirements.yml
ansible-playbook --syntax-check provision.yml
ansible-playbook provision.yml --check --diff
```

Before a real apply, verify the exact inventory target and SSH host key,
review every check-mode difference, confirm protected secret delivery, and
obtain required approval. The supported production path is the private
repository's protected **Apply Frontend Infrastructure** workflow from its
current default branch.

After apply, operators should confirm the deployment command and containers:

```bash
ssh newfrontend 'sudo test -x /usr/local/bin/deploy-frontend'
ssh newfrontend 'docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"'
```

Then follow [Operational verification](DEPLOYMENT.md#operational-verification).
Never combine an infrastructure apply, DNS change, branch promotion, and
application release into one unreviewed operation.

## Completion checklist

- [ ] Backend/database setup is complete and the local OpenAPI schema works.
- [ ] Node.js 20, Yarn, and Git are installed.
- [ ] A feature branch was created from current `sureshDev`.
- [ ] `.env.local` points to the intended backend and remains untracked.
- [ ] The local frontend loads and authenticated/realtime flows were tested.
- [ ] `yarn test:all` passes or failures are documented.
- [ ] Deployment-sensitive changes also pass `yarn build`.
- [ ] Only intended files were committed and pushed.
- [ ] The pull request targets `sureshDev` and documents testing.
- [ ] No one expects the feature push itself to deploy an environment.
- [ ] Release and infrastructure work is performed only by authorized roles.

For common local failures, use the maintained
[Troubleshooting section](LOCAL_DEVELOPMENT.md#troubleshooting).
