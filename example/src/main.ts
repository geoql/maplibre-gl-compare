import maplibregl from 'maplibre-gl';
import { Compare } from '@geoql/maplibre-gl-compare';
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
  swiperIcon: 'none',
  swiperStyle: {
    backgroundColor: '#18181b',
    boxShadow: '0 0 0 2px rgba(255,255,255,0.15), 0 8px 24px rgba(0,0,0,0.5)',
    width: '40px',
    height: '40px',
  },
});

compare.on('slideend', (e) => {
  console.log('Slider position:', e.currentPosition);
});
