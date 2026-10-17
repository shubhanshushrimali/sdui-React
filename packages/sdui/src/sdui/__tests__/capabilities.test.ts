import assert from 'node:assert/strict';
import { test } from 'node:test';
import { missingCapabilities } from '../capabilities';

const client = { components: ['View', 'Card'], actions: ['navigate', 'toggleMember'] };

test('a screen with no requirements fits every client', () => {
  assert.deepEqual(missingCapabilities(undefined, client), []);
});

test('missing components and actions are named', () => {
  const missing = missingCapabilities(
    { components: ['card', 'Chart'], actions: ['navigate', 'pay'] },
    client
  );
  assert.deepEqual(missing, ['component Chart', 'action pay']);
});
