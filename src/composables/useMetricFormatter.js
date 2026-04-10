export function useMetricFormatter() {
  const formatMetricValue = (metric, value) => {
    if (!metric) return String(value ?? '--')
    if (value == null || Number.isNaN(value)) return '暂无数据'
    return `${value} ${metric.unit}`
  }

  const formatPercent = (value) => {
    if (value == null || Number.isNaN(value)) return '--'
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const formatDelta = (metric, value) => {
    if (!metric) return String(value ?? '--')
    if (value == null || Number.isNaN(value)) return '--'
    return `${value > 0 ? '+' : ''}${value} ${metric.unit}`
  }

  return {
    formatMetricValue,
    formatPercent,
    formatDelta,
  }
}
