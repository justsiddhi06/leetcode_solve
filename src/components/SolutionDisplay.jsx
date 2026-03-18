import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Code2, Lightbulb, ListOrdered, GlobeIcon, Image as ImageIcon } from 'lucide-react';
import { MermaidDiagram } from './MermaidDiagram';

export function SolutionDisplay({ data }) {
  const [activeLang, setActiveLang] = useState('hinglish');
  const [activeCodeLang, setActiveCodeLang] = useState('python');

  if (!data) return null;

  const getDifficultyColor = (diff) => {
    switch(diff.toLowerCase()) {
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

  // Graceful fallback if the API returns a string instead of a multi-language object
  const codeToRender = typeof data.code === 'string'
    ? data.code
    : (data.code && data.code[activeCodeLang]) || '// Code not available in this language';

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

          {data.mermaid && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <h4 className="flex items-center gap-2 text-lg font-medium text-slate-200 mb-4">
                <ImageIcon className="w-4 h-4 text-pink-400" />
                Visual Explanation
              </h4>
              <MermaidDiagram code={data.mermaid} />
            </div>
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
                    onClick={() => setActiveLang(lang)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                      activeLang === lang 
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
              <div className="flex flex-wrap items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5 w-full sm:w-auto">
                {['python', 'java', 'c', 'cpp'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveCodeLang(lang)}
                    className={`flex-1 sm:flex-none px-4 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${
                      activeCodeLang === lang 
                        ? 'bg-purple-500/20 text-purple-300 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    {lang === 'cpp' ? 'C++' : lang.charAt(0).toUpperCase() + lang.slice(1)}
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
