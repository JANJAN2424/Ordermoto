export type RouteKey = 'home' | 'about' | 'registration' | 'orders' | 'admin'
export type DeliveryMethod = 'Showroom pickup' | 'Home delivery'

export interface Product {
  id: number
  sku: string
  name: string
  category: string
  description: string
  price: number
  stock: number
  leadTimeDays: number
  featured: boolean
}

export interface Customer {
  id: number
  fullName: string
  email: string
  phone: string
  address: string
  registeredAt: string
}

export interface AdminAccount {
  id: number
  username: string
  displayName: string
  createdAt: string
}

export interface AdminSessionState {
  authenticated: boolean
  admin: AdminAccount | null
  expiresAt: string | null
}

export interface OrderItem {
  productId: number
  productName: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface Order {
  id: number
  customerId: number
  customerName: string
  deliveryMethod: DeliveryMethod
  note: string
  total: number
  createdAt: string
  items: OrderItem[]
}

export interface RegistrationInput {
  fullName: string
  email: string
  phone: string
  address: string
}

export interface CreateOrderInput {
  customerId: number
  deliveryMethod: DeliveryMethod
  note: string
  items: Array<{
    productId: number
    quantity: number
  }>
}

export interface BootstrapData {
  products: Product[]
  customers: Customer[]
  orders: Order[]
}

export interface AdminLoginInput {
  username: string
  password: string
}

export interface OrderSubmissionResponse {
  order: Order
  products: Product[]
}
