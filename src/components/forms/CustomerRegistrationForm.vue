<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { Customer, RegistrationInput } from '../../types/system'

const props = defineProps<{
  submitRegistration: (payload: RegistrationInput) => Promise<Customer>
}>()

const form = reactive<RegistrationInput>({
  fullName: '',
  email: '',
  phone: '',
  address: '',
})

const submitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const resetForm = () => {
  form.fullName = ''
  form.email = ''
  form.phone = ''
  form.address = ''
}

const handleSubmit = async () => {
  submitting.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const customer = await props.submitRegistration({ ...form })
    successMessage.value = `${customer.fullName} has been added to the customer list.`
    resetForm()
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Unable to register the customer.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form class="form-card" @submit.prevent="handleSubmit">
    <div class="form-card__header">
      <div>
        <p class="eyebrow">Registration</p>
        <h2>Customer Registration Form</h2>
      </div>
      <p>Save a new customer so they can place motorcycle orders in the system.</p>
    </div>

    <div class="form-grid">
      <label>
        Full name
        <input v-model="form.fullName" type="text" placeholder="Enter customer name" required />
      </label>

      <label>
        Email address
        <input v-model="form.email" type="email" placeholder="customer@example.com" required />
      </label>

      <label>
        Phone number
        <input v-model="form.phone" type="tel" placeholder="+63 912 345 6789" required />
      </label>

      <label class="form-grid__wide">
        Address
        <textarea
          v-model="form.address"
          rows="4"
          placeholder="Enter full delivery or billing address"
          required
        />
      </label>
    </div>

    <p v-if="successMessage" class="feedback feedback--success">{{ successMessage }}</p>
    <p v-if="errorMessage" class="feedback feedback--error">{{ errorMessage }}</p>

    <button class="submit-button" type="submit" :disabled="submitting">
      {{ submitting ? 'Saving customer...' : 'Register customer' }}
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

.form-card__header p:last-child {
  max-width: 18rem;
  color: #6b5c4c;
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

.form-grid input,
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
