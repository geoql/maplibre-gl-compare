import * as maplibregl from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { Compare } from '@geoql/maplibre-gl-compare';
import type { CompareOptions, Orientation } from '@geoql/maplibre-gl-compare';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import './style.css';
import { initGa, track } from './analytics';
import { getColorMode, setColorMode, watchSystemColorMode } from './color-mode';

interface StyleOption {
  id: string;
  name: string;
  url: string;
}

const STYLES: StyleOption[] = [
  {
    id: 'carto-positron',
    name: 'Positron',
    url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  },
  {
    id: 'carto-dark-matter',
    name: 'Dark Matter',
    url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  },
  {
    id: 'carto-voyager',
    name: 'Voyager',
    url: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  },
  {
    id: 'ofm-liberty',
    name: 'Liberty',
    url: 'https://tiles.openfreemap.org/styles/liberty',
  },
  {
    id: 'ofm-bright',
    name: 'Bright',
    url: 'https://tiles.openfreemap.org/styles/bright',
  },
];

function element<T extends HTMLElement>(id: string, type: new () => T): T {
  const node = document.getElementById(id);
  if (!(node instanceof type)) throw new Error(`Missing #${id}`);
  return node;
}

function styleById(id: string): StyleOption {
  const style = STYLES.find((option) => option.id === id);
  if (!style) throw new Error(`Unknown style ${id}`);
  return style;
}

// maplibre-gl v6: bundlers must point the library at its worker file.
maplibregl.setWorkerUrl(workerUrl);

initGa();
watchSystemColorMode();

const panel = element('panel', HTMLDetailsElement);
panel.open = window.innerWidth >= 640;

const beforeSelect = element('before-style', HTMLSelectElement);
const afterSelect = element('after-style', HTMLSelectElement);
for (const select of [beforeSelect, afterSelect]) {
  for (const style of STYLES) {
    select.add(new Option(style.name, style.id));
  }
}
beforeSelect.value = 'carto-positron';
afterSelect.value = 'carto-dark-matter';

const zoom = window.innerWidth < 640 ? 0.6 : 1.8;
const view = { center: [10, 25] as [number, number], zoom };

const beforeMap = new maplibregl.Map({
  container: 'before',
  style: styleById(beforeSelect.value).url,
  ...view,
});

const afterMap = new maplibregl.Map({
  container: 'after',
  style: styleById(afterSelect.value).url,
  ...view,
});

// One control per map: the swiper clips each map, so whichever map owns the
// top-right corner (B when vertical, A when horizontal) shows its control.
for (const map of [beforeMap, afterMap]) {
  map.addControl(
    new maplibregl.NavigationControl({ visualizePitch: true }),
    'top-right',
  );
}

const positionOutput = element('position', HTMLOutputElement);
const mousemoveInput = element('mousemove', HTMLInputElement);
let orientation: Orientation = 'vertical';

function createCompare(): Compare {
  const options: CompareOptions = {
    orientation,
    mousemove: mousemoveInput.checked,
    theme: getColorMode(),
    lightColors: {
      swiperBackground: 'oklch(0.22 0.015 250)',
      swiperBorder: 'oklch(0.99 0.004 250)',
      lineBackground: 'oklch(0.99 0.004 250)',
    },
    darkColors: {
      swiperBackground: 'oklch(0.27 0.015 250)',
      swiperBorder: 'oklch(0.86 0.17 128)',
      lineBackground: 'oklch(0.86 0.17 128)',
    },
  };
  const instance = new Compare(beforeMap, afterMap, '#stage', options);
  instance.on('slideend', ({ currentPosition }) => {
    positionOutput.value = `${Math.round(currentPosition)}px`;
    track('demo_interaction', { action: 'slideend', orientation });
  });
  positionOutput.value = `${Math.round(instance.currentPosition)}px`;
  document.body.dataset['orientation'] = orientation;
  return instance;
}

let compare = createCompare();

function rebuild(): void {
  compare.remove();
  compare = createCompare();
}

function onStyleChange(
  select: HTMLSelectElement,
  map: maplibregl.Map,
  labelId: string,
  side: string,
): void {
  select.addEventListener('change', () => {
    const style = styleById(select.value);
    map.setStyle(style.url);
    element(labelId, HTMLSpanElement).textContent = style.name;
    track('demo_interaction', { action: 'style', side, style: style.id });
  });
}
onStyleChange(beforeSelect, beforeMap, 'before-name', 'a');
onStyleChange(afterSelect, afterMap, 'after-name', 'b');

for (const input of document.querySelectorAll<HTMLInputElement>(
  'input[name="orientation"]',
)) {
  input.addEventListener('change', () => {
    if (input.value !== 'vertical' && input.value !== 'horizontal') return;
    orientation = input.value;
    rebuild();
    track('demo_interaction', { action: 'orientation', value: orientation });
  });
}

mousemoveInput.addEventListener('change', () => {
  rebuild();
  track('demo_interaction', {
    action: 'mousemove',
    value: mousemoveInput.checked,
  });
});

const initialMode = getColorMode();
for (const input of document.querySelectorAll<HTMLInputElement>(
  'input[name="theme"]',
)) {
  input.checked = input.value === initialMode;
  input.addEventListener('change', () => {
    if (
      input.value !== 'light' &&
      input.value !== 'dark' &&
      input.value !== 'system'
    ) {
      return;
    }
    setColorMode(input.value);
    compare.setTheme(input.value);
    track('demo_interaction', { action: 'theme', value: input.value });
  });
}

const copyButton = element('copy-install', HTMLButtonElement);
const installCommand = element('install-command', HTMLElement);
copyButton.addEventListener('click', () => {
  const text = installCommand.textContent ?? '';
  navigator.clipboard.writeText(text).then(
    () => {
      copyButton.textContent = 'Copied';
      window.setTimeout(() => {
        copyButton.textContent = 'Copy';
      }, 1600);
    },
    () => {
      copyButton.textContent = 'Press ⌘C';
    },
  );
  track('install_copy', { manager: 'pnpm' });
});

for (const link of document.querySelectorAll<HTMLAnchorElement>(
  'a[data-outbound]',
)) {
  link.addEventListener('click', () => {
    track('outbound_click', { target: link.dataset['outbound'] ?? 'unknown' });
  });
}

// `toggle` also fires for the programmatic open above, so track the click.
element('panel-summary', HTMLElement).addEventListener('click', () => {
  track('demo_interaction', { action: 'panel', open: !panel.open });
});
