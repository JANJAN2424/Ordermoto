process.env.NODE_ENV ??= 'production'
process.env.HOST ??= '0.0.0.0'
process.env.PORT ??= '3001'

const [{ closeDatabase }, { startServer, stopServer }] = await Promise.all([
  import('./database.mjs'),
  import('./server.mjs'),
])

const host = process.env.HOST
const port = Number(process.env.PORT)
const { server } = await startServer({ host, port })

console.log(`Ordermoto production server running at http://${host}:${port}`)

const shutdown = async () => {
  await stopServer(server)
  await closeDatabase()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
