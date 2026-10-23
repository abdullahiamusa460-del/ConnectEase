# ConnectEase

Offline-first network diagnostics and connectivity reporting for Nigerian mobile
users. The React frontend stores everything in IndexedDB first and synchronises
with the optional ConnectEase API when it is configured and reachable.

## Features

- **Dashboard** — demo connection, data-saving and usage overview.
- **Offline workspace** — locally created records with a pending sync queue.
- **Network test** — real latency, download and upload measurements against a
  user-supplied endpoint. Unavailable measurements are reported as unavailable;
  speeds are never simulated.
- **Network reports** — voluntary poor-network reports stored locally, with
  provider/location/issue, search, provider filters, timestamps and a map-ready
  layout. Sample reports are clearly labelled demo data and are never synced.
- **Sync centre** — anonymous installation registration, workspace/report/test
  synchronisation, connection status and pending-change counts.

## Run the frontend

```bash
npm install
npm run dev
# http://localhost:5173
```

## Run the backend

```bash
cd /home/dazumi/ConnectEase_backend
npm install
cp .env.example .env
# Set DATABASE_URL, INSTALLATION_PEPPER and CORS_ORIGINS
npm run migrate
npm run dev
# http://localhost:4000
```

Health check:

```bash
curl http://localhost:4000/api/v1/health
```

## Frontend API configuration

The API origin is resolved in `src/lib/api.ts`:

1. `VITE_API_URL`, when set.
2. `http://<current-host>:4000` in Vite development.
3. Unconfigured in production unless `VITE_API_URL` is provided at build time.

Copy `.env.example` to `.env.local` for local overrides:

```bash
cp .env.example .env.local
```

The frontend origin must be listed in the backend's `CORS_ORIGINS`.

## Build and verify

```bash
npm run build
CI=true npm run preview -- --port 4173
```

```bash
# Frontend type-check
npx tsc --noEmit

# Backend
cd /home/dazumi/ConnectEase_backend
npm run typecheck
npm test
```

See [`integration.md`](./integration.md) for the complete frontend/backend
contract, sync sequence, data mapping and troubleshooting guide.
