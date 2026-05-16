<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { CreateProductInput, Product } from '../../types/system'

const props = defineProps<{
  submitProduct: (payload: CreateProductInput) => Promise<Product>
}>()

const form = reactive({
  sku: '',
  name: '',
  category: '',
  description: '',
  price: '',
  stock: '',
  leadTimeDays: '1',
  featured: false,
})

const submitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const resetForm = () => {
  form.sku = ''
  form.name = ''
  form.category = ''
  form.description = ''
  form.price = ''
  form.stock = ''
  form.leadTimeDays = '1'
  form.featured = false
}

const handleSubmit = async () => {
  submitting.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const product = await props.submitProduct({
      sku: form.sku,
      name: form.name,
      category: form.category,
      description: form.description,
      price: Number(form.price),
      stock: Number(form.stock),
      leadTimeDays: Number(form.leadTimeDays),
      featured: form.featured,
    })
    successMessage.value = `${product.name} has been added to the motorcycle list.`
    resetForm()
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Unable to save the motorcycle right now.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form class="form-card" @submit.prevent="handleSubmit">
    <div class="form-card__header">
      <div>
        <p class="eyebrow">Inventory</p>
        <h2>Add a motorcycle to the catalog</h2>
      </div>
      <p>New motorcycles appear immediately in the customer catalog and order builder.</p>
    </div>

    <div class="form-grid">
      <label>
        SKU
        <input v-model="form.sku" type="text" placeholder="HON-ROAD-200" required />
      </label>

      <label>
        Motorcycle name
        <input v-model="form.name" type="text" placeholder="Honda Roadster 200" required />
      </label>

      <label>
        Category
        <input v-model="form.category" type="text" placeholder="Street commuter" required />
      </label>

      <label>
        Price (USD)
        <input
          v-model="form.price"
          type="number"
          min="1"
          step="1"
          placeholder="4200"
          required
        />
      </label>

      <label>
        Stock units
        <input
          v-model="form.stock"
          type="number"
          min="0"
          step="1"
          placeholder="4"
          required
        />
      </label>

      <label>
        Lead time (days)
        <input v-model="form.leadTimeDays" type="number" min="1" step="1" required />
      </label>

      <label class="form-grid__wide">
        Description
        <textarea
          v-model="form.description"
          rows="4"
          placeholder="Short summary of the motorcycle, riding style, and key strengths."
          required
        />
      </label>

      <label class="toggle-row form-grid__wide">
        <input v-model="form.featured" type="checkbox" />
        <span>Mark this motorcycle as featured in the list.</span>
      </label>
    </div>

    <p class="form-note">SKUs are stored in uppercase, and spaces are converted into hyphens.</p>

    <p v-if="successMessage" class="feedback feedback--success">{{ successMessage }}</p>
    <p v-if="errorMessage" class="feedback feedback--error">{{ errorMessage }}</p>

    <button class="submit-button" type="submit" :disabled="submitting">
      {{ submitting ? 'Saving motorcycle...' : 'Add motorcycle' }}
    </button>
  </form>
</template>

<style scoped>
.form-card {
  border: 1px solid rgba(94, 70, 47, 0.12);
  border-radius: 1.5rem;
  background: rgba(255, 252, 247, 0.92);
  padding: 1.4rem;
  box-shadow: 0 18px 40px rgba(73, 51, 27, 0.08);
}

.form-card__header {
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

.form-card__header h2 {
  margin-top: 0.25rem;
  color: #231b14;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.45rem;
}

.form-card__header p:last-child,
.form-note {
  color: #6b5c4c;
}

.form-card__header p:last-child {
  max-width: 18rem;
  text-align: right;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.form-grid label {
  display: grid;
  gap: 0.45rem;
  color: #4b3b2e;
  font-weight: 700;
}

.form-grid input:not([type='checkbox']),
.form-grid textarea {
  width: 100%;
  border: 1px solid rgba(94, 70, 47, 0.14);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.85);
  color: #231b14;
  padding: 0.9rem 1rem;
  resize: vertical;
}

.form-grid__wide {
  grid-column: 1 / -1;
}

.toggle-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  border: 1px solid rgba(94, 70, 47, 0.12);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.7);
  padding: 0.95rem 1rem;
}

.toggle-row input {
  width: 1rem;
  height: 1rem;
  margin: 0;
}

.toggle-row span {
  color: #4b3b2e;
}

.form-note {
  margin-top: 1rem;
}

.feedback {
  margin-top: 1rem;
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

.submit-button {
  margin-top: 1rem;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #ca6b2c, #8f3d14);
  color: #fff8f2;
  cursor: pointer;
  padding: 0.95rem 1.15rem;
  font-size: 1rem;
  font-weight: 700;
}

.submit-button:disabled {
  cursor: progress;
  opacity: 0.7;
}

@media (max-width: 760px) {
  .form-card__header,
  .form-grid {
    grid-template-columns: 1fr;
    display: grid;
  }

  .form-card__header p:last-child {
    max-width: none;
    text-align: left;
  }
}
</style>
