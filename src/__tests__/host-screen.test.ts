import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { render } from '@sdui/react';
import { validateSDUIScreen } from '../../packages/sdui/src/sdui/SchemaValidator';
import { isFirebaseConfigured } from '../services/firebase';
import { fetchSDUIScreen } from '../services/schemaService';

const homeSchema = JSON.parse(readFileSync(new URL('../schemas/home.json', import.meta.url), 'utf8'));

test('the host turns the bundled home schema into a render tree', () => {
  const validation = validateSDUIScreen(homeSchema);
  assert.equal(validation.success, true);
  if (!validation.success) return;

  const element = render({
    node: validation.data.root,
    context: { state: { activeCategory: 'All' } },
  });

  const node = element.props.node;
  assert.ok(node);
  assert.equal(node, validation.data.root);
  assert.equal(node.type, validation.data.root.type);
});

test('an unconfigured Firebase project serves the bundled screen', async () => {
  assert.equal(isFirebaseConfigured, false);

  const home = await fetchSDUIScreen('home');
  assert.equal(home.screenId, 'home');
  assert.equal(home.version, 4);

  const missing = await fetchSDUIScreen('not-a-screen');
  assert.equal(missing.screenId, 'not-a-screen');
  assert.equal(missing.metadata.cachePolicy, 'no-cache');
});
