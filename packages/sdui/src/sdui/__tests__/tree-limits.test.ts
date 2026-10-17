import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DEFAULT_TREE_LIMITS, measureTree, rejectScreen, rejectTree } from '../treeLimits';

function chain(depth: number) {
  let node: { type: string; children?: unknown[] } = { type: 'View' };
  for (let level = 1; level < depth; level += 1) {
    node = { type: 'View', children: [node] };
  }
  return node;
}

test('depth counts children, templates, and branches', () => {
  const size = measureTree({
    type: 'ConditionalRender',
    ifTrue: { type: 'Card', itemTemplate: { type: 'Text' } },
    ifFalse: { type: 'View', children: [{ type: 'Text' }] },
  });
  assert.equal(size.nodes, 5);
  assert.equal(size.depth, 3);
});

test('a tree at the depth cap passes and one past it fails', () => {
  const limits = { ...DEFAULT_TREE_LIMITS, maxDepth: 32, maxNodes: 100 };
  assert.equal(rejectTree(chain(32), limits), null);
  assert.match(rejectTree(chain(33), limits) ?? '', /32/);
});

test('node count and byte length are capped on the whole screen', () => {
  const limits = { ...DEFAULT_TREE_LIMITS, maxNodes: 2, maxBytes: 80 };
  const screen = {
    root: { type: 'View', children: [{ type: 'Text' }, { type: 'Text' }] },
    overlay: [{ type: 'Button' }],
  };
  assert.match(rejectScreen(screen, limits, 10) ?? '', /nodes/);
  assert.match(rejectScreen({ root: { type: 'View' } }, limits, 81) ?? '', /bytes/);
});
