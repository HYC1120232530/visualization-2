/**
 * Vanta/WebGL 或根布局变更后，统一通知已注册的 ECharts 实例执行 resize，
 * 避免背景层导致的初始尺寸为 0 或合成后未重绘。
 */
const listeners = new Set()

export function subscribeChartResize(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function notifyChartsResize() {
  listeners.forEach((fn) => {
    try {
      fn()
    } catch {
      /* 单个图表失败不影响其它实例 */
    }
  })
}
