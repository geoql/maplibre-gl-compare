export type Orientation = 'vertical' | 'horizontal';

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeColors {
  /** Swiper handle background color */
  swiperBackground: string;
  /** Swiper handle border/shadow color */
  swiperBorder: string;
  /** Divider line color */
  lineBackground: string;
}

export type SwiperStyle = Partial<
  Pick<
    CSSStyleDeclaration,
    | 'backgroundColor'
    | 'width'
    | 'height'
    | 'borderRadius'
    | 'boxShadow'
    | 'border'
    | 'opacity'
  >
>;

export interface CompareOptions {
  orientation?: Orientation;
  mousemove?: boolean;
  swiperIcon?: string;
  swiperStyle?: SwiperStyle;
  theme?: Theme;
  lightColors?: Partial<ThemeColors>;
  darkColors?: Partial<ThemeColors>;
}

export interface SlideEndEventData {
  currentPosition: number;
}

export type CompareEventType = 'slideend';

export type CompareEventListener = (data: SlideEndEventData) => void;

export type Container = string | HTMLElement;

export type SyncCleanup = () => void;

export interface LngLat {
  lng: number;
  lat: number;
}

export interface MaplibreMapInterface {
  getCenter(): LngLat;
  getZoom(): number;
  getBearing(): number;
  getPitch(): number;
  jumpTo(options: {
    center: LngLat;
    zoom: number;
    bearing: number;
    pitch: number;
  }): void;
  getContainer(): HTMLElement;
  on(type: string, handler: () => void): void;
  off(type: string, handler: () => void): void;
}
