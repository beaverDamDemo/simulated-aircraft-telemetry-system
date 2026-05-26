import { describe, it, expect, beforeEach, vi } from 'vitest';
import { defineComponent, nextTick, ref, h } from 'vue';
import { mount } from '@vue/test-utils';
import { io } from 'socket.io-client';
import { useTelemetryMap } from '../useTelemetryMap';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('socket.io-client', () => ({ io: vi.fn() }));

vi.mock('leaflet', () => {
  // Returns a chainable mock object (every method returns itself)
  const chainable = () => {
    const o = {
      setView: vi.fn(),
      addTo: vi.fn(),
      remove: vi.fn(),
      panTo: vi.fn(),
      bindTooltip: vi.fn(),
      openTooltip: vi.fn(),
      setLatLng: vi.fn(),
      setIcon: vi.fn(),
      setTooltipContent: vi.fn(),
    };
    Object.keys(o).forEach((k) => o[k].mockReturnValue(o));
    return o;
  };

  return {
    default: {
      map: vi.fn(() => chainable()),
      tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
      marker: vi.fn(() => chainable()),
      polyline: vi.fn(() => chainable()),
      divIcon: vi.fn(() => ({})),
    },
  };
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Mounts the composable inside a minimal component and returns its output. */
function mountComposable() {
  let result;
  const mapContainer = ref(document.createElement('div'));
  mount(
    defineComponent({
      setup() {
        result = useTelemetryMap(mapContainer);
        return () => h('div');
      },
    }),
  );
  return result;
}

/** Builds a complete telemetry packet with sensible defaults. */
const packet = (overrides = {}) => ({
  id: 'AC01',
  lat: 8.1,
  lon: 98.9,
  alt: 1000,
  speed: 200,
  heading: 90,
  roc: 0,
  t: 1000,
  ...overrides,
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useTelemetryMap', () => {
  let socketHandlers;

  beforeEach(() => {
    vi.clearAllMocks();
    socketHandlers = {};
    io.mockReturnValue({
      on: vi.fn((event, cb) => {
        socketHandlers[event] = cb;
      }),
      disconnect: vi.fn(),
    });
  });

  it('rocEmoji returns the correct emoji at every roc threshold boundary', async () => {
    const { rocEmoji } = mountComposable();

    // Each [roc, expectedEmoji] pair maps to one branch in the computed
    const cases = [
      [-25, '🛬'], // roc <= -20
      [-15, '📉'], // roc <= -10
      [-1, '🔻'], // roc < 0
      [0, '⏺️'], // roc === 0
      [3, '🔺'], // roc < 5
      [10, '📈'], // roc < 15
      [20, '🚀'], // roc >= 15
    ];

    for (const [i, [roc, expected]] of cases.entries()) {
      socketHandlers.telemetry(packet({ roc, t: (i + 1) * 1000 }));
      await nextTick();
      expect(rocEmoji.value, `roc = ${roc}`).toBe(expected);
    }
  });

  it('connectionStatusText reflects the socket connection lifecycle', async () => {
    const { connectionStatusText } = mountComposable();

    expect(connectionStatusText.value).toBe('Connecting...');

    socketHandlers.connect();
    await nextTick();
    expect(connectionStatusText.value).toBe('Connected');

    socketHandlers.disconnect();
    await nextTick();
    expect(connectionStatusText.value).toBe('Disconnected');
  });

  it('resets latestTelemetry when a packet arrives with an older timestamp', async () => {
    const { latestTelemetry } = mountComposable();

    // Normal progression
    socketHandlers.telemetry(packet({ t: 1000, lat: 8.1 }));
    await nextTick();
    socketHandlers.telemetry(packet({ t: 2000, lat: 8.2 }));
    await nextTick();
    expect(latestTelemetry.value.lat).toBe(8.2);

    // Timestamp goes backwards → route reset
    socketHandlers.telemetry(packet({ t: 500, lat: 8.05 }));
    await nextTick();

    expect(latestTelemetry.value.t).toBe(500);
    expect(latestTelemetry.value.lat).toBe(8.05);
  });
});
