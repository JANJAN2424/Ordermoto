<script setup lang="ts">
import type { DeliveryMethod } from '../../types/system'

defineProps<{
  customerName: string
  deliveryMethod: DeliveryMethod
  note: string
  items: Array<{
    productId: number
    productName: string
    quantity: number
    lineTotal: number
  }>
  total: number
  canSubmit: boolean
  submitting: boolean
}>()

defineEmits<{
  submit: []
}>()

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
})

const formatCurrency = (value: number) => currencyFormatter.format(value)
</script>

<template>
  <aside class="summary-panel">
    <div class="summary-panel__header">
      <p class="eyebrow">Current order</p>
      <h2>{{ customerName || 'Select a customer' }}</h2>
      <p>{{ deliveryMethod }} <span v-if="note">• {{ note }}</span></p>
    </div>

    <div class="summary-panel__list">
      <article v-for="item in items" :key="item.productId" class="summary-item">
        <div>
          <h3>{{ item.productName }}</h3>
          <p>{{ item.quantity }} unit<span v-if="item.quantity > 1">s</span></p>
        </div>
        <strong>{{ formatCurrency(item.lineTotal) }}</strong>
      </article>

      <div v-if="items.length === 0" class="summary-panel__empty">
        Add motorcycles from the list to prepare an order preview.
      </div>
    </div>

    <div class="summary-total">
      <span>Total</span>
      <strong>{{ formatCurrency(total) }}</strong>
    </div>

    <button type="button" class="summary-panel__cta" :disabled="!canSubmit || submitting" @click="$emit('submit')">
      {{ submitting ? 'Saving order...' : 'Save order' }}
    </button>
  </aside>
</template>

<style scoped>
.summary-panel {
  position: sticky;
  top: 1.5rem;
  border: 1px solid rgba(94, 70, 47, 0.12);
  border-radius: 1.5rem;
  background:
    linear-gradient(180deg, rgba(255, 248, 239, 0.98), rgba(250, 237, 221, 0.96));
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

.summary-panel__header h2 {
  margin-top: 0.3rem;
  color: #231b14;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.8rem;
}

.summary-panel__header p:last-child {
  margin-top: 0.5rem;
  color: #6b5c4c;
}

.summary-panel__list {
  display: grid;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.7);
  padding: 0.95rem;
}

.summary-item h3 {
  color: #231b14;
  font-size: 1rem;
}

.summary-item p {
  color: #6b5c4c;
  font-size: 0.92rem;
}

.summary-item strong {
  color: #231b14;
}

.summary-panel__empty {
  border: 1px dashed rgba(94, 70, 47, 0.25);
  border-radius: 1rem;
  color: #6b5c4c;
  padding: 1rem;
  text-align: center;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.25rem;
  border-top: 1px solid rgba(94, 70, 47, 0.12);
  padding-top: 0.9rem;
  color: #231b14;
}

.summary-total strong {
  font-size: 1.2rem;
}

.summary-panel__cta {
  width: 100%;
  margin-top: 1.25rem;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #ca6b2c, #8f3d14);
  color: #fff8f2;
  cursor: pointer;
  padding: 0.95rem 1.15rem;
  font-size: 1rem;
  font-weight: 700;
}

.summary-panel__cta:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

@media (max-width: 960px) {
  .summary-panel {
    position: static;
  }
}
</style>
