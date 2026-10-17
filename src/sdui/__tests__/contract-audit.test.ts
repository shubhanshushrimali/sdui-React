import assert from 'node:assert/strict';
import { test } from 'node:test';
import { auditDocuments, auditSchemaFixtures } from '../contractAudit';

test('the shipped schemas cover every component, action, and schema field', () => {
  const gaps = auditSchemaFixtures();
  assert.deepEqual(gaps, [], gaps.join('\n'));
});

test('a document that drops a component is reported', () => {
  const gaps = auditDocuments([
    {
      screenId: 'thin',
      version: 1,
      metadata: { title: 'Thin' },
      root: { type: 'View' },
    },
  ]);
  assert.ok(gaps.some((gap) => gap.includes('component "Card"')));
  assert.ok(gaps.some((gap) => gap.includes('action "navigate"')));
  assert.ok(gaps.some((gap) => gap.includes('schema field "overlay"')));
});
