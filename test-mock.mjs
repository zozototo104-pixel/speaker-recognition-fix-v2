import test, { mock } from 'node:test';
import assert from 'node:assert';

mock.module('./dummy.mjs', {
  namedExports: {
    db: {
      transaction: async (cb) => {
        await cb({ isMock: true });
      }
    }
  }
});

test('Mocking ESM', async () => {
  const { doSomething } = await import('./target.mjs');
  const res = await doSomething();
  assert.strictEqual(res.isMock, true);
});
