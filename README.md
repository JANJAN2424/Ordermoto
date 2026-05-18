# ordermoto

Ordermoto is a Vue 3 + Node + Prisma motorcycle ordering system. The backend is set up to use a PostgreSQL database, which makes it compatible with Supabase.

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
2. Open `Project Settings` > `Database` and copy the PostgreSQL connection string.
3. Create `.env.local` with your Supabase database URLs. Use the pooled connection for runtime queries and the direct connection for Prisma migrations:

```env
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@<pooler-host>:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.<project-ref>:<password>@<direct-host>:5432/postgres"
```

4. Keep or update the admin credentials in `.env`:

```env
ADMIN_USERNAME="masteradmin"
ADMIN_PASSWORD="masteradmin123"
ADMIN_DISPLAY_NAME="Ordermoto Administrator"
```

5. Push the Prisma schema to Supabase:

```sh
npm run db:push
```

6. Start the app:

```sh
npm run dev
```

The app still uses its existing customer/admin login flow and stores that data inside your Supabase PostgreSQL database. It does not require Supabase Auth unless you want to add that separately later.

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

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
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@<pooler-host>:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.<project-ref>:<password>@<direct-host>:5432/postgres"
ADMIN_USERNAME="masteradmin"
ADMIN_PASSWORD="change-this-before-production"
ADMIN_DISPLAY_NAME="Ordermoto Administrator"
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
- If you deploy the frontend and backend on different domains later, you will need extra CORS and cookie changes before login works correctly.
