import type {
  AdminLoginInput,
  AdminSessionState,
  BootstrapData,
  CreateProductInput,
  CreateProductResponse,
  CreateOrderInput,
  Customer,
  OrderSubmissionResponse,
  RegistrationInput,
} from '../types/system'

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(path, {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  const text = await response.text()
  const payload = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new Error(payload?.message ?? 'Request failed.')
  }

  return payload as T
}

export const getBootstrapData = () => request<BootstrapData>('/api/bootstrap')

export const getAdminSession = () => request<AdminSessionState>('/api/admin/session')

export const loginAdmin = (payload: AdminLoginInput) =>
  request<AdminSessionState>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const logoutAdmin = () =>
  request<{ success: true }>('/api/admin/logout', {
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
