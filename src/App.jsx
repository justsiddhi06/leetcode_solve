import React, { useState } from 'react';
import { Header } from './components/Header';
import { ProblemInput } from './components/ProblemInput';
import { SolutionDisplay } from './components/SolutionDisplay';
import { solveProblem } from './lib/mockApi';
import { Bot } from 'lucide-react';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [solutionData, setSolutionData] = useState(null);
  const [error, setError] = useState('');

  const handleSolve = async (problemNumber) => {
    setIsLoading(true);
    setError('');
    setSolutionData(null);
    
    try {
      const data = await solveProblem(problemNumber);
      setSolutionData(data);
    } catch (err) {
      setError(err.message || 'Failed to find problem. Please check the number and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-purple-500/30">
      <Header />
      
      <main className="relative pt-10">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/20 opacity-50 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-blue-600/10 opacity-50 blur-[100px] rounded-full pointer-events-none"></div>
        
        <ProblemInput onSolve={handleSolve} isLoading={isLoading} />
        
        {error && (
          <div className="max-w-xl mx-auto mb-8 px-4">
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 py-3 px-4 rounded-xl text-center">
              {error}
            </div>
          </div>
        )}

        {solutionData && <SolutionDisplay data={solutionData} />}
        
        {!solutionData && !isLoading && !error && (
          <div className="max-w-xl mx-auto text-center opacity-30 px-4 pt-10 pb-20 pointer-events-none">
            <Bot className="w-16 h-16 mx-auto mb-4 text-slate-500" />
            <p className="text-slate-400 font-medium">Awaiting a problem number...</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
