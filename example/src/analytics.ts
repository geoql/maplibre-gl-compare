/**
 * Analytics for the demo: Plausible + OpenPanel (loaded in index.html) and
 * GA4 (loaded here). GA4 is skipped while GA_MEASUREMENT_ID is empty.
 */
export const GA_MEASUREMENT_ID: string = 'G-9S2V8MTN81';

type Props = Record<string, string | number | boolean>;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Props }) => void;
    op?: (method: string, ...args: unknown[]) => void;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function initGa(): void {
  if (!GA_MEASUREMENT_ID) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag() {
    // gtag.js reads the `arguments` object, not an array.
    window.dataLayer?.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID);
}

export function track(event: string, props: Props = {}): void {
  window.plausible?.(event, { props });
  window.op?.('track', event, props);
  if (GA_MEASUREMENT_ID) window.gtag?.('event', event, props);
}
