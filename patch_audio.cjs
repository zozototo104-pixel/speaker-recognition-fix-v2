const fs = require('fs');
let code = fs.readFileSync('src/lib/speaker/AudioFeatures.ts', 'utf8');

code = code.replace(
  '  public static prepareEmbeddingWindow(pcm: Float32Array): Float32Array {',
  `  public static prepareEnrollmentEmbeddingPcm(pcm: Float32Array): Float32Array {
    return this.prepareEmbeddingWindow(pcm);
  }

  public static prepareEmbeddingWindow(pcm: Float32Array): Float32Array {`
);

fs.writeFileSync('src/lib/speaker/AudioFeatures.ts', code);
