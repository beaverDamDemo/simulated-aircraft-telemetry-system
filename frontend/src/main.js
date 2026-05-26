import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './assets/styles/global.css';
import router from './router/index';
import { useAuthStore } from './stores/auth';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Re-hydrate user from stored token on page load
const auth = useAuthStore();
auth.fetchUser().then(() => {
  app.mount('#app');
});
