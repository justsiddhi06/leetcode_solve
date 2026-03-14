import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function ProblemInput({ onSolve, isLoading }) {
  const [problemNumber, setProblemNumber] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (problemNumber.trim()) {
      onSolve(problemNumber.trim());
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1, duration: 0.3 }}
      className="max-w-2xl mx-auto w-full mt-16 mb-12 px-4"
    >
      <div className="text-center mb-10 text-white">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Crack Any LeetCode Problem
        </h2>
        <p className="text-slate-400 text-lg">
          Enter the problem number and instantly get the algorithm, step-by-step solution, and code.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
        <div className="relative flex items-center bg-[#1e293b] rounded-2xl p-2 border border-white/10 shadow-xl">
          <div className="pl-4 text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <input
            type="number"
            min="1"
            value={problemNumber}
            onChange={(e) => setProblemNumber(e.target.value)}
            placeholder="e.g. 1"
            className="w-full bg-transparent border-none text-white text-xl px-4 py-3 focus:outline-none placeholder:text-slate-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !problemNumber}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Solving...</span>
              </>
            ) : (
              <span>Solve</span>
            )}
          </button>
        </div>
      </form>
      
      <div className="mt-6 flex justify-center gap-3 text-sm text-slate-500">
        <span>Popular:</span>
        <button onClick={() => onSolve('1')} className="hover:text-purple-400 transition-colors">1. Two Sum</button>
        <span className="w-1.5 h-1.5 rounded-full bg-slate-700 self-center"></span>
        <button onClick={() => onSolve('2')} className="hover:text-purple-400 transition-colors">2. Add Two Numbers</button>
      </div>
    </motion.div>
  );
}
