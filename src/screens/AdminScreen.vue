<script setup lang="ts">
import CustomerListPanel from '../components/customers/CustomerListPanel.vue'
import StatCard from '../components/ui/StatCard.vue'
import type { Customer, Order, Product } from '../types/system'

const props = defineProps<{
  customers: Customer[]
  orders: Order[]
  products: Product[]
  adminDisplayName?: string
}>()

const latestCustomer = () => props.customers[0]?.fullName ?? 'No customers yet'
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
        :value="latestCustomer()"
        helper="Most recently registered customer shown at the top of the admin list."
      />
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

@media (max-width: 960px) {
  .hero-card,
  .stats-grid {
    grid-template-columns: 1fr;
    display: grid;
  }

  .hero-card__summary {
    max-width: none;
  }
}

@media (max-width: 760px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
