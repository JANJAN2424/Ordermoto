import { spawn } from 'node:child_process'
import { join } from 'node:path'

const prismaCliEntrypoint = join(process.cwd(), 'node_modules', 'prisma', 'build', 'index.js')

const child = spawn(process.execPath, [prismaCliEntrypoint, 'studio', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: {
    ...process.env,
    CHECKPOINT_DISABLE: process.env.CHECKPOINT_DISABLE || '1',
  },
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
