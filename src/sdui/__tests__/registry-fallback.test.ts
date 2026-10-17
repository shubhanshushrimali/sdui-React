import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeComponentType, resolveComponentName } from '../resolveComponent';

const registered = new Set(['view', 'text', 'card']);
const has = (type: string) => registered.has(normalizeComponentType(type));

test('type lookup is case-insensitive', () => {
  assert.equal(normalizeComponentType('SDUIView'), 'sduiview');
  assert.deepEqual(resolveComponentName(has, 'View'), { type: 'View', degraded: false });
});

test('an unknown type degrades to fallbackType', () => {
  assert.deepEqual(resolveComponentName(has, 'FutureWidget', 'Text'), {
    type: 'Text',
    degraded: true,
  });
});

test('a known type does not degrade', () => {
  assert.deepEqual(resolveComponentName(has, 'Card', 'Text'), { type: 'Card', degraded: false });
});

test('a missing type and a missing fallback resolve to nothing', () => {
  assert.equal(resolveComponentName(has, 'FutureWidget', 'AlsoMissing'), null);
  assert.equal(resolveComponentName(has, 'FutureWidget'), null);
});
