const fs = require('fs');
let content = fs.readFileSync('src/components/VoiceChat.tsx', 'utf8');

const target = `  const handleBargeIn = useCallback((
    reason: string = 'USER_BARGE_IN',
    vadMetrics?: { rms: number; noiseFloor: number; threshold: number; frames: number; isAiPlaying: boolean }
  ) => {
    if (sourcesRef.current.length > 0 || audioQueueRef.current.length > 0) {
      if (vadMetrics) {
        addDebugLog(\`[BARGE_DIAG] reason=\${reason} turnId=\${currentAiTurnIdRef.current} rms=\${vadMetrics.rms.toFixed(5)} threshold=\${vadMetrics.threshold.toFixed(5)} noiseFloor=\${vadMetrics.noiseFloor.toFixed(5)} frames=\${vadMetrics.frames} aiPlaying=\${vadMetrics.isAiPlaying} activeSources=\${sourcesRef.current.length} queueDepth=\${audioQueueRef.current.length}\`);
      }
      stopPlayback(reason, currentAiTurnIdRef.current);
      interruptionCountRef.current += 1;
      setInterruptionCount(interruptionCountRef.current);
      setConversationState('INTERRUPTED');
      
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        addDebugLog(\`[WS_INTERRUPT] Sending type: 'interrupt' targetTurnId=\${currentAiTurnIdRef.current} to server.\`);
        wsRef.current.send(JSON.stringify({ type: 'interrupt', targetTurnId: currentAiTurnIdRef.current }));
      }
      setTimeout(() => {
        setConversationState('USER_SPEAKING');
      }, 120);
    }
  }, [addDebugLog, stopPlayback]);`;

const replacement = `  const handleBargeIn = useCallback((
    reason: string = 'USER_BARGE_IN',
    vadMetrics?: { rms: number; noiseFloor: number; threshold: number; frames: number; isAiPlaying: boolean }
  ) => {
    if (sourcesRef.current.length > 0 || audioQueueRef.current.length > 0) {
      if (vadMetrics) {
        addDebugLog(\`[BARGE_DIAG] reason=\${reason} turnId=\${currentAiTurnIdRef.current} rms=\${vadMetrics.rms.toFixed(5)} threshold=\${vadMetrics.threshold.toFixed(5)} noiseFloor=\${vadMetrics.noiseFloor.toFixed(5)} frames=\${vadMetrics.frames} aiPlaying=\${vadMetrics.isAiPlaying} activeSources=\${sourcesRef.current.length} queueDepth=\${audioQueueRef.current.length}\`);
      }
      
      const currentTurn = currentAiTurnIdRef.current;
      if (bargeInSentForTurnRef.current === currentTurn) {
        addDebugLog(\`[INTERRUPT_DIAG] Ignored duplicate \${reason} for turnId=\${currentTurn}\`);
        return;
      }
      bargeInSentForTurnRef.current = currentTurn;
      const interruptRequestId = \`req_\${currentTurn}_\${Date.now()}\`;

      stopPlayback(reason, currentTurn, interruptRequestId);
      interruptionCountRef.current += 1;
      setInterruptionCount(interruptionCountRef.current);
      setConversationState('INTERRUPTED');
      
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        addDebugLog(\`[WS_INTERRUPT] Sending type: 'interrupt' targetTurnId=\${currentTurn} interruptRequestId=\${interruptRequestId} to server.\`);
        wsRef.current.send(JSON.stringify({ type: 'interrupt', targetTurnId: currentTurn, interruptRequestId }));
      }
      setTimeout(() => {
        setConversationState('USER_SPEAKING');
      }, 120);
    }
  }, [addDebugLog, stopPlayback]);`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    console.log("handleBargeIn patched");
} else {
    console.log("handleBargeIn target not found");
}

fs.writeFileSync('src/components/VoiceChat.tsx', content, 'utf8');
