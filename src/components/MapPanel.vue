<script setup>
import * as echarts from 'echarts'
import worldGeoJson from '../assets/world.json'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { chartAnimation, setChartOptionMerge } from '../constants/chartAnimation.js'
import { COLORS } from '../constants/colors'
import { useMetricFormatter } from '../composables/useMetricFormatter'
import { subscribeChartResize } from '../utils/chartResizeBus.js'

const props = defineProps({
  embedded: { type: Boolean, default: false },
  mapData: { type: Array, required: true },
  currentMetric: { type: Object, required: true },
  currentYear: { type: [String, Number], required: true },
})

const chartRef = ref(null)
const { formatMetricValue } = useMetricFormatter()
let chartInstance = null
let mapResizeObserver = null
let unsubscribeChartResizeBus = () => {}
const matchedMapData = computed(() => props.mapData.filter((item) => item.mapName))
const mapNameToCountryCode = computed(() =>
  Object.fromEntries(matchedMapData.value.map((item) => [item.mapName, item.countryCode])),
)

const DEFAULT_FOCUS = {
  center: [12, 18],
  zoom: 1.2,
}

const mapName = 'world-focus-map-component'
echarts.registerMap(mapName, worldGeoJson)

const valueExtent = computed(() => {
  const vals = matchedMapData.value
    .map((d) => d.value)
    .filter((v) => v != null && typeof v === 'number' && !Number.isNaN(v))
  if (vals.length === 0) {
    return { min: 0, max: 1, hasNumeric: false }
  }
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  return {
    min,
    max: min === max ? min + 1e-9 : max,
    hasNumeric: true,
  }
})

const renderChart = () => {
  if (!chartRef.value) return

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }

  const focus = DEFAULT_FOCUS
  const ext = valueExtent.value

  setChartOptionMerge(
    chartInstance,
    {
      ...chartAnimation,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(15, 23, 42, 0.96)',
        borderColor: 'rgba(148, 163, 184, 0.35)',
        borderWidth: 1,
        textStyle: {
          color: '#f8fafc',
        },
        formatter: (params) => {
          const country = mapNameToCountryCode.value[params.name]
          const match = matchedMapData.value.find((item) => item.countryCode === country)
          const v = match?.value
          return [
            `国家：${params.name}`,
            `年份：${props.currentYear}`,
            `指标：${props.currentMetric.fullName}`,
            `数值：${formatMetricValue(props.currentMetric, v ?? null)}`,
          ].join('<br/>')
        },
      },
      visualMap: {
        show: ext.hasNumeric,
        type: 'continuous',
        min: ext.min,
        max: ext.max,
        calculable: true,
        orient: 'vertical',
        right: props.embedded ? 8 : 16,
        bottom: 40,
        itemHeight: 168,
        text: ['高', '低'],
        textStyle: {
          color: '#94a3b8',
          fontSize: 11,
        },
        inRange: {
          color: ['#0f172a', '#1e3a8a', '#2563eb', '#38bdf8', '#bae6fd'],
        },
        formatter: (value) => formatMetricValue(props.currentMetric, value),
      },
      series: [
        {
          type: 'map',
          map: mapName,
          roam: true,
          center: focus.center,
          zoom: focus.zoom,
          scaleLimit: {
            min: 1,
            max: 7,
          },
          selectedMode: false,
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: false,
            },
            itemStyle: {
              areaColor: 'rgba(96, 165, 250, 0.42)',
              borderColor: COLORS.primary,
              borderWidth: 1.4,
            },
          },
          data: matchedMapData.value.map((item) => {
            const name = item.mapName ?? item.country
            if (item.value == null || typeof item.value !== 'number' || Number.isNaN(item.value)) {
              return {
                name,
                itemStyle: {
                  areaColor: 'rgba(51, 65, 85, 0.72)',
                  borderColor: 'rgba(100, 116, 139, 0.45)',
                  borderWidth: 0.8,
                },
              }
            }
            return {
              name,
              value: item.value,
            }
          }),
        },
      ],
    },
    ['series', 'visualMap', 'tooltip'],
  )
}

const handleResize = () => {
  chartInstance?.resize()
}

function bindMapResizeObserver() {
  mapResizeObserver?.disconnect()
  if (!chartRef.value || typeof ResizeObserver === 'undefined') return
  mapResizeObserver = new ResizeObserver(() => {
    chartInstance?.resize()
  })
  mapResizeObserver.observe(chartRef.value)
}

onMounted(() => {
  unsubscribeChartResizeBus = subscribeChartResize(handleResize)
  nextTick(() => {
    renderChart()
    bindMapResizeObserver()
  })
  window.addEventListener('resize', handleResize)
})

watch(
  () => [
    props.currentYear,
    props.currentMetric?.key,
    ...matchedMapData.value.map((item) => item.countryCode),
    ...matchedMapData.value.map((item) => item.value ?? -1e12),
  ],
  renderChart,
)

onBeforeUnmount(() => {
  unsubscribeChartResizeBus()
  mapResizeObserver?.disconnect()
  mapResizeObserver = null
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})
</script>

<template>
  <section class="panel" :class="{ 'panel--embedded': embedded }">
    <div
      ref="chartRef"
      class="map-chart"
      :class="{ 'map-chart--embedded': embedded }"
      style="min-width: 0; min-height: 200px"
    ></div>
    <p v-if="embedded" class="map-hint" role="note">白色区域代表无数据。</p>
  </section>
</template>

<style scoped>
.panel {
  height: 100%;
}

.map-chart {
  width: 100%;
  height: 320px;
}

.map-chart--embedded {
  height: var(--tabbed-chart-min-h, 420px);
  min-height: 360px;
}

.map-hint {
  margin: 10px 0 0;
  max-width: 72ch;
  font-size: 0.75rem;
  line-height: 1.55;
  color: #64748b;
}

</style>
