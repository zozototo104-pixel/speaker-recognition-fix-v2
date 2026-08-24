const fs = require('fs');
let code = fs.readFileSync('src/lib/speaker/SpeakerDiarizer.ts', 'utf8');

const targetEnroll = `  public async enrollSpeakerWithSamples(name: string, samples: Float32Array[]): Promise<ReturnType<SpeakerRegistry['registerSpeaker']>> {
    if (!samples.length) throw new Error('SPEAKER_SAMPLES_REQUIRED');
    const embeddings = await Promise.all(samples.map((sample) => this.provider.extractEmbedding(sample)));
    const profile = this.registry.registerOrUpdateSpeaker(name, embeddings[0], { embeddingModel: this.provider.getModelId() });
    for (const embedding of embeddings.slice(1)) this.registry.updateSpeaker(profile.id, embedding, 'HIGH', true);
    return profile;
  }`;

const replacementEnroll = `  public async enrollSpeakerWithSamples(name: string, samples: Float32Array[]): Promise<ReturnType<SpeakerRegistry['registerSpeaker']>> {
    if (!samples.length) throw new Error('SPEAKER_SAMPLES_REQUIRED');
    const embeddings = await Promise.all(samples.map((sample) => {
      const window = AudioFeatures.prepareEmbeddingWindow(sample);
      return this.provider.extractEmbedding(window);
    }));
    const profile = this.registry.registerOrUpdateSpeaker(name, embeddings[0], { embeddingModel: this.provider.getModelId() });
    for (const embedding of embeddings.slice(1)) this.registry.updateSpeaker(profile.id, embedding, 'HIGH', true);
    return profile;
  }`;

code = code.replace(targetEnroll, replacementEnroll);

// Find "  const sampleRate = SPEAKER_THRESHOLDS.SAMPLE_RATE;"
const index = code.indexOf("  const sampleRate = SPEAKER_THRESHOLDS.SAMPLE_RATE;");
if (index > -1) {
    const end = code.indexOf("  private clearBuffer(): void {");
    code = code.substring(0, index) + code.substring(end);
}

fs.writeFileSync('src/lib/speaker/SpeakerDiarizer.ts', code);
