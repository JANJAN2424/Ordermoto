<script setup lang="ts">
import type { Product } from '../../types/system'
import StatusBadge from '../ui/J-StatusBadge.vue'

defineProps<{
  products: Product[]
  quantities: Record<number, number>
}>()

const emit = defineEmits<{
  increase: [productId: number]
  decrease: [productId: number]
}>()

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const formatCurrency = (value: number) => currencyFormatter.format(value)
</script>

<template>
  <section class="panel">
    <div class="panel__header">
      <div>
        <p class="eyebrow">Products</p>
        <h2>Choose motorcycles for the customer order</h2>
      </div>
      <p>Add quantities from the available stock saved in SQLite.</p>
    </div>

    <article v-for="product in products" :key="product.id" class="item-card">
      <div class="item-card__top">
        <div>
          <p class="item-card__sku">{{ product.sku }}</p>
          <h3>{{ product.name }}</h3>
          <p>{{ product.description }}</p>
        </div>

        <StatusBadge :label="product.category" tone="info" />
      </div>

      <div class="item-card__bottom">
        <div class="item-card__meta">
          <span>{{ formatCurrency(product.price) }}</span>
          <small>{{ product.stock }} in stock • {{ product.leadTimeDays }} day lead time</small>
        </div>

        <div class="stepper">
          <button type="button" :disabled="(quantities[product.id] ?? 0) === 0" @click="emit('decrease', product.id)">
            -
          </button>
          <span>{{ quantities[product.id] ?? 0 }}</span>
          <button
            type="button"
            :disabled="(quantities[product.id] ?? 0) >= product.stock"
            @click="emit('increase', product.id)"
          >
            +
          </button>
        </div>
      </div>
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

.item-card {
  border: 1px solid rgba(94, 70, 47, 0.12);
  border-radius: 1.2rem;
  background: #fff;
  padding: 1rem;
}

.item-card + .item-card {
  margin-top: 0.85rem;
}

.item-card__top {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.item-card__sku {
  color: #8d7f6f;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.item-card h3 {
  color: #231b14;
  font-size: 1.1rem;
}

.item-card__top p:last-child {
  margin-top: 0.35rem;
  color: #6b5c4c;
}

.item-card__bottom {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  margin-top: 1rem;
}

.item-card__meta span {
  display: block;
  color: #231b14;
  font-weight: 700;
}

.item-card__meta small {
  color: #6b5c4c;
}

.stepper {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  border-radius: 999px;
  background: #f5ede2;
  padding: 0.3rem;
}

.stepper button {
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 999px;
  background: #fff;
  color: #3d2f22;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 700;
}

.stepper button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.stepper span {
  min-width: 1.3rem;
  color: #231b14;
  text-align: center;
  font-weight: 700;
}

@media (max-width: 760px) {
  .panel__header,
  .item-card__top,
  .item-card__bottom {
    display: grid;
  }

  .panel__header p:last-child {
    max-width: none;
    text-align: left;
  }
}
</style>
