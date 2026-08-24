const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const syncFunc = `
  const syncDbProfiles = async (scope: string, uid: string) => {
    const { getPersistentSpeakerProfiles } = await import('./src/db/speakers.ts');
    const persistentProfiles = await getPersistentSpeakerProfiles(uid);
    const registry = speechEngine.getSessionRegistry(scope);
    registry.importProfiles(persistentProfiles);
    console.log(\`[Speaker:RegistrySync] scope=\${scope} persistentProfiles=\${persistentProfiles.length} loadedProfiles=\${registry.getAllSpeakers().length}\`);
  };

  app.post('/api/speech/register',`;

code = code.replace("  app.post('/api/speech/register',", syncFunc);

const registerTarget = `      const scope = await resolveOwnedSpeakerScope(req, sessionId);
      // registerSpeaker with Float32Array triggers server-side ONNX extraction`;

const registerReplace = `      const scope = await resolveOwnedSpeakerScope(req, sessionId);
      await syncDbProfiles(scope, req.user.uid);
      // registerSpeaker with Float32Array triggers server-side ONNX extraction`;

code = code.replace(registerTarget, registerReplace);

const registerMultiTarget = `      const scope = await resolveOwnedSpeakerScope(req, sessionId);
      const registry = speechEngine.getSessionRegistry(scope);`;

const registerMultiReplace = `      const scope = await resolveOwnedSpeakerScope(req, sessionId);
      await syncDbProfiles(scope, req.user.uid);
      const registry = speechEngine.getSessionRegistry(scope);`;

code = code.replace(registerMultiTarget, registerMultiReplace);

const promoteTarget = `      const scope = await resolveOwnedSpeakerScope(req, sessionId);
      const profile = speechEngine.promoteCandidate(candidateId, name, scope);`;

const promoteReplace = `      const scope = await resolveOwnedSpeakerScope(req, sessionId);
      await syncDbProfiles(scope, req.user.uid);
      const profile = speechEngine.promoteCandidate(candidateId, name, scope);`;

code = code.replace(promoteTarget, promoteReplace);

fs.writeFileSync('server.ts', code);
