<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AppShell from './components/layout/AppShell.vue'
import AdminLoginScreen from './screens/AdminLoginScreen.vue'
import AdminScreen from './screens/AdminScreen.vue'
import AboutScreen from './screens/AboutScreen.vue'
import HomeScreen from './screens/HomeScreen.vue'
import OrdersScreen from './screens/OrdersScreen.vue'
import RegistrationScreen from './screens/RegistrationScreen.vue'
import {
  createCustomer,
  createOrder,
  getAdminSession,
  getBootstrapData,
  loginAdmin as requestAdminLogin,
  logoutAdmin as requestAdminLogout,
} from './services/api'
import type {
  AdminLoginInput,
  AdminSessionState,
  CreateOrderInput,
  Customer,
  Order,
  Product,
  RegistrationInput,
  RouteKey,
} from './types/system'

const normalizeRoute = (hash: string): RouteKey => {
  const route = hash.replace('#', '').trim().toLowerCase()

  if (route === 'about' || route === 'registration' || route === 'orders' || route === 'admin') {
    return route
  }

  return 'home'
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
  { key: 'home', label: 'Homepage', helper: 'Welcome and overview' },
  { key: 'about', label: 'About', helper: 'Available products' },
  { key: 'registration', label: 'Registration', helper: 'Customer form' },
  { key: 'orders', label: 'Orders', helper: 'Products added by customers' },
  {
    key: 'admin',
    label: adminSession.value.authenticated ? 'Admin dashboard' : 'Admin login',
    helper: adminSession.value.authenticated ? 'Protected admin tools' : 'Administrator access',
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
    navigate('home')
  }
}

onMounted(() => {
  window.addEventListener('hashchange', syncRoute)

  if (!window.location.hash) {
    navigate('home')
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
  <AppShell
    :current-route="currentRoute"
    :navigation-items="navigationItems"
    :loading="loading"
    :error-message="errorMessage"
    :admin-session="adminSession"
    @navigate="navigate"
    @logout="signOutAdmin"
  >
    <HomeScreen
      v-if="currentRoute === 'home'"
      :products="products"
      :customers="customers"
      :orders="orders"
    />

    <AboutScreen v-else-if="currentRoute === 'about'" :products="products" />

    <RegistrationScreen
      v-else-if="currentRoute === 'registration'"
      :customers="customers"
      :register-customer="registerCustomer"
    />

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
    />

    <AdminLoginScreen v-else :login-admin="signInAdmin" />
  </AppShell>
</template>
