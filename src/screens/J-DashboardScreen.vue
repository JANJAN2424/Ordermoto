<script setup lang="ts">
import { computed } from 'vue'
import heroImage from '../assets/images/backgroundimg.jpg'
import StatCard from '../components/ui/J-StatCard.vue'
import type { Customer, Order, Product, RouteKey } from '../types/system'

const props = defineProps<{
  products: Product[]
  customers: Customer[]
  orders: Order[]
}>()

const emit = defineEmits<{
  navigate: [route: RouteKey]
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

const statIcons = {
  products:
    'M4 14.5c2.2-4.2 5.1-6.5 8.5-6.5 3.6 0 5.5 1.8 7.5 5m-12 0 1.7 3h5.8l2.5-5H21M7 16a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm15 0a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z',
  stock: 'M4 7h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Zm4-3h8v3H8V4Zm3 5v6m-3-3h6',
  customers:
    'M16 20v-1.4c0-2.4-1.9-4.3-4.3-4.3H7.3C4.9 14.3 3 16.2 3 18.6V20m13-12a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Zm5 12v-1c0-1.7-.8-3.1-2.2-3.9m-.8-6.8a3 3 0 0 1 0 5.8',
  revenue:
    'M12 3v18m4-13.5c0-1.9-1.8-3-4-3s-4 1.1-4 3 1.8 3 4 3 4 1.1 4 3-1.8 3-4 3-4-1.1-4-3',
}
</script>

<template>
  <section class="dashboard-screen">
    <section class="hero-card">
      <div class="hero-card__copy">
        <p class="eyebrow">Dashboard</p>
        <h2>
          Ordermoto
          <span>Motorcycle Ordering System</span>
        </h2>
        <p>
          Manage motorcycles, customers, and orders all in one place with a fast dashboard view.
        </p>

        <div class="hero-card__actions">
          <button
            type="button"
            class="hero-button hero-button--primary"
            @click="emit('navigate', 'about')"
          >
            View Products
          </button>
          <button
            type="button"
            class="hero-button hero-button--secondary"
            @click="emit('navigate', 'orders')"
          >
            Add Order
          </button>
        </div>
      </div>

      <div class="hero-card__art">
        <img :src="heroImage" alt="Motorcycle dashboard artwork" />
      </div>
    </section>

    <section class="stats-grid">
      <StatCard
        label="Available products"
        :value="String(products.length)"
        helper="Motorcycle models currently stored in the product catalog."
        tone="orange"
        :icon-path="statIcons.products"
      />
      <StatCard
        label="Units in stock"
        :value="String(totalUnits)"
        helper="Total on-hand stock ready for new customer orders."
        tone="green"
        :icon-path="statIcons.stock"
      />
      <StatCard
        label="Registered customers"
        :value="String(customers.length)"
        helper="Customers saved from the registration form."
        tone="blue"
        :icon-path="statIcons.customers"
      />
      <StatCard
        label="Order value"
        :value="formatCurrency(totalRevenue)"
        helper="Combined value of all orders currently stored in SQLite."
        tone="violet"
        :icon-path="statIcons.revenue"
      />
    </section>

    <section class="info-grid">
      <article class="info-card">
        <p class="eyebrow eyebrow--dark">System Flow</p>
        <h3>How to use the pages</h3>
        <div class="flow-list">
          <div class="flow-row">
            <span>1</span>
            <p>Open "Motorcycles" to review available products in the catalog.</p>
          </div>
          <div class="flow-row">
            <span>2</span>
            <p>Use "Registration" to add a customer to the system.</p>
          </div>
          <div class="flow-row">
            <span>3</span>
            <p>Go to "Orders" to attach products and save the order.</p>
          </div>
        </div>
      </article>

      <article class="info-card info-card--summary" :style="{ '--summary-image': `url(${heroImage})` }">
        <p class="eyebrow eyebrow--dark">Live Summary</p>
        <h3>Current business snapshot</h3>
        <div class="summary-metric">
          <strong>{{ featuredProducts }}</strong>
          <div>
            <span>Featured products</span>
            <small>Highlighted for quick selling</small>
          </div>
        </div>
        <div class="summary-metric summary-metric--soft">
          <strong>{{ latestOrder ? latestOrder.customerName : 'None yet' }}</strong>
          <div>
            <span>Latest order</span>
            <small>
              {{
                latestOrder
                  ? formatDate(latestOrder.createdAt)
                  : 'The first saved order will appear here.'
              }}
            </small>
          </div>
        </div>
      </article>
    </section>
  </section>
</template>

<style scoped>
.dashboard-screen {
  display: grid;
  gap: 1rem;
}

.hero-card {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 0.95fr);
  gap: 1rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 1.8rem;
  background:
    radial-gradient(circle at left center, rgba(255, 106, 0, 0.14), transparent 26%),
    linear-gradient(135deg, #101217 0%, #161921 52%, #0d0f14 100%);
  padding: 1.5rem;
  box-shadow: 0 28px 65px rgba(15, 17, 22, 0.22);
}

.eyebrow {
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.eyebrow--dark {
  color: #ff6a00;
}

.hero-card__copy {
  display: grid;
  align-content: center;
  gap: 1rem;
  padding: 0.45rem 0;
}

.hero-card h2 {
  color: #ffffff;
  font-size: clamp(2.2rem, 4vw, 3.45rem);
  font-weight: 800;
  line-height: 0.95;
  max-width: 11ch;
}

.hero-card h2 span {
  display: block;
  margin-top: 0.35rem;
  color: #ff6a00;
}

.hero-card__copy p:last-of-type {
  max-width: 30rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.02rem;
}

.hero-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.hero-button {
  min-width: 10.5rem;
  border-radius: 0.95rem;
  cursor: pointer;
  padding: 0.95rem 1.2rem;
  font-weight: 700;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.hero-button:hover {
  transform: translateY(-1px);
}

.hero-button--primary {
  border: none;
  background: linear-gradient(135deg, #ff7a1a, #ff5a00);
  color: #ffffff;
  box-shadow: 0 18px 30px rgba(255, 106, 0, 0.24);
}

.hero-button--secondary {
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.04);
  color: #ffffff;
}

.hero-card__art {
  position: relative;
  min-height: 280px;
  border-radius: 1.5rem;
  overflow: hidden;
}

.hero-card__art::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(16, 18, 23, 0.78) 0%, rgba(16, 18, 23, 0.12) 24%, transparent 46%),
    linear-gradient(180deg, rgba(16, 18, 23, 0.12), rgba(16, 18, 23, 0.3));
}

.hero-card__art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.stats-grid,
.info-grid {
  display: grid;
  gap: 1rem;
}

.stats-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.info-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.info-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(16, 24, 40, 0.08);
  border-radius: 1.6rem;
  background: rgba(255, 255, 255, 0.94);
  padding: 1.35rem;
  box-shadow: 0 18px 40px rgba(15, 17, 22, 0.05);
}

.info-card h3 {
  margin-top: 0.2rem;
  color: #141821;
  font-size: 1.28rem;
  font-weight: 800;
}

.flow-list {
  display: grid;
  gap: 0.95rem;
  margin-top: 1rem;
}

.flow-row {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
}

.flow-row span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.85rem;
  height: 1.85rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #ff7a1a, #ff5a00);
  color: #ffffff;
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
}

.flow-row p {
  color: #677080;
}

.info-card--summary::after {
  content: '';
  position: absolute;
  inset: auto -1.5rem -2rem auto;
  width: 240px;
  height: 240px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.88)),
    var(--summary-image) center / cover no-repeat;
  opacity: 0.26;
  filter: grayscale(1);
  pointer-events: none;
}

.summary-metric {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  padding: 0.95rem 1rem;
  border: 1px solid rgba(255, 106, 0, 0.12);
  border-radius: 1.15rem;
  background: rgba(255, 249, 244, 0.9);
}

.summary-metric--soft {
  border-color: rgba(34, 197, 94, 0.12);
  background: rgba(245, 251, 247, 0.94);
}

.summary-metric strong {
  color: #11151c;
  font-size: 1.5rem;
  font-weight: 800;
  min-width: 4.8rem;
}

.summary-metric span {
  display: block;
  color: #141821;
  font-weight: 700;
}

.summary-metric small {
  color: #758090;
}

@media (max-width: 1500px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 1280px) {
  .hero-card,
  .info-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 860px) {
  .hero-card,
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .hero-card__copy p:last-of-type {
    max-width: none;
  }
}
</style>
