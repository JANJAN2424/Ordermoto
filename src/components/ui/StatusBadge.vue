<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    tone?: 'neutral' | 'success' | 'warning' | 'accent' | 'info'
  }>(),
  {
    tone: 'neutral',
  },
)
</script>

<template>
  <span class="badge" :class="`badge--${tone}`">{{ label }}</span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.badge--neutral {
  background: rgba(73, 61, 49, 0.08);
  color: #5d5044;
}

.badge--success {
  background: rgba(47, 111, 83, 0.16);
  color: #2f6f53;
}

.badge--warning {
  background: rgba(180, 109, 32, 0.16);
  color: #8c561f;
}

.badge--accent {
  background: rgba(208, 100, 42, 0.16);
  color: #a44d1e;
}

.badge--info {
  background: rgba(46, 106, 120, 0.14);
  color: #2f6a78;
}
</style>
