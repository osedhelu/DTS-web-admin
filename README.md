This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy en Railway

Este submódulo tiene su propio `Dockerfile` + `railway.toml`.

1. Conecta el repo `web-admin` en Railway (servicio **DTS-web-admin**)
2. Root Directory = `/`
3. Variables: ver [DEPLOY_RAILWAY.md](./DEPLOY_RAILWAY.md)

