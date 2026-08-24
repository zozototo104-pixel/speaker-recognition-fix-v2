const fs = require('fs');
let content = fs.readFileSync('src/components/VoiceChat.tsx', 'utf8');

const target = `      if (!isCurrentlyPlaying && audioQueueRef.current.length > 0 && queueStarvationStartedAtRef.current > 0) {
          const starvationDurationMs = Date.now() - queueStarvationStartedAtRef.current;
          console.log(\`[SCHED_DIAG] Recovering from starvation. starvationDuration=\${starvationDurationMs}ms bufferedChunksAtResume=\${audioQueueRef.current.length}\`);
          queueStarvationStartedAtRef.current = 0; // Reset
      }`;

const replacement = `      if (!isCurrentlyPlaying && audioQueueRef.current.length > 0 && queueStarvationStartedAtRef.current > 0) {
          const starvationDurationMs = Date.now() - queueStarvationStartedAtRef.current;
          const nextSeq = audioQueueRef.current[0]?.meta?.sequence || '?';
          console.log(\`[SCHED_DIAG] turnId=\${currentAiTurnIdRef.current} nextReceivedChunkSeq=\${nextSeq} schedulerWaitMs=\${starvationDurationMs} bufferedChunksAtResume=\${audioQueueRef.current.length}\`);
          queueStarvationStartedAtRef.current = 0; // Reset
      }`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/components/VoiceChat.tsx', content, 'utf8');
    console.log("Success");
} else {
    console.log("Target not found");
}
