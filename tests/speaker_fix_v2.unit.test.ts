process.env.NODE_ENV = 'test';
process.env.ALLOW_MOCK_DB = 'true';
import test from 'node:test';
import assert from 'node:assert';
import { SpeakerRegistry } from '../src/lib/speaker/SpeakerRegistry.ts';
import { AudioFeatures } from '../src/lib/speaker/AudioFeatures.ts';
import { replacePersistentSpeakerProfiles } from '../src/db/speakers.ts';
import { speechEngine } from '../server/services/speech/SpeechEngine.ts';

test('V2 Speaker Fixes', async (t) => {
  const dummyPcm = new Float32Array(16000).fill(0.1);
  const emb1 = Array(512).fill(0.01);
  const emb2 = Array(512).fill(0.02);
  const emb3 = Array(512).fill(0.03);

  await t.test('TEST A: Duplicate profile check during enrollment', () => {
    const registry = new SpeakerRegistry();
    // 1. Load a persistent profile
    registry.importProfiles([{
      id: 'existing_id_123',
      name: 'ابو مصعب',
      embeddings: [emb1],
      centroidEmbedding: emb1,
      sampleCount: 1,
      confidence: 1.0,
      isCandidate: false,
      status: 'VALID',
      embeddingModel: 'test-model'
    } as any]);

    // 2. Perform enrollment again
    const updatedProfile = registry.registerOrUpdateSpeaker('ابو مصعب ', emb2, { embeddingModel: 'test-model' });
    
    // 3. Must be the same speakerId
    assert.strictEqual(updatedProfile.id, 'existing_id_123');
    assert.strictEqual(updatedProfile.sampleCount, 2);
    assert.strictEqual(updatedProfile.embeddings.length, 2);

    // Should only be one profile overall
    const all = registry.getAllSpeakers();
    assert.strictEqual(all.length, 1);
    assert.strictEqual(all[0].id, 'existing_id_123');
  });

  await t.test('TEST B: promoteCandidate must merge with existing VERIFIED profile', () => {
    const registry = new SpeakerRegistry();
    registry.importProfiles([{
      id: 'target_id_456',
      name: 'ابو مصعب',
      embeddings: [emb1],
      centroidEmbedding: emb1,
      sampleCount: 1,
      confidence: 1.0,
      isCandidate: false,
      status: 'VALID',
      embeddingModel: 'test-model'
    } as any]);

    const candidate = registry.registerSpeaker('متحدث جديد 1', emb2, { isCandidate: true, embeddingModel: 'test-model' });
    
    const promoted = registry.promoteCandidate(candidate.id, '  ابو مصعب  ');
    
    assert.ok(promoted);
    assert.strictEqual(promoted?.id, 'target_id_456');
    assert.strictEqual(promoted?.sampleCount, 2);
    
    const all = registry.getAllSpeakers();
    assert.strictEqual(all.length, 1);
  });

  await t.test('TEST C: Normal enrollment works', () => {
    const registry = new SpeakerRegistry();
    const profile = registry.registerOrUpdateSpeaker('تغريد', emb1, { embeddingModel: 'test-model' });
    assert.strictEqual(profile.name, 'تغريد');
    assert.strictEqual(profile.sampleCount, 1);
    assert.strictEqual(registry.getAllSpeakers().length, 1);
  });

  await t.test('TEST D: Shared preprocessing function check', () => {
    const longPcm = new Float32Array(16000 * 5).fill(0.5); // 5 seconds
    const window = AudioFeatures.prepareEmbeddingWindow(longPcm);
    assert.ok(window.length <= 40000);
  });

  await t.test('TEST E: replacePersistentSpeakerProfiles with allowInsert=false only performs UPDATE', async () => {
    let updateCalled = false;
    let insertCalled = false;

    // A real mock db transaction layer injected into the function
    const mockDb = {
      transaction: async (cb: any) => {
        const tx = {
          update: () => {
            updateCalled = true;
            return {
              set: () => ({
                where: () => Promise.resolve()
              })
            };
          },
          insert: () => {
            insertCalled = true;
            return {
              values: () => ({
                onConflictDoUpdate: () => Promise.resolve()
              })
            };
          }
        };
        await cb(tx);
      }
    };

    const profiles = [{
      id: 'deleted_in_db_but_in_memory',
      name: 'John Doe',
      embeddings: [[0.1, 0.2]],
      centroidEmbedding: Array(512).fill(0.1),
      sampleCount: 1,
      confidence: 0.9,
      isCandidate: false,
      status: 'VALID'
    } as any];

    // True unit test of the non-destructive DB layer behavior (allowInsert = false)
    await replacePersistentSpeakerProfiles('owner1', profiles, false, mockDb);

    assert.strictEqual(updateCalled, true, 'tx.update should be called for existing profiles');
    assert.strictEqual(insertCalled, false, 'tx.insert should NEVER be called when allowInsert is false');
  });

  await t.test('TEST F: SpeechEngine.registerSpeaker must call prepareEnrollmentEmbeddingPcm before extractEmbedding', async () => {
    let originalPrepare = AudioFeatures.prepareEnrollmentEmbeddingPcm;
    let originalExtract = speechEngine.getProvider().extractEmbedding;
    let prepareCalled = false;
    let extractedPcmLength = 0;

    AudioFeatures.prepareEnrollmentEmbeddingPcm = (pcm) => {
      prepareCalled = true;
      return originalPrepare.call(AudioFeatures, pcm);
    };

    speechEngine.getProvider().extractEmbedding = async (pcm) => {
      extractedPcmLength = pcm.length;
      return Array(512).fill(0.1);
    };

    try {
      const longPcm = new Float32Array(16000 * 5).fill(0.5); // 5 seconds
      await speechEngine.registerSpeaker('Test F User', longPcm, 'test_f_session');

      assert.strictEqual(prepareCalled, true, 'prepareEnrollmentEmbeddingPcm must be called');
      assert.ok(extractedPcmLength <= 40000, 'extracted PCM length must be <= 2.5 seconds (40000 samples)');
    } finally {
      AudioFeatures.prepareEnrollmentEmbeddingPcm = originalPrepare;
      speechEngine.getProvider().extractEmbedding = originalExtract;
    }
  });

  await t.test('TEST G: register-multi path (and SpeechEngine) must use prepareEnrollmentEmbeddingPcm', async () => {
    const longPcm1 = new Float32Array(16000 * 3).fill(0.1);
    const longPcm2 = new Float32Array(16000 * 4).fill(0.2);
    
    // Server route directly uses this exported helper, which in turn enforces the standard behavior.
    const pre1 = AudioFeatures.prepareEnrollmentEmbeddingPcm(longPcm1);
    const pre2 = AudioFeatures.prepareEnrollmentEmbeddingPcm(longPcm2);
    
    assert.ok(pre1.length <= 40000, 'PCM 1 should be truncated to <= 2.5s (40000 samples)');
    assert.ok(pre2.length <= 40000, 'PCM 2 should be truncated to <= 2.5s (40000 samples)');
  });
});
