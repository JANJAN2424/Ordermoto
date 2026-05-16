export type RouteKey =
  | 'dashboard'
  | 'about'
  | 'registration'
  | 'orders'
  | 'order-history'
  | 'admin'
  | 'admin-inventory'
  | 'admin-products'
  | 'admin-customers'
  | 'login'
export type DeliveryMethod = 'Showroom pickup' | 'Home delivery'
export type OrderStatus =
  | 'Pending'
  | 'Preparing'
  | 'Ready for pickup'
  | 'On delivery'
  | 'Delivered'
  | 'Cancelled'

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

export interface CustomerSessionState {
  authenticated: boolean
  customer: Customer | null
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
  status: OrderStatus
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
  password: string
}

export interface CustomerLoginInput {
  email: string
  password: string
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

export interface CreateProductInput {
  sku: string
  name: string
  category: string
  description: string
  price: number
  stock: number
  leadTimeDays: number
  featured: boolean
}

export interface UpdateProductInput extends CreateProductInput {
  id: number
}

export interface UpdateOrderStatusInput {
  orderId: number
  status: OrderStatus
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

export interface CreateProductResponse {
  product: Product
  products: Product[]
}

export interface UpdateProductResponse {
  product: Product
  products: Product[]
}

export interface DeleteProductResponse {
  success: true
  products: Product[]
}

export interface UpdateOrderStatusResponse {
  order: Order
  orders: Order[]
}
