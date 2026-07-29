# Change comments

## 2026-07-28 — Separate frontend releases from host infrastructure

- **Problem:** The frontend repository duplicated the production Compose and
  Traefik definitions and embedded host-specific deployment/rollback shell in
  its routine release workflow.
- **Root Cause:** The initial server migration placed application release and
  one-time infrastructure transition logic together on frontend `main`.
- **Solution:** Removed the duplicate infrastructure workflow and server
  definitions; changed release workflows to call the allowlisted
  `/usr/local/bin/deploy-frontend` contract installed by `scicomm_infra`;
  updated CI to enforce the ownership boundary; restored a local
  current-checkout container build with all three `NEXT_PUBLIC_*` arguments;
  added complete public contributor instructions, required-value validation, a
  configurable local port, and a more tolerant clean-container Yarn timeout.
- **Result:** Test, alpha-test, and landing releases remain independently
  controlled by frontend `main`, while Compose, Traefik, health checks,
  per-service locking, and rollback have a single infrastructure owner. Local
  builds require neither GHCR nor the production host. Contributor onboarding
  is self-contained in the public frontend repository, uses the public test
  backend, and documents the boundary from private operational infrastructure.
- **Files Modified:** `.github/workflows/ci.yml`,
  `.github/workflows/deploy-test.yml`,
  `.github/workflows/deploy-alphatest.yml`,
  `.github/workflows/deploy-landing.yml`,
  `.github/workflows/reusable-deploy.yml`, `README.md`,
  `docs/LOCAL_DEVELOPMENT.md`, `docs/DEPLOYMENT.md`, `Dockerfile`,
  `docker-compose.dev.yml`, `.env.example`; removed
  `.github/workflows/deploy-infrastructure.yml`, `compose.yml`, and `traefik/`.
  Implemented on `codex/frontend-infra-separation` from `upstream/main`
  `1f205d1b`.
