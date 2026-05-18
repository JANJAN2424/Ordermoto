import { spawn } from 'node:child_process'

const placeholderDatabaseUrl = 'postgresql://placeholder:placeholder@localhost:5432/postgres'

const env = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL || placeholderDatabaseUrl,
  DIRECT_URL: process.env.DIRECT_URL || process.env.DATABASE_URL || placeholderDatabaseUrl,
}

const prismaCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const child = spawn(prismaCommand, ['prisma', 'generate'], {
  stdio: 'inherit',
  env,
  shell: false,
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 1)
})

child.on('error', (error) => {
  console.error(error)
  process.exit(1)
})
