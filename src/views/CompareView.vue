<script setup>
import CompareRadarChart from '../components/CompareRadarChart.vue'
import { useWorldBankData } from '../composables/useWorldBankData'

useWorldBankData()
</script>

<template>
  <div class="view compare">
    <header class="view__head">
      <h2 class="view__title">两国对比</h2>
      <p class="view__desc">
        在全局选择主国家、对比国家与年份；雷达图在同一图中对比<strong>全部指标</strong>（各轴为不同量纲，轴上为两国相对位置）。
        指标由 URL 或自其它页面带入。离开本页后对比会自动关闭。
      </p>
    </header>

    <section class="compare-module dash-card anim-rise anim-rise-delay-1">
      <header class="compare-module__head">
        <div class="compare-module__intro">
          <h2 class="compare-module__title">对比视图</h2>
          <p class="compare-module__subtitle">当前年份下两国全部指标的雷达对比；量纲按轴独立，便于看结构差异。</p>
        </div>
      </header>
      <div class="compare-module__body">
        <CompareRadarChart embedded />
      </div>
    </section>
  </div>
</template>

<style scoped>
.view__head {
  margin-bottom: 16px;
}

.view__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #e2e8f0;
  letter-spacing: -0.02em;
}

.view__desc {
  margin: 8px 0 0;
  max-width: 72ch;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: #64748b;
}

.compare-module {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.compare-module__head {
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--dash-border);
}

.compare-module__title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--dash-text);
}

.compare-module__subtitle {
  margin: 6px 0 0;
  max-width: 42ch;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--dash-muted);
}

.compare-module__body {
  flex: 1;
  min-height: 0;
  position: relative;
}
</style>
