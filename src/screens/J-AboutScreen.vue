<script setup lang="ts">
import ProductShowcase from '../components/products/J-ProductShowcase.vue'
import type { Product } from '../types/system'

defineProps<{
  products: Product[]
}>()
</script>

<template>
  <section class="about-screen">
    <header class="page-header">
      <div>
        <p class="eyebrow">About</p>
        <h2>Available motorcycle products</h2>
      </div>
      <p>
        This page shows the motorcycles currently available in the system, including photos,
        price, stock, and lead time information.
      </p>
    </header>

    <ProductShowcase :products="products" />
  </section>
</template>

<style scoped>
.about-screen {
  display: grid;
  gap: 1rem;
}

.page-header {
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

.page-header h2 {
  margin-top: 0.25rem;
  color: #231b14;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(1.9rem, 4vw, 2.5rem);
}

.page-header p:last-child {
  max-width: 26rem;
  color: #6b5c4c;
}

@media (max-width: 860px) {
  .page-header {
    grid-template-columns: 1fr;
    display: grid;
  }

  .page-header p:last-child {
    max-width: none;
  }
}
</style>
