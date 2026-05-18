<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AppShell from './components/layout/J-AppShell.vue'
import AdminScreen from './screens/J-AdminScreen.vue'
import AboutScreen from './screens/J-AboutScreen.vue'
import CustomerLoginScreen from './screens/J-CustomerLoginScreen.vue'
import DashboardScreen from './screens/J-DashboardScreen.vue'
import OrderHistoryScreen from './screens/J-OrderHistoryScreen.vue'
import OrdersScreen from './screens/J-OrdersScreen.vue'
import RegistrationScreen from './screens/J-RegistrationScreen.vue'
import {
  createCustomer,
  deleteProduct as requestDeleteProduct,
  createProduct as requestCreateProduct,
  createOrder,
  getAdminSession,
  getBootstrapData,
  getCustomerSession,
  loginAdmin as requestAdminLogin,
  loginCustomer as requestCustomerLogin,
  logoutAdmin as requestAdminLogout,
  logoutCustomer as requestCustomerLogout,
  updateProduct as requestUpdateProduct,
  updateOrderStatus as requestUpdateOrderStatus,
} from './services/api'
import type {
  AdminLoginInput,
  AdminSessionState,
  CreateProductInput,
  CreateOrderInput,
  Customer,
  CustomerLoginInput,
  CustomerSessionState,
  Order,
  Product,
  RegistrationInput,
  RouteKey,
  UpdateProductInput,
  UpdateOrderStatusInput,
} from './types/system'

const normalizeRoute = (hash: string): RouteKey => {
  const route = hash.replace('#', '').trim().toLowerCase()

  if (
    route === 'dashboard' ||
    route === 'about' ||
    route === 'registration' ||
    route === 'orders' ||
    route === 'order-history' ||
    route === 'admin' ||
    route === 'admin-inventory' ||
    route === 'admin-products' ||
    route === 'admin-customers' ||
    route === 'login'
  ) {
    return route
  }

  return 'login'
}

const createEmptyAdminSession = (): AdminSessionState => ({
  authenticated: false,
  admin: null,
  expiresAt: null,
})

const createEmptyCustomerSession = (): CustomerSessionState => ({
  authenticated: false,
  customer: null,
  expiresAt: null,
})

const currentRoute = ref<RouteKey>(normalizeRoute(window.location.hash))
const products = ref<Product[]>([])
const customers = ref<Customer[]>([])
const orders = ref<Order[]>([])
const loading = ref(true)
const errorMessage = ref('')
const adminSession = ref<AdminSessionState>(createEmptyAdminSession())
const customerSession = ref<CustomerSessionState>(createEmptyCustomerSession())

const activeCustomerId = computed(() => customerSession.value.customer?.id ?? null)
const activeCustomerName = computed(() => customerSession.value.customer?.fullName ?? '')
const activeCustomerOrders = computed(() => {
  if (activeCustomerId.value === null) {
    return []
  }

  return orders.value.filter((order) => order.customerId === activeCustomerId.value)
})
const adminRoutes = new Set<RouteKey>([
  'admin-inventory',
  'admin-products',
  'admin-customers',
])
const customerRoutes = new Set<RouteKey>(['orders', 'order-history'])

const navigationItems = computed<Array<{ key: RouteKey; label: string; helper: string }>>(() => {
  if (adminSession.value.authenticated) {
    return [
      { key: 'admin-inventory', label: 'Inventory', helper: 'Add a motorcycle' },
      { key: 'admin-products', label: 'Motorcycles', helper: 'Catalog preview' },
      { key: 'admin-customers', label: 'Customers', helper: 'Registered customers' },
    ]
  }

  if (customerSession.value.authenticated) {
    return [
      { key: 'orders', label: 'New order', helper: 'Build a motorcycle order' },
      { key: 'order-history', label: 'Saved orders', helper: 'Track motorcycle status' },
    ]
  }

  return [
    { key: 'dashboard', label: 'Dashboard', helper: 'Overview and quick actions' },
    { key: 'about', label: 'Motorcycles', helper: 'Available product catalog' },
    { key: 'registration', label: 'Registration', helper: 'Customer form' },
    { key: 'login', label: 'Sign in', helper: 'Customer and admin access' },
  ]
})

const navigate = (route: RouteKey) => {
  window.location.hash = route
}

const syncRoute = () => {
  const nextRoute = normalizeRoute(window.location.hash)
  let allowedRoute = nextRoute

  if (adminSession.value.authenticated) {
    allowedRoute = adminRoutes.has(nextRoute) ? nextRoute : 'admin-inventory'
  } else if (customerSession.value.authenticated) {
    allowedRoute = customerRoutes.has(nextRoute) ? nextRoute : 'orders'
  } else if (nextRoute === 'orders') {
    allowedRoute = 'login'
  } else if (nextRoute === 'order-history') {
    allowedRoute = 'login'
  }

  currentRoute.value = allowedRoute

  if (allowedRoute !== nextRoute && window.location.hash !== `#${allowedRoute}`) {
    window.location.hash = allowedRoute
  }
}

const loadBootstrap = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const [response, admin, customer] = await Promise.all([
      getBootstrapData(),
      getAdminSession(),
      getCustomerSession(),
    ])

    products.value = response.products
    customers.value = response.customers
    orders.value = response.orders
    adminSession.value = admin
    customerSession.value = customer
    syncRoute()
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Unable to load the ordering system data.'
  } finally {
    loading.value = false
  }
}

const registerCustomer = async (payload: RegistrationInput) => {
  const customer = await createCustomer(payload)
  customers.value = [customer, ...customers.value]
  errorMessage.value = ''
  return customer
}

const saveOrder = async (payload: CreateOrderInput) => {
  const response = await createOrder(payload)
  orders.value = [response.order, ...orders.value]
  products.value = response.products
  errorMessage.value = ''
  return response.order
}

const saveProduct = async (payload: CreateProductInput) => {
  const response = await requestCreateProduct(payload)
  products.value = response.products
  errorMessage.value = ''
  return response.product
}

const updateProduct = async (payload: UpdateProductInput) => {
  const response = await requestUpdateProduct(payload)
  products.value = response.products
  errorMessage.value = ''
  return response.product
}

const deleteProduct = async (productId: number) => {
  const response = await requestDeleteProduct(productId)
  products.value = response.products
  errorMessage.value = ''
}

const updateOrderStatus = async (payload: UpdateOrderStatusInput) => {
  const response = await requestUpdateOrderStatus(payload)
  orders.value = response.orders
  errorMessage.value = ''
  return response.order
}

const signInCustomer = async (payload: CustomerLoginInput) => {
  const session = await requestCustomerLogin(payload)

  if (adminSession.value.authenticated) {
    try {
      await requestAdminLogout()
    } catch {
      // Keep the new customer session even if the previous admin logout request fails.
    }

    adminSession.value = createEmptyAdminSession()
  }

  customerSession.value = session
  errorMessage.value = ''
  navigate('orders')
  return session
}

const signInAdmin = async (payload: AdminLoginInput) => {
  const session = await requestAdminLogin(payload)

  if (customerSession.value.authenticated) {
    try {
      await requestCustomerLogout()
    } catch {
      // Keep the new admin session even if the previous customer logout request fails.
    }

    customerSession.value = createEmptyCustomerSession()
  }

  adminSession.value = session
  errorMessage.value = ''
  navigate('admin-inventory')
  return session
}

const signOutCurrentSession = async () => {
  if (adminSession.value.authenticated) {
    try {
      await requestAdminLogout()
    } finally {
      adminSession.value = createEmptyAdminSession()
    }

    navigate('login')
  }

  if (customerSession.value.authenticated) {
    try {
      await requestCustomerLogout()
    } finally {
      customerSession.value = createEmptyCustomerSession()
    }

    navigate('login')
  }
}

onMounted(() => {
  window.addEventListener('hashchange', syncRoute)

  if (!window.location.hash) {
    navigate('login')
  } else {
    syncRoute()
  }

  loadBootstrap()
})

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', syncRoute)
})
</script>

<template>
  <RegistrationScreen
    v-if="currentRoute === 'registration'"
    :customers="customers"
    :register-customer="registerCustomer"
    @navigate="navigate"
  />

  <CustomerLoginScreen
    v-else-if="
      (currentRoute === 'login' || currentRoute === 'admin') &&
      !adminSession.authenticated &&
      !customerSession.authenticated
    "
    :initial-mode="currentRoute === 'admin' ? 'admin' : 'customer'"
    :login-customer="signInCustomer"
    :login-admin="signInAdmin"
    @navigate="navigate"
  />

  <AppShell
    v-else
    :current-route="currentRoute"
    :navigation-items="navigationItems"
    :loading="loading"
    :error-message="errorMessage"
    :admin-session="adminSession"
    :customer-session="customerSession"
    @navigate="navigate"
    @logout="signOutCurrentSession"
  >
    <DashboardScreen
      v-if="currentRoute === 'dashboard'"
      :products="products"
      :customers="customers"
      :orders="orders"
      @navigate="navigate"
    />

    <AboutScreen v-else-if="currentRoute === 'about'" :products="products" />

    <OrdersScreen
      v-else-if="currentRoute === 'orders'"
      :products="products"
      :customers="customers"
      :active-customer-id="activeCustomerId"
      :active-customer-name="activeCustomerName"
      :create-order="saveOrder"
    />

    <OrderHistoryScreen
      v-else-if="currentRoute === 'order-history'"
      :orders="activeCustomerOrders"
      :active-customer-name="activeCustomerName"
    />

    <AdminScreen
      v-else-if="adminSession.authenticated"
      :section="currentRoute"
      :customers="customers"
      :orders="orders"
      :products="products"
      :admin-display-name="adminSession.admin?.displayName"
      :create-product="saveProduct"
      :update-product="updateProduct"
      :delete-product="deleteProduct"
      :update-order-status="updateOrderStatus"
    />
  </AppShell>
</template>
