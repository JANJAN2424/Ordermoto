<script setup lang="ts">
import { computed } from 'vue'
import heroImage from '../assets/images/backgroundimg.jpg'
import type { Customer, Order, Product, RouteKey } from '../types/system'

const props = defineProps<{
  products: Product[]
  customers: Customer[]
  orders: Order[]
}>()

const emit = defineEmits<{
  navigate: [route: RouteKey]
}>()

const featuredProducts = computed(() =>
  props.products.filter((product) => product.featured).length,
)

const inStockProducts = computed(() =>
  props.products.filter((product) => product.stock > 0).length,
)

const savedOrders = computed(() => props.orders.length)
</script>

<template>
  <section class="landing-shell">
    <header class="landing-topbar">
      <button type="button" class="landing-brand" @click="emit('navigate', 'dashboard')">
        <span class="landing-brand__mark">
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
          <small>Access Portal</small>
        </span>
      </button>

      <div class="landing-topbar__actions">
        <button type="button" class="topbar-button topbar-button--ghost" @click="emit('navigate', 'about')">
          Browse Motorcycles
        </button>
        <button type="button" class="topbar-button" @click="emit('navigate', 'dashboard')">
          Open Dashboard
        </button>
      </div>
    </header>

    <section class="landing-screen">
    <section class="hero-card">
      <div class="hero-card__copy">
        <p class="eyebrow">Start Here</p>
        <h2>
          Build your next
          <span>motorcycle order faster.</span>
        </h2>
        <p>
          Use the landing page to register customers, open the admin login, and jump into the
          Ordermoto system with the right entry point.
        </p>

        <div class="hero-card__actions">
          <button
            type="button"
            class="hero-button hero-button--primary"
            @click="emit('navigate', 'registration')"
          >
            Register Now
          </button>
          <button
            type="button"
            class="hero-button hero-button--secondary"
            @click="emit('navigate', 'admin')"
          >
            Admin Login
          </button>
          <button
            type="button"
            class="hero-button hero-button--ghost"
            @click="emit('navigate', 'dashboard')"
          >
            View Dashboard
          </button>
        </div>
      </div>

      <div class="hero-card__art">
        <img :src="heroImage" alt="Motorcycle landing artwork" />
      </div>
    </section>

    <section class="entry-grid">
      <article class="entry-card entry-card--highlight">
        <p class="entry-card__eyebrow">Register</p>
        <h3>Create a customer profile</h3>
        <p>
          Save customer details first, then continue to products and orders with a ready account.
        </p>
        <button type="button" class="entry-button" @click="emit('navigate', 'registration')">
          Open Registration
        </button>
      </article>

      <article class="entry-card">
        <p class="entry-card__eyebrow">Login</p>
        <h3>Admin inventory access</h3>
        <p>
          Sign in as admin to manage the motorcycle list, catalog stock, and protected tools.
        </p>
        <button
          type="button"
          class="entry-button entry-button--dark"
          @click="emit('navigate', 'admin')"
        >
          Open Admin Login
        </button>
      </article>
    </section>

    <section class="summary-strip">
      <article class="summary-card">
        <strong>{{ products.length }}</strong>
        <span>Motorcycle models available</span>
      </article>
      <article class="summary-card">
        <strong>{{ inStockProducts }}</strong>
        <span>Models currently in stock</span>
      </article>
      <article class="summary-card">
        <strong>{{ customers.length }}</strong>
        <span>Registered customers</span>
      </article>
      <article class="summary-card">
        <strong>{{ savedOrders }}</strong>
        <span>Saved customer orders</span>
      </article>
      <article class="summary-card">
        <strong>{{ featuredProducts }}</strong>
        <span>Featured motorcycles in the catalog</span>
      </article>
    </section>

    <section class="info-grid">
      <article class="info-card">
        <p class="eyebrow eyebrow--dark">Quick Path</p>
        <h3>How new users should start</h3>
        <div class="flow-list">
          <div class="flow-row">
            <span>1</span>
            <p>Register the customer first so the order can be attached to a real profile.</p>
          </div>
          <div class="flow-row">
            <span>2</span>
            <p>Browse the motorcycle catalog and review pricing, stock, and lead time.</p>
          </div>
          <div class="flow-row">
            <span>3</span>
            <p>Open the dashboard or admin area when you need full system access.</p>
          </div>
        </div>
      </article>

      <article class="info-card info-card--glow">
        <p class="eyebrow eyebrow--dark">Why this landing page</p>
        <h3>Login and register from one place</h3>
        <p>
          The app now opens on a dedicated entry screen so regular users can go straight to
          registration, while admins can jump directly into sign-in without landing on the
          dashboard first.
        </p>
        <div class="pill-row">
          <span>Customer registration</span>
          <span>Admin login</span>
          <span>Dashboard access</span>
        </div>
      </article>
    </section>
  </section>
  </section>
</template>

<style scoped>
.landing-shell {
  width: min(1320px, calc(100% - 1.5rem));
  margin: 0 auto;
  padding: 1rem 0 2rem;
}

.landing-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem 1.15rem;
  border: 1px solid rgba(16, 24, 40, 0.08);
  border-radius: 1.45rem;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 18px 40px rgba(15, 17, 22, 0.05);
}

.landing-brand {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  border: 0;
  background: transparent;
  color: #12151c;
  cursor: pointer;
  text-align: left;
}

.landing-brand__mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 1rem;
  background: rgba(255, 106, 0, 0.12);
  color: #ff6a00;
}

.landing-brand__mark svg {
  width: 1.55rem;
  height: 1.55rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}

.landing-brand strong {
  display: block;
  font-size: 1.12rem;
  font-weight: 800;
  text-transform: uppercase;
}

.landing-brand small {
  color: #6b7584;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.landing-topbar__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.topbar-button {
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #ff7a1a, #ff5a00);
  color: #ffffff;
  cursor: pointer;
  padding: 0.85rem 1.05rem;
  font-weight: 700;
}

.topbar-button--ghost {
  border: 1px solid rgba(16, 24, 40, 0.1);
  background: rgba(255, 255, 255, 0.86);
  color: #12151c;
}

.landing-screen {
  display: grid;
  gap: 1rem;
}

.hero-card {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(320px, 0.9fr);
  gap: 1rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 1.8rem;
  background:
    radial-gradient(circle at left center, rgba(255, 106, 0, 0.14), transparent 26%),
    linear-gradient(135deg, #101217 0%, #161921 52%, #0d0f14 100%);
  padding: 1.5rem;
  box-shadow: 0 28px 65px rgba(15, 17, 22, 0.22);
}

.eyebrow {
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.eyebrow--dark {
  color: #ff6a00;
}

.hero-card__copy {
  display: grid;
  align-content: center;
  gap: 1rem;
  padding: 0.45rem 0;
}

.hero-card h2 {
  color: #ffffff;
  font-size: clamp(2.2rem, 4vw, 3.35rem);
  font-weight: 800;
  line-height: 0.95;
  max-width: 12ch;
}

.hero-card h2 span {
  display: block;
  margin-top: 0.35rem;
  color: #ff6a00;
}

.hero-card__copy p:last-of-type {
  max-width: 30rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.02rem;
}

.hero-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.hero-button {
  min-width: 10.5rem;
  border-radius: 0.95rem;
  cursor: pointer;
  padding: 0.95rem 1.2rem;
  font-weight: 700;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.hero-button:hover {
  transform: translateY(-1px);
}

.hero-button--primary {
  border: none;
  background: linear-gradient(135deg, #ff7a1a, #ff5a00);
  color: #ffffff;
  box-shadow: 0 18px 30px rgba(255, 106, 0, 0.24);
}

.hero-button--secondary {
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.04);
  color: #ffffff;
}

.hero-button--ghost {
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  color: rgba(255, 255, 255, 0.84);
}

.hero-card__art {
  position: relative;
  min-height: 280px;
  border-radius: 1.5rem;
  overflow: hidden;
}

.hero-card__art::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(16, 18, 23, 0.78) 0%, rgba(16, 18, 23, 0.12) 24%, transparent 46%),
    linear-gradient(180deg, rgba(16, 18, 23, 0.12), rgba(16, 18, 23, 0.3));
}

.hero-card__art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.entry-grid,
.summary-strip,
.info-grid {
  display: grid;
  gap: 1rem;
}

.entry-grid,
.info-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.entry-card,
.info-card,
.summary-card {
  border: 1px solid rgba(16, 24, 40, 0.08);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 18px 40px rgba(15, 17, 22, 0.05);
}

.entry-card {
  display: grid;
  align-content: start;
  gap: 0.8rem;
  padding: 1.35rem;
  border-radius: 1.5rem;
}

.entry-card--highlight {
  background:
    radial-gradient(circle at top right, rgba(255, 106, 0, 0.12), transparent 28%),
    rgba(255, 255, 255, 0.97);
}

.entry-card__eyebrow {
  color: #ff6a00;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.entry-card h3,
.info-card h3 {
  color: #141821;
  font-size: 1.28rem;
  font-weight: 800;
}

.entry-card p,
.info-card p {
  color: #677080;
}

.entry-button {
  justify-self: start;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #ff7a1a, #ff5a00);
  color: #ffffff;
  cursor: pointer;
  padding: 0.9rem 1.15rem;
  font-weight: 700;
}

.entry-button--dark {
  background: linear-gradient(135deg, #171c25, #090c11);
}

.summary-strip {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.summary-card {
  display: grid;
  gap: 0.35rem;
  padding: 1.15rem 1.05rem;
  border-radius: 1.3rem;
}

.summary-card strong {
  color: #11151c;
  font-size: 1.7rem;
  font-weight: 800;
  line-height: 1;
}

.summary-card span {
  color: #6b7584;
  font-size: 0.9rem;
}

.info-card {
  position: relative;
  overflow: hidden;
  border-radius: 1.6rem;
  padding: 1.35rem;
}

.flow-list {
  display: grid;
  gap: 0.95rem;
  margin-top: 1rem;
}

.flow-row {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
}

.flow-row span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.85rem;
  height: 1.85rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #ff7a1a, #ff5a00);
  color: #ffffff;
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
}

.flow-row p {
  color: #677080;
}

.info-card--glow {
  background:
    radial-gradient(circle at top right, rgba(255, 106, 0, 0.12), transparent 26%),
    rgba(255, 255, 255, 0.96);
}

.pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1.15rem;
}

.pill-row span {
  border: 1px solid rgba(255, 106, 0, 0.12);
  border-radius: 999px;
  background: rgba(255, 249, 244, 0.92);
  color: #9d4d14;
  padding: 0.7rem 0.95rem;
  font-size: 0.9rem;
  font-weight: 700;
}

@media (max-width: 1500px) {
  .summary-strip {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1280px) {
  .landing-topbar,
  .hero-card,
  .entry-grid,
  .summary-strip,
  .info-grid {
    grid-template-columns: 1fr;
    display: grid;
  }
}

@media (max-width: 860px) {
  .landing-shell {
    width: min(100%, calc(100% - 1rem));
    padding-top: 0.75rem;
  }

  .landing-topbar__actions {
    width: 100%;
  }

  .topbar-button {
    width: 100%;
  }

  .hero-card__copy p:last-of-type {
    max-width: none;
  }
}
</style>
