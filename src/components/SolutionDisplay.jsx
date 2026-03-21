import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Code2, Lightbulb, ListOrdered, GlobeIcon, Image as ImageIcon } from 'lucide-react';
import { InteractivePlayer } from './InteractivePlayer';

export function SolutionDisplay({ data }) {
  const [activeLang, setActiveLang] = useState('english');
  const [activeCodeLang, setActiveCodeLang] = useState('python3');
  const [explanations, setExplanations] = useState({});
  const [codes, setCodes] = useState({});
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);

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
      case 'easy': return 'text-green-400 border-green-400/20 bg-green-400/10';
      case 'medium': return 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10';
      case 'hard': return 'text-red-400 border-red-400/20 bg-red-400/10';
      default: return 'text-slate-400 border-slate-400/20 bg-slate-400/10';
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto w-full px-4 pb-20"
    >
      {/* Title & Difficulty */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/5">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-primary" />
          {data.title}
        </h2>
        <span className={'px-3 py-1 text-sm font-semibold rounded-full border ' + getDifficultyColor(data.difficulty)}>
          {data.difficulty}
        </span>
      </motion.div>

      <div className="grid grid-cols-1 gap-8">

        {/* Algorithm Approach */}
        <motion.section variants={itemVariants} className="bg-secondary/40 border border-white/5 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <h3 className="flex items-center gap-2 text-xl font-semibold text-white mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            Algorithm Approach
          </h3>
          <p className="text-slate-300 leading-relaxed text-lg">
            {data.algorithm}
          </p>

          {explanations[activeCodeLang]?.[activeLang] ? (
            <div className="mt-8 pt-4 border-t border-white/10">
              <InteractivePlayer explanationData={explanations[activeCodeLang][activeLang]} spokenLanguage={activeLang} />
            </div>
          ) : isLoadingExplanation ? (
            <div className="mt-8 pt-4 border-t border-white/10 text-slate-400 text-sm italic flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              Generating Interactive Explainer in {activeLang.charAt(0).toUpperCase() + activeLang.slice(1)}...
            </div>
          ) : (
            data.interactive_explanation && (
              <div className="mt-8 pt-4 border-t border-white/10">
                <InteractivePlayer explanationData={data.interactive_explanation} spokenLanguage={activeLang} />
              </div>
            )
          )}
        </motion.section>

        {/* Step-by-Step */}
        <motion.section variants={itemVariants} className="bg-secondary/40 border border-white/5 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h3 className="flex items-center gap-2 text-xl font-semibold text-white">
              <ListOrdered className="w-5 h-5 text-blue-400" />
              Step-by-Step Instructions
            </h3>

            {/* Language Tabs */}
            {!Array.isArray(data.steps) && (
              <div className="flex items-center gap-1 bg-[#0f111a] p-1 rounded-lg border border-white/10">
                <GlobeIcon className="w-4 h-4 text-slate-500 ml-2 mr-1 hidden sm:block" />
                {['english', 'hindi', 'hinglish'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleSpokenLangChange(lang)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeLang === lang
                        ? 'bg-blue-500/20 text-blue-300 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                  >
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {stepsToRender.map((step, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-300 font-medium text-sm mt-0.5">
                  {index + 1}
                </div>
                <p className="text-slate-300 pt-1 leading-relaxed">
                  {step}
                </p>
              </div>
            ))}

            {stepsToRender.length === 0 && (
              <p className="text-slate-500 italic">No steps available in this language.</p>
            )}
          </div>
        </motion.section>

        {/* Code Solution */}
        <motion.section variants={itemVariants} className="bg-[#0f111a] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-[#1a1d27] px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5">
            <h3 className="flex items-center gap-2 font-semibold text-slate-200">
              <Code2 className="w-5 h-5 text-purple-400" />
              Optimal Solution
            </h3>

            {/* Code Language Tabs */}
            {typeof data.code !== 'string' && (
              <div className="flex flex-wrap items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5 w-full sm:w-auto overflow-x-auto max-h-32">
                {['python3', 'python', 'cpp', 'java', 'javascript', 'typescript', 'csharp', 'c', 'go', 'kotlin', 'swift', 'rust', 'ruby', 'php', 'dart', 'scala', 'elixir', 'erlang', 'racket'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleCodeLangChange(lang)}
                    className={`flex-none px-3 py-1 text-xs sm:text-sm font-medium rounded-md transition-all ${activeCodeLang === lang
                        ? 'bg-purple-500/20 text-purple-300 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                  >
                    {lang === 'cpp' ? 'C++' : lang === 'csharp' ? 'C#' : lang === 'javascript' ? 'JavaScript' : lang === 'typescript' ? 'TypeScript' : lang === 'php' ? 'PHP' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </button>
                ))}
              </div>
            )}

            <div className="hidden sm:flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
          </div>
          <div className="p-6 overflow-x-auto min-h-[200px]">
            <pre className="text-sm text-slate-300 font-mono">
              <code>{codeToRender}</code>
            </pre>
          </div>
        </motion.section>

      </div>
    </motion.div>
  );
}
