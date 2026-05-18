# Home Server Setup

This guide is for running Ordermoto from your own Windows computer and exposing it to the internet.

## What you need

- A Windows PC that stays on.
- A stable internet connection.
- Your Supabase database already configured.
- A domain name or a dynamic DNS hostname.
- Router access so you can configure port forwarding.

## 1. Prepare the app

Install dependencies:

```powershell
& 'C:\Program Files\nodejs\npm.cmd' install
```

Build the frontend:

```powershell
& 'C:\Program Files\nodejs\npm.cmd' run build
```

Push the Prisma schema if you have not already done it:

```powershell
& 'C:\Program Files\nodejs\npm.cmd' run db:push
```

Use your local secrets file and add these values if they are missing:

```env
NODE_ENV=production
HOST=0.0.0.0
PORT=3001
DATABASE_URL=...
DIRECT_URL=...
ADMIN_USERNAME=...
ADMIN_PASSWORD=...
ADMIN_DISPLAY_NAME=...
```

The app can then be started in production mode with:

```powershell
& 'C:\Program Files\nodejs\npm.cmd' run start:prod
```

Health check:

```txt
http://127.0.0.1:3001/api/health
```

## 2. Give your PC a stable local IP

Set a static LAN IP on your computer or reserve one in your router, for example `192.168.1.50`.

This matters because your router needs to know which device should receive incoming traffic.

## 3. Install a reverse proxy with HTTPS

The easiest option on Windows is Caddy.

Download Caddy and create a `Caddyfile` based on [Caddyfile.example](./Caddyfile.example):

```caddyfile
your-domain.example.com {
  encode gzip zstd
  reverse_proxy 127.0.0.1:3001
}
```

Caddy listens on ports `80` and `443`, gets TLS certificates automatically, and forwards traffic to Ordermoto on port `3001`.

## 4. Point your domain to your home IP

In your DNS settings:

- Point your domain or subdomain to your public IP address.
- If your ISP changes your public IP, use a dynamic DNS service instead.

## 5. Configure router port forwarding

Forward these external ports from your router to your Windows PC:

- `80` -> your-PC-IP `80`
- `443` -> your-PC-IP `443`

If you skip the reverse proxy and expose Node directly, you would forward `3001`, but that is not recommended for production.

## 6. Allow Windows Firewall traffic

Make sure Windows Firewall allows inbound traffic for:

- Caddy on ports `80` and `443`
- or Node on port `3001` if you are only testing directly

## 7. Start the services

Start Ordermoto:

```powershell
& 'C:\Program Files\nodejs\npm.cmd' run start:prod
```

Start Caddy with your real `Caddyfile`.

Then test:

- `https://your-domain.example.com`
- `https://your-domain.example.com/api/health`

## 8. Make it restart automatically

For a real home-server setup, add both services to Windows startup:

- Run Ordermoto with Task Scheduler or a service manager.
- Run Caddy as a Windows service.

Task Scheduler is usually the easiest starting point.

## 9. Important limits

- If your PC turns off, the site goes offline.
- Some ISPs block ports `80` and `443` or use CGNAT.
- Home hosting is fine for demos and learning, but not ideal for business-critical production.
- Keep Windows, Node, and your dependencies updated.
