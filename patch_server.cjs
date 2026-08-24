const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'const embeddingPcm = AudioFeatures.prepareEmbeddingWindow(pcm);',
  'const embeddingPcm = AudioFeatures.prepareEnrollmentEmbeddingPcm(pcm);'
);

fs.writeFileSync('server.ts', code);
