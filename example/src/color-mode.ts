import type { Theme } from '@geoql/maplibre-gl-compare';

const STORAGE_KEY = 'maplibre-gl-compare-color-mode';
const query = window.matchMedia('(prefers-color-scheme: dark)');

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function getColorMode(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isTheme(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

function apply(mode: Theme): void {
  const dark = mode === 'dark' || (mode === 'system' && query.matches);
  document.documentElement.classList.toggle('dark', dark);
}

export function setColorMode(mode: Theme): void {
  try {
    if (mode === 'system') localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Storage can be blocked; the mode still applies for this page view.
  }
  apply(mode);
}

/** Re-applies `system` mode when the OS preference changes. */
export function watchSystemColorMode(): void {
  query.addEventListener('change', () => {
    if (getColorMode() === 'system') apply('system');
  });
}
