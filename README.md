# @geoql/maplibre-gl-compare

Swipe-style map comparison control for [MapLibre GL JS](https://maplibre.org/).

[![npm version](https://img.shields.io/npm/v/@geoql/maplibre-gl-compare.svg)](https://www.npmjs.com/package/@geoql/maplibre-gl-compare)
[![JSR](https://jsr.io/badges/@geoql/maplibre-gl-compare)](https://jsr.io/@geoql/maplibre-gl-compare)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**[Live demo](https://maplibre-gl-compare.geoql.in/?utm_source=github&utm_medium=readme&utm_campaign=maplibre-gl-compare)** · [npm](https://www.npmjs.com/package/@geoql/maplibre-gl-compare) · [JSR](https://jsr.io/@geoql/maplibre-gl-compare)

## Installation

```bash
# npm
npm install @geoql/maplibre-gl-compare

# pnpm
pnpm add @geoql/maplibre-gl-compare

# yarn
yarn add @geoql/maplibre-gl-compare
```

## Usage

```typescript
import * as maplibregl from 'maplibre-gl';
// maplibre-gl v6 + Vite: point the library at its worker file.
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { Compare } from '@geoql/maplibre-gl-compare';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@geoql/maplibre-gl-compare/style.css';

maplibregl.setWorkerUrl(workerUrl);

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
  theme?: Theme;
  lightColors?: Partial<ThemeColors>;
  darkColors?: Partial<ThemeColors>;
}
```

| Option        | Type                         | Default            | Description                                                              |
| ------------- | ---------------------------- | ------------------ | ------------------------------------------------------------------------ |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'`       | Orientation of the swiper                                                |
| `mousemove`   | `boolean`                    | `false`            | If `true`, swiper follows mouse movement                                 |
| `swiperIcon`  | `string`                     | Default arrows SVG | CSS `background-image` value for the swiper handle. Use `'none'` to hide |
| `swiperStyle` | `SwiperStyle`                | `undefined`        | Custom styles for the swiper handle                                      |
| `theme`       | `Theme`                      | `'system'`         | Theme mode: `'light'`, `'dark'`, or `'system'` (follows OS preference)   |
| `lightColors` | `Partial<ThemeColors>`       | `undefined`        | Custom colors for light theme                                            |
| `darkColors`  | `Partial<ThemeColors>`       | `undefined`        | Custom colors for dark theme                                             |

### Types

```typescript
type Theme = 'light' | 'dark' | 'system';

interface ThemeColors {
  swiperBackground: string;
  swiperBorder: string;
  lineBackground: string;
}

type SwiperStyle = Partial<{
  backgroundColor: string;
  width: string;
  height: string;
  padding: string;
  borderRadius: string;
  boxShadow: string;
  border: string;
  opacity: string;
}>;
```

### Methods

#### `setSlider(position: number): void`

Programmatically set the slider position in pixels.

#### `setTheme(theme: Theme): void`

Change the theme at runtime. Accepts `'light'`, `'dark'`, or `'system'`.

#### `on(type: 'slideend', listener: (data: SlideEndEventData) => void): this`

Subscribe to the `slideend` event, fired when the user stops dragging the slider.

#### `off(type: 'slideend', listener: (data: SlideEndEventData) => void): this`

Unsubscribe from the `slideend` event.

#### `remove(): void`

Remove the compare control and clean up event listeners.

### Properties

#### `currentPosition: number` (readonly)

The current slider position in pixels.

#### `theme: Theme` (readonly)

The current theme setting.

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

### Theme Support

```typescript
// Follow system preference (default)
const compare = new Compare(beforeMap, afterMap, '#container', {
  theme: 'system',
});

// Force dark theme
const compare = new Compare(beforeMap, afterMap, '#container', {
  theme: 'dark',
});

// Change theme at runtime
compare.setTheme('light');
```

### Custom Theme Colors

```typescript
const compare = new Compare(beforeMap, afterMap, '#container', {
  theme: 'system',
  lightColors: {
    swiperBackground: '#2563eb',
    swiperBorder: '#ffffff',
    lineBackground: '#e5e7eb',
  },
  darkColors: {
    swiperBackground: '#3b82f6',
    swiperBorder: '#1f2937',
    lineBackground: '#4b5563',
  },
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

### Custom Emoji Icon

Pass any emoji or text string directly to `swiperIcon`. Non-CSS values are rendered as centered text content inside the swiper handle.

```typescript
const compare = new Compare(beforeMap, afterMap, '#container', {
  swiperIcon: '↔️',
});
```

> **Note:** CSS values like `url(...)`, `none`, and gradients are applied as `background-image`. Everything else is rendered as text content with automatic centering.

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

// Default theme colors
export {
  DEFAULT_LIGHT_COLORS,
  DEFAULT_DARK_COLORS,
} from '@geoql/maplibre-gl-compare';

// Types
export type {
  CompareOptions,
  CompareEventType,
  CompareEventListener,
  SlideEndEventData,
  Container,
  Orientation,
  SwiperStyle,
  Theme,
  ThemeColors,
} from '@geoql/maplibre-gl-compare';
```

## Requirements

- MapLibre GL JS >= 2.0.0
- Node.js >= 24.0.0

## More from the author

- [maplibre-gl-inspect](https://maplibre-gl-inspect.geoql.in/?utm_source=github&utm_medium=readme&utm_campaign=maplibre-gl-compare) — inspect vector tile features and their properties
- [maplibre-gl-draw-circle](https://maplibre-gl-draw-circle.geoql.in/?utm_source=github&utm_medium=readme&utm_campaign=maplibre-gl-compare) — draw and edit circles on a MapLibre map
- [maplibre-gl-wind](https://maplibre-gl-wind.geoql.in/?utm_source=github&utm_medium=readme&utm_campaign=maplibre-gl-compare) — wind particle animation layer
- [maplibre-gl-interpolate-heatmap](https://maplibre-gl-interpolate-heatmap.geoql.in/?utm_source=github&utm_medium=readme&utm_campaign=maplibre-gl-compare) — IDW interpolated heatmap layer
- [v-maplibre](https://v-maplibre.geoql.in/?utm_source=github&utm_medium=readme&utm_campaign=maplibre-gl-compare) — 50+ Vue 3 components for MapLibre GL
- [mapcn-vue](https://mapcn-vue.geoql.in/?utm_source=github&utm_medium=readme&utm_campaign=maplibre-gl-compare) — shadcn-vue map components you copy into your app

See every project at [vinayakkulkarni.dev/projects](https://vinayakkulkarni.dev/projects?utm_source=github&utm_medium=readme&utm_campaign=maplibre-gl-compare) and [geoql.in](https://geoql.in/?utm_source=github&utm_medium=readme&utm_campaign=maplibre-gl-compare).

## License

[MIT](./LICENSE)
