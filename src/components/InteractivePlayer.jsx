import React, { useEffect, useRef, useState } from 'react';
import { Play, Square, Volume2 } from 'lucide-react';

export function InteractivePlayer({ explanationData, spokenLanguage = 'english' }) {
  const [playingIndex, setPlayingIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const isPlayingRef = useRef(false);
  const currentIndexRef = useRef(-1);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const stop = () => {
    isPlayingRef.current = false;
    currentIndexRef.current = -1;
    setPlayingIndex(-1);
    setIsPlaying(false);
    window.speechSynthesis.cancel();
  };

  const playLine = (index) => {
    if (!explanationData || index >= explanationData.length) {
      stop();
      return;
    }
    
    // Check if browser supports Speech Synthesis
    if (!window.speechSynthesis) {
        console.warn("Speech Synthesis not supported in this browser.");
        return;
    }

    window.speechSynthesis.cancel();
    
    isPlayingRef.current = true;
    currentIndexRef.current = index;
    setPlayingIndex(index);
    setIsPlaying(true);

    const utterance = new SpeechSynthesisUtterance(explanationData[index].explanation);
    utterance.rate = 1.0;

    // Set corresponding language for TTS Voice
    if (spokenLanguage === 'hindi' || spokenLanguage === 'hinglish') {
        utterance.lang = 'hi-IN';
    } else {
        // default to English
        utterance.lang = 'en-US';
    }
    
    // Attempt to set a native voice for higher quality
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
        const langPrefix = utterance.lang.split('-')[0];
        const targetVoice = voices.find(v => v.lang.startsWith(langPrefix));
        if (targetVoice) utterance.voice = targetVoice;
    }
    
    utterance.onend = (event) => {
      // Advance to next line only if the sequence wasn't interrupted by user mouse hover
      if (isPlayingRef.current && currentIndexRef.current === index) {
         playLine(index + 1);
      }
    };
    
    utterance.onerror = () => {
        // Handle cancel events silently to prevent advancing skip bugs
    };

    window.speechSynthesis.speak(utterance);
  };

  if (!explanationData || !Array.isArray(explanationData) || explanationData.length === 0) return null;

  return (
    <div className="bg-[#0f111a]/80 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden my-6 shadow-xl">
      <div className="bg-[#1a1d27] px-4 py-3 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2 text-blue-300 font-semibold">
          <Volume2 className="w-5 h-5 text-blue-400" />
          Interactive Video Explainer
        </div>
        <div className="flex gap-2">
          {!isPlaying ? (
            <button 
              onClick={() => playLine(0)}
              className="px-4 py-1.5 flex items-center gap-1.5 bg-green-500/20 text-green-300 hover:bg-green-500/30 rounded-md text-sm font-medium transition-colors"
            >
              <Play className="w-4 h-4" /> Play Explanation
            </button>
          ) : (
            <button 
              onClick={stop}
              className="px-4 py-1.5 flex items-center gap-1.5 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-md text-sm font-medium transition-colors"
            >
              <Square className="w-4 h-4" /> Stop
            </button>
          )}
        </div>
      </div>
      <div className="p-4 font-mono text-sm overflow-x-auto min-h-[150px] leading-loose">
        {explanationData.map((item, index) => {
          const isHeading = item.code.trim().startsWith('---');
          
          let baseStyles = isHeading 
            ? 'px-4 py-3 my-4 cursor-pointer rounded-lg transition-all font-sans font-bold text-center tracking-widest bg-purple-500/10 border border-purple-500/20'
            : 'px-4 py-2 cursor-pointer rounded transition-all whitespace-pre font-mono text-sm';
          
          let stateStyles = '';
          if (playingIndex === index) {
            stateStyles = isHeading 
              ? 'bg-purple-500/30 text-purple-100 border-l-4 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
              : 'bg-blue-500/30 text-white font-medium border-l-4 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]';
          } else {
            stateStyles = isHeading
              ? 'text-purple-300 hover:bg-purple-500/20 opacity-90 hover:opacity-100'
              : 'text-slate-300 hover:bg-white/5 border-l-4 border-transparent opacity-80 hover:opacity-100';
          }

          return (
            <div 
              key={index} 
              onMouseEnter={() => playLine(index)}
              className={`${baseStyles} ${stateStyles}`}
            >
              {isHeading ? item.code.replace(/-/g, '').trim() : item.code}
            </div>
          );
        })}
      </div>
    </div>
  );
}
