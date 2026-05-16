<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import heroImage from '../assets/images/backgroundimg.jpg'
import type { Customer, RegistrationInput, RouteKey } from '../types/system'

const props = defineProps<{
  customers: Customer[]
  registerCustomer: (payload: RegistrationInput) => Promise<Customer>
}>()

const emit = defineEmits<{
  navigate: [route: RouteKey]
}>()

const form = reactive<RegistrationInput>({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  password: '',
})

const submitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const showPassword = ref(false)

const recentCustomer = computed(() => props.customers[0]?.fullName ?? 'No customers yet')

const resetForm = () => {
  form.fullName = ''
  form.email = ''
  form.phone = ''
  form.address = ''
  form.password = ''
}

const handleSubmit = async () => {
  submitting.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const customer = await props.registerCustomer({ ...form })
    successMessage.value = `${customer.fullName} has been added to the customer list. You can sign in with this email now.`
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
  <section class="register-page" :style="{ '--register-image': `url(${heroImage})` }">
    <div class="register-shell">
      <button type="button" class="back-link" @click="emit('navigate', 'login')">
        <span class="back-link__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path
              d="M15 18l-6-6 6-6M9 12h10"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.8"
            />
          </svg>
        </span>
        <span>Back to login</span>
      </button>

      <article class="register-card">
        <div class="register-card__brand">
          <span class="register-card__brand-mark">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="6.5" cy="16.5" r="2.3" />
              <circle cx="18" cy="16.5" r="2.3" />
              <path d="M8.8 16.5h4.7l2.8-5.8H20" />
              <path d="M10.5 9.8h3.7l2.1 6.7" />
              <path d="M8.4 12H5.6L4 9.5H2.6" />
            </svg>
          </span>
          <span>
            <strong>Ordermoto</strong>
            <small>System</small>
          </span>
        </div>

        <header class="register-card__header">
          <h1>Create Customer Profile</h1>
          <p>Register a buyer and set their password for future customer sign-in</p>
        </header>

        <form class="register-form" @submit.prevent="handleSubmit">
          <section class="form-section">
            <div class="section-label">
              <span class="section-label__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path
                    d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8c0-3.3 3.1-6 7-6s7 2.7 7 6"
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                  />
                </svg>
              </span>
              <strong>Personal Information</strong>
            </div>

            <div class="form-grid">
              <label class="field">
                <span>Full name</span>
                <div class="field__control">
                  <span class="field__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path
                        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8c0-3.3 3.1-6 7-6s7 2.7 7 6"
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.8"
                      />
                    </svg>
                  </span>
                  <input
                    v-model="form.fullName"
                    type="text"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </label>

              <label class="field">
                <span>Email address</span>
                <div class="field__control">
                  <span class="field__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path
                        d="M4 6h16v12H4zM4 7l8 6 8-6"
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.8"
                      />
                    </svg>
                  </span>
                  <input
                    v-model="form.email"
                    type="email"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </label>

              <label class="field field--wide">
                <span>Phone number</span>
                <div class="field__control">
                  <span class="field__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path
                        d="M5 4h4l2 5-2.5 2.5a16 16 0 0 0 4 4L15 13l5 2v4a2 2 0 0 1-2 2C10.3 21 3 13.7 3 6a2 2 0 0 1 2-2Z"
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.8"
                      />
                    </svg>
                  </span>
                  <input
                    v-model="form.phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </label>
            </div>
          </section>

          <section class="form-section">
            <div class="section-label">
              <span class="section-label__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path
                    d="M7 10V7a5 5 0 0 1 10 0v3m-9 0h8a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z"
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                  />
                </svg>
              </span>
              <strong>Account Access</strong>
            </div>

            <label class="field">
              <span>Password</span>
              <div class="field__control">
                <span class="field__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path
                      d="M7 10V7a5 5 0 0 1 10 0v3m-9 0h8a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z"
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.8"
                    />
                  </svg>
                </span>
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Create a password"
                  minlength="6"
                  required
                />
                <button
                  type="button"
                  class="field__toggle"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                  @click="showPassword = !showPassword"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.8"
                    />
                  </svg>
                </button>
              </div>
            </label>
            <p class="register-note">
              Use this password with the customer email on the login page. Minimum length:
              <strong>6 characters</strong>.
            </p>
          </section>

          <section class="form-section">
            <div class="section-label">
              <span class="section-label__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path
                    d="M4 10.5 12 4l8 6.5V20H4zM9 20v-5h6v5"
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                  />
                </svg>
              </span>
              <strong>Delivery Details</strong>
            </div>

            <label class="field">
              <span>Address</span>
              <div class="field__control field__control--textarea">
                <span class="field__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path
                      d="M12 21s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11Zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.8"
                    />
                  </svg>
                </span>
                <textarea
                  v-model="form.address"
                  rows="4"
                  placeholder="Enter delivery or billing address"
                  required
                />
              </div>
            </label>
          </section>

          <section class="form-section">
            <div class="section-label">
              <span class="section-label__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path
                    d="M4 12h16M12 4v16"
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                  />
                </svg>
              </span>
              <strong>Order Readiness</strong>
            </div>
            <p class="register-note">
              Once registered, this customer can be selected immediately in the order builder.
              Latest customer: <strong>{{ recentCustomer }}</strong>
            </p>
          </section>

          <p v-if="successMessage" class="feedback feedback--success">{{ successMessage }}</p>
          <p v-if="errorMessage" class="feedback feedback--error">{{ errorMessage }}</p>

          <button class="submit-button" type="submit" :disabled="submitting">
            {{ submitting ? 'Creating customer...' : 'Create Customer' }}
          </button>
        </form>

        <p class="register-footer">
          Already have a customer account?
          <button type="button" class="text-link" @click="emit('navigate', 'login')">
            Login here
          </button>
        </p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.register-page {
  width: min(1440px, calc(100% - 1.5rem));
  margin: 0 auto;
  padding: 1rem 0 2rem;
}

.register-shell {
  min-height: calc(100vh - 2rem);
  border-radius: 2rem;
  background:
    linear-gradient(180deg, rgba(8, 10, 16, 0.86), rgba(8, 10, 16, 0.96)),
    radial-gradient(circle at top left, rgba(255, 106, 0, 0.16), transparent 24%);
  padding: 1.5rem;
  box-shadow: 0 26px 70px rgba(15, 17, 22, 0.2);
}

.back-link,
.text-link,
.field__toggle {
  border: 0;
  background: transparent;
  cursor: pointer;
  font: inherit;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: rgba(255, 255, 255, 0.86);
  font-weight: 700;
}

.back-link__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.back-link__icon svg {
  width: 1rem;
  height: 1rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.register-card {
  position: relative;
  overflow: hidden;
  width: min(100%, 1040px);
  margin: 1rem auto 0;
  border-radius: 2rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.94)),
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.95), transparent 30%);
  padding: 1.8rem 2rem;
  border: 1px solid rgba(16, 24, 40, 0.08);
  box-shadow: 0 24px 60px rgba(15, 17, 22, 0.14);
}

.register-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.92)),
    var(--register-image) right center / contain no-repeat;
  opacity: 0.18;
  pointer-events: none;
}

.register-card__brand {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.85rem;
  justify-self: center;
  margin: 0 auto;
}

.register-card__brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.1rem;
  height: 3.1rem;
  border-radius: 1rem;
  background: rgba(255, 106, 0, 0.14);
  color: #ff6a00;
}

.register-card__brand-mark svg {
  width: 1.65rem;
  height: 1.65rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}

.register-card__brand strong {
  display: block;
  color: #12151c;
  font-size: 1.2rem;
  font-weight: 800;
  text-transform: uppercase;
}

.register-card__brand small {
  display: block;
  color: #6b7584;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.register-card__header,
.register-footer {
  position: relative;
  z-index: 1;
  text-align: center;
}

.register-card__header {
  margin-top: 1rem;
}

.register-card__header h1 {
  color: #161b23;
  font-size: clamp(2.1rem, 4vw, 3.1rem);
  font-weight: 800;
  line-height: 1.02;
}

.register-card__header p {
  margin-top: 0.6rem;
  color: #6b7584;
  font-size: 1.06rem;
}

.register-form {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 1.4rem;
  margin-top: 1.5rem;
}

.form-section {
  display: grid;
  gap: 0.95rem;
}

.section-label {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  color: #202632;
}

.section-label strong {
  font-size: 1.12rem;
  font-weight: 800;
}

.section-label__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  background: rgba(255, 106, 0, 0.12);
  color: #ff6a00;
}

.section-label__icon svg {
  width: 1.1rem;
  height: 1.1rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.field {
  display: grid;
  gap: 0.55rem;
  color: #202632;
  font-weight: 700;
}

.field--wide {
  grid-column: 1 / -1;
}

.field__control {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border: 1px solid rgba(16, 24, 40, 0.12);
  border-radius: 1.15rem;
  background: rgba(255, 255, 255, 0.98);
  padding: 0.95rem 1rem;
}

.field__control--textarea {
  align-items: flex-start;
}

.field__icon,
.field__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #4f5968;
  flex-shrink: 0;
}

.field__icon svg,
.field__toggle svg {
  width: 1.3rem;
  height: 1.3rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.field input,
.field textarea {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: #161b23;
  resize: vertical;
}

.register-note {
  color: #667085;
}

.register-note strong {
  color: #12151c;
}

.feedback {
  border-radius: 1rem;
  padding: 0.9rem 1rem;
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
  width: 100%;
  border: none;
  border-radius: 1rem;
  background: linear-gradient(135deg, #ff7a1a, #ff5a00);
  color: #ffffff;
  cursor: pointer;
  padding: 1rem 1.2rem;
  font-size: 1.06rem;
  font-weight: 800;
  box-shadow: 0 18px 34px rgba(255, 106, 0, 0.2);
}

.submit-button:disabled {
  cursor: progress;
  opacity: 0.72;
}

.register-footer {
  margin-top: 1.4rem;
  color: #555f6f;
}

.text-link {
  color: #ff6a00;
  font-weight: 800;
}

@media (max-width: 1180px) {
  .register-card {
    width: 100%;
  }
}

@media (max-width: 860px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .register-page {
    width: min(100%, calc(100% - 1rem));
    padding-top: 0.75rem;
  }

  .register-shell {
    border-radius: 1.45rem;
    padding: 1rem;
  }

  .register-card {
    padding: 1.25rem;
    border-radius: 1.45rem;
  }

  .register-card__header h1 {
    font-size: clamp(1.9rem, 8vw, 2.45rem);
  }
}
</style>
