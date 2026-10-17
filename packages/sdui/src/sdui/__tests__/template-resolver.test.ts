import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolveProps, resolveTemplate } from '../TemplateResolver';

const context = {
  user: { name: 'Ava', isPremium: false },
  item: { price: 18, title: 'Lamp' },
};

test('a whole-string template returns the raw value', () => {
  assert.equal(resolveTemplate('{{user.isPremium}}', context), false);
  assert.equal(resolveTemplate('{{item.price}}', context), 18);
});

test('mixed text interpolates as a string', () => {
  assert.equal(resolveTemplate('Hello, {{user.name}}', context), 'Hello, Ava');
});

test('a missing path stays as the original token', () => {
  assert.equal(resolveTemplate('{{user.city}}', context), '{{user.city}}');
});

test('resolveProps walks nested objects', () => {
  const resolved = resolveProps(
    { title: '{{item.title}}', meta: { price: '{{item.price}}' } },
    context
  );
  assert.equal(resolved.title, 'Lamp');
  assert.deepEqual(resolved.meta, { price: 18 });
});
