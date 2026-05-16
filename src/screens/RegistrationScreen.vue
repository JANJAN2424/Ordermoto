<script setup lang="ts">
import CustomerListPanel from '../components/customers/CustomerListPanel.vue'
import CustomerRegistrationForm from '../components/forms/CustomerRegistrationForm.vue'
import type { Customer, RegistrationInput } from '../types/system'

defineProps<{
  customers: Customer[]
  registerCustomer: (payload: RegistrationInput) => Promise<Customer>
}>()
</script>

<template>
  <section class="registration-screen">
    <CustomerRegistrationForm :submit-registration="registerCustomer" />

    <CustomerListPanel
      :customers="customers"
      eyebrow="Customers"
      title="Recently registered customers"
      helper="Newly saved customers appear here immediately after registration."
      empty-message="No customers registered yet. Use the form above to add the first one."
    />
  </section>
</template>

<style scoped>
.registration-screen {
  display: grid;
  gap: 1rem;
}
</style>
