'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Shield, ChevronRight, BarChart3, Terminal, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

export default function ChatPage() {
  // Hydration Fix: Only render heavy UI after mount
  const [isMounted, setIsMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    setMessages([
      {
        id: 'init-1',
        role: 'assistant',
        content: "Welcome to the **NSE Intelligence Hub**.\n\nI have access to real-time static data regarding:\n• **Membership Regulations**\n• **Listing Fees & Penalties**\n• **Derivatives & Commodity Markets**\n\nHow can I assist your trading operations today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isMounted]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content }),
      });

      const data = await response.json();
      
      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: data.response || "Server response invalid.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      setMessages((prev) => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: "⚠ **Network Failure**: Unable to contact the intelligence core. Please verify your API key configuration.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Safe Render helper
  const renderMessageContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Bold handling
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <div key={i} className={cn("min-h-[1.5em] mb-1.5 last:mb-0", line.startsWith('•') ? "pl-4" : "")}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="text-cyan-300 font-bold">{part.slice(2, -2)}</strong>;
            }
            return <span key={j}>{part}</span>;
          })}
        </div>
      );
    });
  };

  if (!isMounted) return <div className="min-h-screen bg-[#030712]" />; // Prevent flash

  return (
    <main className="flex min-h-screen flex-col bg-[#030712] text-slate-200 font-sans selection:bg-cyan-500/30 overflow-hidden relative">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/10 rounded-full blur-[100px] animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex-1 flex flex-col max-w-6xl mx-auto w-full h-screen p-4 md:p-6 lg:p-8">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-gradient-to-br from-gray-800 to-gray-950 rounded-xl border border-white/10 shadow-xl shadow-cyan-900/10">
              <BarChart3 className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                NSE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Analyst</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium tracking-wide">POWERED BY GEMINI 1.5</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
             <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 flex items-center gap-2 text-xs font-mono text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                SYSTEM ONLINE
             </div>
          </div>
        </header>

        {/* Chat Interface */}
        <section className="flex-1 flex flex-col bg-gray-900/40 backdrop-blur-2xl rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative">
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  className={cn(
                    "flex w-full group",
                    msg.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "flex max-w-[90%] md:max-w-[75%] gap-4",
                    msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}>
                    {/* Icon */}
                    <div className={cn(
                      "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border shadow-lg",
                      msg.role === 'user' 
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-400/30" 
                        : "bg-gradient-to-br from-cyan-500 to-teal-600 border-cyan-400/30"
                    )}>
                      {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                    </div>

                    {/* Content */}
                    <div className="flex flex-col gap-1">
                      <div className={cn(
                        "flex items-center gap-2 text-[10px] font-mono text-slate-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity",
                        msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                      )}>
                        <span>{msg.role === 'user' ? 'YOU' : 'ASSISTANT'}</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      
                      <div className={cn(
                        "px-6 py-4 text-[15px] md:text-base leading-7 tracking-wide shadow-md whitespace-pre-line backdrop-blur-md",
                        msg.role === 'user'
                          ? "bg-indigo-600/20 border border-indigo-500/20 text-indigo-50 rounded-2xl rounded-tr-sm"
                          : "bg-gray-800/40 border border-white/5 text-slate-100 rounded-2xl rounded-tl-sm"
                      )}>
                        {renderMessageContent(msg.content)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading Indicator */}
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="flex items-center gap-4 max-w-[75%]"
              >
                 <div className="w-10 h-10 rounded-full bg-gray-800/50 border border-white/5 flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                 </div>
                 <div className="text-xs font-mono text-cyan-400 animate-pulse">
                   PROCESSING QUERY...
                 </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>

          {/* Input Zone */}
          <div className="p-4 md:p-6 bg-gray-950/50 border-t border-white/5 backdrop-blur-xl">
             <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative flex items-center group">
               <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
               
               <input 
                 type="text"
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 disabled={isLoading}
                 placeholder="Ask about deposits, listing fees, or market regulations..."
                 className="relative w-full bg-gray-900/80 border border-white/10 rounded-2xl px-6 py-4 pr-16 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-gray-900 transition-all duration-300 shadow-inner"
               />
               
               <button 
                 type="submit"
                 disabled={isLoading || !input.trim()}
                 className="absolute right-2 p-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl shadow-lg shadow-cyan-900/20 hover:shadow-cyan-500/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 z-10"
               >
                 <Send className="w-5 h-5" />
               </button>
             </form>
             <div className="text-center mt-3">
               <p className="text-[10px] text-slate-600 font-mono tracking-wider">
                 NSE DATA MAY BE SUBJECT TO CHANGE. ALWAYS VERIFY WITH OFFICIAL SOURCES.
               </p>
             </div>
          </div>

        </section>
      </div>
    </main>
  );
}
