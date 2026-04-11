import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ProblemInput } from './components/ProblemInput';
import { SolutionDisplay } from './components/SolutionDisplay';
import { solveProblem } from './lib/mockApi';
import { Code2, Cpu, Activity } from 'lucide-react';
import { InteractiveBackground } from './components/InteractiveBackground';
import { AIChatbot } from './components/AIChatbot';
import { HistorySidebar } from './components/HistorySidebar';
import { getHistory, addOrUpdateHistoryItem } from './lib/historyManager';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [solutionData, setSolutionData] = useState(null);
  const [error, setError] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeProblemId, setActiveProblemId] = useState(null);
  const [activeView, setActiveView] = useState('main');

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleSolve = async (problemNumber) => {
    setIsLoading(true);
    setError('');
    setSolutionData(null);
    
    try {
      const data = await solveProblem(problemNumber);
      setSolutionData(data);
      const newProblemId = data.title;
      setActiveProblemId(newProblemId);
      setActiveView('main');
      
      const updatedHistory = addOrUpdateHistoryItem({
        id: newProblemId,
        solutionData: data,
        chatMessages: null // Initialized by AIChatbot if not present
      });
      setHistory(updatedHistory);
    } catch (err) {
      setError(err.message || 'Failed to find problem. Please check the number and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-primary/30 relative overflow-hidden">
      <InteractiveBackground theme={solutionData ? solutionData.difficulty : 'default'} />
      
      <div className="relative z-10 w-full flex flex-col items-center">
        <Header 
          onToggleChat={() => setIsChatOpen(!isChatOpen)} 
          onToggleHistory={() => setIsHistoryOpen(true)} 
          onNavSolution={() => setActiveView('solution')}
          onNavHome={() => setActiveView('main')}
          activeView={activeView}
        />
        <HistorySidebar 
          isOpen={isHistoryOpen} 
          onClose={() => setIsHistoryOpen(false)} 
          history={history}
          onSelect={(item) => {
            setSolutionData(item.solutionData);
            setActiveProblemId(item.id);
            setError('');
          }}
        />
      
      <main className="relative pt-32 pb-24 z-10 w-full max-w-[1800px] mx-auto px-4 lg:px-8 flex flex-col items-center">
        
        {!solutionData && <ProblemInput onSolve={handleSolve} isLoading={isLoading} compact={false} />}
        
        {error && (
          <div className="max-w-xl mx-auto mb-8 px-4">
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 py-3 px-4 rounded-xl text-center">
              {error}
            </div>
          </div>
        )}

        {solutionData && <SolutionDisplay data={solutionData} header={<ProblemInput onSolve={handleSolve} isLoading={isLoading} compact={true} />} view={activeView} />}
        
        {!solutionData && activeView === 'solution' && (
          <div className="text-center text-slate-400 mt-12 py-10 bg-white/5 border border-white/10 rounded-2xl w-full max-w-2xl">
              <Code2 className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p>Search for a problem first to see its optimal solution.</p>
          </div>
        )}

        {!solutionData && !isLoading && !error && activeView === 'main' && (
          <div className="max-w-5xl mx-auto pt-16 w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="glass-panel p-6 rounded-2xl animate-float hover:border-primary/50 transition-colors duration-500 cursor-default group" style={{ animationDelay: '0s' }}>
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6 border border-blue-500/30 group-hover:scale-110 transition-transform duration-500">
                  <Activity className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-white font-display font-semibold text-xl mb-3">Step-by-Step Logic</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Break down complex data structures and algorithms into easy, understandable steps tailored to humans.</p>
              </div>
              <div className="glass-panel p-6 rounded-2xl animate-float hover:border-accent/50 transition-colors duration-500 cursor-default group" style={{ animationDelay: '0.2s' }}>
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6 border border-purple-500/30 group-hover:scale-110 transition-transform duration-500">
                  <Cpu className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-white font-display font-semibold text-xl mb-3">Interactive Explainer</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Listen to automated voice guides running through the execution flow in English, Hindi, or Hinglish.</p>
              </div>
              <div className="glass-panel p-6 rounded-2xl animate-float hover:border-emerald-500/50 transition-colors duration-500 cursor-default group" style={{ animationDelay: '0.4s' }}>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-6 border border-emerald-500/30 group-hover:scale-110 transition-transform duration-500">
                  <Code2 className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-white font-display font-semibold text-xl mb-3">Multi-Language Code</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Get optimal solutions instantly in Python, C++, Java, JavaScript, Go, Rust, and many more.</p>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <AIChatbot 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        contextData={solutionData} 
        initialMessages={history.find(h => h.id === activeProblemId)?.chatMessages || null}
        onUpdateChat={(newMessages) => {
          if (activeProblemId) {
            const updatedHistory = addOrUpdateHistoryItem({
              id: activeProblemId,
              solutionData: solutionData, // Use current solutionData
              chatMessages: newMessages
            });
            setHistory(updatedHistory);
          }
        }}
      />
      </div>
    </div>
  );
}

export default App;
