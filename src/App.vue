<script setup>
import { nextTick, onMounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { notifyChartsResize } from './utils/chartResizeBus.js'

const router = useRouter()

function scheduleChartResize() {
  nextTick(() => {
    notifyChartsResize()
    setTimeout(notifyChartsResize, 100)
  })
}

onMounted(scheduleChartResize)

/** 路由切换后子页图表容器尺寸变化，统一 resize */
router.afterEach(() => {
  scheduleChartResize()
})
</script>

<template>
  <RouterView />
</template>
