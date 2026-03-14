import React from 'react';
import { Bot, Terminal, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

export function Header() {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between py-6 px-8 border-b border-secondary/50 bg-background/80 backdrop-blur-md sticky top-0 z-10"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-xl">
          <Terminal className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white m-0 leading-none">LeetSolver</h1>
          <p className="text-xs text-slate-400 mt-1">AI-Powered Algorithm Guide</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-sm font-medium text-slate-300">
        <a href="#" className="flex items-center gap-2 hover:text-white transition-colors">
          <Layers className="w-4 h-4" />
          <span>Problems</span>
        </a>
        <a href="#" className="flex items-center gap-2 hover:text-white transition-colors">
          <Bot className="w-4 h-4" />
          <span>About AI</span>
        </a>
      </div>
    </motion.header>
  );
}
