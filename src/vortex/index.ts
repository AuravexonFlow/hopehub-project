/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                    ██╗   ██╗ ██████╗ ██████╗ ████████╗       ║
 * ║                    ██║   ██║██╔═══██╗██╔══██╗╚══██╔══╝       ║
 * ║                    ██║   ██║██║   ██║██████╔╝   ██║          ║
 * ║                    ╚██╗ ██╔╝██║   ██║██╔══██╗   ██║          ║
 * ║                     ╚████╔╝ ╚██████╔╝██║  ██║   ██║          ║
 * ║                      ╚═══╝   ╚═════╝ ╚═╝  ╚═╝   ╚═╝          ║
 * ║                                                                ║
 * ║  VORTEX Framework v1.0.0                                      ║
 * ║  Next-generation signal-based reactive UI framework           ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

// Core reactivity
export {
  createSignal,
  createComputed,
  createEffect,
  batch,
  untracked,
} from './signals';
export type { Signal, CleanupFn, EffectFn } from './signals';

// Component system
export {
  h,
  Fragment,
  defineComponent,
  registerComponent,
  getComponent,
  onMount,
  onUnmount,
  onUpdate,
  memo,
} from './component';
export type { VNode, VortexComponent, PropsWithChildren } from './component';

// Router
export {
  createRouter,
  useRouter,
  VortexRouter,
} from './router';
export type { RouteConfig } from './router';

// State management
export {
  createStore,
  getStore,
  getAllStores,
} from './store';
export type { Store, StoreDef, StoreAction } from './store';

// Renderer
export { render, html, portal } from './render';

// Version
export const VERSION = '1.0.0';
