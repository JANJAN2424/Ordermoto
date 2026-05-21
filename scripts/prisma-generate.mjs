import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const placeholderDatabaseUrl = 'postgresql://placeholder:placeholder@localhost:5432/postgres'

const env = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL || placeholderDatabaseUrl,
  DIRECT_URL: process.env.DIRECT_URL || process.env.DATABASE_URL || placeholderDatabaseUrl,
}

const prismaCliEntrypoint = join(process.cwd(), 'node_modules', 'prisma', 'build', 'index.js')
const generatedClientEntrypoint = join(process.cwd(), 'node_modules', '.prisma', 'client', 'index.js')

const child = spawn(process.execPath, [prismaCliEntrypoint, 'generate'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  env,
  shell: false,
})

let output = ''

child.stdout.on('data', (chunk) => {
  const text = chunk.toString()
  output += text
  process.stdout.write(chunk)
})

child.stderr.on('data', (chunk) => {
  const text = chunk.toString()
  output += text
  process.stderr.write(chunk)
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  const isWindowsEngineRenameLock =
    process.platform === 'win32' &&
    /EPERM: operation not permitted, rename .*query_engine-windows\.dll\.node\.tmp/i.test(output)

  if (code && isWindowsEngineRenameLock && existsSync(generatedClientEntrypoint)) {
    console.warn(
      '\nPrisma generate hit a locked Windows query engine file. Reusing the existing generated client for local development.',
    )
    process.exit(0)
    return
  }

  process.exit(code ?? 1)
})

child.on('error', (error) => {
  console.error(error)
  process.exit(1)
})
