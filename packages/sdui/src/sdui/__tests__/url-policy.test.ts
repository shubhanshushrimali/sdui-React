import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isUrlAllowed, normalizeOrigin } from '../urlPolicy';

const origins = ['images.unsplash.com', 'github.com', '*.example.com', '127.0.0.1'];

test('an allowlisted https host is accepted', () => {
  assert.equal(isUrlAllowed('https://images.unsplash.com/photo.jpg', origins), true);
  assert.equal(isUrlAllowed('https://github.com/acme/app', origins), true);
});

test('a lookalike host and an empty allowlist are rejected', () => {
  assert.equal(isUrlAllowed('https://images.unsplash.com.evil.test/a', origins), false);
  assert.equal(isUrlAllowed('https://images.unsplash.com/a', []), false);
});

test('a wildcard matches subdomains only', () => {
  assert.equal(isUrlAllowed('https://cdn.example.com/a', origins), true);
  assert.equal(isUrlAllowed('https://example.com.evil.test/a', origins), false);
});

test('non-https schemes and userinfo are rejected', () => {
  assert.equal(isUrlAllowed('javascript:alert(1)', origins), false);
  assert.equal(isUrlAllowed('file:///etc/passwd', origins), false);
  assert.equal(isUrlAllowed('https://user:pass@github.com/a', origins), false);
  assert.equal(isUrlAllowed('http://github.com/a', origins), false);
});

test('http is limited to a listed loopback host', () => {
  assert.equal(isUrlAllowed('http://127.0.0.1:3000/items', origins), true);
  assert.equal(isUrlAllowed('http://localhost:3000/items', origins), false);
});

test('an origin entry can be a full URL', () => {
  assert.equal(normalizeOrigin('https://github.com/acme'), 'github.com');
  assert.equal(normalizeOrigin('*.example.com'), '*.example.com');
});
