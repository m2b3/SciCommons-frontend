<p align="center">
  <img src="https://cdn.scicommons.org/logo.png" alt="SciCommons Logo" width="150">
</p>

---

## 📢 Feature List for SciCommons GSoC 2025 is Now Available!
> You can access it here:  
> 🔗 [GSoC 2025 Feature List](https://github.com/m2b3/SciCommons-frontend/blob/main/gsoc/GSoC_2025_Feature_List.md)


### **Please follow our [Contribution guide](https://github.com/m2b3/SciCommons-frontend/blob/main/CONTRIBUTING.md) to start contributing to this repo.**


## Getting Started

Create .env file with following environments:

```bash
NEXT_PUBLIC_BACKEND_URL="http://127.0.0.1:8000"
NEXT_PUBLIC_REALTIME_URL="http://localhost:8888"
```

Run the development server:

```bash
# Install dependencies
yarn install

# Run server
yarn dev
```

OR Running app in docker container

```bash
# Build docker image locally
docker build . --build-arg NEXT_PUBLIC_BACKEND_URL=http://localhost:8000 -t scicommons-frontend:latest

# Before running docker compose, update the docker image name in docker-compose.dev.yml file
docker compose -f docker-compose.dev.yml up

# detached mode
docker compose -f docker-compose.dev.yml up -d
```

# Theming
![SciCommons_Design_Pattern](https://github.com/user-attachments/assets/f8b57cd7-6488-487a-b06f-b5775dc86891)


