const fs = require('fs');
let code = fs.readFileSync('src/lib/speaker/AudioFeatures.ts', 'utf8');
const newFunc = `
  public static prepareEmbeddingWindow(pcm: Float32Array): Float32Array {
    if (!pcm?.length) return pcm;
    const sampleRate = 16000;
    const targetSamples = Math.min(
      pcm.length,
      Math.floor(sampleRate * 2.5)
    );
    if (pcm.length <= targetSamples) {
      return new Float32Array(pcm);
    }
    const stepSamples = Math.max(
      1,
      Math.floor(sampleRate * 0.25)
    );
    let bestStart = 0;
    let bestEnergy = -1;
    for (
      let start = 0;
      start + targetSamples <= pcm.length;
      start += stepSamples
    ) {
      let sumSquares = 0;
      for (let i = start; i < start + targetSamples; i++) {
        const value = pcm[i];
        sumSquares += value * value;
      }
      const energy = sumSquares / targetSamples;
      if (energy > bestEnergy) {
        bestEnergy = energy;
        bestStart = start;
      }
    }
    return pcm.slice(bestStart, bestStart + targetSamples);
  }
`;
code = code.replace('  public static extractFrameFeatures(', newFunc + '\n  public static extractFrameFeatures(');
fs.writeFileSync('src/lib/speaker/AudioFeatures.ts', code);
