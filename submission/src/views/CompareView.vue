<script setup>
import { ref } from 'vue'
import CompareRadarChart from '../components/CompareRadarChart.vue'
import ExtraCharts from '../components/ExtraCharts.vue'
import TabbedModule from '../components/TabbedModule.vue'
import { useWorldBankData } from '../composables/useWorldBankData'

const {
  dataset,
  state,
  selectedMetric,
  selectedCountry,
  compareCountry,
  yoyYears,
  yoyPrimarySeries,
  yoyCompareSeries,
} = useWorldBankData()

const compareTab = ref('radar')

const compareTabs = [
  { id: 'radar', label: '指标雷达' },
  { id: 'yoy', label: '同比增速' },
]
</script>

<template>
  <div class="view compare">
    <header class="view__head">
      <h2 class="view__title">两国对比</h2>
      <p class="view__desc">
        在全局选择主国家、对比国家与年份；雷达图在同一图中对比<strong>全部指标</strong>（各轴为不同量纲，轴上为两国相对位置）。
        同比增速仍为单指标序列，指标由 URL 或自其它页面带入。离开本页后对比会自动关闭。
      </p>
    </header>

    <TabbedModule
      v-model="compareTab"
      class="anim-rise anim-rise-delay-1"
      title="对比视图"
      subtitle="雷达：当前年份下全部指标；同比：与「时间演变」相同的单指标增速图。"
      :tabs="compareTabs"
    >
      <CompareRadarChart v-if="compareTab === 'radar'" embedded />
      <ExtraCharts
        v-if="compareTab === 'yoy'"
        embedded
        :yoy-years="yoyYears"
        :yoy-primary-series="yoyPrimarySeries"
        :yoy-compare-series="yoyCompareSeries"
        :current-metric="selectedMetric"
        :primary-country="selectedCountry.country"
        :compare-country="compareCountry?.country ?? ''"
        :compare-enabled="state.compareEnabled"
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
