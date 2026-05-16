<script setup lang="ts">
import { computed } from 'vue'
import type { Customer } from '../../types/system'

const props = withDefaults(
  defineProps<{
    customers: Customer[]
    eyebrow?: string
    title?: string
    helper?: string
    emptyMessage?: string
    limit?: number
  }>(),
  {
    eyebrow: 'Customers',
    title: 'Recently registered customers',
    helper: 'Newly saved customers appear here immediately after registration.',
    emptyMessage: 'No customers registered yet.',
  },
)

const visibleCustomers = computed(() =>
  typeof props.limit === 'number' ? props.customers.slice(0, props.limit) : props.customers,
)

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const formatDate = (value: string) => dateFormatter.format(new Date(value))
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
      <div>
        <h3>{{ customer.fullName }}</h3>
        <p>{{ customer.email }}</p>
        <p>{{ customer.phone }}</p>
      </div>

      <div class="customer-card__meta">
        <span>{{ customer.address }}</span>
        <small>{{ formatDate(customer.registeredAt) }}</small>
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
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid rgba(94, 70, 47, 0.12);
  border-radius: 1.2rem;
  background: #fff;
  padding: 1rem;
}

.customer-card + .customer-card {
  margin-top: 0.85rem;
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

@media (max-width: 760px) {
  .customer-list__header,
  .customer-card {
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
