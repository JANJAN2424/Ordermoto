<script setup lang="ts">
import type { AdminSessionState, RouteKey } from '../../types/system'

defineProps<{
  currentRoute: RouteKey
  navigationItems: Array<{
    key: RouteKey
    label: string
    helper: string
  }>
  loading: boolean
  errorMessage: string
  adminSession: AdminSessionState
}>()

defineEmits<{
  navigate: [route: RouteKey]
  logout: []
}>()
</script>

<template>
  <div class="shell">
    <header class="shell__header">
      <div class="brand">
        <p class="brand__eyebrow">Ordermoto System</p>
        <h1>Motorcycle Ordering Portal</h1>
        <p>Homepage, product info, customer registration, and saved orders in one place.</p>
      </div>

      <nav class="shell__nav" aria-label="Primary">
        <button
          v-for="item in navigationItems"
          :key="item.key"
          type="button"
          class="nav-link"
          :class="{ 'nav-link--active': item.key === currentRoute }"
          @click="$emit('navigate', item.key)"
        >
          <span>{{ item.label }}</span>
          <small>{{ item.helper }}</small>
        </button>

        <div class="admin-status" :class="{ 'admin-status--active': adminSession.authenticated }">
          <template v-if="adminSession.authenticated">
            <p class="admin-status__label">Admin signed in</p>
            <strong>{{ adminSession.admin?.displayName }}</strong>
            <span>{{ adminSession.admin?.username }}</span>
            <button type="button" class="admin-status__button" @click="$emit('logout')">
              Logout
            </button>
          </template>

          <template v-else>
            <p class="admin-status__label">Admin access is locked</p>
            <strong>Dashboard hidden from regular users</strong>
            <span>Open `Admin login` to continue.</span>
          </template>
        </div>
      </nav>
    </header>

    <div v-if="loading" class="banner banner--info">Loading system data from SQLite...</div>
    <div v-else-if="errorMessage" class="banner banner--error">{{ errorMessage }}</div>

    <main class="shell__content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.shell {
  max-width: 1240px;
  margin: 0 auto;
  padding: 2rem 1rem 3rem;
}

.shell__header {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.95fr);
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.brand,
.shell__nav {
  border: 1px solid rgba(94, 70, 47, 0.12);
  border-radius: 1.5rem;
  background: rgba(255, 252, 247, 0.9);
  padding: 1.4rem;
  box-shadow: 0 18px 40px rgba(73, 51, 27, 0.08);
}

.brand__eyebrow {
  color: #a44d1e;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.brand h1 {
  margin-top: 0.3rem;
  color: #231b14;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2rem, 4vw, 3.2rem);
  line-height: 1.02;
}

.brand p:last-child {
  max-width: 38rem;
  margin-top: 0.75rem;
  color: #5f5244;
}

.shell__nav {
  display: grid;
  gap: 0.75rem;
  align-content: center;
}

.nav-link {
  display: grid;
  gap: 0.2rem;
  border: 1px solid rgba(94, 70, 47, 0.12);
  border-radius: 1rem;
  background: #fffdf9;
  color: #3f3124;
  cursor: pointer;
  padding: 0.95rem 1rem;
  text-align: left;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.nav-link small {
  color: #7a6b5b;
}

.nav-link:hover,
.nav-link--active {
  transform: translateY(-1px);
  border-color: rgba(164, 77, 30, 0.35);
  box-shadow: 0 12px 24px rgba(73, 51, 27, 0.08);
}

.nav-link--active {
  background: linear-gradient(135deg, rgba(252, 237, 224, 0.95), rgba(255, 255, 255, 0.95));
}

.admin-status {
  display: grid;
  gap: 0.2rem;
  border: 1px dashed rgba(94, 70, 47, 0.2);
  border-radius: 1rem;
  background: rgba(255, 249, 241, 0.92);
  color: #5f5244;
  padding: 1rem;
}

.admin-status--active {
  border-style: solid;
  border-color: rgba(47, 111, 83, 0.18);
  background: rgba(241, 250, 245, 0.92);
  color: #315742;
}

.admin-status__label {
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.admin-status strong {
  color: #231b14;
}

.admin-status--active strong {
  color: #21422f;
}

.admin-status span {
  font-size: 0.92rem;
}

.admin-status__button {
  justify-self: start;
  margin-top: 0.35rem;
  border: none;
  border-radius: 999px;
  background: #2f6f53;
  color: #f8fff9;
  cursor: pointer;
  padding: 0.65rem 0.95rem;
  font-weight: 700;
}

.banner {
  margin-bottom: 1rem;
  border-radius: 1rem;
  padding: 0.9rem 1rem;
  font-weight: 700;
}

.banner--info {
  background: rgba(46, 106, 120, 0.12);
  color: #2f6a78;
}

.banner--error {
  background: rgba(168, 68, 31, 0.12);
  color: #8f3d14;
}

.shell__content {
  display: grid;
}

@media (max-width: 920px) {
  .shell__header {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .shell {
    padding-inline: 0.85rem;
  }
}
</style>
