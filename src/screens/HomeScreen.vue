<script setup lang="ts">
import { computed } from 'vue'
import StatCard from '../components/ui/StatCard.vue'
import type { Customer, Order, Product } from '../types/system'

const props = defineProps<{
  products: Product[]
  customers: Customer[]
  orders: Order[]
}>()

const totalUnits = computed(() =>
  props.products.reduce((total, product) => total + product.stock, 0),
)

const totalRevenue = computed(() =>
  props.orders.reduce((total, order) => total + order.total, 0),
)

const featuredProducts = computed(() =>
  props.products.filter((product) => product.featured).length,
)

const latestOrder = computed(() => props.orders[0] ?? null)

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const formatCurrency = (value: number) => currencyFormatter.format(value)
const formatDate = (value: string) => dateFormatter.format(new Date(value))
</script>

<template>
  <section class="home-screen">
    <section class="hero-card">
      <div>
        <p class="eyebrow">Homepage</p>
        <h2>Welcome to the Ordermoto motorcycle ordering system.</h2>
      </div>
      <p>
        Use this system to review product availability, register customers, and track the
        motorcycles each customer has added to their order.
      </p>
    </section>

    <section class="stats-grid">
      <StatCard
        label="Available products"
        :value="String(products.length)"
        helper="Motorcycle models currently stored in the product catalog."
      />
      <StatCard
        label="Units in stock"
        :value="String(totalUnits)"
        helper="Total on-hand stock ready for new customer orders."
      />
      <StatCard
        label="Registered customers"
        :value="String(customers.length)"
        helper="Customers saved from the registration form."
      />
      <StatCard
        label="Order value"
        :value="formatCurrency(totalRevenue)"
        helper="Combined value of all orders currently stored in SQLite."
      />
    </section>

    <section class="info-grid">
      <article class="info-card">
        <p class="eyebrow">System flow</p>
        <h3>How to use the pages</h3>
        <ol>
          <li>Open `About` to see the available motorcycle products.</li>
          <li>Use `Registration` to add a customer into the system.</li>
          <li>Go to `Orders` to attach products to that customer and save the order.</li>
        </ol>
      </article>

      <article class="info-card">
        <p class="eyebrow">Live summary</p>
        <h3>Current business snapshot</h3>
        <p>{{ featuredProducts }} featured products are highlighted for quick selling.</p>
        <p v-if="latestOrder">
          Latest order: {{ latestOrder.customerName }} on {{ formatDate(latestOrder.createdAt) }}.
        </p>
        <p v-else>No saved orders yet. The first customer order will appear here.</p>
      </article>
    </section>
  </section>
</template>

<style scoped>
.home-screen {
  display: grid;
  gap: 1rem;
}

.hero-card,
.info-card {
  border: 1px solid rgba(94, 70, 47, 0.12);
  border-radius: 1.5rem;
  background: rgba(255, 252, 247, 0.92);
  padding: 1.4rem;
  box-shadow: 0 18px 40px rgba(73, 51, 27, 0.08);
}

.hero-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.eyebrow {
  color: #a44d1e;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.hero-card h2,
.info-card h3 {
  margin-top: 0.25rem;
  color: #231b14;
  font-family: Georgia, 'Times New Roman', serif;
}

.hero-card h2 {
  font-size: clamp(1.9rem, 4vw, 2.8rem);
}

.hero-card p:last-child,
.info-card p,
.info-card li {
  color: #6b5c4c;
}

.hero-card p:last-child {
  max-width: 25rem;
}

.stats-grid,
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.info-card ol {
  margin: 0.9rem 0 0;
  padding-left: 1.2rem;
}

.info-card p + p {
  margin-top: 0.6rem;
}

@media (max-width: 860px) {
  .hero-card,
  .stats-grid,
  .info-grid {
    grid-template-columns: 1fr;
    display: grid;
  }

  .hero-card p:last-child {
    max-width: none;
  }
}
</style>
