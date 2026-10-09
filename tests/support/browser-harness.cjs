'use strict';
const fs = require('node:fs');
const vm = require('node:vm');

// Exercises real client events and DOM output; layout and speech remain browser checks.
function browserHarness(file, { search = '', page = 'auth', fetchImpl = async () => new Response('{}', { status: 401 }), windowExtras = {} } = {}) {
  const nodes = new Map(); const events = new Map(); const calls = []; let document;
  class Node {
    constructor(tag = 'div') {
      this.tagName = tag.toUpperCase(); this.children = []; this.attributes = new Map(); this.listeners = new Map();
      this.value = ''; this.hidden = false; this.disabled = false; this.dataset = {}; this.ownText = '';
      this.classList = { add() {}, remove() {}, toggle() {} };
    }
    set textContent(value) { this.ownText = String(value); this.children = []; }
    get textContent() { return this.ownText + this.children.map((node) => node.textContent).join(''); }
    setAttribute(name, value) { this.attributes.set(name, String(value)); if (name === 'id') { this.id = value; nodes.set(value, this); } if (name.startsWith('data-')) this.dataset[name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = value; }
    getAttribute(name) { return this.attributes.get(name) ?? null; }
    hasAttribute(name) { return this.attributes.has(name); }
    removeAttribute(name) { this.attributes.delete(name); }
    append(...children) { this.children.push(...children); }
    replaceChildren(...children) { this.ownText = ''; this.children = children; }
    replaceWith() {}
    addEventListener(type, callback) { this.listeners.set(type, callback); }
    focus() { document.activeElement = this; }
    scrollIntoView() {}
    querySelector(selector) { return selector.startsWith('#') ? nodes.get(selector.slice(1)) : this.querySelectorAll(selector)[0]; }
    querySelectorAll(selector) {
      const name = selector.slice(1, -1); const found = [];
      const visit = (node) => { for (const child of node.children) { if (child.hasAttribute(name)) found.push(child); visit(child); } }; visit(this); return found;
    }
    async emit(type, extras = {}) { return this.listeners.get(type)?.({ preventDefault() {}, target: this, ...extras }); }
  }
  document = {
    hidden: false, activeElement: null, title: '',
    getElementById(id) { if (!nodes.has(id)) { const node = new Node(); node.id = id; nodes.set(id, node); } return nodes.get(id); },
    createElement(tag) { return new Node(tag); }, createElementNS(_ns, tag) { return new Node(tag); },
    createTextNode(text) { const node = new Node(); node.textContent = text; return node; },
    addEventListener(type, callback) { const key = `document:${type}`; const previous = events.get(key); events.set(key, async (event) => { await previous?.(event); return callback(event); }); },
    dispatchEvent(event) { events.get(`document:${event.type}`)?.(event); },
  };
  document.body = new Node('body'); document.body.dataset.page = page;
  const location = { search, pathname: '/auth', origin: 'http://localhost', assigned: '', assign(url) { this.assigned = url; }, reload() {} };
  const window = { location, addEventListener(type, callback) { events.set(`window:${type}`, callback); }, ...windowExtras };
  const context = { document, window, URL, URLSearchParams, AbortController, Event,
    fetch: async (...args) => { calls.push(args); return fetchImpl(...args); }, console: { error() {} },
    setTimeout, clearTimeout, setInterval: () => 1, clearInterval() {}, requestAnimationFrame: () => 1, cancelAnimationFrame() {}, };
  if (fs.existsSync(file)) vm.runInNewContext(fs.readFileSync(file, 'utf8'), context);
  const flush = () => new Promise((resolve) => setImmediate(resolve));
  return { nodes, document, window, events, calls, get: (id) => document.getElementById(id), flush, run: (source) => vm.runInNewContext(fs.readFileSync(source, 'utf8'), context), async event(key, data = {}) { await events.get(key)?.(data); await flush(); } };
}
module.exports = { browserHarness };
