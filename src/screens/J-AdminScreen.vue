<script setup lang="ts">
import { computed } from 'vue'
import CustomerListPanel from '../components/customers/J-CustomerListPanel.vue'
import ProductCreationForm from '../components/forms/J-ProductCreationForm.vue'
import ProductShowcase from '../components/products/J-ProductShowcase.vue'
import StatCard from '../components/ui/J-StatCard.vue'
import type { CreateProductInput, Customer, Order, Product } from '../types/system'

const props = defineProps<{
  customers: Customer[]
  orders: Order[]
  products: Product[]
  adminDisplayName?: string
  createProduct: (payload: CreateProductInput) => Promise<Product>
}>()

const latestCustomer = computed(() => props.customers[0]?.fullName ?? 'No customers yet')
const featuredProducts = computed(() => props.products.filter((product) => product.featured).length)
const totalStockUnits = computed(() =>
  props.products.reduce((total, product) => total + product.stock, 0),
)
</script>

<template>
  <section class="admin-screen">
    <section class="hero-card">
      <div>
        <p class="eyebrow">Admin</p>
        <h2>Admin page for system monitoring and customer oversight.</h2>
        <p v-if="adminDisplayName" class="admin-signature">
          Signed in as {{ adminDisplayName }}.
        </p>
      </div>
      <p class="hero-card__summary">
        Review recent registrations, monitor how many orders are saved, and keep an eye on
        active inventory from one admin view.
      </p>
    </section>

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
        label="Catalog products"
        :value="String(products.length)"
        helper="Available motorcycles shown to customers in the product catalog."
      />
      <StatCard
        label="Latest customer"
        :value="latestCustomer"
        helper="Most recently registered customer shown at the top of the admin list."
      />
    </section>

    <section class="management-grid">
      <ProductCreationForm :submit-product="createProduct" />

      <article class="inventory-summary-card">
        <div>
          <p class="eyebrow">Overview</p>
          <h3>Catalog management at a glance</h3>
        </div>
        <p>
          Add a motorcycle, then confirm how it appears below. Customers will see the same live
          product list on the About and Orders pages.
        </p>

        <div class="inventory-summary-card__metrics">
          <div class="metric-row">
            <span>Total stock units</span>
            <strong>{{ totalStockUnits }}</strong>
          </div>
          <div class="metric-row">
            <span>Featured motorcycles</span>
            <strong>{{ featuredProducts }}</strong>
          </div>
          <div class="metric-row">
            <span>Catalog sorting</span>
            <strong>Featured first</strong>
          </div>
        </div>
      </article>
    </section>

    <section class="inventory-preview">
      <div class="inventory-preview__header">
        <div>
          <p class="eyebrow">Catalog</p>
          <h2>Motorcycle list preview</h2>
        </div>
        <p>Everything saved here is available immediately to customers browsing the catalog.</p>
      </div>

      <ProductShowcase :products="products" />
    </section>

    <CustomerListPanel
      :customers="customers"
      eyebrow="Customers"
      title="Recently registered customers"
      helper="Newly saved customers appear here immediately after registration."
      empty-message="No customers registered yet. Use the registration page to add the first one."
      :limit="6"
    />
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
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
  gap: 1rem;
}

.inventory-summary-card,
.inventory-preview {
  border: 1px solid rgba(94, 70, 47, 0.12);
  border-radius: 1.5rem;
  background: rgba(255, 252, 247, 0.92);
  padding: 1.4rem;
  box-shadow: 0 18px 40px rgba(73, 51, 27, 0.08);
}

.inventory-summary-card {
  display: grid;
  align-content: start;
  gap: 1rem;
}

.inventory-summary-card h3,
.inventory-preview__header h2 {
  margin-top: 0.25rem;
  color: #231b14;
  font-family: Georgia, 'Times New Roman', serif;
}

.inventory-summary-card p,
.inventory-preview__header p {
  color: #6b5c4c;
}

.inventory-summary-card__metrics {
  display: grid;
  gap: 0.75rem;
}

.metric-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid rgba(94, 70, 47, 0.12);
  border-radius: 1rem;
  background: #fff;
  padding: 0.9rem 1rem;
}

.metric-row span {
  color: #6b5c4c;
}

.metric-row strong {
  color: #231b14;
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
