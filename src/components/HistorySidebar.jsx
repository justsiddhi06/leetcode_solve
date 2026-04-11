import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Layers, ChevronRight, FileCode2 } from 'lucide-react';

export function HistorySidebar({ isOpen, onClose, history, onSelect }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 w-full sm:w-[400px] h-full z-[100] bg-slate-950 border-r border-white/10 shadow-[20px_0_60px_rgba(0,0,0,0.5)] flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="p-2 border border-white/10 rounded-full bg-white/5">
                  <Layers className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-display font-semibold tracking-wide">Problem History</h3>
                  <p className="text-xs text-slate-400 font-medium tracking-wider uppercase">Offline Access</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-transparent hover:border-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-500 gap-3">
                  <Clock className="w-8 h-8 opacity-50" />
                  <p className="text-sm">No history yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelect(item);
                        onClose();
                      }}
                      className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group text-left w-full"
                    >
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 shrink-0">
                          <FileCode2 className="w-4 h-4" />
                        </div>
                        <div className="truncate pr-2">
                          <h4 className="text-white font-medium truncate text-[15px]">{item.solutionData.title}</h4>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(item.timestamp).toLocaleString(undefined, {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
