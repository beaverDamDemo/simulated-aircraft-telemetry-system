import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import HomeView from '../views/HomeView.vue';
import TelemetryMapView from '../views/TelemetryMapView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import NotFoundView from '../views/NotFoundView.vue';
import ProfileView from '../views/ProfileView.vue';

const BASE_TITLE = 'Aircraft Telemetry Dashboard';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: 'Home' },
  },
  {
    path: '/telemetry-map',
    name: 'telemetry-map',
    component: TelemetryMapView,
    meta: { title: 'Live Telemetry', requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { title: 'My Profile', requiresAuth: true, authRedirect: 'home' },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { title: 'Sign In', guestOnly: true },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { title: 'Create Account', guestOnly: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: { title: 'Page Not Found' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  document.title = to.meta.title
    ? `${to.meta.title} | ${BASE_TITLE}`
    : BASE_TITLE;

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: to.meta.authRedirect || 'login' };
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'home' };
  }
});

export default router;
