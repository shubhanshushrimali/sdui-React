import assert from 'node:assert/strict';
import { test } from 'node:test';
import { decideCache, decideRemoteVersion, isCacheFresh } from '../cachePolicy';

test('TTL treats missing as fresh and zero as expired', () => {
  assert.equal(isCacheFresh(undefined, 10_000), true);
  assert.equal(isCacheFresh(0, 0), false);
  assert.equal(isCacheFresh(30, 29_000), true);
  assert.equal(isCacheFresh(30, 30_000), false);
});

test('cache-first returns a fresh copy and refetches when it expires', () => {
  assert.deepEqual(
    decideCache({ policy: 'cache-first', hasCache: true, fresh: true }),
    { action: 'use-cache', revalidate: false }
  );
  assert.deepEqual(
    decideCache({ policy: 'cache-first', hasCache: true, fresh: false }),
    { action: 'fetch-network', keepStaleOnFailure: true }
  );
});

test('stale-while-revalidate paints the cache and refreshes only after TTL', () => {
  assert.deepEqual(
    decideCache({ policy: 'stale-while-revalidate', hasCache: true, fresh: true }),
    { action: 'use-cache', revalidate: false }
  );
  assert.deepEqual(
    decideCache({ policy: 'stale-while-revalidate', hasCache: true, fresh: false }),
    { action: 'use-cache', revalidate: true }
  );
});

test('no-cache ignores a stored copy', () => {
  assert.deepEqual(
    decideCache({ policy: 'no-cache', hasCache: true, fresh: true }),
    { action: 'fetch-network', keepStaleOnFailure: false }
  );
});

test('a forced refresh always asks the network', () => {
  assert.deepEqual(
    decideCache({ policy: 'cache-first', hasCache: true, fresh: true, forceNetwork: true }),
    { action: 'fetch-network', keepStaleOnFailure: true }
  );
});

test('a remote document applies only when it is newer', () => {
  assert.equal(
    decideRemoteVersion({ policy: 'cache-first', cachedVersion: 4, remoteVersion: 4 }),
    'skip-same'
  );
  assert.equal(
    decideRemoteVersion({ policy: 'stale-while-revalidate', cachedVersion: 4, remoteVersion: 3 }),
    'skip-older'
  );
  assert.equal(
    decideRemoteVersion({ policy: 'cache-first', cachedVersion: 4, remoteVersion: 5 }),
    'apply'
  );
  assert.equal(
    decideRemoteVersion({ policy: 'no-cache', cachedVersion: 4, remoteVersion: 4 }),
    'apply'
  );
  assert.equal(
    decideRemoteVersion({ policy: 'cache-first', cachedVersion: null, remoteVersion: 1 }),
    'apply'
  );
});

test('a cache miss always asks the network', () => {
  assert.deepEqual(
    decideCache({ policy: 'stale-while-revalidate', hasCache: false, fresh: false }),
    { action: 'fetch-network', keepStaleOnFailure: false }
  );
});
