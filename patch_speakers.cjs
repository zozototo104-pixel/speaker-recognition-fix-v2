const fs = require('fs');
let code = fs.readFileSync('src/db/speakers.ts', 'utf8');
code = code.replace(
  'export async function replacePersistentSpeakerProfiles(ownerId: string, profiles: SpeakerProfile[], allowInsert = true): Promise<void> {',
  'export async function replacePersistentSpeakerProfiles(ownerId: string, profiles: SpeakerProfile[], allowInsert = true, _testDbClient?: any): Promise<void> {'
);
code = code.replace(
  'await db.transaction(async (tx) => {',
  'await (_testDbClient || db).transaction(async (tx: any) => {'
);
fs.writeFileSync('src/db/speakers.ts', code);
