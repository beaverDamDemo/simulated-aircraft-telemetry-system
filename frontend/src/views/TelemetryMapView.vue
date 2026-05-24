<template>
  <section class="telemetry-map-view">
    <BackendCheckCard v-if="showBackendCheck" class="backend-check" @close="closeBackendCheck" />
    <div class="telemetry-overlay">
      <div class="telemetry-overlay__header">
        <span class="telemetry-overlay__title">
          Live Telemetry
          <span v-if="latestTelemetry" class="telemetry-overlay__title-id">
            | {{ latestTelemetry.id }}
          </span>
        </span>
        <span class="telemetry-overlay__status" :class="`status-${connectionStatus}`">
          {{ connectionStatusText }}
        </span>
      </div>
      <div v-if="latestTelemetry" class="telemetry-overlay__grid">
        <div>
          <span class="telemetry-overlay__label">Latitude</span>
          <span class="telemetry-overlay__value">{{ latestTelemetry.lat.toFixed(7) }}</span>
        </div>
        <div>
          <span class="telemetry-overlay__label">Longitude</span>
          <span class="telemetry-overlay__value">{{ latestTelemetry.lon.toFixed(7) }}</span>
        </div>
        <div>
          <span class="telemetry-overlay__label">Altitude</span>
          <span class="telemetry-overlay__value">{{ latestTelemetry.alt }} m</span>
        </div>
        <div>
          <span class="telemetry-overlay__label">Speed</span>
          <span class="telemetry-overlay__value">{{ latestTelemetry.speed }} kph</span>
        </div>
        <div>
          <span class="telemetry-overlay__label">Heading</span>
          <span class="telemetry-overlay__value">{{ latestTelemetry.heading }}°</span>
        </div>
        <div>
          <span class="telemetry-overlay__label">Rate of Climb</span>
          <span class="telemetry-overlay__value" :class="rocClass">
            <span class="telemetry-overlay__emoji">{{ rocEmoji }}</span>{{ latestTelemetry.roc }} m/s
          </span>
        </div>
      </div>
      <div v-else class="telemetry-overlay__empty">
        Waiting for telemetry data…
      </div>
    </div>
    <div ref="mapContainer" class="map" />
  </section>
</template>

<script setup>
import { ref } from 'vue';
import BackendCheckCard from '../components/BackendCheckCard.vue';
import { useTelemetryMap } from '../composables/useTelemetryMap';

const mapContainer = ref(null);

const {
  showBackendCheck,
  latestTelemetry,
  connectionStatus,
  connectionStatusText,
  rocClass,
  rocEmoji,
  closeBackendCheck,
} = useTelemetryMap(mapContainer);
</script>

<style scoped>
.telemetry-map-view {
  width: min(1100px, 100%);
  border-radius: var(--radius-card);
  padding: 16px;
  display: grid;
  gap: 16px;
  align-content: start;
}

.map {
  width: 100%;
  height: min(70vh, 640px);
  min-height: 420px;
  border-radius: calc(var(--radius-card) - 8px);
  overflow: hidden;
  background: var(--color-surface);
  box-shadow: 0 18px 50px var(--color-shadow);
  border: 1px solid rgba(53, 73, 94, 0.08);
}

.backend-check {
  justify-self: stretch;
}

.telemetry-overlay {
  border-radius: calc(var(--radius-card) - 10px);
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  color: #0f172a;
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.14);
  padding: 14px 16px;
}

.telemetry-overlay__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.telemetry-overlay__title {
  font-size: 0.92rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #0f172a;
}

.telemetry-overlay__title-id {
  color: #2563eb;
}

.telemetry-overlay__status {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.32rem 0.62rem;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.16);
  color: #334155;
}

.status-connected {
  background: rgba(34, 197, 94, 0.14);
  color: #166534;
}

.status-connecting {
  background: rgba(250, 204, 21, 0.16);
  color: #a16207;
}

.status-disconnected {
  background: rgba(248, 113, 113, 0.14);
  color: #b91c1c;
}

.telemetry-overlay__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 16px;
}

.telemetry-overlay__grid > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.telemetry-overlay__label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
}

.telemetry-overlay__value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
}

.telemetry-overlay__emoji {
  display: inline-block;
  margin-right: 0.35rem;
}

.telemetry-overlay__value--up {
  color: #15803d;
}

.telemetry-overlay__value--down {
  color: #dc2626;
}

.telemetry-overlay__empty {
  font-size: 0.92rem;
  color: #475569;
}

/* ── Aircraft balloon tooltip ── */
:deep(.ac-tooltip-wrapper) {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
}
:deep(.ac-tooltip-wrapper::before) {
  display: none;
}
:deep(.ac-balloon) {
  background: rgba(10, 18, 38, 0.90);
  border: 1px solid rgba(59, 130, 246, 0.45);
  border-radius: 8px;
  padding: 7px 11px 8px;
  font-family: ui-monospace, 'Courier New', monospace;
  font-size: 11.5px;
  color: #e2e8f0;
  min-width: 138px;
  backdrop-filter: blur(6px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
}
:deep(.ac-balloon-header) {
  color: #93c5fd;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.04em;
}
</style>