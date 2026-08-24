import { db } from './src/db/index.ts';
import { users } from './src/db/schema.ts';

async function run() {
  try {
    const res = await db.select().from(users).limit(1);
    console.log("DB SUCCESS:", res);
  } catch (e) {
    console.log("DB ERROR:", e);
  }
}
run();
