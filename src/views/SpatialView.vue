<script setup>
import { ref } from 'vue'
import CompareChart from '../components/CompareChart.vue'
import MapPanel from '../components/MapPanel.vue'
import TabbedModule from '../components/TabbedModule.vue'
import { useWorldBankData } from '../composables/useWorldBankData'

const {
  state,
  metrics,
  years,
  selectedMetric,
  currentYear,
  mapData,
  compareBarData,
  setMetric,
  setSelectedYear,
} = useWorldBankData()

const spatialTab = ref('map')

const spatialTabs = [
  { id: 'map', label: '世界地图' },
  { id: 'rank', label: '头部排名' },
]
</script>

<template>
  <div class="view spatial">
    <header class="view__head">
      <h2 class="view__title">空间分布</h2>
      <p class="view__desc">
        在「空间视图」标题旁选择指标与年份；地图以颜色深浅表示各国该指标大小，右侧连续色带为数值图例。头部排名为当年全球排序前列节选。
      </p>
    </header>

    <TabbedModule
      v-model="spatialTab"
      class="anim-rise"
      title="空间视图"
      subtitle="地图与排名共用此处指标与年份；颜色越深（或越靠色带上端）表示数值越大。"
      :tabs="spatialTabs"
    >
      <template #titleExtra>
        <div class="spatial-toolbar" role="group" aria-label="指标与年份">
          <label class="spatial-field">
            <span class="spatial-field__label">指标</span>
            <select
              class="spatial-select"
              :value="state.selectedMetric"
              @change="setMetric($event.target.value)"
            >
              <option v-for="m in metrics" :key="m.key" :value="m.key">{{ m.label }}</option>
            </select>
          </label>
          <label class="spatial-field">
            <span class="spatial-field__label">年份</span>
            <select
              class="spatial-select"
              :value="state.selectedYear"
              @change="setSelectedYear(Number($event.target.value))"
            >
              <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
            </select>
          </label>
        </div>
      </template>

      <MapPanel
        v-if="spatialTab === 'map'"
        embedded
        :map-data="mapData"
        :current-metric="selectedMetric"
        :current-year="currentYear"
      />
      <CompareChart
        v-if="spatialTab === 'rank'"
        embedded
        spatial-mode
        :bar-data="compareBarData"
        :current-metric="selectedMetric"
        :current-year="currentYear"
      />
    </TabbedModule>
  </div>
</template>

<style scoped>
.view__head {
  margin-bottom: 16px;
}

.view__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #e2e8f0;
  letter-spacing: -0.02em;
}

.view__desc {
  margin: 8px 0 0;
  max-width: 72ch;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: #64748b;
}

.spatial-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px 16px;
}

.spatial-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.spatial-field__label {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.spatial-select {
  min-width: 148px;
  max-width: min(240px, 42vw);
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(15, 23, 42, 0.55);
  color: #e2e8f0;
  font-size: 13px;
  cursor: pointer;
}

.spatial-select:focus {
  outline: none;
  border-color: rgba(56, 189, 248, 0.45);
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.15);
}
</style>
