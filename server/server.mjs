import { createServer } from 'node:http'
import { constants } from 'node:fs'
import { access, readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { pathToFileURL } from 'node:url'
import {
  closeDatabase,
  createCustomer,
  createProduct,
  createOrder,
  deleteProduct,
  getAdminSessionState,
  getCustomerSessionState,
  getBootstrapData,
  initializeDatabase,
  listProducts,
  listOrders,
  loginAdmin,
  loginCustomer,
  logoutAdmin,
  logoutCustomer,
  updateOrderStatus,
  updateProduct,
} from './database.mjs'

const defaultHost = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1'
const defaultPort = 3001
const adminSessionCookieName = 'ordermoto_admin_session'
const adminSessionMaxAgeSeconds = 60 * 60 * 8
const customerSessionCookieName = 'ordermoto_customer_session'
const customerSessionMaxAgeSeconds = 60 * 60 * 8

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
}

const withCors = (response) => {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
}

const sendJson = (response, statusCode, payload) => {
  withCors(response)
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(payload))
}

const sendText = (response, statusCode, payload) => {
  withCors(response)
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'text/plain; charset=utf-8')
  response.end(payload)
}

const parseCookies = (cookieHeader = '') =>
  Object.fromEntries(
    cookieHeader
      .split(';')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const separatorIndex = entry.indexOf('=')

        if (separatorIndex === -1) {
          return [entry, '']
        }

        const name = entry.slice(0, separatorIndex).trim()
        const value = entry.slice(separatorIndex + 1).trim()
        try {
          return [name, decodeURIComponent(value)]
        } catch {
          return [name, value]
        }
      }),
  )

const serializeCookie = (name, value, options = {}) => {
  const parts = [`${name}=${encodeURIComponent(value)}`]

  if (options.path) {
    parts.push(`Path=${options.path}`)
  }

  if (typeof options.maxAge === 'number') {
    parts.push(`Max-Age=${options.maxAge}`)
  }

  if (options.httpOnly) {
    parts.push('HttpOnly')
  }

  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`)
  }

  if (options.secure) {
    parts.push('Secure')
  }

  return parts.join('; ')
}

const setAdminSessionCookie = (response, sessionToken) => {
  response.setHeader(
    'Set-Cookie',
    serializeCookie(adminSessionCookieName, sessionToken, {
      path: '/',
      maxAge: adminSessionMaxAgeSeconds,
      httpOnly: true,
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    }),
  )
}

const clearAdminSessionCookie = (response) => {
  response.setHeader(
    'Set-Cookie',
    serializeCookie(adminSessionCookieName, '', {
      path: '/',
      maxAge: 0,
      httpOnly: true,
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    }),
  )
}

const getAdminSessionToken = (request) =>
  parseCookies(request.headers.cookie ?? '')[adminSessionCookieName] ?? ''

const setCustomerSessionCookie = (response, sessionToken) => {
  response.setHeader(
    'Set-Cookie',
    serializeCookie(customerSessionCookieName, sessionToken, {
      path: '/',
      maxAge: customerSessionMaxAgeSeconds,
      httpOnly: true,
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    }),
  )
}

const clearCustomerSessionCookie = (response) => {
  response.setHeader(
    'Set-Cookie',
    serializeCookie(customerSessionCookieName, '', {
      path: '/',
      maxAge: 0,
      httpOnly: true,
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    }),
  )
}

const getCustomerSessionToken = (request) =>
  parseCookies(request.headers.cookie ?? '')[customerSessionCookieName] ?? ''

const requireAdminSession = async (request, response) => {
  const sessionToken = getAdminSessionToken(request)
  const session = await getAdminSessionState(sessionToken)

  if (session.authenticated) {
    return session
  }

  if (sessionToken) {
    clearAdminSessionCookie(response)
  }

  const error = new Error('Admin sign-in is required to add motorcycles.')
  error.statusCode = 401
  throw error
}

const readJsonBody = async (request) => {
  const chunks = []

  for await (const chunk of request) {
    chunks.push(chunk)
  }

  if (chunks.length === 0) {
    return {}
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    const error = new Error('Request body must be valid JSON.')
    error.statusCode = 400
    throw error
  }
}

const fileExists = async (path) => {
  try {
    await access(path, constants.F_OK)
    return true
  } catch {
    return false
  }
}

const serveStaticFile = async (response, requestedPath) => {
  const distDirectory = join(process.cwd(), 'dist')
  const safePath = normalize(join(distDirectory, requestedPath))

  if (!safePath.startsWith(distDirectory)) {
    sendText(response, 403, 'Forbidden')
    return true
  }

  const hasRequestedFile = await fileExists(safePath)
  const fallbackPath = join(distDirectory, 'index.html')

  if (hasRequestedFile) {
    const extension = extname(safePath)
    const content = await readFile(safePath)
    response.statusCode = 200
    response.setHeader('Content-Type', contentTypes[extension] ?? 'application/octet-stream')
    response.end(content)
    return true
  }

  if (await fileExists(fallbackPath)) {
    const content = await readFile(fallbackPath)
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/html; charset=utf-8')
    response.end(content)
    return true
  }

  sendText(
    response,
    404,
    'Frontend build not found. Run "npm run dev" for development or "npm run build" before starting the server.',
  )
  return true
}

const createAppServer = () =>
  createServer(async (request, response) => {
    withCors(response)

    if (request.method === 'OPTIONS') {
      response.statusCode = 204
      response.end()
      return
    }

    const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host ?? '127.0.0.1'}`)

    try {
      if (request.method === 'GET' && requestUrl.pathname === '/api/health') {
        sendJson(response, 200, {
          status: 'ok',
          uptimeSeconds: Math.round(process.uptime()),
        })
        return
      }

      if (request.method === 'GET' && requestUrl.pathname === '/api/bootstrap') {
        sendJson(response, 200, await getBootstrapData())
        return
      }

      if (request.method === 'GET' && requestUrl.pathname === '/api/admin/session') {
        const sessionToken = getAdminSessionToken(request)
        const session = await getAdminSessionState(sessionToken)

        if (sessionToken && !session.authenticated) {
          clearAdminSessionCookie(response)
        }

        sendJson(response, 200, session)
        return
      }

      if (request.method === 'GET' && requestUrl.pathname === '/api/customer/session') {
        const sessionToken = getCustomerSessionToken(request)
        const session = await getCustomerSessionState(sessionToken)

        if (sessionToken && !session.authenticated) {
          clearCustomerSessionCookie(response)
        }

        sendJson(response, 200, session)
        return
      }

      if (request.method === 'POST' && requestUrl.pathname === '/api/admin/login') {
        const payload = await readJsonBody(request)
        const { sessionToken, session } = await loginAdmin(payload)
        setAdminSessionCookie(response, sessionToken)
        sendJson(response, 200, session)
        return
      }

      if (request.method === 'POST' && requestUrl.pathname === '/api/customer/login') {
        const payload = await readJsonBody(request)
        const { sessionToken, session } = await loginCustomer(payload)
        setCustomerSessionCookie(response, sessionToken)
        sendJson(response, 200, session)
        return
      }

      if (request.method === 'POST' && requestUrl.pathname === '/api/admin/logout') {
        await logoutAdmin(getAdminSessionToken(request))
        clearAdminSessionCookie(response)
        sendJson(response, 200, { success: true })
        return
      }

      if (request.method === 'POST' && requestUrl.pathname === '/api/customer/logout') {
        await logoutCustomer(getCustomerSessionToken(request))
        clearCustomerSessionCookie(response)
        sendJson(response, 200, { success: true })
        return
      }

      if (request.method === 'POST' && requestUrl.pathname === '/api/admin/products') {
        await requireAdminSession(request, response)
        const payload = await readJsonBody(request)
        const product = await createProduct(payload)
        sendJson(response, 201, {
          product,
          products: await listProducts(),
        })
        return
      }

      if (request.method === 'POST' && requestUrl.pathname === '/api/admin/products/update') {
        await requireAdminSession(request, response)
        const payload = await readJsonBody(request)
        const product = await updateProduct(payload)
        sendJson(response, 200, {
          product,
          products: await listProducts(),
        })
        return
      }

      if (request.method === 'POST' && requestUrl.pathname === '/api/admin/products/delete') {
        await requireAdminSession(request, response)
        const payload = await readJsonBody(request)
        await deleteProduct(payload)
        sendJson(response, 200, {
          success: true,
          products: await listProducts(),
        })
        return
      }

      if (request.method === 'POST' && requestUrl.pathname === '/api/admin/orders/status') {
        await requireAdminSession(request, response)
        const payload = await readJsonBody(request)
        const order = await updateOrderStatus(payload)
        sendJson(response, 200, {
          order,
          orders: await listOrders(),
        })
        return
      }

      if (request.method === 'POST' && requestUrl.pathname === '/api/customers') {
        const payload = await readJsonBody(request)
        const customer = await createCustomer(payload)
        sendJson(response, 201, customer)
        return
      }

      if (request.method === 'POST' && requestUrl.pathname === '/api/orders') {
        const payload = await readJsonBody(request)
        const order = await createOrder(payload)
        sendJson(response, 201, {
          order,
          products: await listProducts(),
        })
        return
      }

      if (requestUrl.pathname.startsWith('/api/')) {
        sendJson(response, 404, { message: 'API route not found.' })
        return
      }

      await serveStaticFile(response, requestUrl.pathname === '/' ? 'index.html' : requestUrl.pathname)
    } catch (error) {
      sendJson(response, error.statusCode ?? 500, {
        message: error.message ?? 'Unexpected server error.',
      })
    }
  })

export const startServer = ({ host = defaultHost, port = defaultPort } = {}) =>
  new Promise((resolve, reject) => {
    initializeDatabase()
      .then(() => {
        const server = createAppServer()

        server.once('error', reject)
        server.listen(port, host, () => {
          resolve({ server, host, port })
        })
      })
      .catch(reject)
  })

export const stopServer = (server) =>
  new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error)
        return
      }

      resolve()
    })
  })

const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href

if (isDirectRun) {
  const host = process.env.HOST ?? defaultHost
  const port = Number(process.env.PORT ?? defaultPort)
  const { server } = await startServer({ host, port })

  console.log(`Ordermoto server running at http://${host}:${port}`)

  const shutdown = async () => {
    await stopServer(server)
    await closeDatabase()
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}
