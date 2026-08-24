const fs = require('fs');
let code = fs.readFileSync('src/lib/speaker/SpeakerRegistry.ts', 'utf8');

const target = code.substring(code.indexOf('  public promoteCandidate(candidateId: string, name: string): SpeakerProfile | null {'), code.indexOf('  public deleteSpeaker(id: string): boolean {'));

const replacement = `  public promoteCandidate(candidateId: string, name: string): SpeakerProfile | null {
    const profile = this.profiles.get(candidateId);
    const cleanName = normalizeName(name);
    if (!profile || !cleanName) return null;
    if (!profile.isCandidate) return profile.name === cleanName ? profile : null;

    const existing = [...this.profiles.values()].find((p) => 
      !p.isCandidate && 
      p.name === cleanName && 
      p.centroidEmbedding.length === profile.centroidEmbedding.length &&
      (!p.embeddingModel || !profile.embeddingModel || p.embeddingModel === profile.embeddingModel)
    );

    if (existing) {
        let added = 0;
        const beforeSamples = existing.sampleCount;
        for (const emb of profile.embeddings) {
           if (this.updateSpeaker(existing.id, emb, 'HIGH', true)) {
              added++;
           }
        }
        this.deleteSpeaker(candidateId);
        if (this.callbacks?.onDebugLog) {
           this.callbacks.onDebugLog(\`[Speaker:CandidateMerge] candidateId=\${candidateId} targetSpeakerId=\${existing.id} name=\${cleanName} embeddingsMerged=\${added} samplesBefore=\${beforeSamples} samplesAfter=\${existing.sampleCount}\`);
        }
        return existing;
    }

    profile.name = cleanName;
    profile.isCandidate = false;
    profile.status = 'VALID';
    profile.confidence = Math.max(profile.confidence, 0.85);
    profile.updatedAt = Date.now();
    return profile;
  }

`;

code = code.replace(target, replacement);
fs.writeFileSync('src/lib/speaker/SpeakerRegistry.ts', code);
