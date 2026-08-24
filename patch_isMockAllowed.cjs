const fs = require('fs');
let code = fs.readFileSync('src/db/index.ts', 'utf8');

const target = `const isMockAllowed = (): boolean => true;`;
const replacement = `const isMockAllowed = (): boolean => {
  return process.env.NODE_ENV === 'test' || process.env.ALLOW_MOCK_DB === 'true';
};`;

code = code.replace(target, replacement);
fs.writeFileSync('src/db/index.ts', code);
