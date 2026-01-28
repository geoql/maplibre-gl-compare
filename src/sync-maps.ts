import type { MaplibreMapInterface, SyncCleanup } from './types.js';

function moveToMapPosition(
  master: MaplibreMapInterface,
  clones: MaplibreMapInterface[],
): void {
  const center = master.getCenter();
  const zoom = master.getZoom();
  const bearing = master.getBearing();
  const pitch = master.getPitch();

  for (const clone of clones) {
    clone.jumpTo({
      center,
      zoom,
      bearing,
      pitch,
    });
  }
}

export function syncMaps(
  mapA: MaplibreMapInterface,
  mapB: MaplibreMapInterface,
): SyncCleanup {
  const maps: MaplibreMapInterface[] = [mapA, mapB];
  const moveHandlers: Array<() => void> = [];

  function on(): void {
    for (let i = 0; i < maps.length; i++) {
      const map = maps[i];
      const handler = moveHandlers[i];
      if (map && handler) {
        map.on('move', handler);
      }
    }
  }

  function off(): void {
    for (let i = 0; i < maps.length; i++) {
      const map = maps[i];
      const handler = moveHandlers[i];
      if (map && handler) {
        map.off('move', handler);
      }
    }
  }

  function createSyncHandler(
    master: MaplibreMapInterface,
    clones: MaplibreMapInterface[],
  ): () => void {
    return (): void => {
      off();
      moveToMapPosition(master, clones);
      on();
    };
  }

  for (let index = 0; index < maps.length; index++) {
    const master = maps[index];
    if (master) {
      const clones = maps.filter((_, i) => i !== index);
      moveHandlers[index] = createSyncHandler(master, clones);
    }
  }

  on();

  return (): void => {
    off();
    moveHandlers.length = 0;
    maps.length = 0;
  };
}
