<script setup>
import * as echarts from 'echarts'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { chartAnimation, setChartOptionMerge } from '../constants/chartAnimation.js'
import { COLORS } from '../constants/colors'
import { useMetricFormatter } from '../composables/useMetricFormatter'
import { subscribeChartResize } from '../utils/chartResizeBus.js'

const props = defineProps({
  embedded: { type: Boolean, default: false },
  /** 为 true 时不绘制右上角「当前年份」角标（时间演变页使用） */
  hideYearBadge: { type: Boolean, default: false },
  years: { type: Array, required: true },
  currentMetric: { type: Object, required: true },
  primaryCountry: { type: String, required: true },
  compareCountry: { type: String, default: '' },
  compareEnabled: { type: Boolean, default: false },
  selectedYearIndex: { type: Number, required: true },
  primarySeries: { type: Array, required: true },
  compareSeries: { type: Array, default: () => [] },
})

const emit = defineEmits(['select-country'])

const chartRef = ref(null)
const { formatMetricValue } = useMetricFormatter()
let chartInstance = null

const buildSeriesData = (values, color, symbol) =>
  values.map((value, index) => ({
    value,
    symbol: index === props.selectedYearIndex ? symbol : 'emptyCircle',
    symbolSize: index === props.selectedYearIndex ? 18 : 8,
    itemStyle: {
      color,
      borderColor: '#f8fafc',
      borderWidth: index === props.selectedYearIndex ? 2.5 : 1.2,
      shadowBlur: index === props.selectedYearIndex ? 8 : 0,
      shadowColor: index === props.selectedYearIndex ? `${color}55` : 'transparent',
    },
  }))

const renderChart = () => {
  if (!chartRef.value) return

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
    chartInstance.on('click', (params) => {
      if (params.componentType === 'series' && params.seriesName) {
        emit('select-country', params.seriesName)
      }
    })
  }

  const axisText = props.embedded ? '#e2e8f0' : COLORS.text
  const axisMuted = props.embedded ? '#94a3b8' : COLORS.muted

  const series = [
    {
      name: props.primaryCountry,
      type: 'line',
      smooth: true,
      data: buildSeriesData(props.primarySeries, COLORS.primary, 'circle'),
      lineStyle: {
        width: 3.5,
        color: COLORS.primary,
      },
      areaStyle: {
        color: 'rgba(37, 99, 235, 0.10)',
      },
      label: {
        show: false,
      },
      emphasis: {
        focus: 'series',
      },
    },
  ]

  if (props.compareEnabled && props.compareCountry) {
    series.push({
      name: props.compareCountry,
      type: 'line',
      smooth: true,
      data: buildSeriesData(props.compareSeries, COLORS.compare, 'diamond'),
      lineStyle: {
        width: 3,
        type: 'dashed',
        color: COLORS.compare,
      },
      areaStyle: {
        color: 'rgba(6, 182, 212, 0.06)',
      },
      label: {
        show: false,
      },
      emphasis: {
        focus: 'series',
      },
    })
  }

  setChartOptionMerge(
    chartInstance,
    {
      ...chartAnimation,
      legend: {
        bottom: props.embedded ? 6 : 8,
        left: 'center',
        icon: 'roundRect',
        itemWidth: 14,
        itemHeight: 8,
        itemGap: 20,
        textStyle: {
          color: axisText,
          fontSize: 12,
          fontWeight: 600,
        },
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 23, 42, 0.96)',
        borderColor: 'rgba(148, 163, 184, 0.35)',
        borderWidth: 1,
        textStyle: {
          color: '#f8fafc',
        },
        extraCssText: 'box-shadow: 0 12px 24px rgba(15, 23, 42, 0.28);',
        axisPointer: {
          type: 'line',
          animation: true,
          animationDurationUpdate: 350,
          animationEasingUpdate: 'cubicOut',
          lineStyle: {
            color: '#94a3b8',
            width: 1.2,
            type: 'dashed',
          },
        },
        formatter: (params) => {
          const lines = [`年份：${params[0]?.axisValue}`, `指标：${props.currentMetric.fullName}`]

          params.forEach((item) => {
            const value = item.data?.value ?? item.value
            lines.push(`${item.seriesName}：${formatMetricValue(props.currentMetric, value)}`)
          })

          return lines.join('<br/>')
        },
      },
      grid: {
        top: 20,
        left: props.embedded ? 58 : 72,
        right: 24,
        bottom: props.embedded ? 64 : 60,
      },
      xAxis: {
        type: 'category',
        data: props.years.map(String),
        axisLine: {
          show: true,
          lineStyle: {
            color: axisMuted,
          },
        },
        axisTick: {
          alignWithLabel: true,
          lineStyle: { color: axisMuted },
        },
        axisLabel: {
          color: axisText,
          fontWeight: 600,
        },
        splitLine: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
        name: `${props.currentMetric.label} (${props.currentMetric.unit})`,
        nameLocation: 'middle',
        nameGap: 52,
        nameTextStyle: {
          color: axisMuted,
          fontWeight: 600,
          fontSize: 11,
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: axisMuted,
          },
        },
        axisTick: {
          show: true,
          lineStyle: { color: axisMuted },
        },
        axisLabel: {
          show: true,
          color: axisText,
          formatter: (v) => {
            if (v == null || Number.isNaN(Number(v))) return ''
            return Number(v).toLocaleString('zh-CN', { maximumFractionDigits: 2 })
          },
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(148, 163, 184, 0.22)',
            type: 'dashed',
          },
        },
      },
      graphic: props.hideYearBadge
        ? []
        : [
            {
              id: 'year-highlight-badge',
              type: 'group',
              right: 24,
              top: 8,
              silent: true,
              children: [
                {
                  type: 'rect',
                  shape: { x: 0, y: 0, width: 96, height: 24, r: 12 },
                  style: {
                    fill: props.embedded ? 'rgba(56, 189, 248, 0.12)' : '#eff6ff',
                    stroke: props.embedded ? 'rgba(56, 189, 248, 0.35)' : '#bfdbfe',
                    lineWidth: 1,
                  },
                },
                {
                  type: 'text',
                  left: 10,
                  top: 5,
                  style: {
                    text: `当前年份 ${props.years[props.selectedYearIndex] ?? ''}`,
                    fill: props.embedded ? '#7dd3fc' : '#1d4ed8',
                    fontSize: 11,
                    fontWeight: 700,
                  },
                },
              ],
            },
          ],
      series,
    },
    ['series', 'graphic'],
  )
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
  () => [
    props.primaryCountry,
    props.compareCountry,
    props.compareEnabled,
    props.selectedYearIndex,
    props.embedded,
    props.hideYearBadge,
    props.currentMetric?.key,
    ...props.primarySeries,
    ...props.compareSeries,
  ],
  renderChart,
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
      <div>
        <h3 class="panel-title">年度趋势分析</h3>
        <p class="panel-description">趋势图为当前主视图，支持单国家或双国家联动分析。</p>
      </div>
    </div>
    <div
      ref="chartRef"
      class="trend-chart"
      :class="{ 'trend-chart--embedded': embedded }"
      style="min-width: 0; min-height: 200px"
    ></div>
  </section>
</template>

<style scoped>
.panel {
  height: 100%;
}

.panel-head {
  margin-bottom: 12px;
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

.trend-chart {
  width: 100%;
  height: 420px;
}

.trend-chart--embedded {
  height: var(--tabbed-chart-min-h, 420px);
  min-height: 360px;
}

.panel--embedded .panel-head {
  display: none;
}
</style>
