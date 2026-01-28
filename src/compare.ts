import type {
  MaplibreMapInterface,
  CompareOptions,
  CompareEventType,
  CompareEventListener,
  SlideEndEventData,
  Container,
  SyncCleanup,
} from './types.js';
import { syncMaps } from './sync-maps.js';
import { DEFAULT_SWIPER_ICON } from './swiper-icon.js';

export class Compare {
  private readonly mapA: MaplibreMapInterface;
  private readonly mapB: MaplibreMapInterface;
  private readonly options: CompareOptions;
  private readonly horizontal: boolean;
  private readonly swiper: HTMLDivElement;
  private readonly controlContainer: HTMLDivElement;
  private readonly clearSync: SyncCleanup;
  private readonly listeners: Map<CompareEventType, Set<CompareEventListener>>;

  private bounds: DOMRect;
  private _currentPosition: number;

  constructor(
    mapA: MaplibreMapInterface,
    mapB: MaplibreMapInterface,
    container: Container,
    options: CompareOptions = {},
  ) {
    this.options = options;
    this.mapA = mapA;
    this.mapB = mapB;
    this.horizontal = this.options.orientation === 'horizontal';
    this.listeners = new Map();
    this._currentPosition = 0;

    this.swiper = document.createElement('div');
    this.swiper.className = this.horizontal
      ? 'compare-swiper-horizontal'
      : 'compare-swiper-vertical';
    this.swiper.style.backgroundImage =
      this.options.swiperIcon ?? DEFAULT_SWIPER_ICON;
    if (this.options.swiperStyle) {
      Object.assign(this.swiper.style, this.options.swiperStyle);
    }

    this.controlContainer = document.createElement('div');
    this.controlContainer.className = this.horizontal
      ? 'maplibregl-compare maplibregl-compare-horizontal'
      : 'maplibregl-compare';
    this.controlContainer.appendChild(this.swiper);

    const appendTarget = this.resolveContainer(container);
    appendTarget.appendChild(this.controlContainer);

    this.bounds = mapB.getContainer().getBoundingClientRect();
    const initialPosition =
      (this.horizontal ? this.bounds.height : this.bounds.width) / 2;
    this.setPosition(initialPosition);

    this.clearSync = syncMaps(mapA, mapB);

    mapB.on('resize', this.handleResize);

    if (this.options.mousemove) {
      mapA.getContainer().addEventListener('mousemove', this.handleMove);
      mapB.getContainer().addEventListener('mousemove', this.handleMove);
    }

    this.swiper.addEventListener('mousedown', this.handleDown);
    this.swiper.addEventListener('touchstart', this.handleDown);
  }

  get currentPosition(): number {
    return this._currentPosition;
  }

  setSlider(x: number): void {
    this.setPosition(x);
  }

  on(type: CompareEventType, listener: CompareEventListener): this {
    let typeListeners = this.listeners.get(type);
    if (!typeListeners) {
      typeListeners = new Set();
      this.listeners.set(type, typeListeners);
    }
    typeListeners.add(listener);
    return this;
  }

  off(type: CompareEventType, listener: CompareEventListener): this {
    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      typeListeners.delete(listener);
    }
    return this;
  }

  fire(type: CompareEventType, data: SlideEndEventData): this {
    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      for (const listener of typeListeners) {
        listener(data);
      }
    }
    return this;
  }

  remove(): void {
    this.clearSync();
    this.mapB.off('resize', this.handleResize);

    const aContainer = this.mapA.getContainer();
    if (aContainer) {
      aContainer.style.clipPath = '';
      aContainer.removeEventListener('mousemove', this.handleMove);
    }

    const bContainer = this.mapB.getContainer();
    if (bContainer) {
      bContainer.style.clipPath = '';
      bContainer.removeEventListener('mousemove', this.handleMove);
    }

    this.swiper.removeEventListener('mousedown', this.handleDown);
    this.swiper.removeEventListener('touchstart', this.handleDown);
    this.controlContainer.remove();
    this.listeners.clear();
  }

  private resolveContainer(container: Container): HTMLElement {
    if (typeof container === 'string') {
      const element = document.querySelector(container);
      if (!element) {
        throw new Error(
          'Cannot find element with specified container selector.',
        );
      }
      if (!(element instanceof HTMLElement)) {
        throw new Error('Container selector must point to an HTMLElement.');
      }
      return element;
    }

    if (container instanceof HTMLElement) {
      return container;
    }

    throw new Error(
      'Invalid container specified. Must be CSS selector or HTML element.',
    );
  }

  private setPointerEvents(value: string): void {
    this.controlContainer.style.pointerEvents = value;
    this.swiper.style.pointerEvents = value;
  }

  private setPosition(x: number): void {
    const maxPosition = this.horizontal
      ? this.bounds.height
      : this.bounds.width;
    const position = Math.min(Math.max(0, x), maxPosition);

    const transform = this.horizontal
      ? `translate(0, ${position}px)`
      : `translate(${position}px, 0)`;

    this.controlContainer.style.transform = transform;

    const clipPathA = this.horizontal
      ? `inset(0 0 ${this.bounds.height - position}px 0)`
      : `inset(0 ${this.bounds.width - position}px 0 0)`;

    const clipPathB = this.horizontal
      ? `inset(${position}px 0 0 0)`
      : `inset(0 0 0 ${position}px)`;

    this.mapA.getContainer().style.clipPath = clipPathA;
    this.mapB.getContainer().style.clipPath = clipPathB;
    this._currentPosition = position;
  }

  private getX(e: MouseEvent | TouchEvent): number {
    const event =
      'touches' in e && e.touches[0] ? e.touches[0] : (e as MouseEvent);
    let x = event.clientX - this.bounds.left;
    x = Math.max(0, Math.min(x, this.bounds.width));
    return x;
  }

  private getY(e: MouseEvent | TouchEvent): number {
    const event =
      'touches' in e && e.touches[0] ? e.touches[0] : (e as MouseEvent);
    let y = event.clientY - this.bounds.top;
    y = Math.max(0, Math.min(y, this.bounds.height));
    return y;
  }

  private handleResize = (): void => {
    this.bounds = this.mapB.getContainer().getBoundingClientRect();
    if (this._currentPosition) {
      this.setPosition(this._currentPosition);
    }
  };

  private handleDown = (e: MouseEvent | TouchEvent): void => {
    e.preventDefault();
    if ('touches' in e) {
      document.addEventListener('touchmove', this.handleMove);
      document.addEventListener('touchend', this.handleTouchEnd);
    } else {
      document.addEventListener('mousemove', this.handleMove);
      document.addEventListener('mouseup', this.handleMouseUp);
    }
  };

  private handleMove = (e: MouseEvent | TouchEvent): void => {
    if (this.options.mousemove) {
      this.setPointerEvents('touches' in e ? 'auto' : 'none');
    }

    const position = this.horizontal ? this.getY(e) : this.getX(e);
    this.setPosition(position);
  };

  private handleMouseUp = (): void => {
    document.removeEventListener('mousemove', this.handleMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    this.fire('slideend', { currentPosition: this._currentPosition });
  };

  private handleTouchEnd = (): void => {
    document.removeEventListener('touchmove', this.handleMove);
    document.removeEventListener('touchend', this.handleTouchEnd);
    this.fire('slideend', { currentPosition: this._currentPosition });
  };
}
