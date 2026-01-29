import maplibregl from 'maplibre-gl';
import { Compare } from '@geoql/maplibre-gl-compare';
import type { Theme } from '@geoql/maplibre-gl-compare';
import './style.css';

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

beforeMap.on('load', () => {
  beforeMap.addControl(
    new maplibregl.NavigationControl({ visualizePitch: true }),
    'top-left',
  );
});

afterMap.on('load', () => {
  afterMap.addControl(
    new maplibregl.NavigationControl({ visualizePitch: true }),
    'top-right',
  );
});

const compare = new Compare(beforeMap, afterMap, '#comparison-container', {
  mousemove: false,
  orientation: 'vertical',
  theme: 'system',
  swiperIcon: '↔️',
  swiperStyle: {
    width: '32px',
    height: '32px',
    padding: '12px',
  },
  lightColors: {
    swiperBackground:
      'radial-gradient(circle,rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 35%, rgba(0, 212, 255, 1) 100%)',
    swiperBorder: '#ffffff',
    lineBackground: '#ffffff',
  },
  darkColors: {
    swiperBackground: 'radial-gradient(circle, #1a1a2e 0%, #050609 100%)',
    swiperBorder: '#27292e',
    lineBackground: '#27292e',
  },
});

compare.on('slideend', (e) => {
  console.log('Slider position:', e.currentPosition);
});

const themeSelect = document.getElementById(
  'theme-select',
) as HTMLSelectElement;
themeSelect.addEventListener('change', () => {
  const theme = themeSelect.value as Theme;
  compare.setTheme(theme);
  console.log('Theme changed to:', theme);
});
