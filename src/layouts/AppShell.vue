<script setup>
import { computed, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import ControlBar from '../components/ControlBar.vue'
import { useFilterRouteSync } from '../composables/useFilterRouteSync'
import { buildCompareNavQuery, buildFilterQueryFromState, useWorldBankData } from '../composables/useWorldBankData'

useFilterRouteSync()

const route = useRoute()
const compareUi = computed(() => (route.name === 'compare' ? 'panel' : 'off'))
/** 切换子路由时保留筛选 query，避免清空 query 触发 useFilterRouteSync 与 push 竞态（表现为需多次点击导航）。 */
const navQuery = computed(() => buildFilterQueryFromState())
const compareNavQuery = computed(() => buildCompareNavQuery())

/** 空间分布、主题首页：不展示全局筛选与时间轴（主题页为入口，筛选在各探索页） */
const showGlobalFilters = computed(() => route.name !== 'spatial' && route.name !== 'home')

const {
  dataset,
  state,
  years,
  metrics,
  selectedYearIndex,
  currentYear,
  compareOptions,
  setMetric,
  setSelectedYear,
  setPrimaryCountry,
  setCompareCountry,
  togglePlayback,
  previousYear,
  nextYear,
  stopPlayback,
} = useWorldBankData()

watch(
  () => route.name,
  (name) => {
    if (name === 'temporal') stopPlayback()
  },
)
</script>

<template>
  <div class="shell page">
    <header class="shell__header sticky-head">
      <div class="shell__brand dash-card dash-card--no-lift anim-rise">
        <p class="shell__eyebrow">World Bank · 2015–2024</p>
        <h1 class="shell__title">发展差距透镜</h1>
        <p class="shell__tagline">
          聚焦公开 CSV
          中的经济与发展指标：先选定国家与年份，在「空间」「时间」看单国语境；需要两国对照时进入「两国对比」专页。
        </p>
      </div>

      <nav class="shell__nav dash-card dash-card--no-lift anim-rise anim-rise-delay-1" aria-label="主导航">
        <RouterLink v-slot="{ isExactActive, href, navigate }" custom :to="{ name: 'home', query: navQuery }">
          <a
            :href="href"
            class="shell__link"
            :class="{ 'shell__link--active': isExactActive }"
            @click="navigate"
          >
            主题
          </a>
        </RouterLink>
        <RouterLink v-slot="{ isActive, href, navigate }" custom :to="{ name: 'spatial', query: navQuery }">
          <a
            :href="href"
            class="shell__link"
            :class="{ 'shell__link--active': isActive }"
            @click="navigate"
          >
            空间分布
          </a>
        </RouterLink>
        <RouterLink v-slot="{ isActive, href, navigate }" custom :to="{ name: 'temporal', query: navQuery }">
          <a
            :href="href"
            class="shell__link"
            :class="{ 'shell__link--active': isActive }"
            @click="navigate"
          >
            时间演变
          </a>
        </RouterLink>
        <RouterLink v-slot="{ isActive, href, navigate }" custom :to="{ name: 'compare', query: compareNavQuery }">
          <a
            :href="href"
            class="shell__link"
            :class="{ 'shell__link--active': isActive }"
            @click="navigate"
          >
            两国对比
          </a>
        </RouterLink>
      </nav>
    </header>

    <section v-if="showGlobalFilters" class="shell__filters anim-rise anim-rise-delay-2" aria-label="全局筛选">
      <div class="shell__controls dash-card">
        <ControlBar
          dash
          :compare-ui="compareUi"
          :hide-timeline="route.name === 'temporal'"
          :hide-metric="route.name === 'compare'"
          :country-options="dataset.countries"
          :compare-options="compareOptions"
          :metric-options="metrics"
          :primary-country-code="state.selectedCountryCode"
          :compare-country-code="state.compareCountryCode ?? ''"
          :selected-metric="state.selectedMetric"
          :years="years"
          :selected-year-index="selectedYearIndex"
          :current-year="currentYear"
          :is-playing="state.isPlaying"
          @set-primary-country="setPrimaryCountry"
          @set-compare-country="setCompareCountry"
          @set-metric="setMetric"
          @set-selected-year-index="setSelectedYear(years[$event])"
          @toggle-playback="togglePlayback"
          @previous-year="previousYear"
          @next-year="nextYear"
        />
      </div>
    </section>

    <main class="shell__main">
      <RouterView v-slot="{ Component }">
        <Transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

<style scoped>
.page {
  width: min(1680px, calc(100vw - 32px));
  max-width: 1680px;
  min-width: 0;
  margin: 0 auto;
  padding: 20px 0 48px;
  box-sizing: border-box;
}

.sticky-head {
  position: sticky;
  top: 0;
  z-index: 50;
  padding-bottom: 6px;
  margin-bottom: 18px;
  background: linear-gradient(180deg, rgba(11, 17, 32, 0.94) 0%, rgba(11, 17, 32, 0.82) 72%, transparent 100%);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.shell__header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.shell__brand {
  padding: 18px 22px;
}

.shell__eyebrow {
  margin: 0 0 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #38bdf8;
}

.shell__title {
  margin: 0;
  font-size: clamp(1.35rem, 2.2vw, 1.75rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.2;
  color: #f8fafc;
}

.shell__tagline {
  margin: 10px 0 0;
  max-width: 62ch;
  font-size: 0.875rem;
  line-height: 1.65;
  color: #94a3b8;
}

.shell__nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
  align-items: center;
}

.shell__link {
  display: inline-flex;
  align-items: center;
  padding: 9px 18px;
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #cbd5e1;
  text-decoration: none;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.4);
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease,
    transform 0.2s ease;
}

.shell__link:hover {
  color: #f1f5f9;
  border-color: rgba(56, 189, 248, 0.35);
  background: rgba(56, 189, 248, 0.1);
  transform: translateY(-1px);
}

.shell__link--active {
  color: #e0f2fe;
  border-color: rgba(56, 189, 248, 0.45);
  background: rgba(56, 189, 248, 0.18);
  box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.12);
}

.shell__filters {
  margin-bottom: 22px;
}

.shell__controls {
  padding: 18px 20px;
}

.shell__main {
  min-height: 48vh;
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 640px) {
  .page {
    width: calc(100vw - 20px);
    padding-bottom: 32px;
  }
}
</style>
