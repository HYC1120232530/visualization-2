<script setup>
import * as echarts from 'echarts'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { chartAnimation, setChartOptionMerge } from '../constants/chartAnimation.js'
import { COLORS } from '../constants/colors'
import { useMetricFormatter } from '../composables/useMetricFormatter'
import { subscribeChartResize } from '../utils/chartResizeBus.js'

const props = defineProps({
  embedded: { type: Boolean, default: false },
  yoyYears: { type: Array, required: true },
  yoyPrimarySeries: { type: Array, required: true },
  yoyCompareSeries: { type: Array, default: () => [] },
  currentMetric: { type: Object, required: true },
  primaryCountry: { type: String, required: true },
  compareCountry: { type: String, default: '' },
  compareEnabled: { type: Boolean, default: false },
})

const yoyRef = ref(null)
const { formatPercent } = useMetricFormatter()
let yoyChart = null
let yoyResizeObserver = null
let unsubscribeChartResizeBus = () => {}

const renderYoyChart = () => {
  if (!yoyRef.value) return

  if (!yoyChart) {
    yoyChart = echarts.init(yoyRef.value)
  }

  const series = [
    {
      name: props.primaryCountry,
      type: 'bar',
      data: props.yoyPrimarySeries,
      itemStyle: {
        color: COLORS.primary,
        borderRadius: [8, 8, 0, 0],
      },
    },
  ]

  if (props.compareEnabled && props.compareCountry) {
    series.push({
      name: props.compareCountry,
      type: 'bar',
      data: props.yoyCompareSeries,
      itemStyle: {
        color: COLORS.compare,
        borderRadius: [8, 8, 0, 0],
      },
    })
  }

  const axisText = props.embedded ? '#e2e8f0' : COLORS.text
  const axisMuted = props.embedded ? '#94a3b8' : COLORS.muted

  setChartOptionMerge(
    yoyChart,
    {
      ...chartAnimation,
      legend: {
        bottom: props.embedded ? 6 : 0,
        top: props.embedded ? 'auto' : 0,
        left: props.embedded ? 'center' : 'auto',
        icon: 'roundRect',
        itemWidth: 14,
        itemHeight: 8,
        itemGap: 20,
        textStyle: { color: axisText, fontWeight: 600, fontSize: 12 },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(15, 23, 42, 0.96)',
        borderColor: 'rgba(148, 163, 184, 0.35)',
        borderWidth: 1,
        textStyle: { color: '#f8fafc' },
        formatter: (params) => {
          const lines = [
            `年份：${params[0]?.axisValue}`,
            `指标：${props.currentMetric.fullName}`,
            `维度：相对上一年的变化率（同比 %）`,
          ]
          params.forEach((item) => {
            lines.push(`${item.seriesName}：${formatPercent(item.value)}`)
          })
          return lines.join('<br/>')
        },
      },
      grid: {
        top: props.embedded ? 16 : 40,
        left: props.embedded ? 52 : 54,
        right: 20,
        bottom: props.embedded ? 52 : 32,
      },
      xAxis: {
        type: 'category',
        data: props.yoyYears.map(String),
        axisLine: {
          show: true,
          lineStyle: { color: axisMuted },
        },
        axisTick: {
          alignWithLabel: true,
          lineStyle: { color: axisMuted },
        },
        axisLabel: { color: axisText, fontWeight: 600 },
      },
      yAxis: {
        type: 'value',
        name: '同比变化率（%）',
        nameLocation: 'middle',
        nameGap: 44,
        nameTextStyle: {
          color: axisMuted,
          fontWeight: 600,
          fontSize: 11,
        },
        axisLine: {
          show: true,
          lineStyle: { color: axisMuted },
        },
        axisTick: {
          show: true,
          lineStyle: { color: axisMuted },
        },
        axisLabel: {
          show: true,
          formatter: '{value}%',
          color: axisText,
          fontWeight: 500,
        },
        splitLine: {
          lineStyle: { color: 'rgba(148, 163, 184, 0.22)', type: 'dashed' },
        },
      },
      series,
    },
    ['series'],
  )

  nextTick(() => {
    yoyChart?.resize()
  })
}

const handleResize = () => {
  yoyChart?.resize()
}

function bindYoyResizeObserver() {
  yoyResizeObserver?.disconnect()
  if (!yoyRef.value || typeof ResizeObserver === 'undefined') return
  yoyResizeObserver = new ResizeObserver(() => {
    yoyChart?.resize()
  })
  yoyResizeObserver.observe(yoyRef.value)
}

onMounted(() => {
  unsubscribeChartResizeBus = subscribeChartResize(handleResize)
  nextTick(() => {
    renderYoyChart()
    bindYoyResizeObserver()
  })
  window.addEventListener('resize', handleResize)
})

watch(
  () => [
    ...props.yoyPrimarySeries,
    ...props.yoyCompareSeries,
    props.compareEnabled,
    props.primaryCountry,
    props.compareCountry,
    props.currentMetric?.key,
    props.embedded,
  ],
  renderYoyChart,
)

onBeforeUnmount(() => {
  unsubscribeChartResizeBus()
  yoyResizeObserver?.disconnect()
  yoyResizeObserver = null
  window.removeEventListener('resize', handleResize)
  yoyChart?.dispose()
  yoyChart = null
})
</script>

<template>
  <section class="yoy-panel" :class="{ 'yoy-panel--embedded': embedded, card: !embedded }">
    <div v-if="!embedded" class="card-head">
      <h3 class="card-title">同比变化率</h3>
      <p class="card-description">
        仅展示当前所选指标相对上一年的百分比变化，与上方「年度趋势」的绝对量互补；不重复地图或排名图的信息。
      </p>
    </div>
    <div
      ref="yoyRef"
      class="chart"
      :class="{ 'chart--embedded': embedded }"
      style="min-width: 0; min-height: 200px"
    ></div>
  </section>
</template>

<style scoped>
.yoy-panel {
  padding: 22px;
  margin-bottom: 10px;
}

.yoy-panel--embedded {
  padding: 0;
  margin: 0;
}

.card-head {
  margin-bottom: 12px;
}

.card-title {
  margin: 0;
  font-size: 19px;
  color: #0f172a;
}

.card-description {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.6;
  color: #64748b;
}

.chart {
  width: 100%;
  height: 280px;
}

.chart--embedded {
  height: var(--tabbed-chart-min-h, 420px);
  min-height: 360px;
}
</style>
