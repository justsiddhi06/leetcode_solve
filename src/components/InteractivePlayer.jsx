import React, { useEffect, useRef, useState } from 'react';
import { Play, Square, Volume2 } from 'lucide-react';

export function InteractivePlayer({ explanationData, spokenLanguage = 'english', onStateChange }) {
  const [playingIndex, setPlayingIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const isPlayingRef = useRef(false);
  const currentIndexRef = useRef(-1);

  useEffect(() => {
    if (onStateChange) {
      onStateChange({ isPlaying, playingIndex });
    }
  }, [isPlaying, playingIndex, onStateChange]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (onStateChange) onStateChange({ isPlaying: false, playingIndex: -1 });
    };
  }, [onStateChange]);

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

  const highlightCode = (codeStr) => {
    // Simple basic syntax highlighting logic for Python/JS keywords
    const keywords = /\b(class|def|var|let|const|function|return|if|else|for|while|import|from|self|True|False|None)\b/g;
    const types = /\b(int|float|str|bool|list|dict|String|Number|Boolean)\b/g;
    const strings = /(['"].*?['"])/g;
    const comments = /(#.*|\/\/.*)/g;
    
    let html = codeStr
      .replace(comments, '<span class="text-slate-500 italic">$&</span>')
      .replace(strings, '<span class="text-green-400">$&</span>')
      .replace(keywords, '<span class="text-purple-400 font-medium">$&</span>')
      .replace(types, '<span class="text-yellow-300">$&</span>');
      
    // function calls
    html = html.replace(/(\w+)(?=\()/g, (match, p1) => {
      // Don't colorize keywords if they match function signature
      if (/^(if|for|while|def|class|return)$/.test(p1)) return p1;
      return `<span class="text-blue-400">${p1}</span>`;
    });

    return html;
  };

  const containerRef = useRef(null);
  const lineRefs = useRef([]);

  useEffect(() => {
    if (playingIndex >= 0 && lineRefs.current[playingIndex]) {
      lineRefs.current[playingIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [playingIndex]);

  if (!explanationData || !Array.isArray(explanationData) || explanationData.length === 0) return null;

  return (
    <div className="rounded-2xl overflow-hidden my-6 shadow-2xl border border-white/5 bg-[#0a0a0f] font-mono">
      {/* Mac-like Header */}
      <div className="bg-[#12121a] px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-b border-white/5 gap-4">
        <div className="flex items-center w-full sm:w-auto">
          <div className="flex gap-2 mr-6">
            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          </div>
          <div className="flex items-center gap-2 text-slate-300 text-sm tracking-wide bg-white/5 px-3 py-1 rounded-full border border-white/5">
            <Volume2 className="w-4 h-4 text-blue-400" />
            <span>Interactive Explainer</span>
          </div>
        </div>
        <div className="flex gap-2">
          {!isPlaying ? (
            <button 
              onClick={() => playLine(0)}
              className="px-4 py-1.5 flex items-center gap-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 rounded-full text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-[0_0_10px_rgba(59,130,246,0.1)]"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Play Flow
            </button>
          ) : (
            <button 
              onClick={stop}
              className="px-4 py-1.5 flex items-center gap-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/40 rounded-full text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-[0_0_10px_rgba(244,63,94,0.1)]"
            >
              <Square className="w-3.5 h-3.5 fill-current" /> Stop
            </button>
          )}
        </div>
      </div>
      
      {/* Code Editor body */}
      <div 
        ref={containerRef}
        className="py-4 overflow-y-auto overflow-x-auto min-h-[220px] max-h-[350px] text-[14px] leading-[1.6] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
      >
        {explanationData.map((item, index) => (
          <div 
            key={index} 
            ref={(el) => (lineRefs.current[index] = el)}
            onMouseEnter={() => playLine(index)}
            className={`px-4 cursor-pointer transition-colors duration-150 whitespace-pre flex items-stretch ${
              playingIndex === index 
                ? 'bg-blue-500/20 border-l-[3px] border-blue-400 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]' 
                : 'hover:bg-white/5 border-l-[3px] border-transparent'
            }`}
          >
            <div className={`w-8 flex-shrink-0 text-right pr-4 select-none flex items-center justify-end ${playingIndex === index ? 'text-blue-400 font-medium' : 'text-slate-600'}`}>
              {index + 1}
            </div>
            <div 
              className={`py-0.5 flex-1 ${playingIndex === index ? 'text-white' : 'text-slate-300'}`}
              dangerouslySetInnerHTML={{ __html: highlightCode(item.code) }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
