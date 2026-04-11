import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function ProblemInput({ onSolve, isLoading, compact }) {
  const [problemNumber, setProblemNumber] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (problemNumber.trim()) {
      onSolve(problemNumber.trim());
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
      className={`w-full ${compact ? 'mt-4 mb-8' : 'max-w-3xl mx-auto mt-24 mb-16 px-4'}`}
    >
      {!compact && (
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h2 className="text-5xl md:text-7xl font-display font-semibold mb-6 tracking-tight text-white drop-shadow-2xl">
            Crack Any <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-300 to-slate-500">Algorithm</span>
          </h2>
        </motion.div>
        <p className="text-slate-400 text-lg md:text-xl font-sans max-w-xl mx-auto">
          Enter a problem number or name. Instantly get the step-by-step logic, an interactive explainer, and the optimal code.
        </p>
      </div>
      )}

      <form onSubmit={handleSubmit} className={`relative group ${compact ? 'w-full' : 'max-w-2xl mx-auto'}`}>
        <div className="absolute -inset-1 bg-white/5 rounded-3xl blur-md opacity-0 group-hover:opacity-100 transition duration-700"></div>
        <div className="relative flex items-center glass-panel-deep rounded-3xl p-2.5 transition-all outline outline-1 outline-white/10 focus-within:outline-white/30 focus-within:shadow-[0_0_40px_rgba(255,255,255,0.05)]">
          <div className="pl-5 text-slate-500 group-focus-within:text-white transition-colors">
            <Search className="w-6 h-6" />
          </div>
          <input
            type="text"
            value={problemNumber}
            onChange={(e) => setProblemNumber(e.target.value)}
            placeholder={compact ? "Search problem..." : "Search problems (e.g. 1 or Two Sum)"}
            className={`w-full bg-transparent border-none text-white px-4 py-3 focus:outline-none placeholder:text-slate-500 font-sans tracking-wide ${compact ? 'text-lg' : 'text-xl py-4 px-5'}`}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !problemNumber}
            className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 font-semibold py-4 px-8 rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)] group-focus-within:shadow-[0_0_40px_rgba(255,255,255,0.2)]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Solving</span>
              </>
            ) : (
              <span>Solve</span>
            )}
          </button>
        </div>
      </form>
      
      <div className={`flex items-center gap-3 text-sm text-slate-400 font-medium ${compact ? 'mt-4 justify-start' : 'mt-8 justify-center'}`}>
        <span className="opacity-70">Popular:</span>
        <button onClick={() => onSolve('1')} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all hover:scale-105 active:scale-95">1. Two Sum</button>
        <button onClick={() => onSolve('2')} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all hover:scale-105 active:scale-95">2. Add Two Numbers</button>
        <button onClick={() => onSolve('15')} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all hover:scale-105 active:scale-95 hidden sm:block">15. 3Sum</button>
      </div>
    </motion.div>
  );
}
