const fs = require('fs');
let content = fs.readFileSync('src/components/VoiceChat.tsx', 'utf8');

const target = `    if (!isAiTurnInProgressRef.current) {
        nextStartTimeRef.current = 0;
        if (meta?.turnId) currentAiTurnIdRef.current = meta.turnId;
        addDebugLog(\`[TURN_START] Received first chunk for new turn \${meta?.turnId || '?'}. Resetting playback scheduler.\`);
    }
    isAiTurnInProgressRef.current = true;

    const duration = pcm.length / 24000;
    const chunkId = meta?.chunkId || \`chunk_\${Date.now()}_\${Math.random()}\`;
    
    audioQueueRef.current.push({
      id: chunkId,
      pcm,
      duration,
      meta: {
        ...meta,
        queueDepthAtReceive: audioQueueRef.current.length,
        sequence: chunkCountRef.current
      }
    });`;

const replacement = `    if (!isAiTurnInProgressRef.current) {
        nextStartTimeRef.current = 0;
        if (meta?.turnId) currentAiTurnIdRef.current = meta.turnId;
        addDebugLog(\`[TURN_START] Received first chunk for new turn \${meta?.turnId || '?'}. Resetting playback scheduler.\`);
    }
    isAiTurnInProgressRef.current = true;

    const duration = pcm.length / 24000;
    const chunkId = meta?.chunkId || \`chunk_\${Date.now()}_\${Math.random()}\`;
    
    const seq = currentChunkSeqRef.current + 1;
    currentChunkSeqRef.current = seq;
    const networkTransitMs = meta?.serverTimestamp ? now - meta.serverTimestamp : -1;

    audioQueueRef.current.push({
      id: chunkId,
      pcm,
      duration,
      meta: {
        ...meta,
        queueDepthAtReceive: audioQueueRef.current.length,
        sequence: seq,
        networkTransitMs,
        decodedAt: now
      }
    });
    
    console.log(\`[AUDIO_PIPELINE_RECEIVE] turnId=\${meta?.turnId || currentAiTurnIdRef.current} chunkSeq=\${seq} networkTransitMs=\${networkTransitMs} decodedAt=\${now}\`);`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/components/VoiceChat.tsx', content, 'utf8');
    console.log("Success");
} else {
    console.log("Target not found");
}
