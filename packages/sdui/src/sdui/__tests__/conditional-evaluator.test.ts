import assert from 'node:assert/strict';
import { test } from 'node:test';
import { evaluateCondition } from '../ConditionalEvaluator';

const context = {
  user: { isPremium: true, age: 21, role: 'member' },
  item: { tags: ['new', 'home'] },
};

test('truthy reads the template value', () => {
  assert.equal(evaluateCondition({ expression: '{{user.isPremium}}' }, context), true);
  assert.equal(
    evaluateCondition({ expression: '{{user.isPremium}}', operator: 'falsy' }, context),
    false
  );
});

test('comparison operators coerce numbers', () => {
  assert.equal(
    evaluateCondition({ expression: '{{user.age}}', operator: 'gte', value: 18 }, context),
    true
  );
  assert.equal(
    evaluateCondition({ expression: '{{user.age}}', operator: 'lt', value: 18 }, context),
    false
  );
});

test('eq and contains use the resolved value', () => {
  assert.equal(
    evaluateCondition({ expression: '{{user.role}}', operator: 'eq', value: 'member' }, context),
    true
  );
  assert.equal(
    evaluateCondition({ expression: '{{user.role}}', operator: 'neq', value: 'guest' }, context),
    true
  );
  assert.equal(
    evaluateCondition({ expression: '{{item.tags}}', operator: 'contains', value: 'home' }, context),
    true
  );
});

test('an unresolved token is kept and treated as present', () => {
  assert.equal(evaluateCondition({ expression: '{{user.city}}' }, context), true);
});
