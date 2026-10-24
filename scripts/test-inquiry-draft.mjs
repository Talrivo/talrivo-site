import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const nodes = new Map();
const node = selector => {
  if (!nodes.has(selector)) nodes.set(selector, {
    value: '', options: [], handlers: {}, childElementCount: 0,
    classList: { add() {}, remove() {}, toggle() {} },
    addEventListener(type, handler) { this.handlers[type] = handler; },
    querySelector: node, querySelectorAll: () => [],
    setAttribute() {}, removeAttribute() {}, scrollIntoView() {},
    add(option) { this.options.push(option); }, close() { this.open = false; }
  });
  return nodes.get(selector);
};
const context = vm.createContext({
  document: { querySelector: node, querySelectorAll: () => [], title: 'TALRIVO', referrer: '' },
  window: {
    location: new URL('https://talrivo.com/'),
    localStorage: { getItem: () => null }, addEventListener() {}
  },
  URLSearchParams,
  Option: class { constructor(text, value) { this.text = text; this.value = value; } },
  fetch() { throw Error('No real form submissions allowed'); }
});
vm.runInContext(readFileSync('script.js', 'utf8'), context);
const message = node('textarea[name="message"]');
const select = (model, name) => {
  const product = { model, name };
  vm.runInContext(`selectedCatalogueProduct = ${JSON.stringify(product)};`, context);
  node('#product-dialog').handlers.click({ target: { closest: selector => selector === '#dialog-inquiry' } });
  assert.equal(node('#product-interest').value, `${model} ${name}`);
  assert.equal(node('#selected-from').value, `Catalogue dialog: ${model} ${name}`);
};

select('G942', 'RGB Wired Gaming Headset');
assert.match(message.value, /G942/);
select('G935', 'RGB Wired Gaming Headset');
assert.match(message.value, /G935/);
assert.doesNotMatch(message.value, /G942/);
const buyerDraft = `${message.value}\nPlease keep my white packaging and March sample timing.`;
message.value = buyerDraft;
select('TWS042S', 'ANC True Wireless Earbuds');
assert.equal(message.value, buyerDraft, 'Never replace an edited template');
message.value = 'I need a microphone sample, not a quotation.\nPlease keep both lines.';
const original = message.value;
select('G942', 'RGB Wired Gaming Headset');
assert.equal(message.value, original, 'Preserve the exact buyer message on every model selection');
select('G942', 'RGB Wired Gaming Headset');
assert.equal(message.value, original, 'Repeated selection must not append duplicate text');
message.value = '   ';
select('G935', 'RGB Wired Gaming Headset');
assert.match(message.value, /G935/);
assert.equal(node('#product-interest').options.filter(option => option.value === 'G935 RGB Wired Gaming Headset').length, 1);
console.log('Inquiry draft checks passed: empty prefill, untouched template refresh, edited and custom draft preservation, repeated selection and model context.');
