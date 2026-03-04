<template>
  <button
    class="toolbar-btn"
    :class="{ active }"
    v-bind="$attrs"
    :title="title"
  >
    <slot />
  </button>
</template>

<script setup>
defineProps({
  active: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
/* Use CSS custom properties from your theme */
.toolbar-btn {
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  color: var(--color-gray-700);
}

.toolbar-btn:hover {
  background-color: var(--color-gray-100);
}

.dark .toolbar-btn:hover {
  background-color: var(--color-gray-800);
}

.toolbar-btn.active {
  background-color: var(--color-gray-200);
  color: var(--color-brand-500);
}

.dark .toolbar-btn.active {
  background-color: var(--color-gray-800);
  color: var(--color-brand-400);
}
</style>