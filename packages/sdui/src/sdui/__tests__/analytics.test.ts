import assert from 'node:assert/strict';
import { test } from 'node:test';
import { subscribeSDUIAnalytics, trackSDUIEvent } from '../analytics';

test('validation, unknown, render, and boundary events reach one subscriber', () => {
  const seen: string[] = [];
  const stop = subscribeSDUIAnalytics((event) => {
    seen.push(event.kind);
    if (event.kind === 'render') assert.equal(event.durationMs, 12);
    if (event.kind === 'boundary') assert.equal(event.properties?.message, 'boom');
  });

  trackSDUIEvent({ kind: 'validation', name: 'home', properties: { ok: false, reason: 'size' } });
  trackSDUIEvent({ kind: 'unknown', name: 'Chart', nodeType: 'Chart' });
  trackSDUIEvent({ kind: 'render', name: 'ScrollView', nodeType: 'ScrollView', durationMs: 12 });
  trackSDUIEvent({ kind: 'boundary', name: 'Card', nodeType: 'Card', properties: { message: 'boom' } });
  stop();
  trackSDUIEvent({ kind: 'click', name: 'after' });

  assert.deepEqual(seen, ['validation', 'unknown', 'render', 'boundary']);
});
