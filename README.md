# Riziq Khamar

Online shop and dashboard for রিজিক খামার. One Next.js app: the storefront, the dashboard (`/admin`) and the API (`/api/v1`). Bangla at `/`, English at `/en`.

## Setup

Needs Node 24 and PostgreSQL.

1. Copy `.env.example` to `.env` and fill it in.
2. `npm install`
3. `npm run db:deploy` creates the tables.
4. `npm run db:seed` creates the dashboard account and default settings.
5. `npm run dev` and open http://localhost:3006. The dashboard is at `/admin`.

Products are added from the dashboard. Photo upload needs the Cloudinary keys in `.env`.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server on port 3006 |
| `npm run build` | Production build (needs the database, it prerenders the shop) |
| `npm run lint`, `npm run typecheck`, `npm test` | Checks |
| `npm run db:migrate` | Create a migration after changing `prisma/schema.prisma` |
| `npm run db:deploy` | Apply migrations to the database in `.env` |
| `npm run db:seed` | Create the admin account and settings; changes nothing that exists |
