<script setup>
import CountrySearchSelect from './CountrySearchSelect.vue'

defineProps({
  /** 深色仪表盘主题 */
  dash: { type: Boolean, default: false },
  /** off：不显示对比；panel：对比页仅显示「对比国家」选择（对比已开启） */
  compareUi: {
    type: String,
    default: 'off',
    validator: (v) => v === 'off' || v === 'panel',
  },
  /** 两国对比页：指标由雷达图展示全部维度，隐藏指标下拉 */
  hideMetric: { type: Boolean, default: false },
  /** 时间演变页：去掉顶部时间轴滑块与播放年份，仅保留国家/指标等 */
  hideTimeline: { type: Boolean, default: false },
  countryOptions: { type: Array, required: true },
  compareOptions: { type: Array, required: true },
  metricOptions: { type: Array, required: true },
  primaryCountryCode: { type: String, required: true },
  compareCountryCode: { type: String, default: '' },
  selectedMetric: { type: String, required: true },
  years: { type: Array, required: true },
  selectedYearIndex: { type: Number, required: true },
  currentYear: { type: [String, Number], required: true },
  isPlaying: { type: Boolean, default: false },
})

const emit = defineEmits([
  'set-primary-country',
  'set-compare-country',
  'set-metric',
  'set-selected-year-index',
  'toggle-playback',
  'previous-year',
  'next-year',
])
</script>

<template>
  <section class="control-panel" :class="{ 'control-panel--dash': dash }">
    <div
      class="controls-grid"
      :class="{ 'controls-grid--panel': compareUi === 'panel' && !hideMetric }"
    >
      <div class="field-group">
        <label class="field-label" for="primary-country-select">主国家</label>
        <CountrySearchSelect
          id="primary-country-select"
          :selected-code="primaryCountryCode"
          :options="countryOptions"
          :dash="dash"
          placeholder="搜索主国家…"
          @select="emit('set-primary-country', $event)"
        />
      </div>

      <div v-if="!hideMetric" class="field-group">
        <label class="field-label">指标</label>
        <select :value="selectedMetric" @change="emit('set-metric', $event.target.value)">
          <option v-for="metric in metricOptions" :key="metric.key" :value="metric.key">
            {{ metric.label }}
          </option>
        </select>
      </div>

      <div v-if="compareUi === 'panel'" class="field-group">
        <label class="field-label" for="compare-country-select">对比国家</label>
        <CountrySearchSelect
          id="compare-country-select"
          :selected-code="compareCountryCode"
          :options="compareOptions"
          :dash="dash"
          placeholder="搜索对比国家…"
          @select="emit('set-compare-country', $event)"
        />
      </div>
    </div>

    <template v-if="!hideTimeline">
      <div class="timeline-toolbar">
        <div class="timeline-actions">
          <button
            type="button"
            class="action-button"
            @click="emit('previous-year')"
            :disabled="selectedYearIndex <= 0"
          >
            上一年
          </button>
          <button type="button" class="play-button" @click="emit('toggle-playback')">
            {{ isPlaying ? '暂停播放' : '播放年份' }}
          </button>
          <button
            type="button"
            class="action-button"
            @click="emit('next-year')"
            :disabled="selectedYearIndex >= years.length - 1"
          >
            下一年
          </button>
        </div>

        <div class="year-box">{{ currentYear }}</div>
      </div>

      <input
        class="slider"
        type="range"
        min="0"
        :max="years.length - 1"
        :value="selectedYearIndex"
        step="1"
        @input="emit('set-selected-year-index', Number($event.target.value))"
      />

      <div class="year-labels">
        <span v-for="year in years" :key="year">{{ year }}</span>
      </div>
    </template>
  </section>
</template>

<style scoped>
.control-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.controls-grid--panel {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

select,
.toggle-button {
  min-width: 0;
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #ffffff;
  font-size: 14px;
  color: #0f172a;
}

.toggle-button {
  cursor: pointer;
}

.timeline-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
}

.timeline-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-button,
.play-button {
  border: none;
  border-radius: 999px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.action-button {
  background: #e2e8f0;
  color: #0f172a;
}

.action-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.play-button {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
}

.year-box {
  padding: 10px 14px;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 14px;
  font-weight: 700;
}

.slider {
  width: 100%;
  accent-color: #38bdf8;
}

.control-panel--dash .slider {
  opacity: 0.92;
}

.year-labels {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 13px;
  color: #64748b;
}

@media (max-width: 1100px) {
  .controls-grid--panel {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .controls-grid {
    grid-template-columns: 1fr;
  }

  .timeline-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }
}

.control-panel--dash .field-label {
  color: #94a3b8;
}

.control-panel--dash select,
.control-panel--dash .toggle-button {
  border-color: rgba(148, 163, 184, 0.22);
  background: rgba(15, 23, 42, 0.55);
  color: #e2e8f0;
}

.control-panel--dash .action-button {
  background: rgba(51, 65, 85, 0.85);
  color: #e2e8f0;
}

.control-panel--dash .year-box {
  background: rgba(56, 189, 248, 0.14);
  color: #7dd3fc;
}

.control-panel--dash .year-labels {
  color: #64748b;
}
</style>
