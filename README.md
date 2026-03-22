<p align="center">
  <img src="https://cdn.scicommons.org/logo.png" alt="SciCommons Logo" width="150">
</p>

---

## 📢 Possibilities List is Now Available!

- [Possibilities for contributors](notes/Possibilities.md)

### **Please follow our [Contribution guide](notes/CONTRIBUTING.md) to start contributing to this repo.**

## Getting Started

Create .env file with following environments:

```bash
NEXT_PUBLIC_BACKEND_URL="https://backendtest.scicommons.org"
NEXT_PUBLIC_REALTIME_URL="https://backendtest.scicommons.org"
NEXT_PUBLIC_UI_SKIN="sage"
```

Run the development server:

```bash
# Install dependencies
yarn install

# Run server for development
yarn dev

# Testing and deploy
yarn test:fix
yarn build
yarn start
```

# Running app in docker container -- (preferred test before pushing for alignment with deployment)

```bash
# Build docker image locally (for Powershell on Windows)
docker compose -f docker-compose.dev.yml up  --build

# detached mode
docker compose -f docker-compose.dev.yml up -d --build
```
