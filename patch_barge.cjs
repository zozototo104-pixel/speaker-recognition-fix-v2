const fs = require('fs');
let content = fs.readFileSync('src/components/VoiceChat.tsx', 'utf8');

// 1. Add refs
const refTarget = `  const audioUnderrunCountRef = useRef<number>(0);
  const queueStarvationCountRef = useRef<number>(0);
  const queueStarvationStartedAtRef = useRef<number>(0);
  const falseBargeInSuppressedCountRef = useRef<number>(0);`;
const refReplacement = `  const audioUnderrunCountRef = useRef<number>(0);
  const queueStarvationCountRef = useRef<number>(0);
  const queueStarvationStartedAtRef = useRef<number>(0);
  const falseBargeInSuppressedCountRef = useRef<number>(0);
  const bargeInSentForTurnRef = useRef<number>(-1);
  const lastProcessedInterruptIdRef = useRef<string>('');
  const currentChunkSeqRef = useRef<number>(0);`;

if (content.includes(refTarget)) {
    content = content.replace(refTarget, refReplacement);
    console.log("Refs patched");
}

fs.writeFileSync('src/components/VoiceChat.tsx', content, 'utf8');
