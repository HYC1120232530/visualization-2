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
      <h2 class="home__h2">你要回答的问题</h2>
      <p class="home__lead">
        选定指标与年份后，<strong>主国家</strong>的读数处于全球什么位置？这些年<strong>水平与增速</strong>如何变化？若要做<strong>两国并排</strong>，请进入专门的对比页。下方入口进入各探索页即可操作筛选。
      </p>
      <ol class="home__steps">
        <li>
          从下方进入<strong>空间分布</strong>、<strong>时间演变</strong>或<strong>两国对比</strong>后，在对应页顶部选定<strong>指标</strong>、<strong>主国家</strong>与<strong>年份</strong>（时间轴在需用的页面提供）。
        </li>
        <li>在<strong>空间分布</strong>看全球格局与排名切片；在<strong>时间演变</strong>看主国折线与同比。</li>
        <li>在<strong>两国对比</strong>页选择对比国，查看双序列趋势、同比与当前年差值。</li>
      </ol>
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

.home__lead {
  margin: 0;
  max-width: 68ch;
  font-size: 0.9rem;
  line-height: 1.65;
  color: var(--dash-muted);
}

.home__lead strong {
  color: #e2e8f0;
  font-weight: 700;
}

.home__steps {
  margin: 16px 0 0;
  padding-left: 1.25rem;
  color: var(--dash-muted);
  font-size: 0.8125rem;
  line-height: 1.7;
}

.home__steps li {
  margin-bottom: 8px;
}

.home__steps strong {
  color: #cbd5e1;
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
