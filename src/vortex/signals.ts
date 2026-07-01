/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  VORTEX SIGNALS — Reactive Primitive System                 ║
 * ║  Fine-grained reactivity with automatic dependency tracking ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

export type CleanupFn = () => void;
export type EffectFn = () => CleanupFn | void | Promise<void>;

interface ReactiveNode {
  version: number;
  subscribers: Set<ReactiveNode>;
  dependencies: Set<ReactiveNode>;
  update?: () => void;
  effect?: EffectFn;
  cleanup?: CleanupFn | void;
  stale: boolean;
}

let currentEffect: ReactiveNode | null = null;
const effectQueue: ReactiveNode[] = [];
let batchDepth = 0;
let pendingEffects = false;

function track(node: ReactiveNode) {
  if (currentEffect) {
    node.subscribers.add(currentEffect);
    currentEffect.dependencies.add(node);
  }
}

function notify(node: ReactiveNode) {
  node.version++;
  node.subscribers.forEach((sub) => {
    sub.stale = true;
    if (sub.update) {
      sub.update();
    }
  });
}

function runEffects() {
  if (pendingEffects) return;
  pendingEffects = true;
  queueMicrotask(flushEffects);
}

function flushEffects() {
  pendingEffects = false;
  const seen = new Set<ReactiveNode>();
  const queue = [...effectQueue];
  effectQueue.length = 0;

  for (const node of queue) {
    if (seen.has(node)) continue;
    seen.add(node);
    runNodeEffect(node);
  }
}

function runNodeEffect(node: ReactiveNode) {
  if (!node.effect) return;

  // Cleanup previous run
  if (node.cleanup) {
    if (typeof node.cleanup === 'function') {
      node.cleanup();
    }
  }

  currentEffect = node;
  node.dependencies.forEach((dep) => dep.subscribers.delete(node));
  node.dependencies.clear();
  node.stale = false;

  try {
    node.cleanup = node.effect() as CleanupFn | void;
  } finally {
    currentEffect = null;
  }
}

// ─── Signal ───────────────────────────────────────────────────

export interface Signal<T> {
  (): T;
  set: (value: T) => void;
  update: (fn: (prev: T) => T) => void;
  peek: () => T;
  subscribe: (fn: (value: T, prev: T) => void) => CleanupFn;
  readonly value: T;
}

export function createSignal<T>(initialValue: T): Signal<T> {
  const node: ReactiveNode = {
    version: 0,
    subscribers: new Set(),
    dependencies: new Set(),
    stale: false,
  };

  let value = initialValue;

  const read = (): T => {
    track(node);
    return value;
  };

  const set = (newValue: T) => {
    if (Object.is(value, newValue)) return;
    const prev = value;
    value = newValue;
    notify(node);
  };

  const update = (fn: (prev: T) => T) => {
    set(fn(value));
  };

  const peek = () => value;

  const subscribe = (fn: (value: T, prev: T) => void): CleanupFn => {
    let prev = value;
    const effectNode: ReactiveNode = {
      version: 0,
      subscribers: new Set(),
      dependencies: new Set(),
      stale: false,
      effect: () => {
        const current = read();
        if (!Object.is(current, prev)) {
          const p = prev;
          prev = current;
          fn(current, p);
        }
      },
    };
    runNodeEffect(effectNode);
    return () => {
      effectNode.dependencies.forEach((dep) => dep.subscribers.delete(effectNode));
      effectNode.dependencies.clear();
      if (effectNode.cleanup) {
        if (typeof effectNode.cleanup === 'function') {
          effectNode.cleanup();
        }
      }
    };
  };

  read.set = set;
  read.update = update;
  read.peek = peek;
  read.subscribe = subscribe;
  Object.defineProperty(read, 'value', {
    get: () => value,
    enumerable: true,
  });

  return read as Signal<T>;
}

// ─── Computed ─────────────────────────────────────────────────

export function createComputed<T>(fn: () => T): Signal<T> {
  const node: ReactiveNode = {
    version: 0,
    subscribers: new Set(),
    dependencies: new Set(),
    stale: true,
  };

  let value: T;
  let initialized = false;

  const read = (): T => {
    track(node);
    if (!initialized || node.stale) {
      currentEffect = node;
      node.dependencies.forEach((dep) => dep.subscribers.delete(node));
      node.dependencies.clear();
      try {
        value = fn();
        initialized = true;
        node.stale = false;
      } finally {
        currentEffect = null;
      }
    }
    return value!;
  };

  node.update = () => {
    const oldVersion = node.version;
    notify(node);
    // If version didn't change, value is the same
  };

  read.set = () => {
    throw new Error('Cannot set a computed signal');
  };
  read.update = () => {
    throw new Error('Cannot update a computed signal');
  };
  read.peek = () => value!;
  read.subscribe = (subFn: (value: T, prev: T) => void): CleanupFn => {
    return createEffect(() => {
      const v = read();
      subFn(v, v); // simplified
    });
  };
  Object.defineProperty(read, 'value', {
    get: () => read(),
    enumerable: true,
  });

  return read as unknown as Signal<T>;
}

// ─── Effect ───────────────────────────────────────────────────

export function createEffect(fn: EffectFn): CleanupFn {
  const node: ReactiveNode = {
    version: 0,
    subscribers: new Set(),
    dependencies: new Set(),
    stale: false,
    effect: fn,
  };

  effectQueue.push(node);
  runEffects();

  return () => {
    node.dependencies.forEach((dep) => dep.subscribers.delete(node));
    node.dependencies.clear();
    if (node.cleanup && typeof node.cleanup === 'function') {
      node.cleanup();
    }
  };
}

// ─── Batch ────────────────────────────────────────────────────

export function batch<T>(fn: () => T): T {
  batchDepth++;
  try {
    return fn();
  } finally {
    batchDepth--;
    if (batchDepth === 0) {
      runEffects();
    }
  }
}

// ─── Untracked ────────────────────────────────────────────────

export function untracked<T>(fn: () => T): T {
  const prev = currentEffect;
  currentEffect = null;
  try {
    return fn();
  } finally {
    currentEffect = prev;
  }
}
