<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import CurrentOrderPanel from '../components/orders/J-CurrentOrderPanel.vue'
import OrderBuilder from '../components/orders/J-OrderBuilder.vue'
import OrdersHistory from '../components/orders/J-OrdersHistory.vue'
import type {
  CreateOrderInput,
  Customer,
  DeliveryMethod,
  Order,
  Product,
} from '../types/system'

const props = defineProps<{
  products: Product[]
  customers: Customer[]
  orders: Order[]
  createOrder: (payload: CreateOrderInput) => Promise<Order>
}>()

const selectedCustomerId = ref<number | null>(null)
const deliveryMethod = ref<DeliveryMethod>('Showroom pickup')
const orderNote = ref('')
const submitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const quantities = reactive<Record<number, number>>({})

watch(
  () => props.customers,
  (customers) => {
    if (customers.length === 0) {
      selectedCustomerId.value = null
      return
    }

    const currentSelectionExists = customers.some((customer) => customer.id === selectedCustomerId.value)
    const firstCustomer = customers[0]

    if (!currentSelectionExists && firstCustomer) {
      selectedCustomerId.value = firstCustomer.id
    }
  },
  { immediate: true },
)

const selectedCustomerName = computed(() => {
  const customer = props.customers.find((entry) => entry.id === selectedCustomerId.value)
  return customer?.fullName ?? ''
})

const selectedItems = computed(() =>
  props.products
    .filter((product) => (quantities[product.id] ?? 0) > 0)
    .map((product) => ({
      productId: product.id,
      productName: product.name,
      quantity: quantities[product.id] ?? 0,
      lineTotal: product.price * (quantities[product.id] ?? 0),
    })),
)

const total = computed(() =>
  selectedItems.value.reduce((sum, item) => sum + item.lineTotal, 0),
)

const canSubmit = computed(() =>
  Boolean(selectedCustomerId.value) && selectedItems.value.length > 0,
)

const increaseQuantity = (productId: number) => {
  const product = props.products.find((entry) => entry.id === productId)
  if (!product) return

  const currentValue = quantities[productId] ?? 0
  quantities[productId] = Math.min(product.stock, currentValue + 1)
}

const decreaseQuantity = (productId: number) => {
  const currentValue = quantities[productId] ?? 0
  quantities[productId] = Math.max(0, currentValue - 1)
}

const clearQuantities = () => {
  for (const key of Object.keys(quantities)) {
    quantities[Number(key)] = 0
  }
}

const submitOrder = async () => {
  if (!selectedCustomerId.value || selectedItems.value.length === 0) {
    return
  }

  submitting.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    await props.createOrder({
      customerId: selectedCustomerId.value,
      deliveryMethod: deliveryMethod.value,
      note: orderNote.value,
      items: selectedItems.value.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    })

    successMessage.value = 'Order saved successfully.'
    orderNote.value = ''
    clearQuantities()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to save the order.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="orders-screen">
    <section class="order-toolbar">
      <div>
        <p class="eyebrow">Orders</p>
        <h2>Save products added by the customer</h2>
      </div>

      <div class="order-toolbar__controls">
        <label>
          Customer
          <select v-model="selectedCustomerId" :disabled="customers.length === 0">
            <option :value="null" disabled>Select customer</option>
            <option v-for="customer in customers" :key="customer.id" :value="customer.id">
              {{ customer.fullName }}
            </option>
          </select>
        </label>

        <label>
          Delivery method
          <select v-model="deliveryMethod">
            <option value="Showroom pickup">Showroom pickup</option>
            <option value="Home delivery">Home delivery</option>
          </select>
        </label>

        <label class="order-toolbar__wide">
          Note
          <textarea
            v-model="orderNote"
            rows="3"
            placeholder="Add customer preference or delivery note"
          />
        </label>
      </div>
    </section>

    <p v-if="customers.length === 0" class="notice">
      Register a customer first before creating an order.
    </p>
    <p v-if="successMessage" class="notice notice--success">{{ successMessage }}</p>
    <p v-if="errorMessage" class="notice notice--error">{{ errorMessage }}</p>

    <div class="content-grid">
      <div class="content-grid__main">
        <OrderBuilder
          :products="products"
          :quantities="quantities"
          @increase="increaseQuantity"
          @decrease="decreaseQuantity"
        />
        <OrdersHistory :orders="orders" />
      </div>

      <CurrentOrderPanel
        :customer-name="selectedCustomerName"
        :delivery-method="deliveryMethod"
        :note="orderNote"
        :items="selectedItems"
        :total="total"
        :can-submit="canSubmit"
        :submitting="submitting"
        @submit="submitOrder"
      />
    </div>
  </section>
</template>

<style scoped>
.orders-screen {
  display: grid;
  gap: 1rem;
}

.order-toolbar {
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
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

.order-toolbar h2 {
  margin-top: 0.25rem;
  color: #231b14;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(1.8rem, 4vw, 2.4rem);
}

.order-toolbar__controls {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.order-toolbar__controls label {
  display: grid;
  gap: 0.45rem;
  color: #4b3b2e;
  font-weight: 700;
}

.order-toolbar__controls select,
.order-toolbar__controls textarea {
  width: 100%;
  border: 1px solid rgba(94, 70, 47, 0.14);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.85);
  color: #231b14;
  padding: 0.9rem 1rem;
  resize: vertical;
}

.order-toolbar__wide {
  grid-column: 1 / -1;
}

.notice {
  border-radius: 1rem;
  background: rgba(46, 106, 120, 0.12);
  color: #2f6a78;
  padding: 0.85rem 1rem;
  font-weight: 700;
}

.notice--success {
  background: rgba(47, 111, 83, 0.12);
  color: #2f6f53;
}

.notice--error {
  background: rgba(168, 68, 31, 0.12);
  color: #8f3d14;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.8fr);
  gap: 1rem;
  align-items: start;
}

.content-grid__main {
  display: grid;
  gap: 1rem;
}

@media (max-width: 1020px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 860px) {
  .order-toolbar,
  .order-toolbar__controls {
    grid-template-columns: 1fr;
  }
}
</style>
