<script setup lang="ts">
import { computed } from 'vue'
import type { Customer, Order, OrderStatus } from '../../types/system'

const props = withDefaults(
  defineProps<{
    customers: Customer[]
    orders?: Order[]
    eyebrow?: string
    title?: string
    helper?: string
    emptyMessage?: string
    limit?: number
    editableStatus?: boolean
  }>(),
  {
    eyebrow: 'Customers',
    title: 'Recently registered customers',
    helper: 'Newly saved customers appear here immediately after registration.',
    emptyMessage: 'No customers registered yet.',
    orders: () => [],
    editableStatus: false,
  },
)

const emit = defineEmits<{
  updateOrderStatus: [orderId: number, status: OrderStatus]
}>()

const visibleCustomers = computed(() =>
  typeof props.limit === 'number' ? props.customers.slice(0, props.limit) : props.customers,
)

const orderStatusOptions: OrderStatus[] = [
  'Pending',
  'Preparing',
  'Ready for pickup',
  'On delivery',
  'Delivered',
  'Cancelled',
]

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const formatDate = (value: string) => dateFormatter.format(new Date(value))

const getCustomerOrders = (customerId: number) =>
  props.orders.filter((order) => order.customerId === customerId)

const handleStatusChange = (orderId: number, event: Event) => {
  const status = (event.target as HTMLSelectElement).value as OrderStatus
  emit('updateOrderStatus', orderId, status)
}
</script>

<template>
  <section class="customer-list">
    <div class="customer-list__header">
      <div>
        <p class="eyebrow">{{ eyebrow }}</p>
        <h2>{{ title }}</h2>
      </div>
      <p>{{ helper }}</p>
    </div>

    <div v-if="visibleCustomers.length === 0" class="empty-state">
      {{ emptyMessage }}
    </div>

    <article v-for="customer in visibleCustomers" :key="customer.id" class="customer-card">
      <div class="customer-card__top">
        <div>
          <h3>{{ customer.fullName }}</h3>
          <p>{{ customer.email }}</p>
          <p>{{ customer.phone }}</p>
        </div>

        <div class="customer-card__meta">
          <span>{{ customer.address }}</span>
          <small>{{ formatDate(customer.registeredAt) }}</small>
        </div>
      </div>

      <div v-if="orders.length > 0" class="customer-orders">
        <div v-if="getCustomerOrders(customer.id).length === 0" class="customer-orders__empty">
          No motorcycle orders yet.
        </div>

        <article
          v-for="order in getCustomerOrders(customer.id)"
          :key="order.id"
          class="customer-order"
        >
          <div>
            <strong>Order #{{ order.id }}</strong>
            <span>{{ order.deliveryMethod }} · {{ formatDate(order.createdAt) }}</span>
            <small>
              {{ order.items.map((item) => `${item.productName} x ${item.quantity}`).join(', ') }}
            </small>
          </div>

          <label class="status-control">
            <span>Motorcycle status</span>
            <select
              :value="order.status"
              :disabled="!editableStatus"
              @change="handleStatusChange(order.id, $event)"
            >
              <option v-for="status in orderStatusOptions" :key="status" :value="status">
                {{ status }}
              </option>
            </select>
          </label>
        </article>
      </div>
    </article>
  </section>
</template>

<style scoped>
.customer-list {
  border: 1px solid rgba(94, 70, 47, 0.12);
  border-radius: 1.5rem;
  background: rgba(255, 252, 247, 0.92);
  padding: 1.4rem;
  box-shadow: 0 18px 40px rgba(73, 51, 27, 0.08);
}

.customer-list__header {
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

.customer-list__header h2 {
  margin-top: 0.25rem;
  color: #231b14;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.45rem;
}

.customer-list__header p:last-child {
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

.customer-card {
  display: grid;
  gap: 1rem;
  border: 1px solid rgba(94, 70, 47, 0.12);
  border-radius: 1.2rem;
  background: #fff;
  padding: 1rem;
}

.customer-card + .customer-card {
  margin-top: 0.85rem;
}

.customer-card__top {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.customer-card h3 {
  color: #231b14;
  font-size: 1.05rem;
}

.customer-card p,
.customer-card span,
.customer-card small {
  color: #6b5c4c;
}

.customer-card__meta {
  display: grid;
  justify-items: end;
  gap: 0.45rem;
  max-width: 20rem;
  text-align: right;
}

.customer-orders {
  display: grid;
  gap: 0.7rem;
  border-top: 1px solid rgba(94, 70, 47, 0.1);
  padding-top: 0.85rem;
}

.customer-orders__empty {
  color: #8d7f6f;
  font-size: 0.9rem;
  font-weight: 700;
}

.customer-order {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid rgba(94, 70, 47, 0.1);
  border-radius: 0.95rem;
  background: rgba(255, 252, 247, 0.78);
  padding: 0.85rem;
}

.customer-order div,
.status-control {
  display: grid;
  gap: 0.25rem;
}

.customer-order strong {
  color: #231b14;
}

.customer-order span,
.customer-order small,
.status-control span {
  color: #6b5c4c;
}

.status-control {
  min-width: min(15rem, 100%);
  font-weight: 700;
}

.status-control select {
  border: 1px solid rgba(94, 70, 47, 0.16);
  border-radius: 0.85rem;
  background: #ffffff;
  color: #231b14;
  padding: 0.7rem 0.8rem;
  font: inherit;
}

@media (max-width: 760px) {
  .customer-list__header,
  .customer-card__top,
  .customer-order {
    display: grid;
  }

  .customer-list__header p:last-child,
  .customer-card__meta {
    max-width: none;
    text-align: left;
    justify-items: start;
  }
}
</style>
