const fs = require('fs');
let code = fs.readFileSync('server/services/speech/SpeechEngine.ts', 'utf8');
code = code.replace(
  'AudioFeatures.prepareEmbeddingWindow(initialPcmOrEmbedding);',
  'AudioFeatures.prepareEnrollmentEmbeddingPcm(initialPcmOrEmbedding);'
);
fs.writeFileSync('server/services/speech/SpeechEngine.ts', code);
