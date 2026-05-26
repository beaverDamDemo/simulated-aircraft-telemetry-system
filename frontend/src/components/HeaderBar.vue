<template>
  <header class="header">
    <div class="brand">
      <router-link class="logo-link" to="/" aria-label="Go to home page">
        <img class="logo" :src="logoSrc" alt="Logo">
      </router-link>
    </div>
    <div class="header-actions">
      <button
        type="button"
        class="header-button is-theme-toggle"
        :aria-pressed="themeName === 'vibrant'"
        @click="emit('toggle-theme')"
      >
        🎨 palette
      </button>
      <div class="header-auth-action">
        <template v-if="auth.isAuthenticated">
          <span class="header-user-email">{{ auth.user?.email }}</span>
          <button type="button" class="header-button" @click="auth.logout(); $router.push('/')">
            Logout
          </button>
        </template>
        <template v-else>
          <router-link class="header-button" to="/login">Sign in</router-link>
          <router-link class="header-button is-primary" to="/register">Register</router-link>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '../stores/auth';
import logoSrc from '../assets/images/logo-yellow-green-blue.png';

const auth = useAuthStore();

defineProps({
  themeName: {
    type: String,
    default: 'default',
  },
});

const emit = defineEmits(['toggle-theme']);
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 24px clamp(20px, 4vw, 40px);
  border-bottom: 1px solid var(--color-header-border);
  background: var(--color-header-bg);
  color: var(--color-header-text);
  backdrop-filter: blur(8px);
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.logo-link {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}

.logo {
  width: 300px;
  height: 64px;
  object-fit: contain;
  display: block;
}

.eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 12px;
  color: var(--color-primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: nowrap;
  white-space: nowrap;
  flex-shrink: 0;
}

.header-auth-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.header-user-email {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-muted);
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-button-border);
  background: var(--color-button-bg);
  color: var(--color-button-text);
  border-radius: var(--radius-button);
  padding: 10px 14px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  box-shadow: var(--color-button-shadow);
  transition:
    background-color 0.2s ease,
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.header-button:hover {
  background: var(--color-button-hover-bg);
  border-color: var(--color-button-hover-border);
  transform: translateY(-1px);
  box-shadow: var(--color-button-shadow-hover);
}

.header-button:active {
  transform: translateY(0);
}

.header-button.is-theme-toggle {
  border-color: rgba(66, 185, 131, 0.28);
}

.header-button.is-primary {
  background: linear-gradient(135deg, rgba(66, 185, 131, 0.18), rgba(53, 73, 94, 0.08));
  border-color: rgba(66, 185, 131, 0.42);
  color: var(--color-success-text);
}

:global(body[data-theme='vibrant']) .header-button.is-theme-toggle {
  border-color: rgba(255, 47, 179, 0.38);
}

@media (max-width: 640px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .logo {
    width: 56px;
    height: 56px;
  }
}
</style>