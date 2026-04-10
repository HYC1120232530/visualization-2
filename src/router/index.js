import { createRouter, createWebHistory } from 'vue-router'
import AppShell from '../layouts/AppShell.vue'
import CompareView from '../views/CompareView.vue'
import DocumentationView from '../views/DocumentationView.vue'
import HomeView from '../views/HomeView.vue'
import SpatialView from '../views/SpatialView.vue'
import TemporalView from '../views/TemporalView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppShell,
      children: [
        { path: '', name: 'home', component: HomeView },
        { path: 'documentation', name: 'documentation', component: DocumentationView },
        { path: 'spatial', name: 'spatial', component: SpatialView },
        { path: 'temporal', name: 'temporal', component: TemporalView },
        { path: 'compare', name: 'compare', component: CompareView },
      ],
    },
  ],
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' }
  },
})

// 勿在 beforeEach 里提前关闭对比态：导航尚未完成时 route 仍为旧页，会触发 useFilterRouteSync 的
// router.replace，与正在进行的 push 竞态，表现为离开「两国对比」需点两次主导航。
// 对比在目标页由 useFilterRouteSync.applyQueryToState（非 /compare）关闭并同步 URL。

export default router
