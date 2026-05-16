<script setup lang="ts">
import type { Order } from '../../types/system'
import StatusBadge from '../ui/StatusBadge.vue'

defineProps<{
  orders: Order[]
}>()

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
  <section class="panel">
    <div class="panel__header">
      <div>
        <p class="eyebrow">Saved orders</p>
        <h2>Products added by customers</h2>
      </div>
      <p>Every saved order below comes from the SQLite order history.</p>
    </div>

    <div v-if="orders.length === 0" class="empty-state">
      No orders yet. Register a customer and save their first product order.
    </div>

    <article v-for="order in orders" :key="order.id" class="order-card">
      <div class="order-card__top">
        <div>
          <p class="order-card__id">Order #{{ order.id }}</p>
          <h3>{{ order.customerName }}</h3>
          <p>{{ formatDate(order.createdAt) }}</p>
        </div>

        <div class="order-card__meta">
          <StatusBadge :label="order.deliveryMethod" tone="accent" />
          <strong>{{ formatCurrency(order.total) }}</strong>
        </div>
      </div>

      <p v-if="order.note" class="order-card__note">{{ order.note }}</p>

      <ul class="order-card__items">
        <li v-for="item in order.items" :key="`${order.id}-${item.productId}`">
          <span>{{ item.productName }} × {{ item.quantity }}</span>
          <strong>{{ formatCurrency(item.lineTotal) }}</strong>
        </li>
      </ul>
    </article>
  </section>
</template>

<style scoped>
.panel {
  border: 1px solid rgba(94, 70, 47, 0.12);
  border-radius: 1.5rem;
  background: rgba(255, 252, 247, 0.92);
  padding: 1.4rem;
  box-shadow: 0 18px 40px rgba(73, 51, 27, 0.08);
}

.panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.eyebrow {
  color: #a44d1e;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.panel__header h2 {
  margin-top: 0.25rem;
  color: #231b14;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.45rem;
}

.panel__header p:last-child {
  max-width: 18rem;
  color: #6b5c4c;
  text-align: right;
}

.empty-state {
  border: 1px dashed rgba(94, 70, 47, 0.25);
  border-radius: 1rem;
  color: #6b5c4c;
  padding: 1rem;
  text-align: center;
}

.order-card {
  border: 1px solid rgba(94, 70, 47, 0.12);
  border-radius: 1.2rem;
  background: #fff;
  padding: 1rem;
}

.order-card + .order-card {
  margin-top: 0.85rem;
}

.order-card__top {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.order-card__id {
  color: #8d7f6f;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.order-card h3 {
  color: #231b14;
  font-size: 1.05rem;
}

.order-card__top p:last-child,
.order-card__note {
  color: #6b5c4c;
}

.order-card__meta {
  display: grid;
  justify-items: end;
  gap: 0.55rem;
}

.order-card__meta strong {
  color: #231b14;
}

.order-card__note {
  margin-top: 0.8rem;
  font-style: italic;
}

.order-card__items {
  margin: 0.85rem 0 0;
  padding: 0;
  list-style: none;
}

.order-card__items li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  border-top: 1px solid rgba(94, 70, 47, 0.08);
  padding-top: 0.7rem;
}

.order-card__items li + li {
  margin-top: 0.7rem;
}

@media (max-width: 760px) {
  .panel__header,
  .order-card__top {
    display: grid;
  }

  .panel__header p:last-child {
    max-width: none;
    text-align: left;
  }

  .order-card__meta {
    justify-items: start;
  }
}
</style>
