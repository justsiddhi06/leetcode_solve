import React from 'react';
import { Bot, Terminal, Layers, Code2, MonitorPlay } from 'lucide-react';
import { motion } from 'framer-motion';

export function Header({ onToggleChat, onToggleHistory, onNavSolution, onNavHome, activeView }) {
  return (
    <div className="fixed top-0 w-full z-50 px-4 py-8 pointer-events-none flex justify-center">
      <motion.header 
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-8 md:gap-16 py-3 px-6 glass-panel-deep rounded-full pointer-events-auto shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] border border-white/10"
      >
        <div className="flex items-center gap-3 group cursor-pointer" onClick={onNavHome}>
          <div className="relative p-2 bg-white/5 rounded-full border border-white/5 group-hover:bg-white/10 transition-colors duration-300">
            <Terminal className="w-5 h-5 text-white relative z-10" />
          </div>
          <h1 className="text-xl font-display font-semibold tracking-tight text-white m-0 leading-none">
            LeetSolver
          </h1>
        </div>
        
        <div className="flex items-center gap-6 text-sm font-medium text-slate-300">
          <button onClick={onToggleHistory} className="flex items-center gap-2 hover:text-emerald-400 transition-all hover:scale-105 bg-transparent border-none cursor-pointer text-slate-300 font-medium">
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">Problems</span>
          </button>
          <button onClick={onNavHome} className={`flex items-center gap-2 transition-all hover:scale-105 bg-transparent border-none cursor-pointer font-medium ${activeView === 'main' ? 'text-blue-400' : 'text-slate-300 hover:text-blue-400'}`}>
            <MonitorPlay className="w-4 h-4" />
            <span className="hidden sm:inline">Explanation</span>
          </button>
          <button onClick={onNavSolution} className={`flex items-center gap-2 transition-all hover:scale-105 bg-transparent border-none cursor-pointer font-medium ${activeView === 'solution' ? 'text-purple-400' : 'text-slate-300 hover:text-purple-400'}`}>
            <Code2 className="w-4 h-4" />
            <span className="hidden sm:inline">Solution</span>
          </button>
          <button onClick={onToggleChat} className="flex items-center gap-2 hover:text-primary transition-all hover:scale-105 bg-transparent border-none cursor-pointer text-slate-300 font-medium">
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">AI Assistant</span>
          </button>
        </div>
      </motion.header>
    </div>
  );
}
