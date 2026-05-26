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
  border: 1px solid var(--color-map-map-border);
}

.backend-check {
  justify-self: stretch;
}

.telemetry-overlay {
  border-radius: calc(var(--radius-card) - 10px);
  border: 1px solid var(--color-map-panel-border);
  background: var(--color-map-panel-bg);
  color: var(--color-map-panel-text);
  box-shadow: var(--color-map-panel-shadow);
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
  color: var(--color-map-panel-text);
}

.telemetry-overlay__title-id {
  color: var(--color-secondary);
}

.telemetry-overlay__status {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.32rem 0.62rem;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.16);
  color: var(--color-map-panel-text);
}

.status-connected {
  background: var(--color-success-bg);
  color: var(--color-success-text);
}

.status-connecting {
  background: var(--color-warning-bg);
  color: var(--color-warning-text);
}

.status-disconnected {
  background: var(--color-error-bg);
  color: var(--color-error-text);
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
  color: var(--color-muted);
}

.telemetry-overlay__value {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-map-panel-text);
}

.telemetry-overlay__emoji {
  display: inline-block;
  margin-right: 0.35rem;
}

.telemetry-overlay__value--up {
  color: var(--color-success-text);
}

.telemetry-overlay__value--down {
  color: var(--color-error-text);
}

.telemetry-overlay__empty {
  font-size: 0.92rem;
  color: var(--color-muted);
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
  background: var(--color-map-tooltip-bg);
  border: 1px solid var(--color-map-tooltip-border);
  border-radius: 8px;
  padding: 7px 11px 8px;
  font-family: ui-monospace, 'Courier New', monospace;
  font-size: 11.5px;
  color: var(--color-map-tooltip-text);
  min-width: 138px;
  backdrop-filter: blur(6px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
}
:deep(.ac-balloon-header) {
  color: var(--color-map-tooltip-header);
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.04em;
}
</style>