/**
 * ============================================================================
 * DOPAMINE LUXURY STREETWEAR PLATFORM — E2E TEST HARNESS & ENVIRONMENT
 * ============================================================================
 * Zero-dependency sandbox environment and assertions for browser & Node modules.
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

// Base Paths
const ROOT_DIR = path.resolve(__dirname, '..');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');
const JS_DIR = path.join(ASSETS_DIR, 'js');
const CSS_DIR = path.join(ASSETS_DIR, 'css');
const BACKEND_DIR = path.join(ROOT_DIR, 'backend');

/**
 * Creates a mock Storage implementation (localStorage / sessionStorage)
 */
class MockStorage {
  constructor() {
    this._store = {};
  }
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this._store, key) ? this._store[key] : null;
  }
  setItem(key, value) {
    this._store[key] = String(value);
  }
  removeItem(key) {
    delete this._store[key];
  }
  clear() {
    this._store = {};
  }
  get length() {
    return Object.keys(this._store).length;
  }
  key(index) {
    return Object.keys(this._store)[index] || null;
  }
}

/**
 * Creates a lightweight mock DOM node
 */
class MockDOMElement {
  constructor(tagName = 'div', id = '', classList = []) {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.classList = new Set(classList);
    this.dataset = {};
    this.style = {};
    this.attributes = {};
    this.children = [];
    this.parentNode = null;
    this.textContent = '';
    this.innerHTML = '';
    this.hidden = false;
    this._listeners = {};
  }

  getAttribute(name) {
    return this.attributes[name] || (name === 'id' ? this.id : null);
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
    if (name === 'id') this.id = value;
    if (name.startsWith('data-')) {
      const camelKey = name.slice(5).replace(/-([a-z])/g, (_, g) => g.toUpperCase());
      this.dataset[camelKey] = value;
    }
  }

  removeAttribute(name) {
    delete this.attributes[name];
    if (name === 'id') this.id = '';
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx >= 0) {
      child.parentNode = null;
      this.children.splice(idx, 1);
    }
    return child;
  }

  remove() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  }

  addEventListener(event, handler) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(handler);
  }

  removeEventListener(event, handler) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(h => h !== handler);
  }

  dispatchEvent(event) {
    if (this._listeners[event.type]) {
      this._listeners[event.type].forEach(h => h.call(this, event));
    }
    return true;
  }

  querySelector(selector) {
    // Simple mock query selector
    if (selector.startsWith('#')) {
      const targetId = selector.slice(1);
      if (this.id === targetId) return this;
      for (const child of this.children) {
        const found = child.querySelector(selector);
        if (found) return found;
      }
    }
    if (selector.startsWith('.')) {
      const targetClass = selector.slice(1);
      if (this.classList.has(targetClass)) return this;
      for (const child of this.children) {
        const found = child.querySelector(selector);
        if (found) return found;
      }
    }
    if (selector.startsWith('[')) {
      const attrName = selector.replace(/[\[\]]/g, '');
      if (this.attributes[attrName] !== undefined || this.dataset[attrName.replace(/^data-/, '')] !== undefined) return this;
      for (const child of this.children) {
        const found = child.querySelector(selector);
        if (found) return found;
      }
    }
    return null;
  }

  querySelectorAll(selector) {
    const results = [];
    const walk = (node) => {
      if (selector.startsWith('.')) {
        if (node.classList.has(selector.slice(1))) results.push(node);
      } else if (selector.startsWith('[')) {
        const attrName = selector.replace(/[\[\]]/g, '').split('=')[0];
        if (node.attributes[attrName] !== undefined || node.dataset[attrName.replace(/^data-/, '')] !== undefined) {
          results.push(node);
        }
      }
      for (const child of node.children) walk(child);
    };
    walk(this);
    return results;
  }

  closest(selector) {
    let curr = this;
    while (curr) {
      if (selector.startsWith('.') && curr.classList && curr.classList.has(selector.slice(1))) return curr;
      if (selector.startsWith('#') && curr.id === selector.slice(1)) return curr;
      if (selector.startsWith('[') && curr.attributes && curr.attributes[selector.replace(/[\[\]]/g, '')] !== undefined) return curr;
      curr = curr.parentNode;
    }
    return null;
  }
}

/**
 * Creates a complete mock browser sandbox with DOM and event listeners
 */
function createBrowserSandbox(initialStorage = {}) {
  const localStorage = new MockStorage();
  const sessionStorage = new MockStorage();

  for (const [k, v] of Object.entries(initialStorage)) {
    localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
  }

  const documentListeners = {};
  const windowListeners = {};

  const body = new MockDOMElement('body');
  const head = new MockDOMElement('head');
  const docElement = new MockDOMElement('html');
  docElement.appendChild(head);
  docElement.appendChild(body);

  const document = {
    documentElement: docElement,
    head: head,
    body: body,
    createElement: (tag) => new MockDOMElement(tag),
    getElementById: (id) => {
      const search = (node) => {
        if (node.id === id) return node;
        for (const child of node.children) {
          const found = search(child);
          if (found) return found;
        }
        return null;
      };
      return search(docElement);
    },
    querySelector: (selector) => docElement.querySelector(selector),
    querySelectorAll: (selector) => docElement.querySelectorAll(selector),
    addEventListener: (event, handler) => {
      if (!documentListeners[event]) documentListeners[event] = [];
      documentListeners[event].push(handler);
    },
    removeEventListener: (event, handler) => {
      if (!documentListeners[event]) return;
      documentListeners[event] = documentListeners[event].filter(h => h !== handler);
    },
    dispatchEvent: (event) => {
      if (documentListeners[event.type]) {
        documentListeners[event.type].forEach(h => h(event));
      }
      return true;
    }
  };

  class CustomEvent {
    constructor(type, params = {}) {
      this.type = type;
      this.detail = params.detail || null;
      this.bubbles = !!params.bubbles;
      this.cancelable = !!params.cancelable;
    }
  }

  const sandboxWindow = {
    document,
    localStorage,
    sessionStorage,
    CustomEvent,
    Event: CustomEvent,
    location: {
      href: 'http://localhost:3000/',
      pathname: '/',
      search: '',
      hostname: 'localhost'
    },
    navigator: {
      clipboard: {
        writeText: async (txt) => { sandboxWindow._lastCopiedText = txt; }
      }
    },
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
    console: {
      log: () => {},
      warn: () => {},
      error: () => {},
      info: () => {}
    },
    addEventListener: (event, handler) => {
      if (!windowListeners[event]) windowListeners[event] = [];
      windowListeners[event].push(handler);
    },
    removeEventListener: (event, handler) => {
      if (!windowListeners[event]) return;
      windowListeners[event] = windowListeners[event].filter(h => h !== handler);
    },
    dispatchEvent: (event) => {
      if (windowListeners[event.type]) {
        windowListeners[event.type].forEach(h => h(event));
      }
      return true;
    }
  };

  sandboxWindow.window = sandboxWindow;
  return sandboxWindow;
}

/**
 * Loads and executes a script file from assets/js/ inside a sandbox
 */
function loadScriptInSandbox(scriptName, sandbox) {
  const filePath = path.join(JS_DIR, scriptName);
  const code = fs.readFileSync(filePath, 'utf8');
  const context = vm.createContext(sandbox);
  vm.runInContext(code, context);
  return context;
}

/**
 * WCAG 2.1 AA Color Contrast Calculator
 */
function hexToRgb(hex) {
  let clean = hex.replace(/^#/, '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function relativeLuminance(rgb) {
  const srgb = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map(val => {
    return val <= 0.04045 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function calculateContrastRatio(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const l1 = relativeLuminance(rgb1);
  const l2 = relativeLuminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Test Runner Helper
 */
class TestSuiteHarness {
  constructor(name) {
    this.name = name;
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
    this.skipped = 0;
    this.startTime = 0;
    this.duration = 0;
    this.failures = [];
  }

  test(description, fn) {
    this.tests.push({ description, fn });
  }

  async run() {
    this.startTime = Date.now();
    for (const t of this.tests) {
      const start = Date.now();
      try {
        await t.fn();
        const duration = Date.now() - start;
        this.passed++;
        t.status = 'PASS';
        t.duration = duration;
      } catch (err) {
        const duration = Date.now() - start;
        this.failed++;
        t.status = 'FAIL';
        t.duration = duration;
        t.error = err;
        this.failures.push({ description: t.description, error: err });
      }
    }
    this.duration = Date.now() - this.startTime;
    return {
      name: this.name,
      total: this.tests.length,
      passed: this.passed,
      failed: this.failed,
      skipped: this.skipped,
      duration: this.duration,
      failures: this.failures,
      tests: this.tests
    };
  }
}

module.exports = {
  ROOT_DIR,
  ASSETS_DIR,
  JS_DIR,
  CSS_DIR,
  BACKEND_DIR,
  MockStorage,
  MockDOMElement,
  createBrowserSandbox,
  loadScriptInSandbox,
  hexToRgb,
  relativeLuminance,
  calculateContrastRatio,
  TestSuiteHarness,
  assert
};
