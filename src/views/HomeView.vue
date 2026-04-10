<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { buildCompareNavQuery, buildFilterQueryFromState } from '../composables/useWorldBankData'

const navQuery = computed(() => buildFilterQueryFromState())
const compareNavQuery = computed(() => buildCompareNavQuery())
</script>

<template>
  <div class="home">
    <section class="home__intro dash-card anim-rise">
      <h2 class="home__h2">课程说明与入口</h2>
      <div class="home__doc-actions">
        <RouterLink class="home__doc-btn" :to="{ name: 'documentation', query: navQuery }">
          打开说明文档
        </RouterLink>
      </div>
    </section>

    <div class="home__cta anim-rise anim-rise-delay-1">
      <RouterLink class="home__card" :to="{ name: 'spatial', query: navQuery }">
        <span class="home__card-kicker">探索</span>
        <span class="home__card-title">空间分布</span>
        <span class="home__card-desc">地图与排名，回答「此刻在全球的位置」。</span>
      </RouterLink>
      <RouterLink class="home__card" :to="{ name: 'temporal', query: navQuery }">
        <span class="home__card-kicker">探索</span>
        <span class="home__card-title">时间演变</span>
        <span class="home__card-desc">趋势与同比，回答「多年如何变」。</span>
      </RouterLink>
      <RouterLink class="home__card home__card--accent" :to="{ name: 'compare', query: compareNavQuery }">
        <span class="home__card-kicker">对照</span>
        <span class="home__card-title">两国对比</span>
        <span class="home__card-desc">双序列 + 差值读数，专门回答「两国差多少」。</span>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.home__intro {
  padding: 22px 24px;
}

.home__h2 {
  margin: 0 0 10px;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--dash-text);
  letter-spacing: -0.02em;
}

.home__doc-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 14px;
}

.home__doc-btn {
  display: inline-flex;
  align-items: center;
  padding: 10px 22px;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 700;
  text-decoration: none;
  color: #0f172a;
  background: linear-gradient(135deg, #38bdf8, #22d3ee);
  border: 1px solid rgba(56, 189, 248, 0.5);
  box-shadow: 0 4px 20px rgba(56, 189, 248, 0.25);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

@media (hover: hover) {
  .home__doc-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 28px rgba(56, 189, 248, 0.35);
  }
}

.home__cta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 1100px) {
  .home__cta {
    grid-template-columns: 1fr;
  }
}

.home__card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 22px 22px 20px;
  border-radius: 20px;
  text-decoration: none;
  color: inherit;
  background: var(--dash-card);
  border: 1px solid var(--dash-card-border);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35);
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

@media (hover: hover) {
  .home__card:hover {
    border-color: rgba(56, 189, 248, 0.35);
    transform: translateY(-2px);
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.4);
  }
}

.home__card-kicker {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #38bdf8;
}

.home__card-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #f8fafc;
  letter-spacing: -0.02em;
}

.home__card-desc {
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--dash-muted);
  max-width: 36ch;
}

.home__card--accent {
  border-color: rgba(45, 212, 191, 0.28);
}

@media (hover: hover) {
  .home__card--accent:hover {
    border-color: rgba(45, 212, 191, 0.45);
  }
}
</style>
