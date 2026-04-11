import { computed, reactive } from 'vue'
import { PLAYBACK_STEP_MS } from '../constants/chartAnimation.js'
import dataset from '../data/generated/worldBankDataset.json'

/** 与下方 getMetricValue 一致，供初始化/切换指标时在无 state 依赖下读取 */
function readMetricValue(countryCode, year, metricKey) {
  const y = String(year)
  const record = dataset.dataIndex[countryCode]?.values?.[y]
  return record && Object.prototype.hasOwnProperty.call(record, metricKey) ? record[metricKey] : null
}

/** 取该指标在任意国家上仍有数据的最近年份（用于切换指标或缺数年份时的回退） */
function findLatestYearWithMetricData(metricKey) {
  for (let i = dataset.years.length - 1; i >= 0; i -= 1) {
    const year = dataset.years[i]
    const hasAny = dataset.countries.some((c) => readMetricValue(c.countryCode, year, metricKey) != null)
    if (hasAny) return year
  }
  return dataset.years[dataset.years.length - 1]
}

const defaultMetricKey = dataset.metrics[0]?.key ?? 'gdp'

/** 网页首次加载默认主国家：中国（数据集中无 CHN 时回退为原逻辑） */
const DEFAULT_PRIMARY_CODE = 'CHN'
const initialPrimaryCountryCode = dataset.dataIndex[DEFAULT_PRIMARY_CODE]
  ? DEFAULT_PRIMARY_CODE
  : dataset.countries.find((country) => country.hasMapMatch)?.countryCode ?? dataset.countries[0]?.countryCode

/** 开启两国对比时默认对比国：美国（主国为美国或数据集中无 USA 时回退为第一个非主国） */
const DEFAULT_COMPARE_COUNTRY_CODE = 'USA'

export function pickDefaultCompareCountryCodeForPrimary(primaryCode) {
  const options = dataset.countries.filter((country) => country.countryCode !== primaryCode)
  if (
    dataset.dataIndex[DEFAULT_COMPARE_COUNTRY_CODE] &&
    options.some((c) => c.countryCode === DEFAULT_COMPARE_COUNTRY_CODE)
  ) {
    return DEFAULT_COMPARE_COUNTRY_CODE
  }
  return options[0]?.countryCode ?? null
}

const state = reactive({
  selectedMetric: defaultMetricKey,
  selectedCountryCode: initialPrimaryCountryCode,
  selectedYear: findLatestYearWithMetricData(defaultMetricKey),
  compareCountryCode: pickDefaultCompareCountryCodeForPrimary(initialPrimaryCountryCode),
  compareEnabled: false,
  mapSelectionMode: 'primary',
  isPlaying: false,
  error: '',
})

/** setInterval 句柄：播放年份步进 */
let playbackIntervalId = null

const pickDefaultCompareCountryCode = () => pickDefaultCompareCountryCodeForPrimary(state.selectedCountryCode)

const years = computed(() => dataset.years)
const metrics = computed(() => dataset.metrics)
const countries = computed(() => dataset.countries)

const selectedMetric = computed(
  () => dataset.metrics.find((metric) => metric.key === state.selectedMetric) ?? dataset.metrics[0],
)

const selectedCountry = computed(
  () => dataset.countries.find((country) => country.countryCode === state.selectedCountryCode) ?? dataset.countries[0],
)

const compareCountry = computed(() => {
  if (!state.compareEnabled || !state.compareCountryCode) return null
  return dataset.countries.find((country) => country.countryCode === state.compareCountryCode) ?? null
})

const getCountryEntry = (countryCode) => dataset.dataIndex[countryCode] ?? null

const getRecordByYear = (countryCode, year) => getCountryEntry(countryCode)?.values?.[String(year)] ?? null

const getMetricValue = (countryCode, year, metricKey) => readMetricValue(countryCode, year, metricKey)

const getCompareOptions = () =>
  dataset.countries.filter((country) => country.countryCode !== state.selectedCountryCode)

const setMetric = (metricKey) => {
  if (!dataset.metrics.some((metric) => metric.key === metricKey)) return
  state.selectedMetric = metricKey
  const yearHasData = dataset.countries.some(
    (country) => readMetricValue(country.countryCode, state.selectedYear, metricKey) != null,
  )
  if (!yearHasData) {
    state.selectedYear = findLatestYearWithMetricData(metricKey)
  }
}

const setSelectedYear = (year) => {
  if (!dataset.years.includes(year)) return
  stopPlayback()
  state.selectedYear = year
}

const setPrimaryCountry = (countryCode) => {
  if (!dataset.dataIndex[countryCode]) return

  state.selectedCountryCode = countryCode

  if (state.compareEnabled && state.compareCountryCode === countryCode) {
    state.compareCountryCode = pickDefaultCompareCountryCode()
  }
}

const setCompareCountry = (countryCode) => {
  if (!state.compareEnabled || !countryCode || countryCode === state.selectedCountryCode) return
  if (!dataset.dataIndex[countryCode]) return
  state.compareCountryCode = countryCode
}

const toggleCompareMode = (enabled) => {
  state.compareEnabled = enabled

  if (!enabled) {
    state.mapSelectionMode = 'primary'
    return
  }

  if (!state.compareCountryCode || state.compareCountryCode === state.selectedCountryCode) {
    state.compareCountryCode = pickDefaultCompareCountryCode()
  }
}

const setMapSelectionMode = (mode) => {
  if (mode === 'compare' && !state.compareEnabled) return
  if (mode !== 'primary' && mode !== 'compare') return
  state.mapSelectionMode = mode
}

const handleCountrySelection = (countryCode) => {
  if (state.mapSelectionMode === 'compare' && state.compareEnabled) {
    setCompareCountry(countryCode)
    return
  }

  setPrimaryCountry(countryCode)
}

const stopPlayback = () => {
  if (playbackIntervalId != null) {
    clearInterval(playbackIntervalId)
    playbackIntervalId = null
  }

  state.isPlaying = false
}

const startPlayback = () => {
  if (state.isPlaying) return

  if (state.selectedYear === dataset.years[dataset.years.length - 1]) {
    state.selectedYear = dataset.years[0]
  }

  state.isPlaying = true
  playbackIntervalId = setInterval(() => {
    if (!state.isPlaying) return

    const index = dataset.years.indexOf(state.selectedYear)
    if (index >= dataset.years.length - 1) {
      stopPlayback()
      return
    }

    state.selectedYear = dataset.years[index + 1]
  }, PLAYBACK_STEP_MS)
}

const togglePlayback = () => {
  if (state.isPlaying) {
    stopPlayback()
  } else {
    startPlayback()
  }
}

const previousYear = () => {
  stopPlayback()
  const index = dataset.years.indexOf(state.selectedYear)
  if (index > 0) {
    state.selectedYear = dataset.years[index - 1]
  }
}

const nextYear = () => {
  stopPlayback()
  const index = dataset.years.indexOf(state.selectedYear)
  if (index < dataset.years.length - 1) {
    state.selectedYear = dataset.years[index + 1]
  }
}

const primarySeries = computed(() =>
  dataset.years.map((year) => getMetricValue(state.selectedCountryCode, year, state.selectedMetric)),
)

const compareSeries = computed(() =>
  state.compareEnabled && state.compareCountryCode
    ? dataset.years.map((year) => getMetricValue(state.compareCountryCode, year, state.selectedMetric))
    : [],
)

const currentYearValues = computed(() =>
  dataset.countries.map((country) => ({
    ...country,
    value: getMetricValue(country.countryCode, state.selectedYear, state.selectedMetric),
  })),
)

const rank = computed(() => {
  const withValue = currentYearValues.value.filter((item) => item.value != null)
  const sorted = [...withValue].sort((a, b) => b.value - a.value)
  const index = sorted.findIndex((item) => item.countryCode === state.selectedCountryCode)
  return index === -1 ? null : index + 1
})

const primaryValue = computed(() => getMetricValue(state.selectedCountryCode, state.selectedYear, state.selectedMetric))
const compareValue = computed(() =>
  state.compareEnabled && state.compareCountryCode
    ? getMetricValue(state.compareCountryCode, state.selectedYear, state.selectedMetric)
    : null,
)

const previousYearValue = computed(() => {
  const index = dataset.years.indexOf(state.selectedYear)
  if (index <= 0) return null
  return getMetricValue(state.selectedCountryCode, dataset.years[index - 1], state.selectedMetric)
})

const yoyDelta = computed(() => {
  if (primaryValue.value == null || previousYearValue.value == null) return null
  return primaryValue.value - previousYearValue.value
})

const yoyPercent = computed(() => {
  if (yoyDelta.value == null || previousYearValue.value == null || previousYearValue.value === 0) return null
  return (yoyDelta.value / previousYearValue.value) * 100
})

const diffValue = computed(() => {
  if (!state.compareEnabled || primaryValue.value == null || compareValue.value == null) return null
  return primaryValue.value - compareValue.value
})

const diffPercent = computed(() => {
  if (!state.compareEnabled || diffValue.value == null || compareValue.value == null || compareValue.value === 0) {
    return null
  }

  return (diffValue.value / compareValue.value) * 100
})

const mapData = computed(() =>
  currentYearValues.value.map((item) => ({
    ...item,
    isPrimary: item.countryCode === state.selectedCountryCode,
    isCompare: state.compareEnabled && item.countryCode === state.compareCountryCode,
  })),
)

const compareBarData = computed(() =>
  [...currentYearValues.value]
    .filter((item) => item.value != null)
    .map((item) => ({
      ...item,
      isPrimary: item.countryCode === state.selectedCountryCode,
      isCompare: state.compareEnabled && item.countryCode === state.compareCountryCode,
    }))
    .sort((a, b) => b.value - a.value),
)

const yoyYears = computed(() => dataset.years.slice(1))

const buildYoySeries = (countryCode) =>
  dataset.years.slice(1).map((year, index) => {
    const current = getMetricValue(countryCode, year, state.selectedMetric)
    const previous = getMetricValue(countryCode, dataset.years[index], state.selectedMetric)
    if (current == null || previous == null || previous === 0) return null
    return Number((((current - previous) / previous) * 100).toFixed(1))
  })

const yoyPrimarySeries = computed(() => buildYoySeries(state.selectedCountryCode))

/** 与 useFilterRouteSync 中 URL 约定一致，供主导航等在切换子路由时携带 query，避免清空 query 触发错误同步与导航竞态。 */
export function buildFilterQueryFromState() {
  const q = {
    metric: state.selectedMetric,
    year: String(state.selectedYear),
    country: state.selectedCountryCode,
    compareOn: state.compareEnabled ? '1' : '0',
  }
  if (state.compareEnabled && state.compareCountryCode) {
    q.compare = state.compareCountryCode
  }
  return q
}

/**
 * 主导航进入「两国对比」时使用的 query：在探索页 compare 为关时，buildFilterQueryFromState 不含对比国；
 * 若仍用其导航，需在 beforeEach 里提前改 state，会与仍在 /temporal 的路由竞态。此处一次性给出进入 /compare 后的目标参数。
 */
export function buildCompareNavQuery() {
  const primary = state.selectedCountryCode
  const defaultOther = pickDefaultCompareCountryCodeForPrimary(primary)
  const compareCode =
    state.compareCountryCode && state.compareCountryCode !== primary ? state.compareCountryCode : defaultOther
  const q = {
    metric: state.selectedMetric,
    year: String(state.selectedYear),
    country: primary,
    compareOn: '1',
  }
  if (compareCode) {
    q.compare = compareCode
  }
  return q
}

export function useWorldBankData() {
  return {
    dataset,
    state,
    years,
    metrics,
    countries,
    selectedMetric,
    selectedCountry,
    compareCountry,
    currentYear: computed(() => state.selectedYear),
    selectedYearIndex: computed(() => dataset.years.indexOf(state.selectedYear)),
    compareOptions: computed(() => getCompareOptions()),
    primaryValue,
    compareValue,
    rank,
    yoyDelta,
    yoyPercent,
    diffValue,
    diffPercent,
    primarySeries,
    compareSeries,
    mapData,
    compareBarData,
    yoyYears,
    yoyPrimarySeries,
    getRecordByYear,
    getMetricValue,
    setMetric,
    setSelectedYear,
    setPrimaryCountry,
    setCompareCountry,
    toggleCompareMode,
    setMapSelectionMode,
    handleCountrySelection,
    togglePlayback,
    previousYear,
    nextYear,
    stopPlayback,
  }
}
