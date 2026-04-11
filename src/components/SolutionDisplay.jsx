import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Code2, Lightbulb, ListOrdered, GlobeIcon, Image as ImageIcon, ChevronDown } from 'lucide-react';
import { InteractivePlayer } from './InteractivePlayer';

export function SolutionDisplay({ data, header }) {
  const [activeLang, setActiveLang] = useState('english');
  const [activeCodeLang, setActiveCodeLang] = useState('python3');
  const [explanations, setExplanations] = useState({});
  const [codes, setCodes] = useState({});
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [playerState, setPlayerState] = useState({ isPlaying: false, index: -1 });

  React.useEffect(() => {
    if (data?.interactive_explanation) {
      setExplanations({ python3: { english: data.interactive_explanation } });
    }
    if (data?.code && typeof data.code !== 'string') {
      setCodes(data.code);
    } else if (typeof data.code === 'string') {
      setCodes({ python3: data.code });
    }
  }, [data]);

  const fetchExplanation = async (codeLang, spokenLang) => {
    if (explanations[codeLang]?.[spokenLang] || typeof data.code === 'string') return;

    setIsLoadingExplanation(true);
    try {
      const response = await fetch('http://localhost:3001/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          language: codeLang,
          code: codes[codeLang] || "",
          spokenLanguage: spokenLang
        })
      });
      if (response.ok) {
        const result = await response.json();
        if (result.interactive_explanation) {
          setExplanations(prev => ({
            ...prev,
            [codeLang]: {
              ...(prev[codeLang] || {}),
              [spokenLang]: result.interactive_explanation
            }
          }));
        }
        if (result.code && !codes[codeLang]) {
          setCodes(prev => ({ ...prev, [codeLang]: result.code }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  const handleCodeLangChange = (lang) => {
    setActiveCodeLang(lang);
    fetchExplanation(lang, activeLang);
  };

  const handleSpokenLangChange = (lang) => {
    setActiveLang(lang);
    fetchExplanation(activeCodeLang, lang);
  };

  if (!data) return null;

  const getDifficultyColor = (diff) => {
    switch (diff.toLowerCase()) {
      case 'easy': return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10 shadow-[0_0_20px_rgba(16,185,129,0.3)]';
      case 'medium': return 'text-amber-400 border-amber-400/30 bg-amber-400/10 shadow-[0_0_20px_rgba(245,158,11,0.3)]';
      case 'hard': return 'text-rose-400 border-rose-400/30 bg-rose-400/10 shadow-[0_0_20px_rgba(244,63,94,0.3)]';
      default: return 'text-slate-400 border-slate-400/30 bg-slate-400/10';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Graceful fallback if the API returns the old flat array format instead of an object
  const stepsToRender = Array.isArray(data.steps)
    ? data.steps
    : (data.steps && data.steps[activeLang]) || [];

  const codeToRender = typeof data.code === 'string'
    ? data.code
    : (codes[activeCodeLang]) || '// Generating code for this language...';

  // --- Education Helpers ---
  const isFocusMode = playerState.isPlaying;
  const currentExplanationArray = explanations[activeCodeLang]?.[activeLang] || data.interactive_explanation;
  const explanationLength = currentExplanationArray?.length || 0;
  
  // Calculate which English step to highlight based on how far we are in the code explanation
  const currentStepRatio = explanationLength > 1 && playerState.index >= 0 
    ? (playerState.index / (explanationLength - 1)) 
    : 0;
  const activeStepIndex = playerState.isPlaying 
    ? Math.min(stepsToRender.length - 1, Math.floor(currentStepRatio * stepsToRender.length))
    : -1;

  const parseAlgorithmText = (text) => {
    if (!text) return null;
    const terms = {
      'O\\(n\\)': 'Linear Time: Execution time grows directly in proportion to the input size.',
      'O\\(1\\)': 'Constant Time: Execution takes the exact same amount of computing time regardless of data size.',
      'Hash Map': 'A powerful fast-lookup table mapping unique keys to values.',
      'set': 'A fundamental mathematical collection that automatically filters out duplicate elements.',
      'descending': 'Sorting from largest to smallest (e.g. 9, 8, 7).',
      'unique': 'A collection containing no duplicates.',
      'array': 'A continuous list of sequential memory used to store elements.'
    };
    
    let parts = [text];
    Object.entries(terms).forEach(([term, def]) => {
      const regex = new RegExp(`\\b(${term})\\b`, 'gi');
      parts = parts.flatMap(p => {
         if (typeof p !== 'string') return [p];
         const splitStr = p.split(regex);
         return splitStr.map((val, idx) => {
            if (new RegExp(`^${term}$`, 'i').test(val)) {
              return (
                <span key={`${term}-${idx}`} className="relative group/tooltip inline-block cursor-help font-semibold text-amber-300 border-b border-dashed border-amber-400">
                  {val}
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-slate-900 border border-slate-700 text-white text-xs leading-relaxed rounded-xl shadow-2xl opacity-0 group-hover/tooltip:opacity-100 transition-all pointer-events-none z-50 text-center scale-95 group-hover/tooltip:scale-100">
                    {def}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-700"></div>
                  </span>
                </span>
              );
            }
            return val;
         });
      });
    });
    return parts;
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16 items-start"
    >
      {/* Left Column */}
      <div className="flex flex-col gap-8 w-full lg:sticky top-32">
        {header}
        
        {/* Title & Difficulty */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5 mx-2">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white flex items-center gap-3">
            <div className="p-1.5 rounded-xl bg-primary/20 backdrop-blur-sm border border-primary/30 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            {data.title}
          </h2>
          <span className={'px-3 py-1 text-xs font-semibold rounded-xl border backdrop-blur-md uppercase tracking-wider ' + getDifficultyColor(data.difficulty)}>
            {data.difficulty}
          </span>
        </motion.div>

        {/* Algorithm Approach */}
        <motion.section variants={itemVariants} className="glass-panel-deep rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] group-hover:bg-amber-500/10 transition-colors duration-700 pointer-events-none"></div>
          <h3 className={`flex items-center gap-3 text-2xl font-display font-semibold text-white mb-6 transition-opacity duration-500 ${isFocusMode ? 'opacity-40' : ''}`}>
            <div className="p-2 bg-amber-500/20 rounded-lg border border-amber-500/30">
              <Lightbulb className="w-6 h-6 text-amber-400" />
            </div>
            Algorithm Approach
          </h3>
          <p className={`text-slate-300 leading-relaxed text-lg font-sans transition-opacity duration-500 ${isFocusMode ? 'opacity-40' : ''}`}>
            {parseAlgorithmText(data.algorithm)}
          </p>

          {explanations[activeCodeLang]?.[activeLang] ? (
            <div className="mt-8 pt-4 border-t border-white/10 relative z-20">
              <InteractivePlayer explanationData={explanations[activeCodeLang][activeLang]} spokenLanguage={activeLang} onStateChange={setPlayerState} />
            </div>
          ) : isLoadingExplanation ? (
            <div className="mt-8 pt-4 border-t border-white/10 text-slate-400 text-sm italic flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              Generating Interactive Explainer in {activeLang.charAt(0).toUpperCase() + activeLang.slice(1)}...
            </div>
          ) : (
            data.interactive_explanation && (
              <div className="mt-8 pt-4 border-t border-white/10 relative z-20">
                <InteractivePlayer explanationData={data.interactive_explanation} spokenLanguage={activeLang} onStateChange={setPlayerState} />
              </div>
            )
          )}
        </motion.section>
      </div>

      {/* Right Column */}
      <div className="flex flex-col gap-8 w-full pt-4">
        
        {/* Step-by-Step */}
        <motion.section variants={itemVariants} className="glass-panel-deep rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] group-hover:bg-blue-500/10 transition-colors duration-700 pointer-events-none"></div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
            <h3 className="flex items-center gap-3 text-2xl font-display font-semibold text-white">
              <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                <ListOrdered className="w-6 h-6 text-blue-400" />
              </div>
              Step-by-Step Instructions
            </h3>

            {/* Language Tabs */}
            {!Array.isArray(data.steps) && (
              <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                <GlobeIcon className="w-4 h-4 text-slate-500 ml-2 mr-1 hidden sm:block" />
                {['english', 'hindi', 'hinglish'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleSpokenLangChange(lang)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${activeLang === lang
                        ? 'bg-blue-500/20 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.3)] border border-blue-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/10 border border-transparent'
                      }`}
                  >
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {stepsToRender.map((step, index) => {
              const isHighlighted = activeStepIndex === index;
              return (
              <div 
                key={index} 
                className={`flex items-start gap-4 p-3 rounded-xl transition-all duration-500 ${isHighlighted ? 'bg-blue-500/10 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)] scale-[1.02]' : 'border border-transparent'}`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center font-medium text-sm mt-0.5 transition-colors duration-500 ${isHighlighted ? 'bg-blue-500 text-white border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-blue-500/20 border-blue-500/30 text-blue-300'}`}>
                  {index + 1}
                </div>
                <p className={`pt-1 leading-relaxed transition-colors duration-500 ${isHighlighted ? 'text-white font-medium' : 'text-slate-300'}`}>
                  {step}
                </p>
              </div>
              );
            })}

            {stepsToRender.length === 0 && (
              <p className="text-slate-500 italic">No steps available in this language.</p>
            )}
          </div>
        </motion.section>

        {/* Code Solution */}
        <motion.section variants={itemVariants} className={`glass-panel-deep rounded-3xl overflow-hidden shadow-2xl relative transition-all duration-700 ${isFocusMode ? 'opacity-30 blur-[2px] grayscale pointer-events-none scale-95' : 'opacity-100'}`}>
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
          <div className="bg-black/60 backdrop-blur-md px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-white/10">
            <h3 className="flex items-center gap-3 font-display font-semibold text-xl text-white">
              <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
                <Code2 className="w-5 h-5 text-purple-400" />
              </div>
              Optimal Solution
            </h3>

            {/* Code Language Tabs */}
            {typeof data.code !== 'string' && (
              <div className="relative w-full sm:w-auto">
                <select
                  value={activeCodeLang}
                  onChange={(e) => handleCodeLangChange(e.target.value)}
                  className="appearance-none w-full sm:w-auto bg-black/40 px-4 py-1.5 pr-10 text-xs sm:text-sm font-medium text-purple-300 rounded-xl border border-white/5 shadow-[0_0_10px_rgba(168,85,247,0.15)] focus:outline-none focus:ring-2 focus:ring-purple-500/50 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {['python3', 'python', 'cpp', 'java', 'javascript', 'typescript', 'csharp', 'c', 'go', 'kotlin', 'swift', 'rust', 'ruby', 'php', 'dart', 'scala'].map((lang) => (
                    <option key={lang} value={lang} className="bg-slate-900 text-slate-300">
                      {lang === 'cpp' ? 'C++' : lang === 'csharp' ? 'C#' : lang === 'javascript' ? 'JavaScript' : lang === 'typescript' ? 'TypeScript' : lang === 'php' ? 'PHP' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            )}

            <div className="hidden sm:flex gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80 shadow-[0_0_5px_rgba(244,63,94,0.5)]"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80 shadow-[0_0_5px_rgba(245,158,11,0.5)]"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
            </div>
          </div>
          <div className="p-8 overflow-x-auto min-h-[200px] max-h-[500px] overflow-y-auto bg-[#030712] selection:bg-purple-500/30 relative scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <pre className="text-[15px] text-slate-300 font-mono leading-relaxed">
              <code>{codeToRender}</code>
            </pre>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
