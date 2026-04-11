<script setup>
import { ref } from 'vue'
import ExtraCharts from '../components/ExtraCharts.vue'
import TrendChart from '../components/TrendChart.vue'
import TabbedModule from '../components/TabbedModule.vue'
import { useWorldBankData } from '../composables/useWorldBankData'

const {
  dataset,
  years,
  selectedMetric,
  selectedCountry,
  selectedYearIndex,
  primarySeries,
  compareSeries,
  yoyYears,
  yoyPrimarySeries,
  setPrimaryCountry,
} = useWorldBankData()

const countriesByName = Object.fromEntries(dataset.countries.map((country) => [country.country, country]))

const temporalTab = ref('trend')

const temporalTabs = [
  { id: 'trend', label: '水平趋势' },
  { id: 'yoy', label: '同比增速' },
]
</script>

<template>
  <div class="view temporal">
    <header class="view__head">
      <h2 class="view__title">时间演变</h2>
      <p class="view__desc">
        仅展示<strong>主国家</strong>：折线为绝对水平与拐点，柱状为同比增速。主国家与指标在上方筛选；年份与 URL 参数同步。双国对照在「两国对比」页。
      </p>
    </header>

    <TabbedModule
      v-model="temporalTab"
      class="anim-rise"
      title="时间视图"
      subtitle="单序列时间分析：先看量级，再看增速。"
      :tabs="temporalTabs"
    >
      <TrendChart
        v-if="temporalTab === 'trend'"
        embedded
        hide-year-badge
        :years="years"
        :current-metric="selectedMetric"
        :primary-country="selectedCountry.country"
        compare-country=""
        :compare-enabled="false"
        :selected-year-index="selectedYearIndex"
        :primary-series="primarySeries"
        :compare-series="compareSeries"
        @select-country="
          (countryName) => {
            const match = countriesByName[countryName]
            if (match) setPrimaryCountry(match.countryCode)
          }
        "
      />
      <ExtraCharts
        v-if="temporalTab === 'yoy'"
        embedded
        :yoy-years="yoyYears"
        :yoy-primary-series="yoyPrimarySeries"
        :current-metric="selectedMetric"
        :primary-country="selectedCountry.country"
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
</style>
