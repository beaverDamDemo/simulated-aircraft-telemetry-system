<template>
  <section class="auth-view">
    <div class="auth-card">
      <h1 class="auth-card__title">Sign in</h1>
      <form class="auth-card__form" @submit.prevent="submit">
        <div class="auth-card__field">
          <label class="auth-card__label" for="email">Email</label>
          <input
            id="email"
            v-model="email"
            class="auth-card__input"
            type="email"
            autocomplete="email"
            required
            placeholder="you@example.com"
          />
        </div>
        <div class="auth-card__field">
          <label class="auth-card__label" for="password">Password</label>
          <input
            id="password"
            v-model="password"
            class="auth-card__input"
            type="password"
            autocomplete="current-password"
            required
            placeholder="••••••••"
          />
        </div>
        <p v-if="errorMsg" class="auth-card__error">{{ errorMsg }}</p>
        <button type="submit" class="auth-card__submit" :disabled="loading">
          {{ loading ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
      <p class="auth-card__footer">
        No account?
        <router-link class="auth-card__link" to="/register">Register</router-link>
      </p>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();

const email = ref('');
const password = ref('');
const errorMsg = ref('');
const loading = ref(false);

async function submit() {
  errorMsg.value = '';
  loading.value = true;
  try {
    await auth.login(email.value, password.value);
    router.push('/telemetry-map');
  } catch (err) {
    errorMsg.value = err.response?.data?.message ?? 'Login failed. Please try again.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 32px 16px;
}

.auth-card {
  width: min(420px, 100%);
  border-radius: var(--radius-card);
  padding: 36px 32px;
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: 0 18px 50px var(--color-shadow);
  border: 1px solid var(--color-border);
}

.auth-card__title {
  margin: 0 0 24px;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-text);
}

.auth-card__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.auth-card__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.auth-card__label {
  font-size: 0.82rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-muted);
}

.auth-card__input {
  padding: 10px 12px;
  border-radius: var(--radius-button);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.auth-card__input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.18);
}

.auth-card__error {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-error-text);
  background: var(--color-error-bg);
  border-radius: var(--radius-button);
  padding: 8px 12px;
}

.auth-card__submit {
  margin-top: 4px;
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  font-weight: 700;
}

.auth-card__footer {
  margin: 20px 0 0;
  font-size: 0.88rem;
  color: var(--color-muted);
  text-align: center;
}

.auth-card__link {
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: none;
}

.auth-card__link:hover {
  text-decoration: underline;
}
</style>
