import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import './assets/styles/global.css';
import HomeView from './views/HomeView.vue';
import TelemetryMapView from './views/TelemetryMapView.vue';
import NotFoundView from './views/NotFoundView.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/telemetry-map',
    name: 'telemetry-map',
    component: TelemetryMapView,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

createApp(App).use(router).mount('#app');
