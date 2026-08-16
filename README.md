<p align="center">
  <img src="https://cdn.scicommons.org/logo.png" alt="SciCommons Logo" width="150">
</p>

---

## 📢 Feature List for SciCommons GSoC 2025 is Now Available!

> You can access it here:  
> 🔗 [GSoC 2025 Feature List](https://github.com/m2b3/SciCommons-frontend/blob/main/gsoc/GSoC_2025_Feature_List.md)

### **Please follow our [Contribution guide](https://github.com/m2b3/SciCommons-frontend/blob/main/CONTRIBUTING.md) to start contributing to this repo.**

## Getting Started

Application development happens on `sureshDev`; `main` controls deployments.
Create feature branches from `sureshDev` and target pull requests there unless a
maintainer requests otherwise.

```powershell
git clone https://github.com/m2b3/SciCommons-frontend.git
cd SciCommons-frontend
git switch sureshDev
git switch -c feature/my-change
Copy-Item .env.example .env.local
yarn install --frozen-lockfile
yarn dev
```

The committed example points to the public test backend. Open
<http://localhost:3000> after the development server starts.

To test the production-style standalone container instead:

```powershell
docker compose --env-file .env.local -f docker-compose.dev.yml up --build
```

Neither workflow requires the private `scicomm_infra` repository, GHCR
credentials, Cloudflare credentials, SSH keys, or access to a SciCommons
server. See [Local frontend development](docs/LOCAL_DEVELOPMENT.md) for
prerequisites, tests, Docker teardown, configuration, and troubleshooting. New
contributors who already have the backend and database running should follow
the complete [developer setup and release guide](docs/NEW_DEVELOPER_SETUP.md).

## Deployment

`main` is the deployment control branch; its application snapshot is not the
source for a deployed frontend. Application development happens on
`sureshDev`, then is promoted to `test` and `alphatest`.

The Test, Alpha-test, and static Landing workflows are documented in
[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). Production Compose, Traefik, host
provisioning, and the host-side deployment command belong exclusively to the
private `scicomm_infra` repository. Routine frontend releases update only the
selected application service and never run Ansible.

# Theming

![SciCommons_Design_Pattern](https://github.com/user-attachments/assets/f8b57cd7-6488-487a-b06f-b5775dc86891)
