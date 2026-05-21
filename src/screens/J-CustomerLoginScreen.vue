<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { LoginInput, LoginResponse, RouteKey } from '../types/system'

const props = defineProps<{
  login: (payload: LoginInput) => Promise<LoginResponse>
}>()

const emit = defineEmits<{
  navigate: [route: RouteKey]
}>()

const form = reactive<LoginInput>({
  email: '',
  password: '',
})

const submitting = ref(false)
const errorMessage = ref('')
const infoMessage = ref('')
const showPassword = ref(false)

const handleForgotPassword = () => {
  errorMessage.value = ''
  infoMessage.value =
    'Password reset is not available yet. Please use your saved password or contact the administrator.'
}

const handleSubmit = async () => {
  submitting.value = true
  errorMessage.value = ''
  infoMessage.value = ''

  try {
    await props.login({ ...form })
    form.password = ''
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to sign in.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="auth-page">
    <div class="auth-card">
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

        <span class="auth-brand__copy">
          <strong>ORDERMOTO</strong>
          <small>SYSTEM</small>
        </span>
      </div>

      <header class="auth-header">
        <h1>Sign In</h1>
        <p>Enter your credentials to continue</p>
      </header>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <label class="field">
          <span class="field__label">Email address</span>
          <span class="field__control">
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
              autocomplete="email"
              placeholder="Enter your email"
              required
            />
          </span>
        </label>

        <label class="field">
          <span class="field__label">Password</span>
          <span class="field__control">
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
              autocomplete="current-password"
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
          </span>
        </label>

        <div class="auth-actions">
          <button type="button" class="auth-link" @click="handleForgotPassword">
            Forgot password?
          </button>
        </div>

        <p v-if="errorMessage" class="feedback feedback--error">{{ errorMessage }}</p>
        <p v-else-if="infoMessage" class="feedback feedback--info">{{ infoMessage }}</p>

        <button class="submit-button" type="submit" :disabled="submitting">
          {{ submitting ? 'Signing In...' : 'Sign In' }}
        </button>
      </form>

      <div class="auth-divider" aria-hidden="true">
        <span></span>
        <strong>OR</strong>
        <span></span>
      </div>

      <p class="auth-footer">
        Need an account?
        <button type="button" class="auth-link auth-link--accent" @click="emit('navigate', 'registration')">
          Register here
        </button>
      </p>
    </div>
  </section>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem 1rem;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 18% 15%, rgba(255, 255, 255, 0.92), transparent 20%),
    radial-gradient(circle at 84% 20%, rgba(255, 174, 108, 0.18), transparent 18%),
    radial-gradient(circle at 50% 88%, rgba(173, 191, 255, 0.1), transparent 24%),
    linear-gradient(180deg, #fdfefe 0%, #f1f4f8 100%);
}

.auth-page::before,
.auth-page::after {
  content: '';
  position: absolute;
  inset: auto;
  width: 26rem;
  height: 26rem;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.45;
  pointer-events: none;
}

.auth-page::before {
  top: -10rem;
  left: -7rem;
  background: rgba(255, 255, 255, 0.95);
}

.auth-page::after {
  right: -8rem;
  bottom: -10rem;
  background: rgba(255, 123, 0, 0.12);
}

.auth-card {
  position: relative;
  width: min(100%, 50rem);
  padding: clamp(2rem, 5vw, 3.6rem);
  border-radius: 2rem;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(182, 190, 203, 0.34);
  box-shadow:
    0 30px 70px rgba(12, 19, 33, 0.12),
    0 4px 14px rgba(255, 255, 255, 0.7) inset;
  backdrop-filter: blur(24px);
}

.auth-brand {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  margin: 0 auto;
  width: fit-content;
}

.auth-brand__mark {
  width: 4rem;
  height: 4rem;
  border-radius: 1.1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff8a2b, #ff5a00);
  box-shadow: 0 14px 28px rgba(255, 106, 0, 0.28);
  color: #ffffff;
  flex-shrink: 0;
}

.auth-brand__mark svg {
  width: 1.8rem;
  height: 1.8rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}

.auth-brand__copy {
  display: grid;
  gap: 0.08rem;
}

.auth-brand__copy strong {
  color: #202733;
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: 900;
  letter-spacing: 0.09em;
  line-height: 1;
}

.auth-brand__copy small {
  color: #8a919f;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.28em;
}

.auth-header {
  margin-top: 3rem;
  text-align: center;
}

.auth-header h1 {
  color: #212734;
  font-size: clamp(3rem, 6vw, 4.4rem);
  font-weight: 900;
  line-height: 0.95;
}

.auth-header p {
  margin-top: 1rem;
  color: #6f7a8b;
  font-size: clamp(1.1rem, 2vw, 1.4rem);
}

.auth-form {
  margin-top: 2.75rem;
  display: grid;
  gap: 1.9rem;
}

.field {
  display: grid;
  gap: 0.9rem;
}

.field__label {
  color: #202733;
  font-size: 1rem;
  font-weight: 700;
}

.field__control {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  min-height: 4.5rem;
  padding: 0 1.2rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid #d6dce6;
  box-shadow:
    0 8px 20px rgba(255, 255, 255, 0.42) inset,
    0 1px 3px rgba(17, 24, 39, 0.04);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.field__control:focus-within {
  border-color: rgba(255, 106, 0, 0.55);
  box-shadow:
    0 0 0 4px rgba(255, 106, 0, 0.12),
    0 8px 20px rgba(255, 255, 255, 0.42) inset;
  transform: translateY(-1px);
}

.field__icon,
.field__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #717b8c;
  flex-shrink: 0;
}

.field__icon svg,
.field__toggle svg {
  width: 1.55rem;
  height: 1.55rem;
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
  color: #222936;
  font-size: 1rem;
}

.field input::placeholder {
  color: #7d8798;
}

.field__toggle {
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 0;
}

.auth-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: -0.75rem;
}

.auth-link {
  border: 0;
  background: transparent;
  cursor: pointer;
  color: #1764ff;
  font: inherit;
  font-weight: 600;
  padding: 0;
}

.auth-link:hover {
  text-decoration: underline;
}

.feedback {
  border-radius: 1rem;
  padding: 0.95rem 1rem;
  font-size: 0.95rem;
  font-weight: 600;
}

.feedback--error {
  background: rgba(180, 66, 27, 0.1);
  color: #8d3815;
}

.feedback--info {
  background: rgba(23, 100, 255, 0.08);
  color: #2854a5;
}

.submit-button {
  width: 100%;
  min-height: 4.5rem;
  border: 0;
  border-radius: 1rem;
  cursor: pointer;
  color: #ffffff;
  font-size: 1.2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #ff7c1d, #ff5a00);
  box-shadow: 0 18px 40px rgba(255, 106, 0, 0.24);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 22px 44px rgba(255, 106, 0, 0.28);
}

.submit-button:disabled {
  cursor: progress;
  opacity: 0.78;
}

.auth-divider {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
  margin-top: 2.4rem;
  color: #757e8e;
}

.auth-divider span {
  height: 1px;
  background: linear-gradient(90deg, rgba(196, 202, 212, 0.08), rgba(196, 202, 212, 0.88));
}

.auth-divider span:last-child {
  background: linear-gradient(90deg, rgba(196, 202, 212, 0.88), rgba(196, 202, 212, 0.08));
}

.auth-divider strong {
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.auth-footer {
  margin-top: 2rem;
  text-align: center;
  color: #6e7888;
  font-size: 1rem;
}

.auth-link--accent {
  margin-left: 0.35rem;
  font-weight: 700;
}

@media (max-width: 760px) {
  .auth-page {
    padding: 1rem 0.75rem;
  }

  .auth-card {
    border-radius: 1.45rem;
    padding: 1.35rem;
  }

  .auth-brand {
    gap: 0.8rem;
  }

  .auth-brand__mark {
    width: 3.3rem;
    height: 3.3rem;
    border-radius: 0.95rem;
  }

  .auth-brand__copy strong {
    letter-spacing: 0.06em;
  }

  .auth-brand__copy small {
    letter-spacing: 0.18em;
  }

  .auth-header {
    margin-top: 2.2rem;
  }

  .auth-form {
    margin-top: 2rem;
    gap: 1.35rem;
  }

  .field__control,
  .submit-button {
    min-height: 4rem;
  }

  .auth-actions {
    margin-top: -0.35rem;
  }

  .auth-footer {
    line-height: 1.7;
  }
}
</style>
