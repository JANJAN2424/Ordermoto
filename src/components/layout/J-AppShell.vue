<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { AdminSessionState, RouteKey } from '../../types/system'

const props = defineProps<{
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

const emit = defineEmits<{
  navigate: [route: RouteKey]
  logout: []
}>()

const navIcons: Record<RouteKey, string> = {
  home: 'M4 12 12 4l8 8-2 2-2-2v7H8v-7l-2 2-2-2 8-8Z',
  dashboard: 'M4 5h7v6H4V5Zm9 0h7v10h-7V5ZM4 13h7v6H4v-6Zm9 4h7v2h-7v-2Z',
  about: 'M4 14.5c2.2-4.2 5.1-6.5 8.5-6.5 3.6 0 5.5 1.8 7.5 5m-12 0 1.7 3h5.8l2.5-5H21M7 16a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm15 0a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z',
  registration: 'M16 20v-1.4c0-2.4-1.9-4.3-4.3-4.3H7.3C4.9 14.3 3 16.2 3 18.6V20m13-12a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Zm2 4h5m-2.5-2.5v5',
  orders: 'M8 4h8m-7 3h6m-8 1h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Zm0 0V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2',
  admin: 'M12 3 5 6v5c0 4.6 2.6 7.7 7 10 4.4-2.3 7-5.4 7-10V6l-7-3Zm0 6.2a2.3 2.3 0 1 1 0 4.6 2.3 2.3 0 0 1 0-4.6Zm-3.4 8c.8-1.8 2.3-2.7 3.4-2.7 1.1 0 2.6.9 3.4 2.7',
}

const topbarClock = ref(new Date())
let clockTimer: number | undefined
const mobileBreakpoint = 1180
const isCompactLayout = ref(false)
const navOpen = ref(true)

const timestampFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const currentSection = computed(
  () => props.navigationItems.find((item) => item.key === props.currentRoute) ?? props.navigationItems[0],
)

const welcomeMessage = computed(() => {
  if (props.adminSession.authenticated) {
    return `Welcome back, ${props.adminSession.admin?.displayName ?? 'Admin'}!`
  }

  return 'Welcome to Ordermoto.'
})

const userPrimaryLabel = computed(
  () => props.adminSession.admin?.displayName ?? 'Guest session',
)

const userSecondaryLabel = computed(() =>
  props.adminSession.authenticated
    ? props.adminSession.admin?.username ?? 'Administrator'
    : 'Public workspace',
)

const timestamp = computed(() => timestampFormatter.format(topbarClock.value))

const syncLayout = () => {
  const nextCompactLayout = window.innerWidth <= mobileBreakpoint

  if (nextCompactLayout !== isCompactLayout.value) {
    isCompactLayout.value = nextCompactLayout
    navOpen.value = !nextCompactLayout
    return
  }

  if (!nextCompactLayout) {
    navOpen.value = true
  }
}

const toggleNav = () => {
  if (!isCompactLayout.value) {
    return
  }

  navOpen.value = !navOpen.value
}

const handleNavigate = (route: RouteKey) => {
  emit('navigate', route)

  if (isCompactLayout.value) {
    navOpen.value = false
  }
}

const handleLogout = () => {
  emit('logout')

  if (isCompactLayout.value) {
    navOpen.value = false
  }
}

onMounted(() => {
  syncLayout()
  clockTimer = window.setInterval(() => {
    topbarClock.value = new Date()
  }, 30000)
  window.addEventListener('resize', syncLayout)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', syncLayout)

  if (clockTimer) {
    window.clearInterval(clockTimer)
  }
})
</script>

<template>
  <div class="shell">
    <aside
      class="sidebar"
      :class="{
        'sidebar--compact': isCompactLayout,
        'sidebar--collapsed': isCompactLayout && !navOpen,
      }"
    >
      <div class="sidebar__header">
        <button type="button" class="brand" @click="handleNavigate('dashboard')">
          <span class="brand__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <circle cx="6.5" cy="16.5" r="2.3" />
              <circle cx="18" cy="16.5" r="2.3" />
              <path d="M8.8 16.5h4.7l2.8-5.8H20" />
              <path d="M10.5 9.8h3.7l2.1 6.7" />
              <path d="M8.4 12H5.6L4 9.5H2.6" />
            </svg>
          </span>
          <span class="brand__copy">
            <strong>Ordermoto</strong>
            <small>System</small>
          </span>
        </button>

        <button
          v-if="isCompactLayout"
          type="button"
          class="nav-toggle"
          :aria-expanded="navOpen"
          aria-label="Toggle navigation"
          @click="toggleNav"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <nav class="sidebar__nav" aria-label="Primary">
        <button
          v-for="item in navigationItems"
          :key="item.key"
          type="button"
          class="nav-link"
          :class="{ 'nav-link--active': item.key === currentRoute }"
          @click="handleNavigate(item.key)"
        >
          <span class="nav-link__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path
                :d="navIcons[item.key]"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.8"
              />
            </svg>
          </span>
          <span class="nav-link__copy">
            <strong>{{ item.label }}</strong>
            <small>{{ item.helper }}</small>
          </span>
        </button>
      </nav>

      <div class="admin-status" :class="{ 'admin-status--active': adminSession.authenticated }">
        <p class="admin-status__label">System Status</p>
        <strong>
          {{ adminSession.authenticated ? 'Admin tools unlocked' : 'All systems operational' }}
        </strong>
        <span>
          {{
            adminSession.authenticated
              ? 'Inventory controls are ready for protected changes.'
              : 'Browse products, register customers, and sign in for admin actions.'
          }}
        </span>
        <button
          v-if="adminSession.authenticated"
          type="button"
          class="admin-status__button"
          @click="handleLogout"
        >
          Logout
        </button>
      </div>
    </aside>

    <section class="workspace">
      <header class="topbar">
        <div>
          <p class="topbar__eyebrow">{{ currentSection?.label }}</p>
          <h1>{{ welcomeMessage }}</h1>
          <p>{{ currentSection?.helper }}</p>
        </div>

        <div class="topbar__meta">
          <div class="meta-pill">
            <span class="meta-pill__dot"></span>
            <span>{{ timestamp }}</span>
          </div>

          <div class="profile-card">
            <span class="profile-card__avatar">
              {{ userPrimaryLabel.slice(0, 1).toUpperCase() }}
            </span>
            <span>
              <strong>{{ userPrimaryLabel }}</strong>
              <small>{{ userSecondaryLabel }}</small>
            </span>
          </div>
        </div>
      </header>

      <div v-if="loading" class="banner banner--info">Loading system data from SQLite...</div>
      <div v-else-if="errorMessage" class="banner banner--error">{{ errorMessage }}</div>

      <main class="workspace__content">
        <slot />
      </main>
    </section>
  </div>
</template>

<style scoped>
.shell {
  display: grid;
  grid-template-columns: clamp(230px, 18vw, 280px) minmax(0, 1fr);
  gap: clamp(0.85rem, 1vw, 1.15rem);
  width: 100%;
  min-height: 100vh;
  margin: 0 auto;
  padding: clamp(0.75rem, 1vw, 1rem);
}

.sidebar {
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 1.2rem;
  padding: 1.1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 1.8rem;
  background:
    radial-gradient(circle at top right, rgba(255, 106, 0, 0.18), transparent 24%),
    linear-gradient(180deg, rgba(19, 22, 30, 0.98), rgba(10, 12, 17, 0.99));
  color: #f4f7fb;
  box-shadow: 0 30px 70px rgba(8, 10, 15, 0.35);
}

.sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  padding: 0.15rem;
  text-align: left;
}

.nav-toggle {
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.28rem;
  width: 2.9rem;
  height: 2.9rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.95rem;
  background: rgba(255, 255, 255, 0.04);
  cursor: pointer;
  flex-shrink: 0;
  padding: 0.7rem;
}

.nav-toggle span {
  width: 100%;
  height: 2px;
  border-radius: 999px;
  background: #ffffff;
}

.brand__mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 1rem;
  background: rgba(255, 106, 0, 0.14);
  color: #ff6a00;
}

.brand__mark svg {
  width: 1.6rem;
  height: 1.6rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}

.brand__copy {
  display: grid;
  line-height: 1.05;
}

.brand__copy strong {
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.brand__copy small {
  color: rgba(244, 247, 251, 0.68);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.sidebar__nav {
  display: grid;
  gap: 0.45rem;
  align-content: start;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.02);
  color: rgba(244, 247, 251, 0.92);
  cursor: pointer;
  padding: 0.9rem 0.95rem;
  text-align: left;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.nav-link__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.15rem;
  height: 2.15rem;
  border-radius: 0.85rem;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(244, 247, 251, 0.92);
  flex-shrink: 0;
}

.nav-link__icon svg {
  width: 1.1rem;
  height: 1.1rem;
}

.nav-link__copy {
  display: grid;
  gap: 0.05rem;
}

.nav-link__copy strong {
  font-size: 0.95rem;
  font-weight: 700;
}

.nav-link__copy small {
  color: rgba(244, 247, 251, 0.58);
  font-size: 0.77rem;
}

.nav-link:hover,
.nav-link--active {
  transform: translateY(-1px);
  border-color: rgba(255, 106, 0, 0.16);
  box-shadow: 0 16px 30px rgba(6, 8, 13, 0.22);
}

.nav-link--active {
  background: linear-gradient(135deg, #ff7a1a, #ff5a00);
  color: #ffffff;
}

.nav-link--active .nav-link__icon {
  background: rgba(255, 255, 255, 0.18);
}

.nav-link--active .nav-link__copy small {
  color: rgba(255, 255, 255, 0.78);
}

.admin-status {
  display: grid;
  gap: 0.3rem;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 1.2rem;
  background: rgba(255, 255, 255, 0.03);
  color: rgba(244, 247, 251, 0.86);
}

.admin-status--active {
  border-color: rgba(34, 197, 94, 0.14);
  background: linear-gradient(180deg, rgba(34, 197, 94, 0.08), rgba(255, 255, 255, 0.04));
}

.admin-status__label {
  color: rgba(244, 247, 251, 0.58);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.admin-status strong {
  color: #ffffff;
}

.admin-status span {
  color: rgba(244, 247, 251, 0.68);
  font-size: 0.85rem;
}

.admin-status__button {
  justify-self: start;
  margin-top: 0.55rem;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  cursor: pointer;
  padding: 0.65rem 0.95rem;
  font-weight: 700;
}

.workspace {
  display: grid;
  align-content: start;
  gap: 1rem;
  min-width: 0;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.15rem 1.35rem;
  border: 1px solid rgba(16, 24, 40, 0.08);
  border-radius: 1.6rem;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 18px 40px rgba(15, 17, 22, 0.05);
}

.topbar__eyebrow {
  color: #ff6a00;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.topbar h1 {
  margin-top: 0.2rem;
  color: #11151c;
  font-size: clamp(1.55rem, 2.8vw, 2rem);
  font-weight: 800;
  line-height: 1.05;
}

.topbar p:last-child {
  margin-top: 0.3rem;
  color: #6d7584;
}

.topbar__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.85rem;
  justify-content: flex-end;
}

.meta-pill,
.profile-card {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.8rem 0.95rem;
  border: 1px solid rgba(16, 24, 40, 0.08);
  border-radius: 1rem;
  background: #ffffff;
  min-width: 0;
}

.meta-pill {
  color: #5f6776;
  font-weight: 600;
  white-space: nowrap;
}

.meta-pill__dot {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.12);
}

.profile-card__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #161a22, #2b3240);
  color: #ffffff;
  font-weight: 800;
  flex-shrink: 0;
}

.profile-card span:last-child {
  display: grid;
  line-height: 1.1;
}

.profile-card strong {
  color: #11151c;
  font-size: 0.95rem;
}

.profile-card small {
  color: #717a89;
  font-size: 0.8rem;
}

.banner {
  border-radius: 1.05rem;
  padding: 0.95rem 1.05rem;
  font-weight: 700;
}

.banner--info {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

.banner--error {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.workspace__content {
  display: grid;
  min-width: 0;
}

@media (max-width: 1500px) {
  .shell {
    grid-template-columns: clamp(220px, 20vw, 250px) minmax(0, 1fr);
  }

  .topbar {
    padding: 1.05rem 1.2rem;
  }
}

@media (max-width: 1280px) {
  .shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: sticky;
    top: 0.8rem;
    z-index: 20;
    grid-template-rows: auto auto auto;
  }

  .sidebar__nav {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .nav-link__copy small {
    display: none;
  }

  .topbar {
    display: grid;
    grid-template-columns: 1fr;
  }

  .topbar__meta {
    justify-content: flex-start;
  }
}

@media (max-width: 860px) {
  .topbar,
  .topbar__meta {
    display: grid;
  }

  .topbar__meta {
    justify-items: start;
    justify-content: stretch;
  }
}

@media (max-width: 760px) {
  .shell {
    padding: 0.8rem;
  }

  .topbar {
    padding: 1rem;
    border-radius: 1.25rem;
  }

  .topbar h1 {
    font-size: clamp(1.35rem, 6vw, 1.75rem);
  }

  .sidebar__nav {
    grid-template-columns: 1fr;
  }

  .sidebar__nav,
  .admin-status {
    min-width: 0;
  }

  .meta-pill,
  .profile-card {
    width: 100%;
  }
}

@media (max-width: 1280px) {
  .sidebar--collapsed {
    gap: 0;
  }

  .sidebar--collapsed .sidebar__nav,
  .sidebar--collapsed .admin-status {
    display: none;
  }
}

@media (max-width: 560px) {
  .shell {
    gap: 0.75rem;
    padding: 0.65rem;
  }

  .sidebar {
    padding: 0.85rem;
    border-radius: 1.35rem;
  }

  .brand__copy strong {
    font-size: 0.98rem;
  }

  .brand__copy small {
    letter-spacing: 0.18em;
  }

  .topbar__meta {
    gap: 0.65rem;
  }

  .meta-pill,
  .profile-card {
    padding: 0.75rem 0.85rem;
    border-radius: 0.9rem;
  }

  .profile-card strong,
  .profile-card small,
  .meta-pill {
    white-space: normal;
  }
}
</style>
