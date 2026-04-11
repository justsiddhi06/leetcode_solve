import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Loader2 } from 'lucide-react';
import { sendChatMessage } from '../lib/mockApi';

export function AIChatbot({ isOpen, onClose, contextData, initialMessages, onUpdateChat }) {
  const defaultMessages = [
    { role: 'ai', content: 'Hi! Main ek AI Assistant hu. Aapko is problem me kya samajh nahi aa raha? Main Hinglish ya English me apki madad kar sakta hu.' }
  ];
  const [messages, setMessages] = useState(initialMessages || defaultMessages);

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    } else {
      setMessages(defaultMessages);
    }
  }, [contextData?.title, initialMessages]);

  const updateMessages = (newMsgs) => {
    setMessages(newMsgs);
    if (onUpdateChat) {
      onUpdateChat(newMsgs);
    }
  };
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    updateMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const chatContext = contextData ? {
        title: contextData.title,
        code: typeof contextData.code === 'string' ? contextData.code : (contextData.code?.python3 || "")
      } : null;

      const response = await sendChatMessage(newMessages, chatContext);
      
      updateMessages([...newMessages, { role: 'ai', content: response.reply }]);
    } catch (error) {
      let errorText = "Sorry, mera server se connection toot gaya.";
      if (error.message.includes("503") || error.message.includes("demand")) {
         errorText = "Sorry, Google's AI servers are currently full (503 High Demand). Please wait a few seconds and try again!";
      } else {
         errorText = `Error: ${error.message}`;
      }
      updateMessages([...newMessages, { role: 'ai', content: errorText }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessageContent = (text) => {
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\n)/g);
    return parts.map((part, index) => {
      if (!part) return null;
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={index} className="px-1.5 py-0.5 rounded-md bg-black/40 text-amber-300 border border-white/10 font-mono text-[13px] shadow-inner">{part.slice(1, -1)}</code>;
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="text-white font-bold tracking-wide">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={index} className="text-emerald-300 font-medium">{part.slice(1, -1)}</em>;
      }
      if (part === '\n') {
        return <br key={index} className="mb-2" />;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 w-full md:w-[450px] h-full z-[100] p-4 flex flex-col"
        >
          {/* Main Chat Container */}
          <div className="flex-1 glass-panel-deep border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.5)]">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="p-2 border border-white/10 rounded-full bg-white/5">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-white font-display font-semibold tracking-wide">AI Tutor</h3>
                  <p className="text-xs text-emerald-400 font-medium tracking-wider uppercase">Online</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-transparent hover:border-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border shadow-lg ${msg.role === 'user' ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-slate-800 border-white/10 text-slate-300'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary/20 border border-primary/20 text-white rounded-tr-sm' : 'bg-white/5 border border-white/5 text-slate-300 rounded-tl-sm shadow-inner'}`}>
                    {formatMessageContent(msg.content)}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 max-w-[85%]">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 border border-white/10 text-slate-300 flex items-center justify-center shadow-lg">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 rounded-tl-sm flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-black/40 border-t border-white/10 backdrop-blur-md">
              <form onSubmit={handleSubmit} className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-white text-sm focus:outline-none focus:border-primary/50 focus:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all placeholder:text-slate-500"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-2.5 bg-primary hover:bg-primary/80 text-white rounded-xl transition-colors disabled:opacity-50 disabled:hover:bg-primary"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
