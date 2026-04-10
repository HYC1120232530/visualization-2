<script setup>
import * as echarts from 'echarts'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { chartAnimation, setChartOptionMerge } from '../constants/chartAnimation.js'
import { COLORS } from '../constants/colors'
import { useMetricFormatter } from '../composables/useMetricFormatter'
import { subscribeChartResize } from '../utils/chartResizeBus.js'

const props = defineProps({
  embedded: { type: Boolean, default: false },
  /** 空间分布页：仅按数值排名、条形用色阶、不可点击切换主国 */
  spatialMode: { type: Boolean, default: false },
  barData: { type: Array, required: true },
  currentMetric: { type: Object, required: true },
  currentYear: { type: [String, Number], required: true },
})

const emit = defineEmits(['select-country'])

const chartRef = ref(null)
const { formatMetricValue } = useMetricFormatter()
let chartInstance = null

/** 固定展示 8 条：优先保留主/对比国，其余按全球排名从高到低补齐 */
const DISPLAY_COUNT = 8

const rankingData = computed(() => {
  const sorted = [...props.barData].sort((a, b) => b.value - a.value)
  if (sorted.length === 0) return []

  const withRank = sorted.map((item, index) => ({
    ...item,
    rank: index + 1,
  }))

  if (props.spatialMode) {
    return withRank.slice(0, DISPLAY_COUNT)
  }

  const picked = []
  const seen = new Set()

  const tryAdd = (code) => {
    if (!code || seen.has(code)) return
    const row = withRank.find((item) => item.countryCode === code)
    if (!row) return
    picked.push(row)
    seen.add(code)
  }

  const primaryRow = withRank.find((item) => item.isPrimary)
  const compareRow = withRank.find((item) => item.isCompare)
  if (primaryRow) tryAdd(primaryRow.countryCode)
  if (compareRow) tryAdd(compareRow.countryCode)

  for (const row of withRank) {
    if (picked.length >= DISPLAY_COUNT) break
    tryAdd(row.countryCode)
  }

  picked.sort((a, b) => a.rank - b.rank)

  return picked
})

const barColorsSpatial = ['#1e3a8a', '#1d4ed8', '#2563eb', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd', '#e0f2fe']

const renderChart = () => {
  if (!chartRef.value) return

  if (props.barData.length === 0 || rankingData.value.length === 0) {
    chartInstance?.clear()
    return
  }

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
    chartInstance.on('click', (params) => {
      if (props.spatialMode) return
      const match = rankingData.value[params.dataIndex]
      if (match?.countryCode) {
        emit('select-country', match.countryCode)
      }
    })
  }

  const axisText = props.embedded ? '#e2e8f0' : COLORS.text
  const axisMuted = props.embedded ? '#94a3b8' : COLORS.muted

  setChartOptionMerge(
    chartInstance,
    {
      ...chartAnimation,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        backgroundColor: 'rgba(15, 23, 42, 0.96)',
        borderColor: 'rgba(148, 163, 184, 0.35)',
        borderWidth: 1,
        textStyle: {
          color: '#f8fafc',
        },
        formatter: (params) => {
          const point = params[0]
          if (!point) return ''
          const item = rankingData.value[point.dataIndex]
          return [
            `国家：${item?.country ?? '—'}`,
            `排名：#${item?.rank ?? '--'}`,
            `年份：${props.currentYear}`,
            `指标：${props.currentMetric.fullName}`,
            `数值：${formatMetricValue(props.currentMetric, point.value)}`,
          ].join('<br/>')
        },
      },
      grid: {
        top: 18,
        left: props.embedded ? 132 : 108,
        right: 18,
        bottom: 24,
      },
      xAxis: {
        type: 'value',
        axisLine: {
          show: true,
          lineStyle: { color: axisMuted },
        },
        axisTick: { show: true, lineStyle: { color: axisMuted } },
        axisLabel: {
          color: axisText,
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(148, 163, 184, 0.22)',
            type: 'dashed',
          },
        },
      },
      yAxis: {
        type: 'category',
        inverse: true,
        data: rankingData.value.map((_, index) => String(index)),
        axisLine: {
          show: true,
          lineStyle: { color: axisMuted },
        },
        axisTick: { show: false },
        axisLabel: {
          color: axisText,
          fontWeight: 600,
          align: 'right',
          margin: 10,
          lineHeight: 16,
          formatter: (value) => {
            const item = rankingData.value[Number(value)]
            if (!item) return ''
            return `{r|#${item.rank}}\n{n|${item.country}}`
          },
          rich: {
            r: {
              fontSize: 11,
              color: axisMuted,
              fontWeight: 700,
              padding: [0, 0, 2, 0],
            },
            n: {
              fontSize: 12,
              color: axisText,
              fontWeight: 600,
            },
          },
        },
      },
      series: [
        {
          type: 'bar',
          barWidth: 18,
          data: rankingData.value.map((item, idx) => ({
            value: item.value,
            itemStyle: {
              color: props.spatialMode
                ? barColorsSpatial[Math.min(idx, barColorsSpatial.length - 1)]
                : item.isPrimary
                  ? COLORS.primary
                  : item.isCompare
                    ? COLORS.compare
                    : '#94a3b8',
              borderRadius: [0, 10, 10, 0],
            },
          })),
          label: {
            show: true,
            position: 'right',
            color: axisMuted,
            formatter: ({ dataIndex }) => {
              const item = rankingData.value[dataIndex]
              if (!item) return ''
              if (props.spatialMode) {
                return formatMetricValue(props.currentMetric, item.value)
              }
              if (item.isPrimary) return '主国家'
              if (item.isCompare) return '对比国家'
              return ''
            },
          },
        },
      ],
    },
    ['series'],
  )

  nextTick(() => {
    chartInstance?.resize()
  })
}

const handleResize = () => {
  chartInstance?.resize()
}

let unsubscribeChartResizeBus = () => {}

onMounted(() => {
  unsubscribeChartResizeBus = subscribeChartResize(handleResize)
  nextTick(() => {
    renderChart()
  })
  window.addEventListener('resize', handleResize)
})

watch(
  () => [props.barData, props.currentYear, props.currentMetric?.key, props.embedded, props.spatialMode],
  renderChart,
  { deep: true },
)

onBeforeUnmount(() => {
  unsubscribeChartResizeBus()
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})
</script>

<template>
  <section class="panel" :class="{ 'panel--embedded': embedded }">
    <div v-if="!embedded" class="panel-head">
      <h3 class="panel-title">国家排名视图</h3>
      <p class="panel-description">
        当前年、当前指标下固定展示 8 个国家：优先包含主国家与对比国家，其余按全球排名从高到低补齐；左侧为排名与名称；点击条形可切换主国家。
      </p>
    </div>
    <p v-if="barData.length === 0" class="empty-hint">
      当前年份下该指标无可用数据（例如 CSV 末列年份尚未填报）。请调整年份或更换指标。
    </p>
    <div
      v-show="barData.length > 0"
      ref="chartRef"
      class="compare-chart"
      :class="{ 'compare-chart--embedded': embedded }"
      style="min-width: 0; min-height: 200px"
    ></div>
  </section>
</template>

<style scoped>
.panel {
  height: 100%;
}

.panel-head {
  margin-bottom: 10px;
}

.panel-title {
  margin: 0;
  font-size: 20px;
  color: #0f172a;
}

.panel-description {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.6;
  color: #64748b;
}

.compare-chart {
  width: 100%;
  height: 320px;
}

.compare-chart--embedded {
  height: var(--tabbed-chart-min-h, 420px);
  min-height: 360px;
}

.empty-hint {
  margin: 0 0 12px;
  padding: 14px 16px;
  font-size: 13px;
  line-height: 1.6;
  color: #64748b;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.panel--embedded .empty-hint {
  color: #94a3b8;
  background: rgba(15, 23, 42, 0.45);
  border-color: rgba(148, 163, 184, 0.18);
}
</style>
