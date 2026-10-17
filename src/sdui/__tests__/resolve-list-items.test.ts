import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolveListItems } from '../resolveListItems';

const catalog = [
  { id: 'lamp', title: 'Arc lamp', category: 'Studio', featured: true, rating: 4.8, badge: 'New' },
  { id: 'pack', title: 'Field pack', category: 'Travel', featured: false, rating: 4.1 },
];

const source = {
  type: 'state' as const,
  stateKey: 'activeCategory',
  data: catalog,
  filters: {
    Featured: { field: 'featured', operator: 'eq' as const, value: true },
    TopRated: { field: 'rating', operator: 'gte' as const, value: 4.5 },
  },
};

test('All and an empty state return the full catalog', () => {
  assert.equal(resolveListItems(source, 'All').length, 2);
  assert.equal(resolveListItems(source, undefined).length, 2);
});

test('a named filter keeps matching rows', () => {
  const featured = resolveListItems(source, 'Featured') as { id: string }[];
  assert.deepEqual(featured.map((item) => item.id), ['lamp']);
  const top = resolveListItems(source, 'TopRated') as { id: string }[];
  assert.deepEqual(top.map((item) => item.id), ['lamp']);
});

test('an unknown state value matches title, category, and tags', () => {
  const studio = resolveListItems(source, 'Studio') as { id: string }[];
  assert.deepEqual(studio.map((item) => item.id), ['lamp']);
});

test('a state array replaces the catalog', () => {
  const rows = resolveListItems(source, [{ id: 'custom' }]) as { id: string }[];
  assert.deepEqual(rows, [{ id: 'custom' }]);
});

test('local and remote sources do not apply state filters', () => {
  assert.equal(resolveListItems({ type: 'local', data: catalog }, 'Featured').length, 2);
  assert.deepEqual(resolveListItems({ type: 'remote', url: 'https://example.com' }, 'All', [{ id: 'net' }]), [
    { id: 'net' },
  ]);
});

test('maxMinutes reads the first number in a duration string', () => {
  const timed = {
    type: 'state' as const,
    data: [{ id: 'fast', eta: '20-25 mins' }, { id: 'slow', eta: '35-40 mins' }],
    filters: { Fast: { field: 'eta', operator: 'maxMinutes' as const, value: 25 } },
  };
  const rows = resolveListItems(timed, 'Fast') as { id: string }[];
  assert.deepEqual(rows.map((item) => item.id), ['fast']);
});
