/**
 * 年份切换等数据更新时的统一动画与 setOption 策略（合并更新以启用过渡）。
 */
export const chartAnimation = {
  animation: true,
  animationDuration: 480,
  animationEasing: 'quarticOut',
  animationDurationUpdate: 750,
  animationEasingUpdate: 'cubicOut',
}

/** @param {object} chart ECharts 实例 */
export function setChartOptionMerge(chart, option, replaceMerge = []) {
  const opt = { notMerge: false, lazyUpdate: false }
  if (replaceMerge.length > 0) opt.replaceMerge = replaceMerge
  chart.setOption(option, opt)
}

/** 与 animationDurationUpdate 对齐的播放步进间隔（略大于动画时长，避免切帧抢跑） */
export const PLAYBACK_STEP_MS = 820
