<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { Product, UpdateProductInput } from '../../types/system'
import {
  acceptedProductImageMimeTypes,
  formatProductImageSizeLimit,
  readProductImageFile,
  supportedProductImageLabel,
} from '../../utils/productImages'
import StatusBadge from '../ui/J-StatusBadge.vue'

const props = withDefaults(
  defineProps<{
    products: Product[]
    editable?: boolean
    updateProduct?: (payload: UpdateProductInput) => Promise<Product>
    deleteProduct?: (productId: number) => Promise<void>
  }>(),
  {
    editable: false,
  },
)

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
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

const uploadingProductId = ref<number | null>(null)
const deletingProductId = ref<number | null>(null)
const feedbackByProductId = reactive<Record<number, { message: string; tone: 'success' | 'error' }>>({})
const fileInputKeys = reactive<Record<number, number>>({})
const maxImageSizeLabel = formatProductImageSizeLimit()

const setFeedback = (productId: number, tone: 'success' | 'error', message: string) => {
  feedbackByProductId[productId] = { tone, message }
}

const resetFileInput = (productId: number) => {
  fileInputKeys[productId] = (fileInputKeys[productId] ?? 0) + 1
}

const getImageActionLabel = (product: Product) => {
  if (uploadingProductId.value === product.id) {
    return 'Updating image...'
  }

  return product.imageUrl ? 'Replace image' : 'Add image'
}

const isProductBusy = (productId: number) =>
  uploadingProductId.value === productId || deletingProductId.value === productId

const updateProductImage = async (product: Product, event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    resetFileInput(product.id)
    return
  }

  if (!props.updateProduct) {
    setFeedback(product.id, 'error', 'Image editing is not available right now.')
    resetFileInput(product.id)
    return
  }

  uploadingProductId.value = product.id

  try {
    const imageUrl = await readProductImageFile(file)
    const updatedProduct = await props.updateProduct({
      ...product,
      imageUrl,
    })
    setFeedback(product.id, 'success', `${updatedProduct.name} image updated.`)
  } catch (error) {
    setFeedback(
      product.id,
      'error',
      error instanceof Error ? error.message : 'Unable to update the motorcycle image.',
    )
  } finally {
    uploadingProductId.value = null
    resetFileInput(product.id)
  }
}

const removeProductImage = async (product: Product) => {
  if (!props.updateProduct) {
    setFeedback(product.id, 'error', 'Image editing is not available right now.')
    return
  }

  uploadingProductId.value = product.id

  try {
    const updatedProduct = await props.updateProduct({
      ...product,
      imageUrl: '',
    })
    setFeedback(product.id, 'success', `${updatedProduct.name} image removed.`)
  } catch (error) {
    setFeedback(
      product.id,
      'error',
      error instanceof Error ? error.message : 'Unable to remove the motorcycle image.',
    )
  } finally {
    uploadingProductId.value = null
  }
}

const deleteProductCard = async (product: Product) => {
  if (!props.deleteProduct) {
    setFeedback(product.id, 'error', 'Delete is not available right now.')
    return
  }

  const confirmed = window.confirm(
    `Delete ${product.name}? This cannot be undone, and motorcycles already used in saved orders cannot be deleted.`,
  )

  if (!confirmed) {
    return
  }

  deletingProductId.value = product.id

  try {
    await props.deleteProduct(product.id)
  } catch (error) {
    setFeedback(
      product.id,
      'error',
      error instanceof Error ? error.message : 'Unable to delete the motorcycle right now.',
    )
  } finally {
    deletingProductId.value = null
  }
}
</script>

<template>
  <div class="product-grid">
    <article v-for="product in props.products" :key="product.id" class="product-card">
      <div class="product-card__top">
        <StatusBadge :label="product.featured ? 'Featured' : product.category" tone="info" />
        <StatusBadge :label="stockLabel(product.stock)" :tone="stockTone(product.stock)" />
      </div>

      <div class="product-card__media">
        <img
          v-if="product.imageUrl"
          :src="product.imageUrl"
          :alt="`${product.name} photo`"
          loading="lazy"
        />
        <div v-else class="product-card__placeholder">
          <span>{{ product.category }}</span>
          <strong>{{ product.name }}</strong>
          <small>No image yet</small>
        </div>
      </div>

      <div class="product-card__body">
        <div>
          <p class="product-card__sku">{{ product.sku }}</p>
          <h3>{{ product.name }}</h3>
          <p class="product-card__description">{{ product.description }}</p>
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

      <div v-if="props.editable" class="product-card__actions">
        <label class="action-button action-button--upload" :class="{ 'is-disabled': isProductBusy(product.id) }">
          <input
            :key="fileInputKeys[product.id] ?? 0"
            type="file"
            :accept="acceptedProductImageMimeTypes"
            :disabled="isProductBusy(product.id)"
            @change="updateProductImage(product, $event)"
          />
          {{ getImageActionLabel(product) }}
        </label>

        <button
          v-if="product.imageUrl"
          type="button"
          class="action-button action-button--secondary"
          :disabled="isProductBusy(product.id)"
          @click="removeProductImage(product)"
        >
          Remove image
        </button>

        <button
          type="button"
          class="action-button action-button--danger"
          :disabled="isProductBusy(product.id)"
          @click="deleteProductCard(product)"
        >
          {{ deletingProductId === product.id ? 'Deleting...' : 'Delete motorcycle' }}
        </button>
      </div>

      <p v-if="props.editable" class="product-card__hint">
        {{ supportedProductImageLabel }} up to {{ maxImageSizeLabel }}. Uploaded files are stored in Supabase Storage.
      </p>

      <p
        v-if="feedbackByProductId[product.id]"
        class="feedback"
        :class="
          feedbackByProductId[product.id]?.tone === 'success'
            ? 'feedback--success'
            : 'feedback--error'
        "
      >
        {{ feedbackByProductId[product.id]?.message }}
      </p>
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

.product-card__media {
  margin-top: 1rem;
  overflow: hidden;
  border-radius: 1.1rem;
  background:
    linear-gradient(135deg, rgba(255, 126, 49, 0.14), rgba(255, 241, 225, 0.9));
  aspect-ratio: 16 / 10;
}

.product-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-card__placeholder {
  display: grid;
  align-content: center;
  justify-items: start;
  gap: 0.35rem;
  height: 100%;
  padding: 1.2rem;
  color: #4b3b2e;
}

.product-card__placeholder span,
.meta-label {
  display: block;
  color: #8d7f6f;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.product-card__placeholder strong {
  color: #231b14;
  font-size: 1.15rem;
}

.product-card__placeholder small {
  color: #6b5c4c;
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

.product-card__description {
  margin-top: 0.35rem;
  color: #6b5c4c;
}

.product-card__meta {
  display: grid;
  gap: 0.75rem;
}

.product-card__meta strong {
  color: #231b14;
}

.product-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(94, 70, 47, 0.16);
  border-radius: 999px;
  background: #fff;
  color: #3d2f22;
  cursor: pointer;
  padding: 0.82rem 1rem;
  font-weight: 700;
}

.action-button input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.action-button--upload {
  position: relative;
  background: linear-gradient(135deg, #f7ede1, #fff8f1);
}

.action-button--secondary:disabled,
.action-button.is-disabled {
  cursor: progress;
  opacity: 0.7;
}

.action-button--danger {
  border-color: rgba(143, 61, 20, 0.24);
  background: linear-gradient(135deg, #fff3ec, #ffe6d8);
  color: #8f3d14;
}

.product-card__hint {
  margin-top: 0.8rem;
  color: #7b6c5d;
  font-size: 0.88rem;
}

.feedback {
  margin-top: 0.85rem;
  border-radius: 0.95rem;
  padding: 0.8rem 0.95rem;
  font-weight: 700;
}

.feedback--success {
  background: rgba(47, 111, 83, 0.12);
  color: #2f6f53;
}

.feedback--error {
  background: rgba(168, 68, 31, 0.12);
  color: #8f3d14;
}

@media (max-width: 860px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
}
</style>
