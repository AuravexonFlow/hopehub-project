/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  VORTEX STORE — Global Reactive State Management            ║
 * ║  Immer-like updates, middleware, persistence, devtools       ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { createSignal, batch, type Signal } from './signals';

export type StoreAction<T> = (state: T, ...args: any[]) => Partial<T> | void;

export interface StoreDef<T extends Record<string, any>> {
  state: T;
  actions?: Record<string, StoreAction<T>>;
  persist?: string; // localStorage key
}

export interface Store<T extends Record<string, any>> {
  get: Signal<T>;
  set: (partial: Partial<T>) => void;
  reset: () => void;
  actions: Record<string, (...args: any[]) => void>;
  subscribe: (fn: (state: T) => void) => () => void;
}

const stores = new Map<string, Store<any>>();

export function createStore<T extends Record<string, any>>(
  name: string,
  def: StoreDef<T>
): Store<T> {
  // Hydrate from persistence
  let initial = { ...def.state };
  if (def.persist) {
    try {
      const saved = localStorage.getItem(def.persist);
      if (saved) {
        initial = { ...initial, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
  }

  const state = createSignal<T>(initial);

  // Persist on change
  if (def.persist) {
    state.subscribe((value) => {
      try {
        localStorage.setItem(def.persist!, JSON.stringify(value));
      } catch {
        // ignore
      }
    });
  }

  const set = (partial: Partial<T>) => {
    batch(() => {
      const current = state.peek();
      state.set({ ...current, ...partial });
    });
  };

  const reset = () => {
    state.set({ ...def.state });
  };

  const actions: Record<string, (...args: any[]) => void> = {};
  if (def.actions) {
    for (const [name, action] of Object.entries(def.actions)) {
      actions[name] = (...args: any[]) => {
        batch(() => {
          const current = state.peek();
          const result = action(current, ...args);
          if (result) {
            state.set({ ...current, ...result });
          }
        });
      };
    }
  }

  const subscribe = (fn: (state: T) => void) => {
    return state.subscribe(fn);
  };

  const store: Store<T> = { get: state, set, reset, actions, subscribe };
  stores.set(name, store);
  return store;
}

export function getStore<T extends Record<string, any>>(name: string): Store<T> | undefined {
  return stores.get(name);
}

export function getAllStores(): Map<string, Store<any>> {
  return new Map(stores);
}
