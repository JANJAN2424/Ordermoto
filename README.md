# ordermoto

Ordermoto is a Vue 3 + Node + Prisma motorcycle ordering system. The backend is set up to use a Supabase PostgreSQL database.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Supabase Setup

1. Create a Supabase project.
2. Open `Project Settings` > `API` and copy:
   - `Project URL` into `SUPABASE_URL`
   - the publishable or anon key into `SUPABASE_ANON_KEY`
   - the service role key into `SUPABASE_SERVICE_ROLE_KEY`
3. Open `Project Settings` > `Database` and copy the PostgreSQL connection strings.
4. In `Authentication` > `Providers` > `Email`, keep email/password enabled. The `OAuth Apps` page in the dashboard is not used for basic customer registration.
5. Create `.env.local` with your Supabase Auth and database values:

```env
SUPABASE_URL="https://<project-ref>.supabase.co"
SUPABASE_ANON_KEY="sb_publishable_..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@<pooler-host>:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.<project-ref>:<password>@<direct-host>:5432/postgres"
```

6. Keep or update the admin credentials in `.env`:

```env
ADMIN_USERNAME="masteradmin"
ADMIN_EMAIL="masteradmin@gmail.com"
ADMIN_PASSWORD="masteradmin123"
ADMIN_DISPLAY_NAME="Ordermoto Administrator"
```

7. Optional for split frontend/API hosting: if the Vue frontend is served from a different HTTPS origin than the Node server, add these too:

```env
CLIENT_ORIGIN="https://app.example.com"
VITE_API_BASE_URL="https://api.example.com"
```

`CLIENT_ORIGIN` belongs on the Node server so it can allow credentialed browser requests. `VITE_API_BASE_URL` belongs in the frontend build so `/api/*` calls reach the Node server instead of the static host.

8. Push the Prisma schema to Supabase:

```sh
npm run db:push
```

9. Start the app:

```sh
npm run dev
```

For local development, the app now ignores `VITE_API_BASE_URL` by default so Vite can proxy `/api/*` to `http://127.0.0.1:3001` using [vite.config.ts](./vite.config.ts). If you intentionally want local dev to call a remote API instead, set `VITE_FORCE_API_BASE_URL=true`. If you also need the Node server to honor `CLIENT_ORIGIN` in development, set `FORCE_CLIENT_ORIGIN_IN_DEV=true`.
If you need to sync Prisma after schema or environment changes, run `npm run dev:setup` manually before `npm run dev`.
This project no longer uses a local SQLite fallback. Local and deployed environments should both point to Supabase through `DATABASE_URL` and `DIRECT_URL`.

Customer registration runs through Supabase Auth, and both customers and admins now use the same email/password sign-in page. The seeded admin account defaults to `masteradmin@gmail.com`.

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Open Prisma Studio

```sh
npm run studio
```

If Prisma Studio has trouble starting on Windows, this repo's `studio` script already disables Prisma's checkpoint cache that can trigger the `Unable to communicate with Prisma Client` error.

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

## Production Deployment

Ordermoto can be deployed as one public Node service that serves both the frontend and the API. This is the simplest production setup because the login flow uses same-origin cookies.

### Production environment variables

Set these on your host instead of committing secrets:

```env
NODE_ENV=production
HOST=0.0.0.0
PORT=3001
CLIENT_ORIGIN=https://app.example.com
SUPABASE_URL="https://<project-ref>.supabase.co"
SUPABASE_ANON_KEY="sb_publishable_..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@<pooler-host>:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.<project-ref>:<password>@<direct-host>:5432/postgres"
ADMIN_USERNAME="masteradmin"
ADMIN_EMAIL="masteradmin@gmail.com"
ADMIN_PASSWORD="change-this-before-production"
ADMIN_DISPLAY_NAME="Ordermoto Administrator"
```

If the frontend is built on a separate origin, also set:

```env
VITE_API_BASE_URL="https://api.example.com"
```

You can use [.env.production.example](./.env.production.example) as a reference.

### Generic Node host

Use a host that supports long-running Node apps and lets you set environment variables. Set the production environment variables before the first build so Prisma can generate its client during install.

Build command:

```sh
npm install
npm run build
```

Schema sync command:

```sh
npm run db:push
```

Start command:

```sh
npm start
```

Health check endpoint:

```txt
/api/health
```

### Docker deployment

This repo includes a [Dockerfile](./Dockerfile) for Docker-friendly hosts.

Build the image:

```sh
docker build -t ordermoto .
```

Run the container:

```sh
docker run --env-file .env.production -p 3001:3001 ordermoto
```

### Notes

- `npm start` no longer runs `prisma db push` automatically, which is safer for production restarts.
- Cross-origin login requires HTTPS because the auth cookies switch to `SameSite=None; Secure` when `CLIENT_ORIGIN` is set.
