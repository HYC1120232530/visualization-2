<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  tabs: {
    type: Array,
    required: true,
    // { id: string, label: string }
  },
  modelValue: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <section class="tabbed-module dash-card anim-rise">
    <header class="tabbed-module__head">
      <div class="tabbed-module__intro">
        <div class="tabbed-module__title-row">
          <h2 class="tabbed-module__title">{{ title }}</h2>
          <div v-if="$slots.titleExtra" class="tabbed-module__title-extra">
            <slot name="titleExtra" />
          </div>
        </div>
        <p v-if="subtitle" class="tabbed-module__subtitle">{{ subtitle }}</p>
      </div>
      <div class="segmented" role="tablist" :aria-label="title">
        <button
          v-for="t in tabs"
          :key="t.id"
          type="button"
          class="segmented__btn"
          role="tab"
          :aria-selected="modelValue === t.id"
          :class="{ 'segmented__btn--active': modelValue === t.id }"
          @click="emit('update:modelValue', t.id)"
        >
          {{ t.label }}
        </button>
      </div>
    </header>
    <div class="tabbed-module__body">
      <Transition name="tab-fade" mode="out-in">
        <div :key="modelValue" class="tabbed-module__pane">
          <slot />
        </div>
      </Transition>
    </div>
  </section>
</template>

<style scoped>
.tabbed-module {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.tabbed-module__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 14px 20px;
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--dash-border);
}

.tabbed-module__title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;
}

.tabbed-module__title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--dash-text);
}

.tabbed-module__title-extra {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.tabbed-module__subtitle {
  margin: 6px 0 0;
  max-width: 42ch;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--dash-muted);
}

.segmented {
  display: inline-flex;
  padding: 4px;
  border-radius: 12px;
  background: var(--dash-segment-bg);
  border: 1px solid var(--dash-border);
  gap: 4px;
}

.segmented__btn {
  border: none;
  cursor: pointer;
  padding: 8px 14px;
  border-radius: 9px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--dash-muted);
  background: transparent;
  transition:
    color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.segmented__btn:hover {
  color: var(--dash-text);
  background: rgba(255, 255, 255, 0.06);
}

.segmented__btn--active {
  color: var(--dash-accent-text);
  background: var(--dash-segment-active, rgba(56, 189, 248, 0.22));
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.06);
}

.tabbed-module__body {
  flex: 1;
  min-height: 0;
  position: relative;
}

.tabbed-module__pane {
  min-height: var(--tabbed-chart-min-h, 400px);
}

.tab-fade-enter-active,
.tab-fade-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
