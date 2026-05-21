import type {
  AdminLoginInput,
  AdminSessionState,
  BootstrapData,
  CreateProductInput,
  CreateProductResponse,
  CreateOrderInput,
  Customer,
  CustomerLoginInput,
  CustomerSessionState,
  OrderSubmissionResponse,
  RegistrationInput,
  LoginInput,
  LoginResponse,
  UpdateProductInput,
  UpdateProductResponse,
  UpdateOrderStatusInput,
  UpdateOrderStatusResponse,
  DeleteProductResponse,
} from '../types/system'

const rawConfiguredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '') ?? ''
const forceConfiguredApiBaseUrl =
  String(import.meta.env.VITE_FORCE_API_BASE_URL ?? '').trim().toLowerCase() === 'true'
const configuredApiBaseUrl =
  import.meta.env.DEV && !forceConfiguredApiBaseUrl ? '' : rawConfiguredApiBaseUrl

const createRequestUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return configuredApiBaseUrl ? `${configuredApiBaseUrl}${normalizedPath}` : normalizedPath
}

const getRoutingHint = (path: string) =>
  configuredApiBaseUrl
    ? `Check VITE_API_BASE_URL, CLIENT_ORIGIN, and confirm the Node API server is reachable for ${path}. For local development, leave VITE_API_BASE_URL empty so Vite can proxy /api requests to the local Node server.`
    : `Check that the Node server is running and that Vite's /api proxy reaches ${path}. Set VITE_FORCE_API_BASE_URL=true only when you intentionally want local dev to call the remote API.`

const getResponsePreview = (text: string) =>
  text.replace(/\s+/g, ' ').trim().slice(0, 160)

const createNonJsonResponseError = (path: string, contentType: string, text: string) => {
  const preview = getResponsePreview(text)
  const looksLikeHtml =
    /text\/html/i.test(contentType) ||
    /^<!doctype html/i.test(preview) ||
    /^<html/i.test(preview) ||
    /the page could not be found/i.test(preview)

  if (looksLikeHtml) {
    return new Error(`The API request to ${path} returned HTML instead of JSON. ${getRoutingHint(path)}`)
  }

  if (preview) {
    return new Error(
      `The API request to ${path} returned a non-JSON response: ${preview}`,
    )
  }

  return new Error(`The API request to ${path} returned a non-JSON response. ${getRoutingHint(path)}`)
}

const parseJsonPayload = (path: string, text: string) => {
  try {
    return JSON.parse(text)
  } catch {
    throw new Error(`The API returned invalid JSON for ${path}. ${getRoutingHint(path)}`)
  }
}

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  let response: Response

  try {
    response = await fetch(createRequestUrl(path), {
      credentials: configuredApiBaseUrl ? 'include' : 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      ...init,
    })
  } catch {
    throw new Error(`Unable to reach ${path}. ${getRoutingHint(path)}`)
  }

  const text = await response.text()
  const contentType = response.headers.get('Content-Type') ?? ''
  const expectsJson = /\bapplication\/json\b/i.test(contentType)
  const payload = text ? (expectsJson ? parseJsonPayload(path, text) : null) : null

  if (!response.ok) {
    if (payload && typeof payload === 'object' && 'message' in payload && typeof payload.message === 'string') {
      throw new Error(payload.message)
    }

    throw createNonJsonResponseError(path, contentType, text)
  }

  if (!text) {
    return null as T
  }

  if (!expectsJson) {
    throw createNonJsonResponseError(path, contentType, text)
  }

  return payload as T
}

export const getBootstrapData = () => request<BootstrapData>('/api/bootstrap')

export const getAdminSession = () => request<AdminSessionState>('/api/admin/session')

export const getCustomerSession = () => request<CustomerSessionState>('/api/customer/session')

export const login = (payload: LoginInput) =>
  request<LoginResponse>('/api/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const loginAdmin = (payload: AdminLoginInput) =>
  request<AdminSessionState>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const loginCustomer = (payload: CustomerLoginInput) =>
  request<CustomerSessionState>('/api/customer/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const logoutAdmin = () =>
  request<{ success: true }>('/api/admin/logout', {
    method: 'POST',
  })

export const logoutCustomer = () =>
  request<{ success: true }>('/api/customer/logout', {
    method: 'POST',
  })

export const createCustomer = (payload: RegistrationInput) =>
  request<Customer>('/api/customers', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const createOrder = (payload: CreateOrderInput) =>
  request<OrderSubmissionResponse>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const createProduct = (payload: CreateProductInput) =>
  request<CreateProductResponse>('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const updateProduct = (payload: UpdateProductInput) =>
  request<UpdateProductResponse>('/api/admin/products/update', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const deleteProduct = (productId: number) =>
  request<DeleteProductResponse>('/api/admin/products/delete', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  })

export const updateOrderStatus = (payload: UpdateOrderStatusInput) =>
  request<UpdateOrderStatusResponse>('/api/admin/orders/status', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
