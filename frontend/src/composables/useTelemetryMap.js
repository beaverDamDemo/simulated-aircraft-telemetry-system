import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { io } from 'socket.io-client';
import { makeAircraftIcon } from '../utils/aircraftMarker';

const MAX_TRAIL_POSITIONS = 50;
const TRAIL_OPACITY_SPAN = 0.75;

const makeTooltipContent = (data) => `
  <div class="ac-balloon">
    <div class="ac-balloon-header">✈ ${data.id}</div>
  </div>
`;

export function useTelemetryMap(mapContainer) {
  const map = shallowRef(null);
  const socket = shallowRef(null);
  const aircraftMarker = shallowRef(null);
  const trailMarkers = ref([]);
  const trailPositions = ref([]);
  const latestTelemetry = ref(null);
  const lastTimestamp = ref(null);
  const connectionStatus = ref('connecting');
  const showBackendCheck = ref(true);

  const connectionStatusText = computed(() => {
    if (connectionStatus.value === 'connected') {
      return 'Connected';
    }

    if (connectionStatus.value === 'disconnected') {
      return 'Disconnected';
    }

    return 'Connecting...';
  });

  const rocClass = computed(() => {
    if (!latestTelemetry.value) {
      return '';
    }

    if (latestTelemetry.value.roc > 0) {
      return 'telemetry-overlay__value--up';
    }

    if (latestTelemetry.value.roc < 0) {
      return 'telemetry-overlay__value--down';
    }

    return '';
  });

  const rocEmoji = computed(() => {
    if (!latestTelemetry.value) {
      return '⏺️';
    }

    const roc = latestTelemetry.value.roc;

    if (roc <= -20) return '🛬';
    if (roc <= -10) return '📉';
    if (roc < 0) return '🔻';
    if (roc === 0) return '⏺️';
    if (roc < 5) return '🔺';
    if (roc < 15) return '📈';
    return '🚀';
  });

  const clearTrailMarkers = () => {
    trailMarkers.value.forEach((marker) => marker.remove());
    trailMarkers.value = [];
  };

  const renderTrailMarkers = () => {
    clearTrailMarkers();

    if (!map.value || trailPositions.value.length === 0) {
      return;
    }

    const trailCount = trailPositions.value.length;

    trailMarkers.value = trailPositions.value.map((position, index) => {
      const opacity =
        trailCount === 1
          ? 1
          : 1 - (index / (trailCount - 1)) * TRAIL_OPACITY_SPAN;

      return L.marker([position.lat, position.lon], {
        icon: makeAircraftIcon(position.heading, { grayscale: true, opacity }),
        interactive: false,
        zIndexOffset: -500,
      }).addTo(map.value);
    });
  };

  const applyTelemetry = (data) => {
    if (lastTimestamp.value !== null && data.t < lastTimestamp.value) {
      console.log(
        `[Telemetry] Route reset detected — timestamp jumped from ${lastTimestamp.value} ms back to ${data.t} ms. Aircraft restarted from origin.`,
      );
      trailPositions.value = [];
      clearTrailMarkers();
    }

    if (latestTelemetry.value) {
      trailPositions.value.unshift({ ...latestTelemetry.value });

      if (trailPositions.value.length > MAX_TRAIL_POSITIONS) {
        trailPositions.value.length = MAX_TRAIL_POSITIONS;
      }
    }

    lastTimestamp.value = data.t;
    latestTelemetry.value = data;

    const latlng = [data.lat, data.lon];

    if (!aircraftMarker.value) {
      aircraftMarker.value = L.marker(latlng, {
        icon: makeAircraftIcon(data.heading),
      })
        .addTo(map.value)
        .bindTooltip(makeTooltipContent(data), {
          permanent: true,
          direction: 'right',
          offset: [22, 0],
          className: 'ac-tooltip-wrapper',
        })
        .openTooltip();
    } else {
      aircraftMarker.value.setLatLng(latlng);
      aircraftMarker.value.setIcon(makeAircraftIcon(data.heading));
      aircraftMarker.value.setTooltipContent(makeTooltipContent(data));
    }

    renderTrailMarkers();

    map.value.panTo(latlng, {
      animate: true,
      duration: 0.5,
    });
  };

  onMounted(() => {
    if (!mapContainer.value) {
      return;
    }

    map.value = L.map(mapContainer.value).setView([8.1005, 98.9841], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map.value);

    socket.value = io('/telemetry');
    socket.value.on('connect', () => {
      connectionStatus.value = 'connected';
    });
    socket.value.on('disconnect', () => {
      connectionStatus.value = 'disconnected';
    });
    socket.value.on('telemetry', applyTelemetry);
  });

  onBeforeUnmount(() => {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
    }

    clearTrailMarkers();

    if (map.value) {
      map.value.remove();
      map.value = null;
    }
  });

  return {
    showBackendCheck,
    latestTelemetry,
    connectionStatus,
    connectionStatusText,
    rocClass,
    rocEmoji,
    mapContainer,
  };
}
