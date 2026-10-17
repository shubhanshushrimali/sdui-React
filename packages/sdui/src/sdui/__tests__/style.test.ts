import assert from 'node:assert/strict';
import { test } from 'node:test';
import { schemaStyle, SDUIStyleSchema } from '../style';

test('a catalog style with a percentage width is accepted', () => {
  const parsed = SDUIStyleSchema.parse({
    width: '100%',
    backgroundColor: '#070B14',
    fontWeight: '800',
    flexDirection: 'row',
  });
  assert.equal(parsed.width, '100%');
  assert.equal(schemaStyle(parsed).fontWeight, '800');
});

test('an unknown key, a bad color, and a bad enum are rejected', () => {
  assert.equal(SDUIStyleSchema.safeParse({ display: 'none' }).success, false);
  assert.equal(SDUIStyleSchema.safeParse({ backgroundColor: 'javascript:alert(1)' }).success, false);
  assert.equal(SDUIStyleSchema.safeParse({ flexDirection: 'sideways' }).success, false);
  assert.equal(SDUIStyleSchema.safeParse({ width: '100px' }).success, false);
  assert.deepEqual(schemaStyle({ color: 'red; background: url(evil)' }), {});
});
