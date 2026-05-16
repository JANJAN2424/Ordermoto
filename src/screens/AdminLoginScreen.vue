<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { AdminLoginInput, AdminSessionState } from '../types/system'

const props = defineProps<{
  loginAdmin: (payload: AdminLoginInput) => Promise<AdminSessionState>
}>()

const form = reactive<AdminLoginInput>({
  username: '',
  password: '',
})

const submitting = ref(false)
const errorMessage = ref('')

const handleSubmit = async () => {
  submitting.value = true
  errorMessage.value = ''

  try {
    await props.loginAdmin({ ...form })
    form.password = ''
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to sign in as admin.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="admin-login-screen">
    <article class="hero-card">
      <div>
        <p class="eyebrow">Admin Access</p>
        <h2>Sign in with the admin username and password.</h2>
      </div>
      <p>
        The dashboard is protected. Regular users can use the ordering pages, while admins must
        log in before customer oversight tools appear.
      </p>
    </article>

    <div class="content-grid">
      <form class="login-card" @submit.prevent="handleSubmit">
        <div class="login-card__header">
          <div>
            <p class="eyebrow">Secure Login</p>
            <h3>Administrator sign in</h3>
          </div>
          <p>Use the admin credentials saved in `.env`.</p>
        </div>

        <label>
          Username
          <input v-model="form.username" type="text" placeholder="Enter admin username" required />
        </label>

        <label>
          Password
          <input
            v-model="form.password"
            type="password"
            placeholder="Enter admin password"
            required
          />
        </label>

        <p v-if="errorMessage" class="feedback feedback--error">{{ errorMessage }}</p>

        <button class="submit-button" type="submit" :disabled="submitting">
          {{ submitting ? 'Signing in...' : 'Open admin dashboard' }}
        </button>
      </form>

      <article class="note-card">
        <p class="eyebrow">Setup</p>
        <h3>Where the credentials live</h3>
        <p>
          Change `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `ADMIN_DISPLAY_NAME` in `.env` to set
          your own admin account details.
        </p>
        <p>
          After updating `.env`, restart the server so Prisma can seed the current admin
          credentials into SQLite.
        </p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.admin-login-screen {
  display: grid;
  gap: 1rem;
}

.hero-card,
.login-card,
.note-card {
  border: 1px solid rgba(94, 70, 47, 0.12);
  border-radius: 1.5rem;
  background: rgba(255, 252, 247, 0.92);
  padding: 1.4rem;
  box-shadow: 0 18px 40px rgba(73, 51, 27, 0.08);
}

.hero-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(280px, 0.95fr);
  gap: 1rem;
}

.eyebrow {
  color: #a44d1e;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.hero-card h2,
.login-card__header h3,
.note-card h3 {
  margin-top: 0.25rem;
  color: #231b14;
  font-family: Georgia, 'Times New Roman', serif;
}

.hero-card h2 {
  font-size: clamp(1.9rem, 4vw, 2.6rem);
}

.hero-card p:last-child,
.login-card__header p,
.note-card p,
.login-card label {
  color: #6b5c4c;
}

.hero-card p:last-child {
  max-width: 26rem;
}

.login-card {
  display: grid;
  gap: 1rem;
}

.login-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.login-card label {
  display: grid;
  gap: 0.45rem;
  font-weight: 700;
}

.login-card input {
  width: 100%;
  border: 1px solid rgba(94, 70, 47, 0.14);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.85);
  color: #231b14;
  padding: 0.9rem 1rem;
}

.feedback {
  border-radius: 0.95rem;
  padding: 0.8rem 0.95rem;
  font-weight: 700;
}

.feedback--error {
  background: rgba(168, 68, 31, 0.12);
  color: #8f3d14;
}

.submit-button {
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

.note-card {
  display: grid;
  align-content: start;
  gap: 0.85rem;
}

@media (max-width: 900px) {
  .hero-card,
  .content-grid,
  .login-card__header {
    grid-template-columns: 1fr;
    display: grid;
  }

  .hero-card p:last-child {
    max-width: none;
  }
}
</style>
