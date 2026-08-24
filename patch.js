const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');
const target = `    const publishSpeakerResult = async (diagResult: any, isCalibration = false, phase: 'PROBE' | 'FINAL' = 'FINAL') => {
      if (!diagResult) return;
      if (diagResult.identitySource === 'VERIFIED') {
        activeSpeakerAttribution = {
          speakerId: diagResult.speakerId || null,
          speakerName: diagResult.name || 'متحدث غير معروف',
          speakerConfidence: confidenceToNumber(diagResult.confidence),
          identitySource: 'VERIFIED',
        };
      } else if (phase === 'FINAL') {
        activeSpeakerAttribution = {
          speakerId: diagResult.speakerId || null,
          speakerName: diagResult.name || 'متحدث غير معروف',
          speakerConfidence: confidenceToNumber(diagResult.confidence),
          identitySource: diagResult.identitySource || 'UNKNOWN',
        };
      }
      if (clientWs.readyState === clientWs.OPEN) {
        clientWs.send(JSON.stringify({`;
        
const replacement = `    const publishSpeakerResult = async (diagResult: any, isCalibration = false, phase: 'PROBE' | 'FINAL' = 'FINAL') => {
      if (!diagResult) return;
      const rawSimilarity = diagResult.similarity !== undefined ? diagResult.similarity : -1;
      const rawSpeaker = diagResult.name || 'UNKNOWN';
      const currentTurn = liveTurnSequence;
      
      let action = 'RETAINED';
      let reason = 'NO_CHANGE';

      if (diagResult.identitySource === 'VERIFIED') {
        activeSpeakerAttribution = {
          speakerId: diagResult.speakerId || null,
          speakerName: diagResult.name || 'متحدث غير معروف',
          speakerConfidence: confidenceToNumber(diagResult.confidence),
          identitySource: 'VERIFIED',
        };
        activeSpeakerTurnId = currentTurn;
        action = 'UPDATED';
        reason = 'VERIFIED_MATCH';
      } else if (phase === 'FINAL') {
        // Temporal stabilization: Keep verified identity within the same turn if the new result is weak/unknown
        if (activeSpeakerAttribution.identitySource === 'VERIFIED' && activeSpeakerTurnId === currentTurn) {
          action = 'RETAINED';
          reason = 'TEMPORAL_STABILIZATION';
        } else {
          activeSpeakerAttribution = {
            speakerId: diagResult.speakerId || null,
            speakerName: diagResult.name || 'متحدث غير معروف',
            speakerConfidence: confidenceToNumber(diagResult.confidence),
            identitySource: diagResult.identitySource || 'UNKNOWN',
          };
          activeSpeakerTurnId = currentTurn;
          action = 'UPDATED';
          reason = 'FINAL_OVERWRITE';
        }
      }

      console.log(\`[SPEAKER_STABILITY] rawSpeaker=\${rawSpeaker} rawSimilarity=\${rawSimilarity.toFixed(4)} stableSpeaker=\${activeSpeakerAttribution.speakerName} stableSimilarity=\${activeSpeakerAttribution.identitySource === 'VERIFIED' ? 'HIGH' : 'LOW'} action=\${action} reason=\${reason} turnId=\${currentTurn}\`);

      if (clientWs.readyState === clientWs.OPEN) {
        clientWs.send(JSON.stringify({`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('server.ts', content, 'utf8');
    console.log("Success");
} else {
    console.log("Target not found");
}
