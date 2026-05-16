<script setup lang="ts">
import { reactive, ref } from 'vue'
import heroImage from '../assets/images/backgroundimg.jpg'
import type { CustomerLoginInput, CustomerSessionState, RouteKey } from '../types/system'

const props = defineProps<{
  loginCustomer: (payload: CustomerLoginInput) => Promise<CustomerSessionState>
}>()

const emit = defineEmits<{
  navigate: [route: RouteKey]
}>()

const form = reactive<CustomerLoginInput>({
  email: '',
  password: '',
})

const submitting = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)

const handleSubmit = async () => {
  submitting.value = true
  errorMessage.value = ''

  try {
    await props.loginCustomer({ ...form })
    form.password = ''
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Unable to sign in to the customer account.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="auth-page">
    <div class="auth-stage">
      <aside class="auth-visual" :style="{ '--auth-image': `url(${heroImage})` }">
        <div class="auth-brand">
          <span class="auth-brand__mark">
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

        <div class="auth-visual__copy">
          <p class="auth-visual__eyebrow">Customer Login</p>
          <h2>Sign in with the customer profile you created during registration.</h2>
          <p>Continue to orders faster and keep purchases attached to the right buyer account.</p>
        </div>
      </aside>

      <section class="auth-card">
        <button type="button" class="back-link" @click="emit('navigate', 'registration')">
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
          <span>Back to registration</span>
        </button>

        <div class="auth-card__brand">
          <span class="auth-card__brand-mark">
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

        <header class="auth-card__header">
          <h1>Customer Sign In</h1>
          <p>Use the email and password created during customer registration</p>
        </header>

        <form class="auth-form" @submit.prevent="handleSubmit">
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
                placeholder="Enter your password"
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

          <p class="auth-form__hint">Use the same email and password saved on the register page.</p>

          <p v-if="errorMessage" class="feedback feedback--error">{{ errorMessage }}</p>

          <button class="submit-button" type="submit" :disabled="submitting">
            {{ submitting ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <p class="auth-footer">
          Need to create a customer profile?
          <button type="button" class="text-link" @click="emit('navigate', 'registration')">
            Register here
          </button>
        </p>

        <p class="auth-footer auth-footer--secondary">
          Need admin access?
          <button type="button" class="text-link" @click="emit('navigate', 'admin')">
            Admin login
          </button>
        </p>
      </section>
    </div>
  </section>
</template>

<style scoped>
.auth-page {
  width: min(1440px, calc(100% - 1.5rem));
  margin: 0 auto;
  padding: 1rem 0 2rem;
}

.auth-stage {
  display: grid;
  grid-template-columns: minmax(280px, 0.52fr) minmax(0, 0.92fr);
  gap: 1.15rem;
  min-height: calc(100vh - 2rem);
}

.auth-visual {
  position: relative;
  overflow: hidden;
  border-radius: 2rem;
  background:
    linear-gradient(180deg, rgba(8, 10, 16, 0.32), rgba(8, 10, 16, 0.78)),
    radial-gradient(circle at top left, rgba(255, 106, 0, 0.18), transparent 24%),
    var(--auth-image) left center / cover no-repeat;
  padding: 2rem;
  color: #ffffff;
  display: grid;
  align-content: space-between;
  box-shadow: 0 26px 70px rgba(15, 17, 22, 0.28);
}

.auth-visual::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, rgba(255, 106, 0, 0.18), transparent 28%),
    linear-gradient(180deg, rgba(8, 10, 16, 0.05), rgba(8, 10, 16, 0.55));
  pointer-events: none;
}

.auth-brand,
.auth-card__brand {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.85rem;
}

.auth-brand__mark,
.auth-card__brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.1rem;
  height: 3.1rem;
  border-radius: 1rem;
  background: rgba(255, 106, 0, 0.14);
  color: #ff6a00;
  flex-shrink: 0;
}

.auth-brand__mark svg,
.auth-card__brand-mark svg {
  width: 1.65rem;
  height: 1.65rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}

.auth-brand strong,
.auth-card__brand strong {
  display: block;
  font-size: 1.2rem;
  font-weight: 800;
  text-transform: uppercase;
}

.auth-brand small,
.auth-card__brand small {
  display: block;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.auth-visual__copy {
  position: relative;
  z-index: 1;
  max-width: 22rem;
}

.auth-visual__eyebrow {
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.auth-visual__copy h2 {
  margin-top: 0.75rem;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  line-height: 1.02;
}

.auth-visual__copy p:last-child {
  margin-top: 0.85rem;
  color: rgba(255, 255, 255, 0.82);
}

.auth-card {
  display: grid;
  align-content: start;
  gap: 1.1rem;
  border-radius: 2rem;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.95), transparent 30%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.94));
  padding: 2rem 2.1rem;
  box-shadow: 0 24px 60px rgba(15, 17, 22, 0.12);
  border: 1px solid rgba(16, 24, 40, 0.08);
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
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: #3c4657;
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

.auth-card__brand {
  justify-self: center;
}

.auth-card__header {
  text-align: center;
}

.auth-card__header h1 {
  color: #161b23;
  font-size: clamp(2.2rem, 4vw, 3.2rem);
  font-weight: 800;
  line-height: 1.02;
}

.auth-card__header p {
  margin-top: 0.6rem;
  color: #6b7584;
  font-size: 1.06rem;
}

.auth-form {
  display: grid;
  gap: 1rem;
}

.field {
  display: grid;
  gap: 0.55rem;
  color: #202632;
  font-weight: 700;
}

.field__control {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border: 1px solid rgba(16, 24, 40, 0.12);
  border-radius: 1.15rem;
  background: #ffffff;
  padding: 0.95rem 1rem;
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

.field input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: #161b23;
}

.auth-form__hint {
  color: #6b7584;
  text-align: right;
}

.feedback {
  border-radius: 1rem;
  padding: 0.9rem 1rem;
  font-weight: 700;
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

.auth-footer {
  color: #555f6f;
  text-align: center;
}

.auth-footer--secondary {
  margin-top: -0.45rem;
}

.text-link {
  color: #ff6a00;
  font-weight: 800;
}

@media (max-width: 1180px) {
  .auth-stage {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .auth-visual {
    min-height: 280px;
  }
}

@media (max-width: 760px) {
  .auth-page {
    width: min(100%, calc(100% - 1rem));
    padding-top: 0.75rem;
  }

  .auth-visual,
  .auth-card {
    border-radius: 1.45rem;
    padding: 1.25rem;
  }

  .auth-card {
    gap: 1rem;
  }

  .auth-card__header h1 {
    font-size: clamp(1.95rem, 8vw, 2.5rem);
  }

  .auth-form__hint {
    text-align: left;
  }
}
</style>
