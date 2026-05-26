<template>
  <section class="card" :class="{ compact }">
    <button type="button" class="close-button" @click="emit('close')" aria-label="Close backend test section">
      X
    </button>
    <div class="toolbar">
      <button type="button" class="test-button" @click="testBackendConnection">
        Test backend connection
      </button>
      <p v-if="!(compact && statusClass === 'success')" class="status" :class="statusClass">
        {{ statusText }}
      </p>
      <p v-if="compact && statusClass === 'success' && responseSummary" class="response-summary">
        {{ responseSummary }}
      </p>
    </div>
    <pre v-if="!compact && responseText" class="response">{{ responseText }}</pre>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { fetchHello } from '../services/helloService';

defineProps({
  compact: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close']);

const statusText = ref('No request sent yet.');
const responseText = ref('');
const responseSummary = ref('');
const statusClass = ref('idle');

async function testBackendConnection() {
  statusText.value = 'Checking backend...';
  statusClass.value = 'loading';
  responseText.value = 'Waiting for /hello response...';
  responseSummary.value = '';

  try {
    const data = await fetchHello();
    const [responseKey, responseValue] = Object.entries(data)[0] || [];

    statusText.value = 'Connected to backend';
    statusClass.value = 'success';
    responseText.value = JSON.stringify(data, null, 2);
    responseSummary.value = responseKey ? `${responseKey}: ${responseValue}` : '';
  } catch (error) {
    statusText.value = 'Backend request failed';
    statusClass.value = 'error';
    responseText.value = error.message;
    responseSummary.value = '';
  }
}
</script>

<style scoped>
.card {
  position: relative;
  width: min(720px, 100%);
  border-radius: var(--radius-card);
  padding: 32px;
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: 0 18px 50px var(--color-shadow);
  border: 1px solid rgba(53, 73, 94, 0.08);
}

.card.compact {
  width: min(100%, 560px);
  padding: 20px 22px;
  background: transparent;
  box-shadow: none;
  border: none;
}

.card.compact .close-button {
  top: 0;
  right: 0;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.close-button {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(53, 73, 94, 0.18);
  background: #ffffff;
  color: var(--color-secondary);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.close-button svg {
  display: none;
}

.close-button:hover {
  background: rgba(53, 73, 94, 0.06);
  border-color: rgba(53, 73, 94, 0.28);
  color: #111827;
  transform: translateY(-1px);
}

.close-button:active {
  transform: translateY(0);
}

.test-button {
  padding: 10px 14px;
  border-radius: var(--radius-button);
  border: 1px solid rgba(66, 185, 131, 0.28);
  background: linear-gradient(135deg, rgba(66, 185, 131, 0.12), rgba(53, 73, 94, 0.08));
  color: var(--color-secondary);
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
  box-shadow: 0 10px 24px rgba(53, 73, 94, 0.08);
}

.test-button:hover {
  background: linear-gradient(135deg, rgba(66, 185, 131, 0.18), rgba(53, 73, 94, 0.12));
  border-color: rgba(66, 185, 131, 0.48);
  transform: translateY(-1px);
  box-shadow: 0 14px 30px rgba(53, 73, 94, 0.14);
}

.test-button:active {
  transform: translateY(0);
}

.status {
  display: inline-block;
  margin: 0;
  padding: 8px 12px;
  border-radius: var(--radius-pill);
  font-weight: 700;
}

.response-summary {
  margin: 0;
  padding: 0;
  border-radius: 0;
  background: transparent;
  color: var(--color-primary);
  border: none;
  font-weight: 700;
}

.status.idle {
  background: #ffffff;
  color: var(--color-secondary);
  border: 1px solid rgba(53, 73, 94, 0.14);
}

.status.loading {
  background: var(--color-loading-bg);
  color: var(--color-loading-text);
}

.status.warning {
  background: #ffffff;
  color: var(--color-secondary);
  border: 1px solid rgba(53, 73, 94, 0.14);
}

.status.success {
  background: rgba(66, 185, 131, 0.14);
  color: #256f50;
  border: 1px solid rgba(66, 185, 131, 0.22);
}

.status.error {
  background: rgba(239, 68, 68, 0.14);
  color: #b91c1c;
  border: 1px solid rgba(239, 68, 68, 0.22);
}

.response {
  margin: 0;
  margin-top: 16px;
  padding: 18px 20px;
  border-radius: 16px;
  background: var(--color-card-gradient);
  color: var(--color-text);
  overflow: auto;
  border: 1px solid rgba(53, 73, 94, 0.08);
}
</style>