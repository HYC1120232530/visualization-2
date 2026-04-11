import { onMounted, ref, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  buildFilterQueryFromState,
  pickDefaultCompareCountryCodeForPrimary,
  useWorldBankData,
} from './useWorldBankData'

/**
 * 将核心筛选条件同步到 URL query，支持刷新/分享/后退恢复；与 useWorldBankData 模块级 state 配合。
 */
export function useFilterRouteSync() {
  const route = useRoute()
  const router = useRouter()
  const {
    dataset,
    state,
    setMetric,
    setSelectedYear,
    setPrimaryCountry,
    setCompareCountry,
    toggleCompareMode,
  } = useWorldBankData()

  /** fromRoute | fromState | idle */
  const syncPhase = ref('idle')

  function queryMatchesState(q) {
    const t = buildFilterQueryFromState()
    return (
      String(q.metric ?? '') === String(t.metric) &&
      String(q.year ?? '') === String(t.year) &&
      String(q.country ?? '') === String(t.country) &&
      String(q.compareOn ?? '') === String(t.compareOn) &&
      String(q.compare ?? '') === String(t.compare ?? '')
    )
  }

  /** 将当前 state 写回 URL（播放年份时暂缓同步年份，避免 router.replace 触发整树重渲染、打断图表动画） */
  function replaceQueryFromStateIfNeeded() {
    if (syncPhase.value === 'fromRoute') return
    const q = buildFilterQueryFromState()
    if (queryMatchesState(route.query)) return
    syncPhase.value = 'fromState'
    router.replace({ query: q }).finally(() => {
      nextTick(() => {
        syncPhase.value = 'idle'
      })
    })
  }

  function applyQueryToState(q) {
    if (typeof q.metric === 'string' && dataset.metrics.some((m) => m.key === q.metric)) {
      setMetric(q.metric)
    }
    const y = q.year != null && q.year !== '' ? Number(q.year) : null
    if (y != null && !Number.isNaN(y) && dataset.years.includes(y)) {
      setSelectedYear(y)
    }
    if (typeof q.country === 'string' && dataset.dataIndex[q.country]) {
      setPrimaryCountry(q.country)
    }

    // 对比仅属于 /compare：其它页面忽略 URL 中的对比参数，避免与路由策略冲突
    if (route.name !== 'compare') {
      toggleCompareMode(false)
      return
    }

    toggleCompareMode(true)
    if (typeof q.compare === 'string' && dataset.dataIndex[q.compare]) {
      setCompareCountry(q.compare)
    } else {
      const fallback = pickDefaultCompareCountryCodeForPrimary(state.selectedCountryCode)
      if (fallback) setCompareCountry(fallback)
    }
  }

  watch(
    () => ({ ...route.query }),
    (q) => {
      if (syncPhase.value === 'fromState' || syncPhase.value === 'fromRoute') return
      if (queryMatchesState(q)) return
      syncPhase.value = 'fromRoute'
      applyQueryToState(q)
      nextTick(() => {
        syncPhase.value = 'idle'
        // applyQueryToState 内会关对比，但 state 监听器在 syncPhase === 'fromRoute' 时跳过 replace，
        // 导致 URL 仍带 compare 参数；此处补一次与 state 对齐，避免脏 query。
        const t = buildFilterQueryFromState()
        if (!queryMatchesState(route.query)) {
          syncPhase.value = 'fromState'
          router.replace({ query: t }).finally(() => {
            nextTick(() => {
              syncPhase.value = 'idle'
            })
          })
        }
      })
    },
    { deep: true },
  )

  watch(
    () => [
      state.selectedMetric,
      state.selectedCountryCode,
      state.compareEnabled,
      state.compareCountryCode,
    ],
    () => {
      replaceQueryFromStateIfNeeded()
    },
  )

  watch(
    () => state.selectedYear,
    () => {
      if (state.isPlaying) return
      replaceQueryFromStateIfNeeded()
    },
  )

  watch(
    () => state.isPlaying,
    (playing) => {
      if (playing) return
      replaceQueryFromStateIfNeeded()
    },
  )

  onMounted(() => {
    const q = route.query
    const hasQuery =
      Boolean(q.metric) || Boolean(q.year) || Boolean(q.country) || q.compareOn != null || Boolean(q.compare)
    if (hasQuery) {
      if (!queryMatchesState(q)) {
        syncPhase.value = 'fromRoute'
        applyQueryToState(q)
        nextTick(() => {
          syncPhase.value = 'idle'
        })
      }
    } else {
      syncPhase.value = 'fromState'
      router.replace({ query: buildFilterQueryFromState() }).finally(() => {
        nextTick(() => {
          syncPhase.value = 'idle'
        })
      })
    }
  })
}
