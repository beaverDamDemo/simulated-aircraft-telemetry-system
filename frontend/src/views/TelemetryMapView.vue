<template>
  <section class="telemetry-map-view">
    <BackendCheckCard v-if="showBackendCheck" class="backend-check" @close="showBackendCheck = false" />
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
          <span class="telemetry-overlay__label">ROC</span>
          <span class="telemetry-overlay__value" :class="rocClass">
            <span class="telemetry-overlay__emoji" aria-hidden="true">{{ rocEmoji }}</span>
            {{ latestTelemetry.roc.toFixed(1) }} m/s
          </span>
        </div>
        <div>
          <span class="telemetry-overlay__label">Speed</span>
          <span class="telemetry-overlay__value">{{ latestTelemetry.speed.toFixed(1) }} kph</span>
        </div>
        <div>
          <span class="telemetry-overlay__label">Heading</span>
          <span class="telemetry-overlay__value">{{ latestTelemetry.heading.toFixed(1) }}°</span>
        </div>
      </div>
      <div v-else class="telemetry-overlay__empty">
        Waiting for aircraft telemetry...
      </div>
    </div>
    <div ref="mapContainer" class="map"></div>
  </section>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { io } from 'socket.io-client';
import BackendCheckCard from '../components/BackendCheckCard.vue';

const AIRCRAFT_SVG = (heading) => `
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 64 64"
    style="transform:rotate(${heading}deg);transform-origin:center;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.45));">
    <g>
      <!-- fuselage -->
      <rect x="28" y="10" width="8" height="34" rx="4" fill="#facc15" stroke="#ca8a04" stroke-width="1"/>
      <!-- nose -->
      <path d="M32 4 L38 14 L26 14 Z" fill="#fde047" stroke="#ca8a04" stroke-width="0.8"/>
      <!-- main wings -->
      <path d="M32 24 L6 35 L32 31 L58 35 Z" fill="#facc15" stroke="#ca8a04" stroke-width="0.8"/>
      <!-- tail plane -->
      <path d="M32 38 L18 48 L32 45 L46 48 Z" fill="#f59e0b" stroke="#ca8a04" stroke-width="0.8"/>
      <!-- engine left -->
      <ellipse cx="21" cy="34" rx="4" ry="6" fill="#fbbf24" stroke="#ca8a04" stroke-width="0.6"/>
      <!-- engine right -->
      <ellipse cx="43" cy="34" rx="4" ry="6" fill="#fbbf24" stroke="#ca8a04" stroke-width="0.6"/>
      <!-- cockpit window -->
      <ellipse cx="32" cy="9" rx="2" ry="3" fill="#fff7cc" opacity="0.9"/>
    </g>
  </svg>
`;

const makeIcon = (heading) =>
  L.divIcon({
    html: AIRCRAFT_SVG(heading),
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

const makeTooltipContent = (data) => {
  return `
    <div class="ac-balloon">
      <div class="ac-balloon-header">✈ ${data.id}</div>
    </div>
  `;
};

export default {
  name: 'TelemetryMapView',
  components: {
    BackendCheckCard,
  },
  data() {
    return {
      map: null,
      socket: null,
      aircraftMarker: null,
      latestTelemetry: null,
      lastTimestamp: null,
      connectionStatus: 'connecting',
      showBackendCheck: true,
    };
  },
  computed: {
    connectionStatusText() {
      if (this.connectionStatus === 'connected') {
        return 'Connected';
      }

      if (this.connectionStatus === 'disconnected') {
        return 'Disconnected';
      }

      return 'Connecting...';
    },
    rocClass() {
      if (!this.latestTelemetry) {
        return '';
      }

      if (this.latestTelemetry.roc > 0) {
        return 'telemetry-overlay__value--up';
      }

      if (this.latestTelemetry.roc < 0) {
        return 'telemetry-overlay__value--down';
      }

      return '';
    },
    rocEmoji() {
      if (!this.latestTelemetry) {
        return '⏺️';
      }

      const roc = this.latestTelemetry.roc;

      if (roc <= -20) return '🛬';
      if (roc <= -10) return '📉';
      if (roc < 0) return '🔻';
      if (roc === 0) return '⏺️';
      if (roc < 5) return '🔺';
      if (roc < 15) return '📈';
      return '🚀';
    },
  },
  mounted() {
    this.map = L.map(this.$refs.mapContainer).setView([8.1005, 98.9841], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    this.socket = io('/telemetry');
    this.socket.on('connect', () => {
      this.connectionStatus = 'connected';
    });
    this.socket.on('disconnect', () => {
      this.connectionStatus = 'disconnected';
    });
    this.socket.on('telemetry', (data) => {
      if (this.lastTimestamp !== null && data.t < this.lastTimestamp) {
        console.log(
          `[Telemetry] Route reset detected — timestamp jumped from ${this.lastTimestamp} ms back to ${data.t} ms. Aircraft restarted from origin.`
        );
      }
      this.lastTimestamp = data.t;
      this.latestTelemetry = data;
      const latlng = [data.lat, data.lon];

      if (!this.aircraftMarker) {
        this.aircraftMarker = L.marker(latlng, { icon: makeIcon(data.heading) })
          .addTo(this.map)
          .bindTooltip(makeTooltipContent(data), {
            permanent: true,
            direction: 'right',
            offset: [22, 0],
            className: 'ac-tooltip-wrapper',
          })
          .openTooltip();
      } else {
        this.aircraftMarker.setLatLng(latlng);
        this.aircraftMarker.setIcon(makeIcon(data.heading));
        this.aircraftMarker.setTooltipContent(makeTooltipContent(data));
      }

      this.map.panTo(latlng, {
        animate: true,
        duration: 0.5,
      });
    });
  },
  beforeUnmount() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  },
};
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