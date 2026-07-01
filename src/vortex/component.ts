/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  VORTEX COMPONENT — Declarative Component System            ║
 * ║  Lifecycle hooks, props, slots, and reactive rendering      ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { createSignal, createEffect, type Signal, type CleanupFn } from './signals';

export interface VortexComponent<P = any> {
  (props: P): VNode;
  __vortex_type: 'component';
}

export interface VNode {
  type: string | VortexComponent | ((...args: any[]) => VNode) | typeof Fragment;
  props: Record<string, any>;
  children: (VNode | string | number | boolean | null | undefined)[];
  key?: string | number;
  __vortex_node: true;
}

export const Fragment: unique symbol = Symbol('VORTEX_FRAGMENT');

export function h(
  type: string | VortexComponent | ((...args: any[]) => VNode) | typeof Fragment,
  props: Record<string, any> | null,
  ...children: any[]
): VNode {
  const flatChildren = flattenChildren(children);
  return {
    type,
    props: props || {},
    children: flatChildren,
    key: props?.key,
    __vortex_node: true,
  };
}

function flattenChildren(children: any[]): any[] {
  const result: any[] = [];
  for (const child of children) {
    if (Array.isArray(child)) {
      result.push(...flattenChildren(child));
    } else if (child != null && child !== false && child !== true) {
      result.push(child);
    }
  }
  return result;
}

// ─── Component Registry ───────────────────────────────────────

const componentRegistry = new Map<string, VortexComponent>();

export function registerComponent(name: string, component: VortexComponent) {
  componentRegistry.set(name, component);
}

export function getComponent(name: string): VortexComponent | undefined {
  return componentRegistry.get(name);
}

// ─── Lifecycle ────────────────────────────────────────────────

type LifecycleHook = () => void | CleanupFn;

const onMountHooks = new WeakMap<object, LifecycleHook[]>();
const onUnmountHooks = new WeakMap<object, LifecycleHook[]>();
const onUpdateHooks = new WeakMap<object, (() => void)[]>();

let currentComponentContext: object | null = null;

export function onMount(fn: LifecycleHook) {
  if (currentComponentContext) {
    const hooks = onMountHooks.get(currentComponentContext) || [];
    hooks.push(fn);
    onMountHooks.set(currentComponentContext, hooks);
  }
}

export function onUnmount(fn: () => void) {
  if (currentComponentContext) {
    const hooks = onUnmountHooks.get(currentComponentContext) || [];
    hooks.push(fn);
    onUnmountHooks.set(currentComponentContext, hooks);
  }
}

export function onUpdate(fn: () => void) {
  if (currentComponentContext) {
    const hooks = onUpdateHooks.get(currentComponentContext) || [];
    hooks.push(fn);
    onUpdateHooks.set(currentComponentContext, hooks);
  }
}

export function getCurrentContext(): object | null {
  return currentComponentContext;
}

export function setCurrentContext(ctx: object | null) {
  currentComponentContext = ctx;
}

// ─── Props & Children Helpers ─────────────────────────────────

export type PropsWithChildren<P = {}> = P & { children?: any };

export function defineComponent<P = {}>(
  name: string,
  render: (props: PropsWithChildren<P>) => VNode
): VortexComponent<P> {
  const component = ((props: P) => {
    const ctx = {};
    currentComponentContext = ctx;
    try {
      return render(props as PropsWithChildren<P>);
    } finally {
      currentComponentContext = null;
    }
  }) as VortexComponent<P>;

  component.__vortex_type = 'component';
  (component as any).__name = name;
  registerComponent(name, component);
  return component;
}

// ─── Memoization ──────────────────────────────────────────────

export function memo<T>(fn: () => T, deps?: () => any[]): Signal<T> {
  const value = createSignal<T>(undefined as any);
  createEffect(() => {
    if (deps) deps(); // track deps
    value.set(fn());
  });
  return value as Signal<T>;
}
