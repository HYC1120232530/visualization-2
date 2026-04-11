/**
 * 年份切换等数据更新时的统一动画与 setOption 策略（合并更新以启用过渡）。
 */
export const chartAnimation = {
  animation: true,
  animationDuration: 480,
  animationEasing: 'quarticOut',
  animationDurationUpdate: 640,
  animationEasingUpdate: 'cubicOut',
}

/** @param {object} chart ECharts 实例 */
export function setChartOptionMerge(chart, option, replaceMerge = []) {
  const opt = { notMerge: false, lazyUpdate: false }
  if (replaceMerge.length > 0) opt.replaceMerge = replaceMerge
  chart.setOption(option, opt)
}

/**
 * 自动播放年份步进间隔（须大于 animationDurationUpdate，保证雷达/折线等更新动画播完再切年）
 */
export const PLAYBACK_STEP_MS = 900
