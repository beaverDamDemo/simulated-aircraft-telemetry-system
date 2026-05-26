<template>
  <section class="profile-page">
    <div class="profile-card">
      <h1 class="profile-title">My Profile</h1>

      <p v-if="loading" class="profile-loading">Loading…</p>
      <p v-else-if="error" class="profile-error">{{ error }}</p>

      <div v-else-if="user" class="profile-fields">
        <div class="profile-field">
          <span class="field-label">Email</span>
          <span class="field-value">{{ user.email }}</span>
        </div>
        <div class="profile-field">
          <span class="field-label">Account ID</span>
          <span class="field-value field-id">{{ user.id }}</span>
        </div>
        <div v-if="formattedDate" class="profile-field">
          <span class="field-label">Member since</span>
          <span class="field-value">{{ formattedDate }}</span>
        </div>
      </div>

      <button type="button" class="logout-button" @click="handleLogout">
        Logout
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();
const { user } = storeToRefs(auth);

const loading = ref(false);
const error = ref(null);

const formattedDate = computed(() => {
  if (!user.value?.createdAt) return null;
  return new Date(user.value.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

onMounted(async () => {
  loading.value = true;
  try {
    await auth.fetchUser();
  } catch {
    error.value = 'Could not load profile. Please check your connection and try again.';
  } finally {
    loading.value = false;
  }
});

function handleLogout() {
  auth.logout();
  router.push('/');
}
</script>

<style scoped>
.profile-page {
  width: 100%;
  min-height: clamp(420px, 70vh, 760px);
  display: grid;
  place-items: center;
  padding: 32px 20px;
}

.profile-card {
  width: 100%;
  max-width: 480px;
  background: var(--color-card-bg, var(--color-hero-bg));
  border: 1px solid var(--color-card-border, var(--color-hero-border));
  border-radius: 20px;
  padding: 40px 36px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  box-shadow: var(--color-hero-shadow);
}

.profile-title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-hero-text);
}

.profile-loading {
  margin: 0;
  opacity: 0.5;
  font-size: 0.95rem;
  color: var(--color-hero-text);
}

.profile-error {
  margin: 0;
  font-size: 0.95rem;
  color: #e05252;
}

.profile-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.profile-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.55;
  color: var(--color-hero-text);
}

.field-value {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-hero-text);
  word-break: break-all;
}

.field-id {
  font-family: monospace;
  font-size: 0.88rem;
  opacity: 0.75;
}

.logout-button {
  align-self: flex-start;
  padding: 10px 22px;
  border-radius: 10px;
  border: 1px solid var(--color-hero-border);
  background: transparent;
  color: var(--color-hero-text);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
}

.logout-button:hover {
  background: rgba(255, 255, 255, 0.08);
  opacity: 0.9;
}
</style>
