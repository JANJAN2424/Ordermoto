import './load-env.mjs'

import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

import { PrismaClient } from '@prisma/client'
import {
  deleteCustomerAuthUser,
  registerCustomerAuthUser,
  signInCustomerWithSupabase,
} from './supabase-auth.mjs'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error(
    'DATABASE_URL is not configured. Set it in .env.local or .env to your Supabase pooled PostgreSQL connection string.',
  )
}

if (!/^postgres(ql)?:\/\//i.test(connectionString)) {
  throw new Error(
    'DATABASE_URL must be a PostgreSQL connection string. For Supabase, use the pooled database URL from Project Settings > Database.',
  )
}

const prisma = new PrismaClient()
const sessionDurationMs = 1000 * 60 * 60 * 8
const defaultAdminUsername = process.env.ADMIN_USERNAME?.trim() || 'admin'
const defaultAdminPassword = process.env.ADMIN_PASSWORD?.trim() || 'admin123'
const defaultAdminDisplayName =
  process.env.ADMIN_DISPLAY_NAME?.trim() || 'Ordermoto Administrator'

const seededProducts = [
  {
    sku: 'HON-ATLAS-160',
    name: 'Honda Atlas 160',
    category: 'City commuter',
    description: 'Efficient, lightweight motorcycle built for daily city rides.',
    price: 4250,
    stock: 4,
    leadTimeDays: 1,
    featured: 1,
  },
  {
    sku: 'YAM-TRAIL-250',
    name: 'Yamaha Trailhawk 250',
    category: 'Dual-sport',
    description: 'Balanced dual-sport bike for road trips and light trail use.',
    price: 6100,
    stock: 3,
    leadTimeDays: 3,
    featured: 1,
  },
  {
    sku: 'KAW-BOLT-400',
    name: 'Kawasaki Bolt 400',
    category: 'Street performance',
    description: 'A premium mid-range street motorcycle with strong acceleration.',
    price: 7850,
    stock: 2,
    leadTimeDays: 5,
    featured: 0,
  },
  {
    sku: 'SUZ-GLIDE-125',
    name: 'Suzuki Glide 125',
    category: 'Delivery scooter',
    description: 'Cargo-friendly scooter for delivery teams and urban businesses.',
    price: 2950,
    stock: 6,
    leadTimeDays: 1,
    featured: 0,
  },
]

const allowedDeliveryMethods = new Set(['Showroom pickup', 'Home delivery'])
const allowedOrderStatuses = new Set([
  'Pending',
  'Preparing',
  'Ready for pickup',
  'On delivery',
  'Delivered',
  'Cancelled',
])

const badRequest = (message) => {
  const error = new Error(message)
  error.statusCode = 400
  return error
}

const unauthorized = (message) => {
  const error = new Error(message)
  error.statusCode = 401
  return error
}

const nowIso = () => new Date().toISOString()
const normalizeEmail = (value) => value?.trim().toLowerCase() ?? ''
const readAuthMetadataText = (record, key) =>
  typeof record?.[key] === 'string' ? record[key].trim() : ''

const hashPassword = (password) => {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${derivedKey}`
}

const verifyPassword = (password, storedHash) => {
  const [salt, expectedHash] = storedHash.split(':')

  if (!salt || !expectedHash) {
    return false
  }

  const expectedBuffer = Buffer.from(expectedHash, 'hex')
  const candidateBuffer = scryptSync(password, salt, expectedBuffer.length)

  return timingSafeEqual(expectedBuffer, candidateBuffer)
}

const createSessionToken = () => randomBytes(32).toString('base64url')
const hashSessionToken = (sessionToken) =>
  createHash('sha256').update(sessionToken).digest('hex')

const serializeProduct = (product) => ({
  id: product.id,
  sku: product.sku,
  name: product.name,
  category: product.category,
  description: product.description,
  price: Number(product.price),
  stock: product.stock,
  leadTimeDays: product.leadTimeDays,
  featured: Boolean(product.featured),
})

const serializeCustomer = (customer) => ({
  id: customer.id,
  fullName: customer.fullName,
  email: customer.email,
  phone: customer.phone,
  address: customer.address,
  registeredAt: customer.registeredAt,
})

const serializeAdminAccount = (adminUser) => ({
  id: adminUser.id,
  username: adminUser.username,
  displayName: adminUser.displayName,
  createdAt: adminUser.createdAt,
})

const serializeAdminSession = (session) => ({
  authenticated: true,
  admin: serializeAdminAccount(session.adminUser),
  expiresAt: session.expiresAt,
})

const serializeCustomerSession = (session) => ({
  authenticated: true,
  customer: serializeCustomer(session.customer),
  expiresAt: session.expiresAt,
})

const emptyAdminSession = () => ({
  authenticated: false,
  admin: null,
  expiresAt: null,
})

const emptyCustomerSession = () => ({
  authenticated: false,
  customer: null,
  expiresAt: null,
})

const serializeOrder = (order) => ({
  id: order.id,
  customerId: order.customerId,
  customerName: order.customer.fullName,
  deliveryMethod: order.deliveryMethod,
  status: order.status ?? 'Pending',
  note: order.note,
  total: Number(order.total),
  createdAt: order.createdAt,
  items: order.items.map((item) => ({
    productId: item.productId,
    productName: item.productName,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    lineTotal: Number(item.lineTotal),
  })),
})

const orderInclude = {
  customer: true,
  items: {
    orderBy: {
      id: 'asc',
    },
  },
}

const getOrderById = async (orderId, client = prisma) => {
  const order = await client.order.findUnique({
    where: { id: orderId },
    include: orderInclude,
  })

  return order ? serializeOrder(order) : null
}

const getAdminSessionRecord = async (sessionToken, client = prisma) => {
  if (!sessionToken) {
    return null
  }

  const session = await client.adminSession.findUnique({
    where: {
      sessionTokenHash: hashSessionToken(sessionToken),
    },
    include: {
      adminUser: true,
    },
  })

  if (!session) {
    return null
  }

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    await client.adminSession.delete({
      where: {
        id: session.id,
      },
    })
    return null
  }

  return session
}

const getCustomerSessionRecord = async (sessionToken, client = prisma) => {
  if (!sessionToken) {
    return null
  }

  const session = await client.customerSession.findUnique({
    where: {
      sessionTokenHash: hashSessionToken(sessionToken),
    },
    include: {
      customer: true,
    },
  })

  if (!session) {
    return null
  }

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    await client.customerSession.delete({
      where: {
        id: session.id,
      },
    })
    return null
  }

  return session
}

export const initializeDatabase = async () => {
  await prisma.$connect()

  for (const product of seededProducts) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      create: product,
      update: {},
    })
  }

  await prisma.adminUser.upsert({
    where: {
      username: defaultAdminUsername,
    },
    create: {
      username: defaultAdminUsername,
      displayName: defaultAdminDisplayName,
      passwordHash: hashPassword(defaultAdminPassword),
      createdAt: nowIso(),
    },
    update: {
      displayName: defaultAdminDisplayName,
      passwordHash: hashPassword(defaultAdminPassword),
    },
  })

  await prisma.adminSession.deleteMany({
    where: {
      expiresAt: {
        lt: nowIso(),
      },
    },
  })

  await prisma.customerSession.deleteMany({
    where: {
      expiresAt: {
        lt: nowIso(),
      },
    },
  })
}

export const listProducts = async () =>
  (
    await prisma.product.findMany({
      orderBy: [{ featured: 'desc' }, { name: 'asc' }],
    })
  ).map(serializeProduct)

export const listCustomers = async () =>
  (
    await prisma.customer.findMany({
      orderBy: [{ registeredAt: 'desc' }, { id: 'desc' }],
    })
  ).map(serializeCustomer)

export const listOrders = async () =>
  (
    await prisma.order.findMany({
      include: orderInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    })
  ).map(serializeOrder)

export const getBootstrapData = async () => {
  const [products, customers, orders] = await Promise.all([
    listProducts(),
    listCustomers(),
    listOrders(),
  ])

  return {
    products,
    customers,
    orders,
  }
}

export const getAdminSessionState = async (sessionToken) => {
  const session = await getAdminSessionRecord(sessionToken)
  return session ? serializeAdminSession(session) : emptyAdminSession()
}

export const getCustomerSessionState = async (sessionToken) => {
  const session = await getCustomerSessionRecord(sessionToken)
  return session ? serializeCustomerSession(session) : emptyCustomerSession()
}

export const loginAdmin = async (input) => {
  const username = input.username?.trim()
  const password = input.password?.trim()

  if (!username || !password) {
    throw badRequest('Enter the admin username and password.')
  }

  const adminUser = await prisma.adminUser.findUnique({
    where: {
      username,
    },
  })

  if (!adminUser || !verifyPassword(password, adminUser.passwordHash)) {
    throw unauthorized('Invalid admin username or password.')
  }

  const sessionToken = createSessionToken()
  const createdAt = nowIso()
  const expiresAt = new Date(Date.now() + sessionDurationMs).toISOString()

  const session = await prisma.adminSession.create({
    data: {
      sessionTokenHash: hashSessionToken(sessionToken),
      adminUserId: adminUser.id,
      createdAt,
      expiresAt,
    },
    include: {
      adminUser: true,
    },
  })

  return {
    sessionToken,
    session: serializeAdminSession(session),
  }
}

export const loginCustomer = async (input) => {
  const email = normalizeEmail(input.email)
  const password = input.password?.trim()

  if (!email || !password) {
    throw badRequest('Enter the registered email and password.')
  }

  const authUser = await signInCustomerWithSupabase({
    email,
    password,
  })
  const fullNameFromMetadata =
    readAuthMetadataText(authUser.metadata, 'fullName') ||
    readAuthMetadataText(authUser.metadata, 'full_name') ||
    authUser.email.split('@')[0]
  const phoneFromMetadata = readAuthMetadataText(authUser.metadata, 'phone')
  const addressFromMetadata = readAuthMetadataText(authUser.metadata, 'address')

  const existingCustomer =
    (await prisma.customer.findUnique({
      where: {
        authUserId: authUser.userId,
      },
    })) ||
    (await prisma.customer.findUnique({
      where: {
        email: authUser.email,
      },
    }))

  const customer = existingCustomer
    ? await prisma.customer.update({
        where: {
          id: existingCustomer.id,
        },
        data: {
          authUserId: authUser.userId,
          email: authUser.email,
          passwordHash: '',
          fullName: existingCustomer.fullName || fullNameFromMetadata,
          phone: existingCustomer.phone || phoneFromMetadata,
          address: existingCustomer.address || addressFromMetadata,
        },
      })
    : await prisma.customer.create({
        data: {
          authUserId: authUser.userId,
          fullName: fullNameFromMetadata,
          email: authUser.email,
          phone: phoneFromMetadata,
          address: addressFromMetadata,
          passwordHash: '',
          registeredAt: new Date().toISOString(),
        },
      })

  const sessionToken = createSessionToken()
  const createdAt = nowIso()
  const expiresAt = new Date(Date.now() + sessionDurationMs).toISOString()

  const session = await prisma.customerSession.create({
    data: {
      sessionTokenHash: hashSessionToken(sessionToken),
      customerId: customer.id,
      createdAt,
      expiresAt,
    },
    include: {
      customer: true,
    },
  })

  return {
    sessionToken,
    session: serializeCustomerSession(session),
  }
}

export const logoutAdmin = async (sessionToken) => {
  if (!sessionToken) {
    return
  }

  await prisma.adminSession.deleteMany({
    where: {
      sessionTokenHash: hashSessionToken(sessionToken),
    },
  })
}

export const logoutCustomer = async (sessionToken) => {
  if (!sessionToken) {
    return
  }

  await prisma.customerSession.deleteMany({
    where: {
      sessionTokenHash: hashSessionToken(sessionToken),
    },
  })
}

export const createCustomer = async (input) => {
  const fullName = input.fullName?.trim()
  const email = normalizeEmail(input.email)
  const phone = input.phone?.trim()
  const address = input.address?.trim()
  const password = input.password?.trim()

  if (!fullName || !email || !phone || !address || !password) {
    throw badRequest('Please complete all registration fields.')
  }

  if (password.length < 6) {
    throw badRequest('Password must be at least 6 characters long.')
  }

  const existingCustomer = await prisma.customer.findUnique({
    where: {
      email,
    },
  })

  if (existingCustomer?.authUserId) {
    throw badRequest('A customer account with this email already exists.')
  }

  const { userId } = await registerCustomerAuthUser({
    email,
    password,
    metadata: {
      fullName,
      phone,
      address,
    },
  })

  try {
    const customer = existingCustomer
      ? await prisma.customer.update({
          where: {
            id: existingCustomer.id,
          },
          data: {
            authUserId: userId,
            fullName,
            email,
            phone,
            address,
            passwordHash: '',
          },
        })
      : await prisma.customer.create({
          data: {
            authUserId: userId,
            fullName,
            email,
            phone,
            address,
            passwordHash: '',
            registeredAt: new Date().toISOString(),
          },
        })

    return serializeCustomer(customer)
  } catch (error) {
    try {
      await deleteCustomerAuthUser(userId)
    } catch {
      // Keep the original database error if rollback fails.
    }

    throw error
  }
}

export const createProduct = async (input) => {
  const trimmedSku = input.sku?.trim()
  const sku = trimmedSku ? trimmedSku.replace(/\s+/g, '-').toUpperCase() : ''
  const name = input.name?.trim()
  const category = input.category?.trim()
  const description = input.description?.trim()
  const price = Number(input.price)
  const stock = Number(input.stock)
  const leadTimeDays = Number(input.leadTimeDays)
  const featured = input.featured === true

  if (!sku || !name || !category || !description) {
    throw badRequest('Please complete all motorcycle fields before saving.')
  }

  if (!Number.isFinite(price) || price <= 0) {
    throw badRequest('Enter a valid motorcycle price greater than zero.')
  }

  if (!Number.isInteger(stock) || stock < 0) {
    throw badRequest('Stock must be a whole number that is zero or higher.')
  }

  if (!Number.isInteger(leadTimeDays) || leadTimeDays < 1) {
    throw badRequest('Lead time must be at least one day.')
  }

  const existingProduct = await prisma.product.findUnique({
    where: {
      sku,
    },
    select: {
      id: true,
    },
  })

  if (existingProduct) {
    throw badRequest('A motorcycle with this SKU already exists in the catalog.')
  }

  const product = await prisma.product.create({
    data: {
      sku,
      name,
      category,
      description,
      price,
      stock,
      leadTimeDays,
      featured: featured ? 1 : 0,
    },
  })

  return serializeProduct(product)
}

export const updateProduct = async (input) => {
  const productId = Number(input.id)
  const trimmedSku = input.sku?.trim()
  const sku = trimmedSku ? trimmedSku.replace(/\s+/g, '-').toUpperCase() : ''
  const name = input.name?.trim()
  const category = input.category?.trim()
  const description = input.description?.trim()
  const price = Number(input.price)
  const stock = Number(input.stock)
  const leadTimeDays = Number(input.leadTimeDays)
  const featured = input.featured === true

  if (!Number.isInteger(productId) || productId <= 0) {
    throw badRequest('Choose a valid motorcycle before updating.')
  }

  if (!sku || !name || !category || !description) {
    throw badRequest('Please complete all motorcycle fields before saving.')
  }

  if (!Number.isFinite(price) || price <= 0) {
    throw badRequest('Enter a valid motorcycle price greater than zero.')
  }

  if (!Number.isInteger(stock) || stock < 0) {
    throw badRequest('Stock must be a whole number that is zero or higher.')
  }

  if (!Number.isInteger(leadTimeDays) || leadTimeDays < 1) {
    throw badRequest('Lead time must be at least one day.')
  }

  const existingProduct = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      id: true,
    },
  })

  if (!existingProduct) {
    throw badRequest('The selected motorcycle could not be found.')
  }

  const productWithSku = await prisma.product.findUnique({
    where: {
      sku,
    },
    select: {
      id: true,
    },
  })

  if (productWithSku && productWithSku.id !== productId) {
    throw badRequest('Another motorcycle already uses this SKU.')
  }

  const product = await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      sku,
      name,
      category,
      description,
      price,
      stock,
      leadTimeDays,
      featured: featured ? 1 : 0,
    },
  })

  return serializeProduct(product)
}

export const deleteProduct = async (input) => {
  const productId = Number(input.productId)

  if (!Number.isInteger(productId) || productId <= 0) {
    throw badRequest('Choose a valid motorcycle before deleting.')
  }

  const existingProduct = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          orderItems: true,
        },
      },
    },
  })

  if (!existingProduct) {
    throw badRequest('The selected motorcycle could not be found.')
  }

  if (existingProduct._count.orderItems > 0) {
    throw badRequest(
      `${existingProduct.name} is already used in saved orders, so it cannot be deleted.`,
    )
  }

  await prisma.product.delete({
    where: {
      id: productId,
    },
  })
}

export const createOrder = async (input) => {
  const customerId = Number(input.customerId)
  const deliveryMethod = input.deliveryMethod?.trim()
  const note = input.note?.trim() ?? ''
  const items = Array.isArray(input.items) ? input.items : []

  if (!Number.isInteger(customerId) || customerId <= 0) {
    throw badRequest('Select a registered customer before saving an order.')
  }

  if (!allowedDeliveryMethods.has(deliveryMethod)) {
    throw badRequest('Choose a valid delivery method.')
  }

  const normalizedItems = items
    .map((item) => ({
      productId: Number(item.productId),
      quantity: Number(item.quantity),
    }))
    .filter(
      (item) =>
        Number.isInteger(item.productId) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0,
    )

  if (normalizedItems.length === 0) {
    throw badRequest('Add at least one product to create an order.')
  }

  const createdOrderId = await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.findUnique({
      where: { id: customerId },
      select: { id: true },
    })

    if (!customer) {
      throw badRequest('The selected customer could not be found.')
    }

    const productIds = [...new Set(normalizedItems.map((item) => item.productId))]
    const products = await tx.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    })

    const productMap = new Map(products.map((product) => [product.id, product]))
    const preparedItems = []
    let total = 0

    for (const item of normalizedItems) {
      const product = productMap.get(item.productId)

      if (!product) {
        throw badRequest('One of the selected products no longer exists.')
      }

      if (item.quantity > product.stock) {
        throw badRequest(`${product.name} only has ${product.stock} unit(s) available.`)
      }

      const unitPrice = Number(product.price)
      const lineTotal = unitPrice * item.quantity

      preparedItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
      })

      total += lineTotal
    }

    const order = await tx.order.create({
      data: {
        customerId,
        deliveryMethod,
        status: 'Pending',
        note,
        total,
        createdAt: new Date().toISOString(),
        items: {
          create: preparedItems,
        },
      },
      select: {
        id: true,
      },
    })

    for (const item of preparedItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      })
    }

    return order.id
  })

  const createdOrder = await getOrderById(createdOrderId)

  if (!createdOrder) {
    throw new Error('The order was saved, but the final record could not be loaded.')
  }

  return createdOrder
}

export const updateOrderStatus = async (input) => {
  const orderId = Number(input.orderId)
  const status = input.status?.trim()

  if (!Number.isInteger(orderId) || orderId <= 0) {
    throw badRequest('Choose a valid order before updating the motorcycle status.')
  }

  if (!allowedOrderStatuses.has(status)) {
    throw badRequest('Choose a valid motorcycle status.')
  }

  const existingOrder = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    select: {
      id: true,
    },
  })

  if (!existingOrder) {
    throw badRequest('The selected order could not be found.')
  }

  const order = await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      status,
    },
    include: orderInclude,
  })

  return serializeOrder(order)
}

export const closeDatabase = async () => {
  await prisma.$disconnect()
}
