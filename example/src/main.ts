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

const emojiIcon = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">' +
    '<foreignObject width="32" height="32">' +
    '<div xmlns="http://www.w3.org/1999/xhtml" style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:16px;">↔️</div>' +
    '</foreignObject>' +
    '</svg>',
)}")`;

const compare = new Compare(beforeMap, afterMap, '#comparison-container', {
  mousemove: false,
  orientation: 'vertical',
  theme: 'system',
  swiperIcon: emojiIcon,
  swiperStyle: {
    width: '32px',
    height: '32px',
  },
  lightColors: {
    swiperBackground: '#0072da',
    swiperBorder: '#d5d7de',
    lineBackground: '#d5d7de',
  },
  darkColors: {
    swiperBackground: '#0092fd',
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
