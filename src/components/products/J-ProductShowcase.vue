<script setup lang="ts">
import type { Product } from '../../types/system'
import StatusBadge from '../ui/J-StatusBadge.vue'

defineProps<{
  products: Product[]
}>()

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const formatCurrency = (value: number) => currencyFormatter.format(value)

const stockTone = (stock: number) => {
  if (stock >= 4) return 'success'
  if (stock <= 1) return 'warning'
  return 'accent'
}

const stockLabel = (stock: number) => {
  if (stock === 0) return 'Out of stock'
  if (stock === 1) return '1 unit left'
  return `${stock} units available`
}
</script>

<template>
  <div class="product-grid">
    <article v-for="product in products" :key="product.id" class="product-card">
      <div class="product-card__top">
        <StatusBadge :label="product.featured ? 'Featured' : product.category" tone="info" />
        <StatusBadge :label="stockLabel(product.stock)" :tone="stockTone(product.stock)" />
      </div>

      <div class="product-card__body">
        <div>
          <p class="product-card__sku">{{ product.sku }}</p>
          <h3>{{ product.name }}</h3>
          <p>{{ product.description }}</p>
        </div>

        <div class="product-card__meta">
          <div>
            <span class="meta-label">Price</span>
            <strong>{{ formatCurrency(product.price) }}</strong>
          </div>
          <div>
            <span class="meta-label">Lead time</span>
            <strong>{{ product.leadTimeDays }} day<span v-if="product.leadTimeDays > 1">s</span></strong>
          </div>
        </div>
      </div>
    </article>
  </div>
</template>

<style scoped>
.product-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.product-card {
  border: 1px solid rgba(94, 70, 47, 0.12);
  border-radius: 1.3rem;
  background: rgba(255, 252, 247, 0.92);
  padding: 1.15rem;
  box-shadow: 0 18px 40px rgba(73, 51, 27, 0.08);
}

.product-card__top {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
}

.product-card__body {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.product-card__sku {
  color: #8d7f6f;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.product-card h3 {
  margin-top: 0.2rem;
  color: #231b14;
  font-size: 1.15rem;
}

.product-card p:last-child {
  margin-top: 0.35rem;
  color: #6b5c4c;
}

.product-card__meta {
  display: grid;
  gap: 0.75rem;
}

.meta-label {
  display: block;
  color: #8d7f6f;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.product-card__meta strong {
  color: #231b14;
}

@media (max-width: 860px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
}
</style>
