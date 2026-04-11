import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Video } from 'lucide-react';

export function VideoExplainer({ videoData, spokenLanguage = 'english', onComplete }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [view, setView] = useState('demo'); // 'demo' or 'complexity'
  const [currentStep, setCurrentStep] = useState(0);

  const { demo, complexity } = videoData;
  const isPlayingRef = useRef(false);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const stop = () => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    window.speechSynthesis.cancel();
    setCurrentStep(0);
    setView('demo');
  };

  const playSequence = async () => {
    if (!demo && !complexity) return;
    
    // Check if browser supports Speech Synthesis
    if (!window.speechSynthesis) {
      console.warn("Speech Synthesis not supported in this browser.");
      return;
    }

    stop(); // reset
    isPlayingRef.current = true;
    setIsPlaying(true);
    setView('demo');
    setCurrentStep(0);

    if (demo && demo.steps && demo.steps.length > 0) {
      for (let i = 0; i < demo.steps.length; i++) {
        if (!isPlayingRef.current) break;
        setCurrentStep(i);
        await speakText(demo.steps[i].explanation);
      }
    }

    if (!isPlayingRef.current) return;
    
    if (complexity) {
      setView('complexity');
      await speakText(complexity.explanation);
    }

    if (isPlayingRef.current) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      if (onComplete) onComplete();
    }
  };

  const speakText = (text) => {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;

      if (spokenLanguage === 'hindi' || spokenLanguage === 'hinglish') {
        utterance.lang = 'hi-IN';
      } else {
        utterance.lang = 'en-US';
      }

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const langPrefix = utterance.lang.split('-')[0];
        const targetVoice = voices.find(v => v.lang.startsWith(langPrefix));
        if (targetVoice) utterance.voice = targetVoice;
      }

      utterance.onend = () => {
        resolve();
      };

      utterance.onerror = () => {
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  };

  if (!demo && !complexity) return null;

  return (
    <div className="bg-[#0a0b10]/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden my-8 shadow-[0_8px_32px_rgba(0,0,0,0.6)] relative min-h-[450px] flex flex-col">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 h-1 bg-white/5 w-full z-20">
        <motion.div 
          className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
          animate={{ width: view === 'demo' && demo ? `${((currentStep + 1) / demo.steps.length) * 100}%` : '100%' }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      <div className="bg-[#12151e]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-white/5 relative z-10 pt-5">
        <div className="flex items-center gap-3 text-purple-200 font-semibold tracking-wide">
          <div className="p-1.5 bg-purple-500/20 rounded-lg">
            <Video className="w-5 h-5 text-purple-400" />
          </div>
          Interactive Explanation
        </div>
        <div className="flex gap-2">
          {!isPlaying ? (
             <button 
               onClick={playSequence}
               className="px-4 py-1.5 flex items-center gap-1.5 bg-green-500/20 text-green-300 hover:bg-green-500/30 rounded-md text-sm font-medium transition-colors"
             >
               <Play className="w-4 h-4" /> Play Visualizer
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

      <div className="flex-1 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0f18] to-black flex flex-col items-center justify-center p-6 md:p-10 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-600/10 blur-[80px] rounded-full pointer-events-none"></div>

        <AnimatePresence mode="wait">
          {view === 'demo' && demo && (
            <motion.div 
              key="demo-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full max-w-4xl flex flex-col items-center relative z-10"
            >
              <div className="w-full flex justify-between items-center mb-16 px-2 md:px-8">
                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 font-medium text-sm md:text-base shadow-lg backdrop-blur-sm">
                  {demo.title}
                </span>
                {demo.target && (
                  <span className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-purple-500/20 text-indigo-100 font-mono text-sm md:text-base flex items-center gap-3 shadow-[0_4px_20px_rgba(168,85,247,0.15)] backdrop-blur-md">
                    Target <span className="text-yellow-400 font-bold text-lg md:text-xl drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">{demo.target}</span>
                  </span>
                )}
              </div>

              {demo.array && (
                <div className="flex items-center justify-center gap-4 md:gap-5 mb-10 flex-wrap">
                  {demo.array.map((val, idx) => {
                    const activeIndices = demo.steps[currentStep]?.active_indices || [];
                    const isActive = activeIndices.includes(idx);
                    const textStr = String(val);
                    const isLongText = textStr.length > 3;
                    
                    return (
                      <motion.div
                        key={idx}
                        layout
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ 
                          y: 0, 
                          opacity: 1,
                          scale: isActive ? 1.05 : 1,
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className={`
                          relative min-h-[4rem] md:min-h-[5rem] rounded-2xl flex flex-col items-center justify-center 
                          font-bold font-mono transition-all duration-500 shadow-2xl whitespace-nowrap
                          ${isLongText ? 'min-w-[6rem] px-5 pt-3 pb-6 text-sm md:text-base' : 'w-16 md:w-20 pt-2 pb-5 text-2xl md:text-3xl'}
                          ${isActive 
                            ? 'bg-gradient-to-b from-[#1a1f35] to-[#111424] border-2 border-yellow-400/80 text-yellow-50 shadow-[0_0_30px_rgba(250,204,21,0.3)] z-10 scale-110 -translate-y-2' 
                            : 'bg-gradient-to-b from-[#141824] to-[#0c0e15] border border-white/10 text-slate-300 opacity-80 hover:opacity-100'
                          }
                        `}
                      >
                        <span className="flex-1 flex items-center">{val}</span>
                        <span className={`absolute bottom-1.5 right-2 text-[10px] md:text-xs font-mono 
                          ${isActive ? 'text-blue-300' : 'text-blue-500'}
                        `}>
                          {idx}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {demo.steps[currentStep]?.output && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 font-mono text-blue-100 shadow-[0_0_20px_rgba(59,130,246,0.15)] text-lg md:text-xl backdrop-blur-md"
                >
                  {demo.steps[currentStep].output}
                </motion.div>
              )}
            </motion.div>
          )}

          {view === 'complexity' && complexity && (
            <motion.div 
              key="complexity-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-3xl flex flex-col items-center"
            >
              <h3 className="text-3xl font-bold text-white mb-16">{complexity.approach}</h3>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 w-full">
                {complexity.pseudo_code && (
                  <div className="bg-[#161b22] border border-white/10 rounded-xl p-6 shadow-2xl relative overflow-hidden flex-1 max-w-[300px]">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    <span className="text-slate-400 text-xs font-mono mb-3 block">Approach</span>
                    <pre className="text-slate-200 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                      {complexity.pseudo_code}
                    </pre>
                  </div>
                )}

                <div className="relative flex items-center justify-center w-48 h-48 md:w-56 md:h-56">
                  {/* Glowing ring animation */}
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-[6px] border-t-red-500 border-r-red-500/30 border-b-red-500/10 border-l-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.2)] opacity-80"
                  />
                  <div className="absolute inset-2 rounded-full border-[2px] border-white/5 bg-black/40 backdrop-blur-sm" />
                  
                  <div className="relative z-10 flex flex-col items-center justify-center">
                    <span className="text-slate-400 font-mono text-sm mb-1 uppercase tracking-wider">Time</span>
                    <span className="text-4xl text-red-400 font-mono font-bold">{complexity.time}</span>
                    {complexity.space && (
                      <span className="text-slate-500 text-xs mt-2 font-mono">Space: {complexity.space}</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Explanation Text at bottom (Subtitles) */}
      <div className="bg-[#0c0e15]/90 backdrop-blur-2xl border-t border-white/10 p-6 md:p-10 text-center min-h-[140px] flex items-center justify-center relative z-20 transition-colors shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <AnimatePresence mode="wait">
          <motion.p
            key={view + currentStep}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ duration: 0.3 }}
            className="text-slate-100 text-xl md:text-2xl lg:text-3xl font-light tracking-wide max-w-4xl mx-auto leading-relaxed"
          >
            <span className="text-blue-500/50 font-serif text-4xl leading-none mr-2">"</span>
            {view === 'demo' ? demo?.steps[currentStep]?.explanation : complexity?.explanation}
            <span className="text-purple-500/50 font-serif text-4xl leading-none ml-2">"</span>
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
