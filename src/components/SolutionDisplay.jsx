import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Code2, Lightbulb, ListOrdered } from 'lucide-react';

export function SolutionDisplay({ data }) {
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
        </motion.section>

        {/* Step-by-Step */}
        <motion.section variants={itemVariants} className="bg-secondary/40 border border-white/5 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <h3 className="flex items-center gap-2 text-xl font-semibold text-white mb-6">
            <ListOrdered className="w-5 h-5 text-blue-400" />
            Step-by-Step Instructions
          </h3>
          <div className="space-y-4">
            {data.steps.map((step, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-300 font-medium text-sm mt-0.5">
                  {index + 1}
                </div>
                <p className="text-slate-300 pt-1 leading-relaxed">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Code Solution */}
        <motion.section variants={itemVariants} className="bg-[#0f111a] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-[#1a1d27] px-6 py-4 flex items-center justify-between border-b border-white/5">
            <h3 className="flex items-center gap-2 font-semibold text-slate-200">
              <Code2 className="w-5 h-5 text-purple-400" />
              Optimal Solution
            </h3>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm text-slate-300 font-mono">
              <code>{data.code}</code>
            </pre>
          </div>
        </motion.section>

      </div>
    </motion.div>
  );
}
