<script setup>
import * as echarts from 'echarts'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { chartAnimation, setChartOptionMerge } from '../constants/chartAnimation.js'
import { COLORS } from '../constants/colors'
import { useMetricFormatter } from '../composables/useMetricFormatter'
import { useWorldBankData } from '../composables/useWorldBankData'
import { subscribeChartResize } from '../utils/chartResizeBus.js'

defineProps({
  embedded: { type: Boolean, default: false },
})

const { metrics, selectedCountry, compareCountry, getMetricValue, state } = useWorldBankData()
const { formatMetricValue } = useMetricFormatter()

const chartRef = ref(null)
/** 单国/双国切换时需整表 replace；仅年份变化时 merge，便于 ECharts 播放更新动画 */
const radarSeriesLayoutKey = ref('')
let chartInstance = null
let resizeObserver = null

/**
 * 按该轴上两国数值的较大者为 100，其余同比例缩放：scaled = (value / max) * 100。
 * 原始值仍仅存于 primaryRaw/compareRaw，供 tooltip；此处仅生成展示用 0–100，避免 min–max 时较小值被压成 0。
 */
function pairScaleByMax(a, b) {
  if (a == null && b == null) return [50, 50]
  if (a == null) return [0, 100]
  if (b == null) return [100, 0]
  const maxValue = Math.max(a, b)
  if (maxValue < 1e-12) return [50, 50]
  return [(a / maxValue) * 100, (b / maxValue) * 100]
}

const radarPayload = computed(() => {
  const year = state.selectedYear
  const primaryCode = state.selectedCountryCode
  const compareCode = state.compareCountryCode
  const list = metrics.value
  const primaryRaw = []
  const compareRaw = []
  const primaryNorm = []
  const compareNorm = []

  for (const m of list) {
    const p = getMetricValue(primaryCode, year, m.key)
    const c = compareCode ? getMetricValue(compareCode, year, m.key) : null
    const [pn, cn] = pairScaleByMax(p, c)
    primaryRaw.push(p)
    compareRaw.push(c)
    primaryNorm.push(pn)
    compareNorm.push(cn)
  }

  return {
    indicator: list.map((m) => ({ name: m.label, max: 100 })),
    primaryNorm,
    compareNorm,
    primaryRaw,
    compareRaw,
    labels: list.map((m) => m.label),
  }
})

const renderChart = () => {
  if (!chartRef.value) return

  const p = radarPayload.value
  const primaryName = selectedCountry.value?.country ?? '主国家'
  const compareName = compareCountry.value?.country ?? '对比国'

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }

  const hasCompare = Boolean(state.compareEnabled && state.compareCountryCode)

  const seriesData = [
    {
      value: [...p.primaryNorm],
      name: primaryName,
      areaStyle: {
        color: 'rgba(37, 99, 235, 0.14)',
      },
      lineStyle: {
        width: 2.5,
        color: COLORS.primary,
      },
      itemStyle: {
        color: COLORS.primary,
      },
    },
  ]

  if (hasCompare) {
    seriesData.push({
      value: [...p.compareNorm],
      name: compareName,
      areaStyle: {
        color: 'rgba(6, 182, 212, 0.12)',
      },
      lineStyle: {
        width: 2.2,
        type: 'dashed',
        color: COLORS.compare,
      },
      itemStyle: {
        color: COLORS.compare,
      },
    })
  }

  const layoutKey = hasCompare ? 'dual' : 'single'
  const structureChanged = radarSeriesLayoutKey.value !== layoutKey
  radarSeriesLayoutKey.value = layoutKey

  setChartOptionMerge(
    chartInstance,
    {
      ...chartAnimation,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(15, 23, 42, 0.96)',
        borderColor: 'rgba(148, 163, 184, 0.35)',
        borderWidth: 1,
        textStyle: { color: '#f8fafc' },
        formatter: (params) => {
          if (params.componentType !== 'series') return ''
          const pl = radarPayload.value
          // 雷达图仅有一个 series，两国各占 data 中一项，须用 dataIndex 区分；seriesIndex 恒为 0。
          const dataIdx = params.dataIndex ?? 0
          const title =
            typeof params.name === 'string' && params.name
              ? params.name
              : dataIdx === 0
                ? primaryName
                : compareName
          const lines = [`<strong>${title}</strong>`, `年份：${state.selectedYear}`]
          pl.labels.forEach((label, i) => {
            const raw = dataIdx === 0 ? pl.primaryRaw[i] : pl.compareRaw[i]
            const mk = metrics.value[i]
            lines.push(
              `${label}：${formatMetricValue(mk, raw)}（轴上为按两国较大值比例刻度 0–100，非原始单位）`,
            )
          })
          return lines.join('<br/>')
        },
      },
      radar: {
        indicator: p.indicator,
        center: ['50%', '52%'],
        radius: '62%',
        axisName: {
          color: '#94a3b8',
          fontSize: 11,
        },
        splitLine: {
          lineStyle: { color: 'rgba(148, 163, 184, 0.18)' },
        },
        splitArea: {
          show: true,
          areaStyle: {
            color: ['rgba(15, 23, 42, 0.2)', 'rgba(15, 23, 42, 0.08)'],
          },
        },
        axisLine: {
          lineStyle: { color: 'rgba(148, 163, 184, 0.25)' },
        },
      },
      series: [
        {
          type: 'radar',
          ...chartAnimation,
          emphasis: {
            focus: 'series',
          },
          data: seriesData,
        },
      ],
    },
    structureChanged ? ['series', 'radar', 'tooltip'] : [],
  )

  nextTick(() => {
    chartInstance?.resize()
  })
}

const handleResize = () => chartInstance?.resize()

let unsubscribeChartResizeBus = () => {}

function bindResizeObserver() {
  resizeObserver?.disconnect()
  if (!chartRef.value || typeof ResizeObserver === 'undefined') return
  resizeObserver = new ResizeObserver(() => {
    chartInstance?.resize()
  })
  resizeObserver.observe(chartRef.value)
}

onMounted(async () => {
  unsubscribeChartResizeBus = subscribeChartResize(handleResize)
  await nextTick()
  renderChart()
  bindResizeObserver()
  window.addEventListener('resize', handleResize)
})

watch(
  () => ({
    year: state.selectedYear,
    primary: state.selectedCountryCode,
    compare: state.compareCountryCode,
    compareOn: state.compareEnabled,
  }),
  async () => {
    await nextTick()
    renderChart()
  },
  { deep: true },
)

onBeforeUnmount(() => {
  unsubscribeChartResizeBus()
  resizeObserver?.disconnect()
  resizeObserver = null
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
  chartInstance = null
})
</script>

<template>
  <section class="compare-radar" :class="{ 'compare-radar--embedded': embedded }">
    <p v-if="!state.compareEnabled || !state.compareCountryCode" class="compare-radar__hint">
      请先在上方选择对比国家以查看双国雷达。
    </p>
    <div
      ref="chartRef"
      class="compare-radar__chart"
      :class="{ 'compare-radar__chart--embedded': embedded }"
      style="min-width: 0; min-height: 200px"
    ></div>
    <p class="compare-radar__note">
      每个轴对应一项指标。展示刻度为：在该轴上取两国中的<strong>较大值为 100</strong>，两国数值按
      <code>(值 / 较大值) × 100</code> 同比例映射（例如 4 与 3 → 100 与 75），避免旧版「最小值映射为 0」导致较小值被压到轴心。
      Tooltip 中仍为<strong>原始数据</strong>，未改写。
    </p>
  </section>
</template>

<style scoped>
.compare-radar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
}

.compare-radar__hint {
  margin: 0;
  padding: 12px 14px;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: #94a3b8;
  background: rgba(15, 23, 42, 0.45);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 12px;
}

.compare-radar__chart {
  width: 100%;
  height: 360px;
}

.compare-radar__chart--embedded {
  height: var(--tabbed-chart-min-h, 420px);
  min-height: 380px;
}

.compare-radar__note {
  margin: 0;
  font-size: 0.75rem;
  line-height: 1.5;
  color: #64748b;
  max-width: 72ch;
}
</style>
