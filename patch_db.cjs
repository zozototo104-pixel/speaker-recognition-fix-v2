const fs = require('fs');
let code = fs.readFileSync('src/db/speakers.ts', 'utf8');

const targetFunc = `export async function replacePersistentSpeakerProfiles(ownerId: string, profiles: SpeakerProfile[]): Promise<void> {`;
const replaceFunc = `export async function replacePersistentSpeakerProfiles(ownerId: string, profiles: SpeakerProfile[], allowInsert = true): Promise<void> {`;
code = code.replace(targetFunc, replaceFunc);

const targetInsert = `      await tx.insert(speakerProfiles).values({
        ownerId,
        speakerId: profile.id,
        name: profile.name.trim(),
        embeddings: profile.embeddings,
        centroidEmbedding: profile.centroidEmbedding,
        sampleCount: Math.max(1, profile.sampleCount || 1),
        confidence: Math.max(0, Math.min(1, profile.confidence || 0)),
        isCandidate: Boolean(profile.isCandidate),
        status: profile.status || (profile.isCandidate ? 'CANDIDATE' : 'VALID'),
        embeddingModel: profile.embeddingModel || 'legacy-unknown',
        createdAt: asTimestamp(profile.createdAt) || new Date(),
        updatedAt: new Date(),
        lastSeenAt: asTimestamp(profile.lastSeenAt),
      }).onConflictDoUpdate({
        target: [speakerProfiles.ownerId, speakerProfiles.speakerId],
        set: {
          name: profile.name.trim(),
          embeddings: profile.embeddings,
          centroidEmbedding: profile.centroidEmbedding,
          sampleCount: Math.max(1, profile.sampleCount || 1),
          confidence: Math.max(0, Math.min(1, profile.confidence || 0)),
          isCandidate: Boolean(profile.isCandidate),
          status: profile.status || (profile.isCandidate ? 'CANDIDATE' : 'VALID'),
          embeddingModel: profile.embeddingModel || 'legacy-unknown',
          updatedAt: new Date(),
          lastSeenAt: asTimestamp(profile.lastSeenAt),
        },
      });`;

const replaceInsert = `      if (!allowInsert) {
        await tx.update(speakerProfiles)
          .set({
            name: profile.name.trim(),
            embeddings: profile.embeddings,
            centroidEmbedding: profile.centroidEmbedding,
            sampleCount: Math.max(1, profile.sampleCount || 1),
            confidence: Math.max(0, Math.min(1, profile.confidence || 0)),
            isCandidate: Boolean(profile.isCandidate),
            status: profile.status || (profile.isCandidate ? 'CANDIDATE' : 'VALID'),
            embeddingModel: profile.embeddingModel || 'legacy-unknown',
            updatedAt: new Date(),
            lastSeenAt: asTimestamp(profile.lastSeenAt),
          })
          .where(and(eq(speakerProfiles.ownerId, ownerId), eq(speakerProfiles.speakerId, profile.id)));
      } else {
        await tx.insert(speakerProfiles).values({
          ownerId,
          speakerId: profile.id,
          name: profile.name.trim(),
          embeddings: profile.embeddings,
          centroidEmbedding: profile.centroidEmbedding,
          sampleCount: Math.max(1, profile.sampleCount || 1),
          confidence: Math.max(0, Math.min(1, profile.confidence || 0)),
          isCandidate: Boolean(profile.isCandidate),
          status: profile.status || (profile.isCandidate ? 'CANDIDATE' : 'VALID'),
          embeddingModel: profile.embeddingModel || 'legacy-unknown',
          createdAt: asTimestamp(profile.createdAt) || new Date(),
          updatedAt: new Date(),
          lastSeenAt: asTimestamp(profile.lastSeenAt),
        }).onConflictDoUpdate({
          target: [speakerProfiles.ownerId, speakerProfiles.speakerId],
          set: {
            name: profile.name.trim(),
            embeddings: profile.embeddings,
            centroidEmbedding: profile.centroidEmbedding,
            sampleCount: Math.max(1, profile.sampleCount || 1),
            confidence: Math.max(0, Math.min(1, profile.confidence || 0)),
            isCandidate: Boolean(profile.isCandidate),
            status: profile.status || (profile.isCandidate ? 'CANDIDATE' : 'VALID'),
            embeddingModel: profile.embeddingModel || 'legacy-unknown',
            updatedAt: new Date(),
            lastSeenAt: asTimestamp(profile.lastSeenAt),
          },
        });
      }`;

code = code.replace(targetInsert, replaceInsert);
fs.writeFileSync('src/db/speakers.ts', code);
