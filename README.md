<p align="center">
  <img src="https://cdn.scicommons.org/logo.png" alt="SciCommons Logo" width="150">
</p>

---

## 📢 Feature List for SciCommons GSoC 2025 is Now Available!
> You can access it here:  
> 🔗 [GSoC 2025 Feature List](https://github.com/m2b3/SciCommons-frontend/blob/main/gsoc/GSoC_2025_Feature_List.md)


### **Please follow our [Contribution guide](https://github.com/m2b3/SciCommons-frontend/blob/main/CONTRIBUTING.md) to start contributing to this repo.**


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
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

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

# Theming
![SciCommons_Design_Patter](https://github.com/user-attachments/assets/26f2fb14-8f00-4a4f-ae2b-52c636f09278)

