import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Compare } from '../src/compare.js';
import type { MaplibreMapInterface } from '../src/types.js';

interface MockMap extends MaplibreMapInterface {
  fire: (event: string) => void;
}

function createMockMap(containerEl: HTMLElement): MockMap {
  const listeners = new Map<string, Set<() => void>>();

  return {
    getCenter: vi.fn(() => ({ lng: 0, lat: 0 })),
    getZoom: vi.fn(() => 10),
    getBearing: vi.fn(() => 0),
    getPitch: vi.fn(() => 0),
    jumpTo: vi.fn(),
    getContainer: vi.fn(() => containerEl),
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

describe('Compare', () => {
  let container: HTMLDivElement;
  let mapAContainer: HTMLDivElement;
  let mapBContainer: HTMLDivElement;
  let mapA: MockMap;
  let mapB: MockMap;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'comparison-container';
    document.body.appendChild(container);

    mapAContainer = document.createElement('div');
    mapAContainer.id = 'map-a';
    mapAContainer.getBoundingClientRect = vi.fn(() => ({
      width: 800,
      height: 600,
      left: 0,
      top: 0,
      right: 800,
      bottom: 600,
      x: 0,
      y: 0,
      toJSON: vi.fn(),
    }));
    container.appendChild(mapAContainer);

    mapBContainer = document.createElement('div');
    mapBContainer.id = 'map-b';
    mapBContainer.getBoundingClientRect = vi.fn(() => ({
      width: 800,
      height: 600,
      left: 0,
      top: 0,
      right: 800,
      bottom: 600,
      x: 0,
      y: 0,
      toJSON: vi.fn(),
    }));
    container.appendChild(mapBContainer);

    mapA = createMockMap(mapAContainer);
    mapB = createMockMap(mapBContainer);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('constructor', () => {
    it('should create with CSS selector container', () => {
      const compare = new Compare(mapA, mapB, '#comparison-container');

      expect(container.querySelector('.maplibregl-compare')).toBeTruthy();
      expect(compare.currentPosition).toBe(400);

      compare.remove();
    });

    it('should create with HTMLElement container', () => {
      const compare = new Compare(mapA, mapB, container);

      expect(container.querySelector('.maplibregl-compare')).toBeTruthy();

      compare.remove();
    });

    it('should throw error for non-existent selector', () => {
      expect(() => new Compare(mapA, mapB, '#non-existent')).toThrow(
        'Cannot find element with specified container selector.',
      );
    });

    it('should throw error for invalid container type', () => {
      expect(() => new Compare(mapA, mapB, 123 as never)).toThrow(
        'Invalid container specified. Must be CSS selector or HTML element.',
      );
    });

    it('should throw error when selector points to non-HTMLElement', () => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.id = 'svg-element';
      document.body.appendChild(svg);

      expect(() => new Compare(mapA, mapB, '#svg-element')).toThrow(
        'Container selector must point to an HTMLElement.',
      );
    });

    it('should create vertical swiper by default', () => {
      const compare = new Compare(mapA, mapB, container);

      const swiper = container.querySelector('.compare-swiper-vertical');
      expect(swiper).toBeTruthy();

      compare.remove();
    });

    it('should create horizontal swiper when specified', () => {
      const compare = new Compare(mapA, mapB, container, {
        orientation: 'horizontal',
      });

      const swiper = container.querySelector('.compare-swiper-horizontal');
      expect(swiper).toBeTruthy();
      expect(
        container.querySelector('.maplibregl-compare-horizontal'),
      ).toBeTruthy();

      compare.remove();
    });

    it('should register mousemove listeners when mousemove option is true', () => {
      const addEventListenerA = vi.spyOn(mapAContainer, 'addEventListener');
      const addEventListenerB = vi.spyOn(mapBContainer, 'addEventListener');

      const compare = new Compare(mapA, mapB, container, { mousemove: true });

      expect(addEventListenerA).toHaveBeenCalledWith(
        'mousemove',
        expect.any(Function),
      );
      expect(addEventListenerB).toHaveBeenCalledWith(
        'mousemove',
        expect.any(Function),
      );

      compare.remove();
    });

    it('should set initial position to center', () => {
      const compare = new Compare(mapA, mapB, container);

      expect(compare.currentPosition).toBe(400);

      compare.remove();
    });
  });

  describe('setSlider', () => {
    it('should update slider position', () => {
      const compare = new Compare(mapA, mapB, container);

      compare.setSlider(200);

      expect(compare.currentPosition).toBe(200);
      // For vertical orientation, clipPath is `inset(0 ${width - position}px 0 0)` = `inset(0 600px 0 0)`
      expect(mapAContainer.style.clipPath).toBe('inset(0 600px 0 0)');

      compare.remove();
    });

    it('should clamp position to minimum 0', () => {
      const compare = new Compare(mapA, mapB, container);

      compare.setSlider(-100);

      expect(compare.currentPosition).toBe(0);

      compare.remove();
    });

    it('should clamp position to maximum bounds', () => {
      const compare = new Compare(mapA, mapB, container);

      compare.setSlider(1000);

      expect(compare.currentPosition).toBe(800);

      compare.remove();
    });
  });

  describe('events', () => {
    it('should register and fire slideend event', () => {
      const compare = new Compare(mapA, mapB, container);
      const listener = vi.fn();

      compare.on('slideend', listener);
      compare.fire('slideend', { currentPosition: 300 });

      expect(listener).toHaveBeenCalledWith({ currentPosition: 300 });

      compare.remove();
    });

    it('should allow chaining on()', () => {
      const compare = new Compare(mapA, mapB, container);
      const listener = vi.fn();

      const result = compare.on('slideend', listener);

      expect(result).toBe(compare);

      compare.remove();
    });

    it('should remove listener with off()', () => {
      const compare = new Compare(mapA, mapB, container);
      const listener = vi.fn();

      compare.on('slideend', listener);
      compare.off('slideend', listener);
      compare.fire('slideend', { currentPosition: 300 });

      expect(listener).not.toHaveBeenCalled();

      compare.remove();
    });

    it('should allow chaining off()', () => {
      const compare = new Compare(mapA, mapB, container);
      const listener = vi.fn();

      const result = compare.off('slideend', listener);

      expect(result).toBe(compare);

      compare.remove();
    });

    it('should allow chaining fire()', () => {
      const compare = new Compare(mapA, mapB, container);

      const result = compare.fire('slideend', { currentPosition: 300 });

      expect(result).toBe(compare);

      compare.remove();
    });

    it('should handle fire with no listeners', () => {
      const compare = new Compare(mapA, mapB, container);

      expect(() =>
        compare.fire('slideend', { currentPosition: 300 }),
      ).not.toThrow();

      compare.remove();
    });

    it('should handle off with non-existent listener', () => {
      const compare = new Compare(mapA, mapB, container);
      const listener = vi.fn();

      expect(() => compare.off('slideend', listener)).not.toThrow();

      compare.remove();
    });
  });

  describe('mouse interactions', () => {
    it('should handle mousedown and register document listeners', () => {
      const compare = new Compare(mapA, mapB, container);
      const addListener = vi.spyOn(document, 'addEventListener');

      const swiper = container.querySelector(
        '.compare-swiper-vertical',
      ) as HTMLElement;
      swiper.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

      expect(addListener).toHaveBeenCalledWith(
        'mousemove',
        expect.any(Function),
      );
      expect(addListener).toHaveBeenCalledWith('mouseup', expect.any(Function));

      compare.remove();
    });

    it('should handle mouseup and fire slideend', () => {
      const compare = new Compare(mapA, mapB, container);
      const listener = vi.fn();
      compare.on('slideend', listener);

      const swiper = container.querySelector(
        '.compare-swiper-vertical',
      ) as HTMLElement;
      swiper.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

      document.dispatchEvent(new MouseEvent('mouseup'));

      expect(listener).toHaveBeenCalledWith({
        currentPosition: expect.any(Number),
      });

      compare.remove();
    });

    it('should update position on mousemove during drag', () => {
      const compare = new Compare(mapA, mapB, container);

      const swiper = container.querySelector(
        '.compare-swiper-vertical',
      ) as HTMLElement;
      swiper.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

      document.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 300, clientY: 200 }),
      );

      expect(compare.currentPosition).toBe(300);

      compare.remove();
    });

    it('should set pointer events to none on mousemove when mousemove option is enabled', () => {
      const compare = new Compare(mapA, mapB, container, { mousemove: true });

      const swiper = container.querySelector(
        '.compare-swiper-vertical',
      ) as HTMLElement;
      swiper.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

      document.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 300, clientY: 200 }),
      );

      const controlContainer = container.querySelector(
        '.maplibregl-compare',
      ) as HTMLElement;
      expect(controlContainer.style.pointerEvents).toBe('none');

      compare.remove();
    });
  });

  describe('touch interactions', () => {
    it('should handle touchstart and register document listeners', () => {
      const compare = new Compare(mapA, mapB, container);
      const addListener = vi.spyOn(document, 'addEventListener');

      const swiper = container.querySelector(
        '.compare-swiper-vertical',
      ) as HTMLElement;
      swiper.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }));

      expect(addListener).toHaveBeenCalledWith(
        'touchmove',
        expect.any(Function),
      );
      expect(addListener).toHaveBeenCalledWith(
        'touchend',
        expect.any(Function),
      );

      compare.remove();
    });

    it('should handle touchend and fire slideend', () => {
      const compare = new Compare(mapA, mapB, container);
      const listener = vi.fn();
      compare.on('slideend', listener);

      const swiper = container.querySelector(
        '.compare-swiper-vertical',
      ) as HTMLElement;
      swiper.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }));

      document.dispatchEvent(new TouchEvent('touchend'));

      expect(listener).toHaveBeenCalledWith({
        currentPosition: expect.any(Number),
      });

      compare.remove();
    });

    it('should update position on touchmove', () => {
      const compare = new Compare(mapA, mapB, container);

      const swiper = container.querySelector(
        '.compare-swiper-vertical',
      ) as HTMLElement;
      swiper.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }));

      const touch = {
        clientX: 250,
        clientY: 150,
        identifier: 0,
        target: swiper,
      } as unknown as Touch;
      document.dispatchEvent(new TouchEvent('touchmove', { touches: [touch] }));

      expect(compare.currentPosition).toBe(250);

      compare.remove();
    });

    it('should set pointer events to auto on touchmove when mousemove option is enabled', () => {
      const compare = new Compare(mapA, mapB, container, { mousemove: true });

      const swiper = container.querySelector(
        '.compare-swiper-vertical',
      ) as HTMLElement;
      swiper.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }));

      const touch = {
        clientX: 250,
        clientY: 150,
        identifier: 0,
        target: swiper,
      } as unknown as Touch;
      document.dispatchEvent(new TouchEvent('touchmove', { touches: [touch] }));

      const controlContainer = container.querySelector(
        '.maplibregl-compare',
      ) as HTMLElement;
      expect(controlContainer.style.pointerEvents).toBe('auto');

      compare.remove();
    });
  });

  describe('horizontal orientation', () => {
    it('should use Y coordinate for horizontal slider', () => {
      const compare = new Compare(mapA, mapB, container, {
        orientation: 'horizontal',
      });

      const swiper = container.querySelector(
        '.compare-swiper-horizontal',
      ) as HTMLElement;
      swiper.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

      document.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 300, clientY: 200 }),
      );

      expect(compare.currentPosition).toBe(200);

      compare.remove();
    });

    it('should set initial position based on height for horizontal', () => {
      const compare = new Compare(mapA, mapB, container, {
        orientation: 'horizontal',
      });

      expect(compare.currentPosition).toBe(300);

      compare.remove();
    });
  });

  describe('resize handling', () => {
    it('should update bounds on resize', () => {
      const compare = new Compare(mapA, mapB, container);

      compare.setSlider(400);

      mapBContainer.getBoundingClientRect = vi.fn(() => ({
        width: 1000,
        height: 800,
        left: 0,
        top: 0,
        right: 1000,
        bottom: 800,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      }));

      mapB.fire('resize');

      expect(compare.currentPosition).toBe(400);

      compare.remove();
    });
  });

  describe('remove', () => {
    it('should remove control container from DOM', () => {
      const compare = new Compare(mapA, mapB, container);

      compare.remove();

      expect(container.querySelector('.maplibregl-compare')).toBeNull();
    });

    it('should clear clip styles on map containers', () => {
      const compare = new Compare(mapA, mapB, container);

      compare.remove();

      expect(mapAContainer.style.clipPath).toBe('');
      expect(mapBContainer.style.clipPath).toBe('');
    });

    it('should remove resize listener from mapB', () => {
      const compare = new Compare(mapA, mapB, container);

      compare.remove();

      expect(mapB.off).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    it('should remove mousemove listeners when mousemove option was enabled', () => {
      const removeListenerA = vi.spyOn(mapAContainer, 'removeEventListener');
      const removeListenerB = vi.spyOn(mapBContainer, 'removeEventListener');

      const compare = new Compare(mapA, mapB, container, { mousemove: true });

      compare.remove();

      expect(removeListenerA).toHaveBeenCalledWith(
        'mousemove',
        expect.any(Function),
      );
      expect(removeListenerB).toHaveBeenCalledWith(
        'mousemove',
        expect.any(Function),
      );
    });

    it('should clear all event listeners', () => {
      const compare = new Compare(mapA, mapB, container);
      const listener = vi.fn();
      compare.on('slideend', listener);

      compare.remove();

      compare.fire('slideend', { currentPosition: 100 });
      expect(listener).not.toHaveBeenCalled();
    });
  });
});
