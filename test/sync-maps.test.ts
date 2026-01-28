import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncMaps } from '../src/sync-maps.js';
import type { MaplibreMapInterface } from '../src/types.js';

interface MockMap extends MaplibreMapInterface {
  fire: (event: string) => void;
}

function createMockMap(): MockMap {
  const listeners = new Map<string, Set<() => void>>();

  return {
    getCenter: vi.fn(() => ({ lng: 0, lat: 0 })),
    getZoom: vi.fn(() => 10),
    getBearing: vi.fn(() => 0),
    getPitch: vi.fn(() => 0),
    jumpTo: vi.fn(),
    getContainer: vi.fn(() => document.createElement('div')),
    on: vi.fn((event: string, handler: () => void) => {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event)?.add(handler);
    }),
    off: vi.fn((event: string, handler: () => void) => {
      listeners.get(event)?.delete(handler);
    }),
    fire: (event: string) => {
      listeners.get(event)?.forEach((handler) => handler());
    },
  };
}

describe('syncMaps', () => {
  let mapA: MockMap;
  let mapB: MockMap;

  beforeEach(() => {
    mapA = createMockMap();
    mapB = createMockMap();
  });

  it('should register move listeners on both maps', () => {
    syncMaps(mapA, mapB);

    expect(mapA.on).toHaveBeenCalledWith('move', expect.any(Function));
    expect(mapB.on).toHaveBeenCalledWith('move', expect.any(Function));
  });

  it('should sync mapB to mapA position when mapA moves', () => {
    vi.mocked(mapA.getCenter).mockReturnValue({ lng: 10, lat: 20 });
    vi.mocked(mapA.getZoom).mockReturnValue(5);
    vi.mocked(mapA.getBearing).mockReturnValue(45);
    vi.mocked(mapA.getPitch).mockReturnValue(30);

    syncMaps(mapA, mapB);
    mapA.fire('move');

    expect(mapB.jumpTo).toHaveBeenCalledWith({
      center: { lng: 10, lat: 20 },
      zoom: 5,
      bearing: 45,
      pitch: 30,
    });
  });

  it('should sync mapA to mapB position when mapB moves', () => {
    vi.mocked(mapB.getCenter).mockReturnValue({ lng: -5, lat: 15 });
    vi.mocked(mapB.getZoom).mockReturnValue(8);
    vi.mocked(mapB.getBearing).mockReturnValue(90);
    vi.mocked(mapB.getPitch).mockReturnValue(60);

    syncMaps(mapA, mapB);
    mapB.fire('move');

    expect(mapA.jumpTo).toHaveBeenCalledWith({
      center: { lng: -5, lat: 15 },
      zoom: 8,
      bearing: 90,
      pitch: 60,
    });
  });

  it('should remove listeners when cleanup is called', () => {
    const cleanup = syncMaps(mapA, mapB);

    cleanup();

    expect(mapA.off).toHaveBeenCalledWith('move', expect.any(Function));
    expect(mapB.off).toHaveBeenCalledWith('move', expect.any(Function));
  });

  it('should not sync after cleanup is called', () => {
    const cleanup = syncMaps(mapA, mapB);
    cleanup();

    vi.mocked(mapA.jumpTo).mockClear();
    vi.mocked(mapB.jumpTo).mockClear();

    mapA.fire('move');
    mapB.fire('move');

    expect(mapA.jumpTo).not.toHaveBeenCalled();
    expect(mapB.jumpTo).not.toHaveBeenCalled();
  });
});
