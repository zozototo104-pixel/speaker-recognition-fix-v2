const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "replacePersistentSpeakerProfiles(ownerUid, profiles).catch((error) => {",
  "replacePersistentSpeakerProfiles(ownerUid, profiles, false).catch((error) => {"
);

fs.writeFileSync('server.ts', code);
