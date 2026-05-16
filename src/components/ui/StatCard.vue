<script setup lang="ts">
defineProps<{
  label: string
  value: string
  helper: string
}>()
</script>

<template>
  <article class="stat-card">
    <p class="stat-card__label">{{ label }}</p>
    <p class="stat-card__value">{{ value }}</p>
    <p class="stat-card__helper">{{ helper }}</p>
  </article>
</template>

<style scoped>
.stat-card {
  border: 1px solid rgba(94, 70, 47, 0.12);
  border-radius: 1.25rem;
  background: rgba(255, 250, 244, 0.88);
  padding: 1.2rem;
  box-shadow: 0 18px 40px rgba(73, 51, 27, 0.08);
}

.stat-card__label {
  color: #7b6d5c;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.stat-card__value {
  margin-top: 0.5rem;
  color: #231b14;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-weight: 700;
  line-height: 1;
}

.stat-card__helper {
  margin-top: 0.65rem;
  color: #6b5c4c;
  font-size: 0.95rem;
}
</style>
