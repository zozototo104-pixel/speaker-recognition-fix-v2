const fs = require('fs');
let code = fs.readFileSync('tests/speaker_fix_v2.unit.test.ts', 'utf8');
code = code.replace("registry.setCallbacks({ onDebugLog: () => {} });", "");
fs.writeFileSync('tests/speaker_fix_v2.unit.test.ts', code);
