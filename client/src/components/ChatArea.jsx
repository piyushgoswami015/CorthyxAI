import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Moon, Sun, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatArea({ messages, onSendMessage, isLoading, isReady, darkMode, onToggleDarkMode, onToggleSidebar }) {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !isReady) return;
        onSendMessage(input);
        setInput('');
    };

    return (
        <main className="flex-1 flex flex-col bg-cream dark:bg-dark-bg relative transition-colors">
            {/* Header */}
            <div className="h-14 md:h-16 border-b border-beige/30 dark:border-dark-border flex items-center px-3 md:px-6 justify-between bg-white/50 dark:bg-dark-bg/80 backdrop-blur-sm z-10">
                <div className="flex items-center gap-2 md:gap-3">
                    {/* Hamburger menu for mobile */}
                    <button
                        onClick={onToggleSidebar}
                        className="md:hidden p-2 rounded-lg hover:bg-beige/10 dark:hover:bg-dark-border transition-colors"
                        aria-label="Toggle sidebar"
                    >
                        <Menu size={20} className="text-charcoal dark:text-slate-300" />
                    </button>

                    <div className={`w-2 h-2 rounded-full ${isReady ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-charcoal/30 dark:bg-slate-600'}`} />
                    <span className="text-xs md:text-sm font-medium text-charcoal dark:text-slate-300">
                        {isReady ? 'Corthyx AI Ready' : 'Waiting for context...'}
                    </span>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={onToggleDarkMode}
                        className="p-1.5 md:p-2 rounded-lg bg-beige/10 dark:bg-dark-surface border border-beige/30 dark:border-dark-border hover:scale-105 transition-all"
                        aria-label="Toggle dark mode"
                    >
                        {darkMode ? (
                            <Sun size={16} className="md:w-[18px] md:h-[18px] text-yellow-500" />
                        ) : (
                            <Moon size={16} className="md:w-[18px] md:h-[18px] text-charcoal" />
                        )}
                    </button>

                    <div className="hidden sm:flex items-center gap-2 text-xs text-charcoal/50 dark:text-slate-500 bg-beige/10 dark:bg-dark-surface px-2 md:px-3 py-1 rounded-full border border-beige/20 dark:border-dark-border">
                        <Sparkles size={12} className="text-beige dark:text-purple-400" />
                        <span>GPT-4o Mini</span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-6">
                <AnimatePresence>
                    {messages.map((msg, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[85%] md:max-w-[80%] flex gap-2 md:gap-4 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`relative w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.type === 'user' ? 'bg-charcoal dark:bg-blue-600' :
                                    msg.type === 'system' ? 'bg-beige/20 dark:bg-dark-surface' : 'bg-gradient-to-tr from-beige to-charcoal dark:from-purple-600 dark:to-blue-600'
                                    }`}>
                                    {msg.type === 'user' ? <User size={14} className="md:w-4 md:h-4 text-white" /> : <Bot size={14} className="md:w-4 md:h-4 text-white dark:text-white" />}

                                    {/* AI Star for bot */}
                                    {msg.type === 'bot' && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-1 -right-1 bg-white dark:bg-dark-bg rounded-full p-0.5"
                                        >
                                            <Sparkles size={10} className="text-yellow-500 fill-yellow-500" />
                                        </motion.div>
                                    )}
                                </div>

                                <div className={`p-3 md:p-4 rounded-2xl text-xs md:text-sm leading-relaxed ${msg.type === 'user'
                                    ? 'bg-charcoal dark:bg-blue-600 text-white rounded-tr-none shadow-lg shadow-charcoal/10 dark:shadow-blue-900/20'
                                    : msg.type === 'system'
                                        ? 'bg-beige/10 dark:bg-dark-surface/50 text-charcoal/60 dark:text-slate-400 italic text-center w-full border border-beige/20 dark:border-dark-border'
                                        : 'bg-white dark:bg-dark-surface text-charcoal dark:text-slate-200 rounded-tl-none border border-beige/30 dark:border-dark-border shadow-sm'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                        >
                            <div className="flex gap-2 md:gap-4">
                                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-tr from-beige to-charcoal dark:from-purple-600 dark:to-blue-600 flex items-center justify-center flex-shrink-0">
                                    <Bot size={14} className="md:w-4 md:h-4 text-white" />
                                </div>
                                <div className="bg-white dark:bg-dark-surface p-3 md:p-4 rounded-2xl rounded-tl-none border border-beige/30 dark:border-dark-border shadow-sm flex items-center gap-2">
                                    <span className="w-2 h-2 bg-beige dark:bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 bg-beige dark:bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 bg-beige dark:bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 md:p-6 bg-white/50 dark:bg-dark-bg border-t border-beige/30 dark:border-dark-border backdrop-blur-sm">
                <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto group">
                    <div className="absolute inset-0 bg-gradient-to-r from-beige/20 to-charcoal/20 dark:from-purple-500/20 dark:to-blue-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isReady ? "Ask Corthyx anything..." : "Upload content first"}
                        disabled={!isReady || isLoading}
                        className="relative w-full bg-white dark:bg-dark-surface border border-beige/30 dark:border-dark-border rounded-xl py-3 md:py-4 pl-4 md:pl-6 pr-12 md:pr-14 text-sm md:text-base text-charcoal dark:text-slate-200 placeholder-charcoal/40 dark:placeholder-slate-500 focus:border-beige dark:focus:border-blue-500 focus:ring-1 focus:ring-beige dark:focus:ring-blue-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    />
                    <button
                        type="submit"
                        disabled={!isReady || isLoading || !input.trim()}
                        className="absolute right-2 top-2 bottom-2 p-2 md:p-2.5 bg-button dark:bg-blue-600 hover:bg-button/80 dark:hover:bg-blue-500 text-white rounded-lg transition-all disabled:bg-charcoal/20 dark:disabled:bg-dark-border disabled:text-charcoal/40 dark:disabled:text-slate-500 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                    >
                        <Send size={18} className="md:w-5 md:h-5" />
                    </button>
                </form>
                <p className="text-center text-[10px] md:text-xs text-charcoal/40 dark:text-slate-600 mt-2 md:mt-3 flex items-center justify-center gap-1">
                    <Sparkles size={10} />
                    AI can make mistakes. Please verify important information.
                </p>
            </div>
        </main>
    );
}
