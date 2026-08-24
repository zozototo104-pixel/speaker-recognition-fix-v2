import { db } from './dummy.mjs';
export async function doSomething() {
  let res;
  await db.transaction(async (tx) => { res = tx; });
  return res;
}
