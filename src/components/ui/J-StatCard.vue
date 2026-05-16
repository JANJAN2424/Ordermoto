<script setup lang="ts">
withDefaults(
  defineProps<{
  label: string
  value: string
  helper: string
    tone?: 'orange' | 'green' | 'blue' | 'violet'
    iconPath?: string
  }>(),
  {
    tone: 'orange',
    iconPath: '',
  },
)
</script>

<template>
  <article class="stat-card" :class="`stat-card--${tone}`">
    <div class="stat-card__header">
      <span class="stat-card__icon">
        <svg v-if="iconPath" viewBox="0 0 24 24" aria-hidden="true">
          <path
            :d="iconPath"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.8"
          />
        </svg>
      </span>

      <div class="stat-card__copy">
        <p class="stat-card__value">{{ value }}</p>
        <p class="stat-card__label">{{ label }}</p>
      </div>
    </div>

    <p class="stat-card__helper">{{ helper }}</p>
  </article>
</template>

<style scoped>
.stat-card {
  border: 1px solid rgba(16, 24, 40, 0.08);
  border-radius: 1.35rem;
  background: rgba(255, 255, 255, 0.94);
  padding: 1.2rem 1.15rem;
  box-shadow: 0 18px 40px rgba(15, 17, 22, 0.05);
}

.stat-card__header {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.stat-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 1rem;
  background: rgba(255, 106, 0, 0.12);
  color: #ff6a00;
  flex-shrink: 0;
}

.stat-card__icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

.stat-card__copy {
  display: grid;
  gap: 0.15rem;
}

.stat-card__label {
  color: #505868;
  font-size: 0.92rem;
  font-weight: 600;
}

.stat-card__value {
  color: #11151c;
  font-family: 'Arial Black', 'Segoe UI', sans-serif;
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  font-weight: 700;
  line-height: 1;
}

.stat-card__helper {
  margin-top: 0.85rem;
  color: #7b8392;
  font-size: 0.85rem;
}

.stat-card--green .stat-card__icon {
  background: rgba(34, 197, 94, 0.12);
  color: #16a34a;
}

.stat-card--blue .stat-card__icon {
  background: rgba(59, 130, 246, 0.12);
  color: #2563eb;
}

.stat-card--violet .stat-card__icon {
  background: rgba(139, 92, 246, 0.12);
  color: #7c3aed;
}
</style>
