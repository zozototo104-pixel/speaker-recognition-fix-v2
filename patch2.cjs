const fs = require('fs');
let content = fs.readFileSync('src/components/VoiceChat.tsx', 'utf8');
const target = `      const isCurrentlyPlaying = sourcesRef.current.length > 0;
      // Pre-buffering: require at least 2 chunks (~80-120ms) only when starting a new turn from complete silence
      if (!isCurrentlyPlaying && audioQueueRef.current.length < 2 && isAiTurnInProgressRef.current) {
         // Log silently without polluting UI
         console.log(\`[SCHED_DIAG] Pre-buffering. Waiting for 2 chunks. currentQueue=\${audioQueueRef.current.length}\`);
         return;
      }

      while (audioQueueRef.current.length > 0) {`;
const replacement = `      const isCurrentlyPlaying = sourcesRef.current.length > 0;
      
      if (!isCurrentlyPlaying && audioQueueRef.current.length > 0 && queueStarvationStartedAtRef.current > 0) {
          const starvationDurationMs = Date.now() - queueStarvationStartedAtRef.current;
          console.log(\`[SCHED_DIAG] Recovering from starvation. starvationDuration=\${starvationDurationMs}ms bufferedChunksAtResume=\${audioQueueRef.current.length}\`);
          queueStarvationStartedAtRef.current = 0; // Reset
      }

      while (audioQueueRef.current.length > 0) {`;
if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/components/VoiceChat.tsx', content, 'utf8');
    console.log("Success");
} else {
    console.log("Target not found");
}
