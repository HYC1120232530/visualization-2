<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  /** 当前选中的 ISO3 */
  selectedCode: { type: String, required: true },
  /** { country, countryCode }[] */
  options: { type: Array, required: true },
  dash: { type: Boolean, default: false },
  placeholder: { type: String, default: '搜索国家名称…' },
})

const emit = defineEmits(['select'])

const rootRef = ref(null)
const inputRef = ref(null)
const listRef = ref(null)
const open = ref(false)
const query = ref('')
const highlightIndex = ref(0)

const selectedLabel = computed(() => {
  const found = props.options.find((o) => o.countryCode === props.selectedCode)
  return found?.country ?? props.selectedCode ?? '—'
})

const normalizedQuery = computed(() => query.value.trim().toLowerCase())

const filtered = computed(() => {
  const q = normalizedQuery.value
  if (!q) return props.options
  return props.options.filter((c) => c.country.toLowerCase().includes(q))
})

watch(filtered, (list) => {
  if (highlightIndex.value >= list.length) {
    highlightIndex.value = Math.max(0, list.length - 1)
  }
})

watch(
  () => props.selectedCode,
  () => {
    if (!open.value) return
    syncHighlightToSelection()
  },
)

function syncHighlightToSelection() {
  const idx = filtered.value.findIndex((c) => c.countryCode === props.selectedCode)
  highlightIndex.value = idx >= 0 ? idx : 0
}

function close() {
  open.value = false
  query.value = ''
}

function toggle() {
  open.value = !open.value
  if (open.value) {
    query.value = ''
    nextTick(() => {
      inputRef.value?.focus()
      syncHighlightToSelection()
      scrollHighlightIntoView()
    })
  }
}

function selectCode(code) {
  if (!code) return
  emit('select', code)
  close()
}

function onKeydown(e) {
  if (!open.value) return

  const list = filtered.value

  if (e.key === 'Escape') {
    e.preventDefault()
    close()
    return
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (list.length === 0) return
    highlightIndex.value = (highlightIndex.value + 1) % list.length
    scrollHighlightIntoView()
    return
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (list.length === 0) return
    highlightIndex.value = (highlightIndex.value - 1 + list.length) % list.length
    scrollHighlightIntoView()
    return
  }

  if (e.key === 'Enter') {
    e.preventDefault()
    const item = list[highlightIndex.value]
    if (item) selectCode(item.countryCode)
  }
}

function scrollHighlightIntoView() {
  nextTick(() => {
    const ul = listRef.value
    if (!ul) return
    const items = ul.querySelectorAll('.country-search__option')
    items[highlightIndex.value]?.scrollIntoView({ block: 'nearest' })
  })
}

function onDocumentPointerDown(e) {
  if (!open.value || !rootRef.value) return
  if (!rootRef.value.contains(e.target)) close()
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown, true)
})
</script>

<template>
  <div ref="rootRef" class="country-search" :class="{ 'country-search--dash': dash }">
    <button
      type="button"
      class="country-search__trigger"
      :aria-expanded="open"
      aria-haspopup="listbox"
      @click="toggle"
    >
      <span class="country-search__value">{{ selectedLabel }}</span>
      <span class="country-search__caret" aria-hidden="true" />
    </button>

    <div v-show="open" class="country-search__dropdown" role="listbox">
      <input
        ref="inputRef"
        v-model="query"
        type="search"
        class="country-search__filter"
        :placeholder="placeholder"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        @keydown="onKeydown"
      />
      <ul ref="listRef" class="country-search__list">
        <li v-if="filtered.length === 0" class="country-search__empty" role="status">
          无匹配国家
        </li>
        <li
          v-for="(c, i) in filtered"
          v-else
          :key="c.countryCode"
          role="option"
          :aria-selected="c.countryCode === selectedCode"
          class="country-search__option"
          :class="{
            'country-search__option--selected': c.countryCode === selectedCode,
            'country-search__option--keyboard': i === highlightIndex,
          }"
          @mousedown.prevent="selectCode(c.countryCode)"
          @mouseenter="highlightIndex = i"
        >
          {{ c.country }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.country-search {
  position: relative;
  min-width: 0;
}

.country-search__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  min-width: 0;
  padding: 10px 12px 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #ffffff;
  font-size: 14px;
  color: #0f172a;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.country-search__trigger:hover {
  border-color: #94a3b8;
}

.country-search__trigger:focus-visible {
  outline: none;
  border-color: #38bdf8;
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.25);
}

.country-search__value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.country-search__caret {
  flex-shrink: 0;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid #64748b;
  opacity: 0.85;
}

.country-search__dropdown {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 4px);
  z-index: 80;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.14);
  overflow: hidden;
}

.country-search__filter {
  display: block;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-bottom: 1px solid #e2e8f0;
  font-size: 14px;
  color: #0f172a;
  background: #f8fafc;
}

.country-search__filter:focus {
  outline: none;
  background: #ffffff;
}

.country-search__filter::placeholder {
  color: #94a3b8;
}

.country-search__list {
  margin: 0;
  padding: 4px 0;
  list-style: none;
  max-height: 260px;
  overflow-y: auto;
}

.country-search__empty {
  padding: 14px 12px;
  font-size: 13px;
  color: #64748b;
  text-align: center;
}

.country-search__option {
  padding: 8px 12px;
  font-size: 14px;
  color: #334155;
  cursor: pointer;
  transition: background 0.1s ease;
}

.country-search__option:hover {
  background: #f1f5f9;
}

.country-search__option--selected {
  font-weight: 600;
  color: #1d4ed8;
  background: #eff6ff;
}

.country-search__option--keyboard:not(.country-search__option--selected) {
  background: #e2e8f0;
}

.country-search__option--keyboard.country-search__option--selected {
  background: #dbeafe;
}

/* 深色仪表盘 */
.country-search--dash .country-search__trigger {
  border-color: rgba(148, 163, 184, 0.22);
  background: rgba(15, 23, 42, 0.55);
  color: #e2e8f0;
}

.country-search--dash .country-search__trigger:hover {
  border-color: rgba(148, 163, 184, 0.35);
}

.country-search--dash .country-search__caret {
  border-top-color: #94a3b8;
}

.country-search--dash .country-search__dropdown {
  border-color: rgba(148, 163, 184, 0.2);
  background: rgba(17, 24, 39, 0.98);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.45);
}

.country-search--dash .country-search__filter {
  border-bottom-color: rgba(148, 163, 184, 0.15);
  background: rgba(15, 23, 42, 0.9);
  color: #e2e8f0;
}

.country-search--dash .country-search__filter:focus {
  background: rgba(15, 23, 42, 0.98);
}

.country-search--dash .country-search__filter::placeholder {
  color: #64748b;
}

.country-search--dash .country-search__empty {
  color: #94a3b8;
}

.country-search--dash .country-search__option {
  color: #cbd5e1;
}

.country-search--dash .country-search__option:hover {
  background: rgba(51, 65, 85, 0.5);
}

.country-search--dash .country-search__option--selected {
  color: #7dd3fc;
  background: rgba(56, 189, 248, 0.12);
}

.country-search--dash .country-search__option--keyboard:not(.country-search__option--selected) {
  background: rgba(51, 65, 85, 0.75);
}

.country-search--dash .country-search__option--keyboard.country-search__option--selected {
  background: rgba(56, 189, 248, 0.22);
}
</style>
