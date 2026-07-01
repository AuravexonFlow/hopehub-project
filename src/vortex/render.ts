/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  VORTEX RENDERER — DOM Rendering Engine                     ║
 * ║  Efficient DOM diffing, event delegation, ref handling      ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { createEffect } from './signals';
import type { VNode } from './component';
import { Fragment } from './component';

type DOMNode = Node & { __vortex_cleanup?: (() => void)[] };

const eventMap: Record<string, string> = {
  onClick: 'click',
  onInput: 'input',
  onChange: 'change',
  onSubmit: 'submit',
  onKeydown: 'keydown',
  onKeyup: 'keyup',
  onMouseenter: 'mouseenter',
  onMouseleave: 'mouseleave',
  onFocus: 'focus',
  onBlur: 'blur',
  onScroll: 'scroll',
  onTouchstart: 'touchstart',
  onTouchend: 'touchend',
};

function applyAttributes(el: HTMLElement, props: Record<string, any>) {
  for (const [key, value] of Object.entries(props)) {
    if (key === 'key' || key === 'ref' || key === 'children') continue;

    if (key === 'className' || key === 'class') {
      if (typeof value === 'object') {
        el.className = Object.entries(value)
          .filter(([, v]) => v)
          .map(([k]) => k)
          .join(' ');
      } else {
        el.className = value ?? '';
      }
    } else if (key === 'style') {
      if (typeof value === 'object') {
        Object.assign(el.style, value);
      } else {
        el.setAttribute('style', value);
      }
    } else if (key === 'dangerouslySetInnerHTML') {
      el.innerHTML = value.__html || '';
    } else if (key.startsWith('on') && eventMap[key]) {
      const eventName = eventMap[key];
      el.addEventListener(eventName.toLowerCase(), value);
    } else if (key === 'dataset') {
      for (const [dk, dv] of Object.entries(value)) {
        el.dataset[dk] = String(dv);
      }
    } else if (key === 'checked' || key === 'disabled' || key === 'readOnly' || key === 'value') {
      (el as any)[key] = value;
    } else if (typeof value === 'boolean') {
      if (value) el.setAttribute(key, '');
      else el.removeAttribute(key);
    } else {
      el.setAttribute(key, String(value));
    }
  }
}

function createDOMNode(vnode: VNode | string | number | boolean | null | undefined): Node {
  if (vnode == null || vnode === false || vnode === true) {
    return document.createTextNode('');
  }

  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return document.createTextNode(String(vnode));
  }

  if (!vnode.__vortex_node) {
    return document.createTextNode(String(vnode));
  }

  // Fragment
  if (vnode.type === Fragment) {
    const frag = document.createDocumentFragment();
    for (const child of vnode.children) {
      frag.appendChild(createDOMNode(child));
    }
    return frag;
  }

  // Component
  if (typeof vnode.type === 'function' && (vnode.type as any).__vortex_type === 'component') {
    const result = (vnode.type as Function)(vnode.props);
    return createDOMNode(result);
  }

  // HTML Element
  if (typeof vnode.type === 'string') {
    const el = document.createElement(vnode.type);
    applyAttributes(el, vnode.props);

    // Ref
    if (vnode.props.ref) {
      if (typeof vnode.props.ref === 'function') {
        vnode.props.ref(el);
      } else if (vnode.props.ref && typeof vnode.props.ref === 'object') {
        (vnode.props.ref as any).current = el;
      }
    }

    // Children
    const children = vnode.props.children ?? vnode.children;
    if (children) {
      const childArray = Array.isArray(children) ? children : [children];
      for (const child of childArray) {
        if (child != null && child !== false) {
          el.appendChild(createDOMNode(child));
        }
      }
    }

    return el;
  }

  return document.createTextNode('');
}

// ─── Public API ───────────────────────────────────────────────

export function render(vnode: VNode, container: HTMLElement | string): () => void {
  const target = typeof container === 'string' ? document.querySelector(container) : container;
  if (!target) throw new Error(`VORTEX: Mount target not found: ${container}`);

  target.innerHTML = '';

  const cleanupFns: (() => void)[] = [];

  const dispose = createEffect(() => {
    target.innerHTML = '';
    const node = createDOMNode(vnode);
    target.appendChild(node);
  });

  cleanupFns.push(dispose);

  return () => {
    cleanupFns.forEach((fn) => fn());
    target.innerHTML = '';
  };
}

export function html(
  strings: TemplateStringsArray,
  ...values: any[]
): VNode {
  // Tagged template for inline HTML-like syntax
  let htmlStr = '';
  for (let i = 0; i < strings.length; i++) {
    htmlStr += strings[i];
    if (i < values.length) {
      htmlStr += String(values[i]);
    }
  }

  return {
    type: 'div',
    props: { dangerouslySetInnerHTML: { __html: htmlStr } },
    children: [],
    __vortex_node: true,
  };
}

export function portal(vnode: VNode, target: string): void {
  const container = document.querySelector(target);
  if (container) {
    const node = createDOMNode(vnode);
    container.appendChild(node);
  }
}
