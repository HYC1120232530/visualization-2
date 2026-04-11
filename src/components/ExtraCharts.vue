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
  currentMetric: { type: Object, required: true },
  primaryCountry: { type: String, required: true },
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

/** 折叠说明展开/收起时，容器高度变化，需触发 ECharts 自适应 */
const onYoyHelpToggle = () => {
  nextTick(() => handleResize())
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
  () => [...props.yoyPrimarySeries, props.primaryCountry, props.currentMetric?.key, props.embedded],
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
    <details v-if="embedded" class="yoy-help" @toggle="onYoyHelpToggle">
      <summary class="yoy-help__summary">
        <span class="yoy-help__icon" aria-hidden="true">ⓘ</span>
        同比增速算法说明
      </summary>
      <div class="yoy-help__body">
        <p class="yoy-help__line">
          所选指标在每一年相对<strong>上一日历年</strong>的百分比变化，计算公式为：
        </p>
        <p class="yoy-help__formula">同比增速 = (本年值 − 上年值) ÷ 上年值 × 100%</p>
        <p class="yoy-help__note">当上年值缺失或为 0 时，该年不显示柱形（无同比增速）。</p>
      </div>
    </details>
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

.yoy-help {
  margin: 0 0 12px;
  border-radius: 12px;
  border: 1px solid var(--dash-border, rgba(148, 163, 184, 0.14));
  background: rgba(15, 23, 42, 0.45);
  color: var(--dash-muted, #94a3b8);
  font-size: 0.8125rem;
  line-height: 1.55;
}

.yoy-help__summary {
  cursor: pointer;
  list-style: none;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  font-weight: 600;
  color: var(--dash-text, #e2e8f0);
  user-select: none;
}

.yoy-help__summary::-webkit-details-marker {
  display: none;
}

.yoy-help__summary::after {
  content: '';
  margin-left: auto;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid var(--dash-muted, #94a3b8);
  transition: transform 0.2s ease;
}

.yoy-help[open] .yoy-help__summary::after {
  transform: rotate(180deg);
}

.yoy-help__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25em;
  height: 1.25em;
  border-radius: 999px;
  background: rgba(56, 189, 248, 0.12);
  color: var(--dash-accent, #38bdf8);
  font-size: 0.85em;
  line-height: 1;
}

.yoy-help__body {
  padding: 0 12px 12px 12px;
  border-top: 1px solid var(--dash-border, rgba(148, 163, 184, 0.12));
}

.yoy-help__line {
  margin: 10px 0 0;
}

.yoy-help__formula {
  margin: 8px 0 0;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.65);
  color: var(--dash-text, #f1f5f9);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.8125rem;
  font-weight: 500;
}

.yoy-help__note {
  margin: 8px 0 0;
  font-size: 0.75rem;
  opacity: 0.92;
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
