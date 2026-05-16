<script setup lang="ts">
import { computed } from 'vue'
import CustomerListPanel from '../components/customers/J-CustomerListPanel.vue'
import ProductCreationForm from '../components/forms/J-ProductCreationForm.vue'
import ProductShowcase from '../components/products/J-ProductShowcase.vue'
import StatCard from '../components/ui/J-StatCard.vue'
import type {
  CreateProductInput,
  Customer,
  Order,
  OrderStatus,
  Product,
  RouteKey,
  UpdateOrderStatusInput,
  UpdateProductInput,
} from '../types/system'

const props = defineProps<{
  section: RouteKey
  customers: Customer[]
  orders: Order[]
  products: Product[]
  adminDisplayName?: string
  createProduct: (payload: CreateProductInput) => Promise<Product>
  updateProduct: (payload: UpdateProductInput) => Promise<Product>
  deleteProduct: (productId: number) => Promise<void>
  updateOrderStatus: (payload: UpdateOrderStatusInput) => Promise<Order>
}>()

const latestCustomer = computed(() => props.customers[0]?.fullName ?? 'No customers yet')
const featuredProducts = computed(() => props.products.filter((product) => product.featured).length)
const totalStockUnits = computed(() =>
  props.products.reduce((total, product) => total + product.stock, 0),
)
const pendingOrders = computed(() =>
  props.orders.filter((order) => order.status === 'Pending' || order.status === 'Preparing').length,
)
const activeDeliveryOrders = computed(() =>
  props.orders.filter((order) => order.status === 'Ready for pickup' || order.status === 'On delivery')
    .length,
)

const pageTitle = computed(() => {
  if (props.section === 'admin-products') return 'Motorcycle list preview'
  if (props.section === 'admin-customers') return 'Recently registered customers'
  return 'Add a motorcycle to the catalog'
})

const pageHelper = computed(() => {
  if (props.section === 'admin-products') {
    return 'Review the live motorcycle catalog customers can browse.'
  }

  if (props.section === 'admin-customers') {
    return 'Review customer accounts created from the registration page.'
  }

  return 'Create a new motorcycle record and add it to the customer catalog.'
})

const updateStatus = async (orderId: number, status: OrderStatus) => {
  await props.updateOrderStatus({ orderId, status })
}
</script>

<template>
  <section class="admin-screen">
    <section class="hero-card">
      <div>
        <p class="eyebrow">Admin</p>
        <h2>{{ pageTitle }}</h2>
        <p v-if="adminDisplayName" class="admin-signature">
          Signed in as {{ adminDisplayName }}.
        </p>
      </div>
      <p class="hero-card__summary">{{ pageHelper }}</p>
    </section>

    <section v-if="section === 'admin-inventory'" class="stats-grid">
      <StatCard
        label="Catalog products"
        :value="String(products.length)"
        helper="Available motorcycles shown to customers in the product catalog."
      />
      <StatCard
        label="Total stock units"
        :value="String(totalStockUnits)"
        helper="Combined stock count across every motorcycle in the catalog."
      />
      <StatCard
        label="Featured motorcycles"
        :value="String(featuredProducts)"
        helper="Motorcycles marked as featured appear first in customer views."
      />
    </section>

    <section v-if="section === 'admin-inventory'" class="management-grid">
      <ProductCreationForm :submit-product="createProduct" />
    </section>

    <section v-else-if="section === 'admin-products'" class="inventory-preview">
      <div class="inventory-preview__header">
        <div>
          <p class="eyebrow">Catalog</p>
          <h2>Motorcycle list preview</h2>
        </div>
        <p>Everything saved here is available immediately to customers browsing the catalog.</p>
      </div>

      <ProductShowcase
        :products="products"
        editable
        :update-product="updateProduct"
        :delete-product="deleteProduct"
      />
    </section>

    <template v-else-if="section === 'admin-customers'">
      <section class="stats-grid">
        <StatCard
          label="Registered customers"
          :value="String(customers.length)"
          helper="Total customers currently stored in the system database."
        />
        <StatCard
          label="Saved orders"
          :value="String(orders.length)"
          helper="Orders submitted by customers and retained in SQLite through Prisma."
        />
        <StatCard
          label="Pending motorcycles"
          :value="String(pendingOrders)"
          helper="Orders still pending or being prepared."
        />
        <StatCard
          label="Active delivery"
          :value="String(activeDeliveryOrders)"
          helper="Orders ready for pickup or currently on delivery."
        />
      </section>

      <CustomerListPanel
        :customers="customers"
        :orders="orders"
        eyebrow="Customers"
        title="Recently registered customers"
        helper="Update motorcycle order status for each registered customer."
        empty-message="No customers registered yet. Use the registration page to add the first one."
        :limit="12"
        editable-status
        @update-order-status="updateStatus"
      />
    </template>
  </section>
</template>

<style scoped>
.admin-screen {
  display: grid;
  gap: 1rem;
}

.hero-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid rgba(94, 70, 47, 0.12);
  border-radius: 1.5rem;
  background: rgba(255, 252, 247, 0.92);
  padding: 1.4rem;
  box-shadow: 0 18px 40px rgba(73, 51, 27, 0.08);
}

.eyebrow {
  color: #a44d1e;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.hero-card h2 {
  margin-top: 0.25rem;
  color: #231b14;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(1.9rem, 4vw, 2.7rem);
}

.admin-signature {
  margin-top: 0.65rem;
  color: #2f6f53;
  font-weight: 700;
}

.hero-card__summary {
  max-width: 26rem;
  color: #6b5c4c;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.management-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
}

.inventory-preview {
  border: 1px solid rgba(94, 70, 47, 0.12);
  border-radius: 1.5rem;
  background: rgba(255, 252, 247, 0.92);
  padding: 1.4rem;
  box-shadow: 0 18px 40px rgba(73, 51, 27, 0.08);
}

.inventory-preview__header h2 {
  margin-top: 0.25rem;
  color: #231b14;
  font-family: Georgia, 'Times New Roman', serif;
}

.inventory-preview__header p {
  color: #6b5c4c;
}

.inventory-preview {
  display: grid;
  gap: 1rem;
}

.inventory-preview__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.inventory-preview__header p {
  max-width: 22rem;
  text-align: right;
}

@media (max-width: 960px) {
  .hero-card,
  .stats-grid,
  .management-grid,
  .inventory-preview__header {
    grid-template-columns: 1fr;
    display: grid;
  }

  .hero-card__summary,
  .inventory-preview__header p {
    max-width: none;
    text-align: left;
  }
}

@media (max-width: 760px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
