import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  login as apiLogin,
  register as apiRegister,
  getMe,
} from '../services/authService';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(localStorage.getItem('access_token') || null);

  const isAuthenticated = computed(() => !!token.value);

  async function login(email, password) {
    const data = await apiLogin(email, password);
    token.value = data.accessToken;
    user.value = data.user;
    localStorage.setItem('access_token', data.accessToken);
  }

  async function register(email, password) {
    const data = await apiRegister(email, password);
    token.value = data.accessToken;
    user.value = data.user;
    localStorage.setItem('access_token', data.accessToken);
  }

  async function fetchUser() {
    if (!token.value) return;
    try {
      user.value = await getMe();
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        return;
      }
      throw err;
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('access_token');
  }

  return { user, token, isAuthenticated, login, register, fetchUser, logout };
});
