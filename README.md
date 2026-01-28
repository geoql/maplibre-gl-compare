# @geoql/maplibre-gl-compare

Swipe-style map comparison control for [MapLibre GL JS](https://maplibre.org/).

[![npm version](https://img.shields.io/npm/v/@geoql/maplibre-gl-compare.svg)](https://www.npmjs.com/package/@geoql/maplibre-gl-compare)
[![JSR](https://jsr.io/badges/@geoql/maplibre-gl-compare)](https://jsr.io/@geoql/maplibre-gl-compare)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
# npm
npm install @geoql/maplibre-gl-compare

# pnpm
pnpm add @geoql/maplibre-gl-compare

# yarn
yarn add @geoql/maplibre-gl-compare

# bun
bun add @geoql/maplibre-gl-compare
```

## Usage

```typescript
import maplibregl from 'maplibre-gl';
import { Compare } from '@geoql/maplibre-gl-compare';
import '@geoql/maplibre-gl-compare/style.css';

const beforeMap = new maplibregl.Map({
  container: 'before',
  style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  center: [0, 0],
  zoom: 2,
});

const afterMap = new maplibregl.Map({
  container: 'after',
  style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  center: [0, 0],
  zoom: 2,
});

const compare = new Compare(beforeMap, afterMap, '#comparison-container');
```

## API

### Constructor

```typescript
new Compare(mapA, mapB, container, options?)
```

| Parameter   | Type                    | Description                                               |
| ----------- | ----------------------- | --------------------------------------------------------- |
| `mapA`      | `Map`                   | The first MapLibre GL map instance (left/top)             |
| `mapB`      | `Map`                   | The second MapLibre GL map instance (right/bottom)        |
| `container` | `string \| HTMLElement` | CSS selector or HTML element for the comparison container |
| `options`   | `CompareOptions`        | Optional configuration object                             |

### Options

```typescript
interface CompareOptions {
  orientation?: 'vertical' | 'horizontal';
  mousemove?: boolean;
  swiperIcon?: string;
  swiperStyle?: SwiperStyle;
}
```

| Option        | Type                         | Default            | Description                                                              |
| ------------- | ---------------------------- | ------------------ | ------------------------------------------------------------------------ |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'`       | Orientation of the swiper                                                |
| `mousemove`   | `boolean`                    | `false`            | If `true`, swiper follows mouse movement                                 |
| `swiperIcon`  | `string`                     | Default arrows SVG | CSS `background-image` value for the swiper handle. Use `'none'` to hide |
| `swiperStyle` | `SwiperStyle`                | `undefined`        | Custom styles for the swiper handle                                      |

### SwiperStyle

```typescript
type SwiperStyle = Partial<{
  backgroundColor: string;
  width: string;
  height: string;
  borderRadius: string;
  boxShadow: string;
  border: string;
  opacity: string;
}>;
```

### Methods

#### `setSlider(position: number): void`

Programmatically set the slider position in pixels.

#### `on(type: 'slideend', listener: (data: SlideEndEventData) => void): this`

Subscribe to the `slideend` event, fired when the user stops dragging the slider.

#### `off(type: 'slideend', listener: (data: SlideEndEventData) => void): this`

Unsubscribe from the `slideend` event.

#### `remove(): void`

Remove the compare control and clean up event listeners.

### Properties

#### `currentPosition: number` (readonly)

The current slider position in pixels.

## Examples

### Basic Usage

```typescript
const compare = new Compare(beforeMap, afterMap, '#container');
```

### Horizontal Orientation

```typescript
const compare = new Compare(beforeMap, afterMap, '#container', {
  orientation: 'horizontal',
});
```

### Mouse Follow Mode

```typescript
const compare = new Compare(beforeMap, afterMap, '#container', {
  mousemove: true,
});
```

### Custom Swiper Style

```typescript
const compare = new Compare(beforeMap, afterMap, '#container', {
  swiperIcon: 'none',
  swiperStyle: {
    backgroundColor: '#18181b',
    boxShadow: '0 0 0 2px rgba(255,255,255,0.15), 0 8px 24px rgba(0,0,0,0.5)',
    width: '40px',
    height: '40px',
  },
});
```

### Listen to Slide Events

```typescript
const compare = new Compare(beforeMap, afterMap, '#container');

compare.on('slideend', (e) => {
  console.log('Slider position:', e.currentPosition);
});
```

## Exports

```typescript
// Main class
export { Compare } from '@geoql/maplibre-gl-compare';

// Utility function to sync two maps
export { syncMaps } from '@geoql/maplibre-gl-compare';

// Default swiper icon (base64 SVG)
export { DEFAULT_SWIPER_ICON } from '@geoql/maplibre-gl-compare';

// Types
export type {
  CompareOptions,
  CompareEventType,
  CompareEventListener,
  SlideEndEventData,
  Container,
  Orientation,
  SwiperStyle,
} from '@geoql/maplibre-gl-compare';
```

## Requirements

- MapLibre GL JS >= 2.0.0
- Node.js >= 24.0.0

## License

[MIT](./LICENSE)
