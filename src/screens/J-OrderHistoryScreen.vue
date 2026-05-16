<script setup lang="ts">
import OrdersHistory from '../components/orders/J-OrdersHistory.vue'
import type { Order } from '../types/system'

defineProps<{
  orders: Order[]
  activeCustomerName: string
}>()
</script>

<template>
  <section class="order-history-screen">
    <section class="history-hero">
      <div>
        <p class="eyebrow">Saved orders</p>
        <h2>Motorcycle order status</h2>
      </div>
      <p>
        {{ activeCustomerName || 'Customer' }} can track each saved motorcycle order from pending
        through delivery.
      </p>
    </section>

    <OrdersHistory
      :orders="orders"
      title="Your motorcycle order status"
      helper="Track whether your motorcycle is pending, preparing, ready for pickup, on delivery, delivered, or cancelled."
    />
  </section>
</template>

<style scoped>
.order-history-screen {
  display: grid;
  gap: 1rem;
}

.history-hero {
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

.history-hero h2 {
  margin-top: 0.25rem;
  color: #231b14;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(1.8rem, 4vw, 2.4rem);
}

.history-hero p {
  max-width: 28rem;
  color: #6b5c4c;
  text-align: right;
}

@media (max-width: 760px) {
  .history-hero {
    display: grid;
  }

  .history-hero p {
    max-width: none;
    text-align: left;
  }
}
</style>
