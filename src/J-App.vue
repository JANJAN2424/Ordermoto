<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AppShell from './components/layout/J-AppShell.vue'
import AdminLoginScreen from './screens/J-AdminLoginScreen.vue'
import AdminScreen from './screens/J-AdminScreen.vue'
import AboutScreen from './screens/J-AboutScreen.vue'
import DashboardScreen from './screens/J-DashboardScreen.vue'
import HomeScreen from './screens/J-HomeScreen.vue'
import OrdersScreen from './screens/J-OrdersScreen.vue'
import RegistrationScreen from './screens/J-RegistrationScreen.vue'
import {
  createCustomer,
  createProduct as requestCreateProduct,
  createOrder,
  getAdminSession,
  getBootstrapData,
  loginAdmin as requestAdminLogin,
  logoutAdmin as requestAdminLogout,
} from './services/api'
import type {
  AdminLoginInput,
  AdminSessionState,
  CreateProductInput,
  CreateOrderInput,
  Customer,
  Order,
  Product,
  RegistrationInput,
  RouteKey,
} from './types/system'

const normalizeRoute = (hash: string): RouteKey => {
  const route = hash.replace('#', '').trim().toLowerCase()

  if (
    route === 'home' ||
    route === 'dashboard' ||
    route === 'about' ||
    route === 'registration' ||
    route === 'orders' ||
    route === 'admin'
  ) {
    return route
  }

  return 'admin'
}

const currentRoute = ref<RouteKey>(normalizeRoute(window.location.hash))
const products = ref<Product[]>([])
const customers = ref<Customer[]>([])
const orders = ref<Order[]>([])
const loading = ref(true)
const errorMessage = ref('')
const adminSession = ref<AdminSessionState>({
  authenticated: false,
  admin: null,
  expiresAt: null,
})

const navigationItems = computed<Array<{ key: RouteKey; label: string; helper: string }>>(() => [
  { key: 'dashboard', label: 'Dashboard', helper: 'Overview and quick actions' },
  { key: 'about', label: 'Motorcycles', helper: 'Available product catalog' },
  { key: 'registration', label: 'Registration', helper: 'Customer form' },
  { key: 'orders', label: 'Orders', helper: 'Build and save customer orders' },
  {
    key: 'admin',
    label: adminSession.value.authenticated ? 'Admin' : 'Admin login',
    helper: adminSession.value.authenticated ? 'Protected inventory tools' : 'Administrator access',
  },
])

const syncRoute = () => {
  currentRoute.value = normalizeRoute(window.location.hash)
}

const navigate = (route: RouteKey) => {
  window.location.hash = route
}

const loadBootstrap = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const [response, session] = await Promise.all([getBootstrapData(), getAdminSession()])
    products.value = response.products
    customers.value = response.customers
    orders.value = response.orders
    adminSession.value = session
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

const signInAdmin = async (payload: AdminLoginInput) => {
  const session = await requestAdminLogin(payload)
  adminSession.value = session
  errorMessage.value = ''
  return session
}

const signOutAdmin = async () => {
  await requestAdminLogout()
  adminSession.value = {
    authenticated: false,
    admin: null,
    expiresAt: null,
  }

  if (currentRoute.value === 'admin') {
    navigate('admin')
  }
}

onMounted(() => {
  window.addEventListener('hashchange', syncRoute)

  if (!window.location.hash) {
    navigate('admin')
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
  <HomeScreen
    v-if="currentRoute === 'home'"
    :products="products"
    :customers="customers"
    :orders="orders"
    @navigate="navigate"
  />

  <RegistrationScreen
    v-else-if="currentRoute === 'registration'"
    :customers="customers"
    :register-customer="registerCustomer"
    @navigate="navigate"
  />

  <AdminLoginScreen
    v-else-if="currentRoute === 'admin' && !adminSession.authenticated"
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
    @navigate="navigate"
    @logout="signOutAdmin"
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
      :orders="orders"
      :create-order="saveOrder"
    />

    <AdminScreen
      v-else-if="adminSession.authenticated"
      :customers="customers"
      :orders="orders"
      :products="products"
      :admin-display-name="adminSession.admin?.displayName"
      :create-product="saveProduct"
    />
  </AppShell>
</template>
