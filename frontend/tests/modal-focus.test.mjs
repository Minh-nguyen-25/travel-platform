import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';

test('an open modal keeps the active input focused when its parent rerenders', () => {
  const source = readFileSync(new URL('../src/components/common/Modal.tsx', import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;

  const slots = [];
  const pendingEffects = [];
  const frameCallbacks = new Map();
  const listeners = new Map();
  let hookIndex = 0;
  let nextFrameId = 0;

  const document = {
    activeElement: null,
    body: { style: { overflow: '' } },
    addEventListener: (name, listener) => listeners.set(name, listener),
    removeEventListener: (name, listener) => {
      if (listeners.get(name) === listener) listeners.delete(name);
    },
  };
  class Element {
    constructor(name) { this.name = name; }
    focus() { document.activeElement = this; }
  }
  const opener = new Element('opener');
  const closeButton = new Element('close button');
  const input = new Element('input');
  document.activeElement = opener;

  const sameDeps = (a, b) => a && b && a.length === b.length && a.every((value, index) => Object.is(value, b[index]));
  const react = {
    useId: () => slots[hookIndex++] ?? 'modal-title',
    useRef: (initial) => {
      const index = hookIndex++;
      return slots[index] ??= { current: initial };
    },
    useCallback: (callback, deps) => {
      const index = hookIndex++;
      const old = slots[index];
      if (old && sameDeps(old.deps, deps)) return old.callback;
      slots[index] = { callback, deps };
      return callback;
    },
    useEffect: (effect, deps) => {
      const index = hookIndex++;
      const old = slots[index];
      if (!old || !sameDeps(old.deps, deps)) pendingEffects.push({ index, effect, deps });
    },
  };
  const window = {
    requestAnimationFrame: (callback) => {
      const id = ++nextFrameId;
      frameCallbacks.set(id, callback);
      return id;
    },
    cancelAnimationFrame: (id) => frameCallbacks.delete(id),
  };
  const jsxRuntime = { jsx: () => ({}), jsxs: () => ({}) };
  const module = { exports: {} };
  const requireModule = (name) => ({
    react,
    'react-dom': { createPortal: (content) => content },
    'react/jsx-runtime': jsxRuntime,
  })[name];
  new Function('require', 'module', 'exports', 'document', 'window', 'HTMLElement', compiled)(
    requireModule, module, module.exports, document, window, Element,
  );
  const Modal = module.exports.default;

  const flushEffects = () => {
    for (const { index, effect, deps } of pendingEffects.splice(0)) {
      slots[index]?.cleanup?.();
      slots[index] = { deps, cleanup: effect() };
    }
    for (const [id, callback] of frameCallbacks) {
      frameCallbacks.delete(id);
      callback();
    }
  };
  const render = (onClose) => {
    hookIndex = 0;
    Modal({ isOpen: true, onClose, title: 'Destination', children: null });
    flushEffects();
  };

  let oldCloseCalls = 0;
  let newCloseCalls = 0;
  hookIndex = 0;
  Modal({ isOpen: true, onClose: () => { oldCloseCalls++; }, title: 'Destination', children: null });
  const dialogRef = slots.find((slot) => slot && slot.current === null);
  dialogRef.current = { querySelector: () => closeButton };
  flushEffects();
  input.focus();

  render(() => { newCloseCalls++; });
  assert.equal(document.activeElement, input, 'typing should not move focus to the dialog close button');
  listeners.get('keydown')?.({ key: 'Escape' });
  assert.equal(newCloseCalls, 1, 'Escape should use the latest close callback');
  assert.equal(oldCloseCalls, 0);
});
