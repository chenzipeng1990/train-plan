/**
 * 路由配置
 */

import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import WeightChartView from '../views/WeightChartView.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/weight-chart',
    name: 'weight-chart',
    component: WeightChartView
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;