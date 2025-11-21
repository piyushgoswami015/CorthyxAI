import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, LogIn, ChevronRight, ChevronLeft, Github, Linkedin, Instagram, Code, User, X } from 'lucide-react';

const slides = [
    {
        id: 0,
        title: "Corthyx AI",
        subtitle: "Search less, understand more",
        content: "Corthyx AI is a powerful, AI-driven chatbot that understands and answers questions using your own documents and sources. Whether it’s a PDF, a website link, or a YouTube video, the system fetches, processes, and learns from the content—so your answers are always relevant, accurate, and specific to your data.",
        icon: "bot"
    },
    {
        id: 1,
        title: "What Problem Does It Solve?",
        subtitle: "Stop searching, start finding",
        content: "Finding specific information inside documents, websites, or long videos takes too much time. Traditional chatbots guess answers without understanding your source material. Corthyx AI fixes this by providing context-grounded responses, not hallucinations.",
        features: ["⏱ Save Time", "🎯 Accurate", "🔐 Private", "🧠 Smart Retrieval"],
        icon: "shield"
    },
    {
        id: 2,
        title: "Use Cases",
        subtitle: "For work, study, and research",
        content: "Perfect for students, developers, researchers, analysts, lawyers, consultants, and anyone who deals with information overload.",
        features: ["Summarize PDFs", "Extract Web Info", "Chat with Videos", "Research Faster"],
        icon: "zap"
    }
];

const Carousel = () => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    const next = () => setCurrent((prev) => (prev + 1) % slides.length);
    const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <div className="relative w-full h-full flex flex-col">
            <div className="flex-1 relative overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 flex flex-col items-center justify-center p-6 md:p-8 text-center"
                    >
                        <div className="p-3 md:p-4 bg-beige/10 dark:bg-blue-500/10 rounded-2xl mb-4 md:mb-6">
                            <Bot size={32} className="md:w-12 md:h-12 text-beige dark:text-blue-400" />
                        </div>

                        <h2 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-beige to-charcoal dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                            {slides[current].title}
                        </h2>
                        <p className="text-xs md:text-sm font-medium text-charcoal/50 dark:text-slate-400 mb-4 md:mb-6 uppercase tracking-wider">
                            {slides[current].subtitle}
                        </p>

                        <p className="text-sm md:text-base text-charcoal/80 dark:text-slate-300 mb-6 md:mb-8 leading-relaxed max-w-lg">
                            {slides[current].content}
                        </p>

                        {slides[current].features && (
                            <div className="grid grid-cols-2 gap-2 md:gap-3 w-full max-w-md">
                                {slides[current].features.map((feature, idx) => (
                                    <div key={idx} className="bg-white/50 dark:bg-dark-surface/50 border border-beige/20 dark:border-dark-border p-1.5 md:p-2 rounded-lg text-[10px] md:text-xs font-medium text-charcoal/70 dark:text-slate-300">
                                        {feature}
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 pb-4 md:pb-8">
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrent(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${current === idx
                            ? 'w-6 bg-beige dark:bg-blue-500'
                            : 'bg-beige/30 dark:bg-slate-600'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

const DeveloperModal = ({ isOpen, onClose }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-dark-surface p-8 rounded-2xl max-w-sm w-full shadow-2xl border border-beige/30 dark:border-dark-border relative"
                    onClick={e => e.stopPropagation()}
                >
                    <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors">
                        <X size={20} className="text-charcoal/50 dark:text-slate-400" />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-beige to-charcoal dark:from-blue-500 dark:to-purple-500 p-1 mb-4 shadow-lg">
                            <div className="w-full h-full rounded-full bg-white dark:bg-dark-bg flex items-center justify-center overflow-hidden relative">
                                <img
                                    src="/developer.jpg"
                                    alt="Piyush"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-charcoal dark:text-white mb-1">Piyush</h3>
                        <p className="text-sm text-charcoal/50 dark:text-slate-400 mb-4">Full Stack Developer</p>

                        <div className="text-charcoal/80 dark:text-slate-300 text-xs mb-6 leading-relaxed text-left max-h-60 overflow-y-auto pr-2 scrollbar-thin">
                            <p className="mb-3">
                                I’m a software engineer with 1.5 years of hands-on experience in building modern web applications and solving real-world problems through technology. Born and brought up in Jamshedpur and schooled at Kerala Public School, I’m now based in Bangalore, exploring the fast-paced world of AI.
                            </p>
                            <p>
                                I’m passionate about creating intelligent, user-focused applications—especially those powered by React, Node.js, and emerging AI tools. Whether it’s building RAG systems, experimenting with new frameworks, or turning ideas into functional products, I love pushing myself to learn, build, and innovate every day.
                            </p>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <a href="https://github.com/piyushgoswami015" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 dark:bg-dark-bg hover:bg-beige/20 dark:hover:bg-blue-500/20 transition-colors text-charcoal dark:text-slate-300">
                                <Github size={20} />
                            </a>
                            <a href="https://www.linkedin.com/in/piyush-goswami-240a611a0?utm_source=share_via&utm_content=profile&utm_medium=member_ios" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 dark:bg-dark-bg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors text-blue-600 dark:text-blue-400">
                                <Linkedin size={20} />
                            </a>
                            <a href="https://www.instagram.com/piyushxgoswami?igsh=YjJ3a2c5dm8wNnYz&utm_source=qr" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 dark:bg-dark-bg hover:bg-pink-100 dark:hover:bg-pink-500/20 transition-colors text-pink-600 dark:text-pink-400">
                                <Instagram size={20} />
                            </a>
                            <a href="https://x.com/chimtucomder?s=21&t=csb6WoyGwUHSRjkUkFM6sw" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 dark:bg-dark-bg hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-colors text-charcoal dark:text-slate-300">
                                <X size={20} />
                            </a>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

const Footer = ({ onOpenDev }) => (
    <footer className="w-full p-6 border-t border-beige/20 dark:border-dark-border bg-white/30 dark:bg-dark-bg/30 backdrop-blur-sm flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-charcoal/60 dark:text-slate-500 z-20 relative md:absolute md:bottom-0 mt-8 md:mt-0">
        <div className="flex items-center gap-4">
            <a href="https://github.com/piyushgoswami015" target="_blank" rel="noopener noreferrer" className="hover:text-beige dark:hover:text-blue-400 transition-colors"><Github size={18} /></a>
            <a href="https://www.linkedin.com/in/piyush-goswami-240a611a0?utm_source=share_via&utm_content=profile&utm_medium=member_ios" target="_blank" rel="noopener noreferrer" className="hover:text-beige dark:hover:text-blue-400 transition-colors"><Linkedin size={18} /></a>
            <a href="https://www.instagram.com/piyushxgoswami?igsh=YjJ3a2c5dm8wNnYz&utm_source=qr" target="_blank" rel="noopener noreferrer" className="hover:text-beige dark:hover:text-blue-400 transition-colors"><Instagram size={18} /></a>
            <a href="https://x.com/chimtucomder?s=21&t=csb6WoyGwUHSRjkUkFM6sw" target="_blank" rel="noopener noreferrer" className="hover:text-beige dark:hover:text-blue-400 transition-colors"><X size={18} /></a>
        </div>

        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={onOpenDev}>
            <span>Developed by</span>
            <div className="flex items-center gap-2 bg-beige/10 dark:bg-dark-surface px-2 py-1 rounded-full border border-beige/20 dark:border-dark-border">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-beige to-charcoal dark:from-blue-500 dark:to-purple-500 flex items-center justify-center text-[10px] text-white font-bold">
                    P
                </div>
                <span className="font-medium text-charcoal dark:text-slate-300">Piyush</span>
            </div>
        </div>
    </footer>
);

export default function WelcomeScreen() {
    const [isDevModalOpen, setIsDevModalOpen] = useState(false);

    const handleLogin = () => {
        window.location.href = '/auth/google';
    };

    return (
        <div className="min-h-screen flex flex-col bg-cream dark:bg-dark-bg relative overflow-hidden transition-colors">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-beige/20 dark:bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s' }} />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4 md:p-6 z-10 overflow-y-auto">
                <div className="flex flex-col md:flex-row w-full max-w-5xl h-auto md:h-[600px] bg-white/80 dark:bg-dark-surface/80 backdrop-blur-xl border border-beige/30 dark:border-dark-border rounded-3xl shadow-2xl overflow-hidden my-4 md:my-0">

                    {/* Left: Carousel */}
                    <div className="w-full md:flex-1 h-[450px] md:h-auto bg-gradient-to-br from-white/50 to-transparent dark:from-dark-surface/50 relative order-1 md:order-none">
                        <Carousel />
                    </div>

                    {/* Right: Login */}
                    <div className="w-full md:w-[400px] border-t md:border-t-0 md:border-l border-beige/30 dark:border-dark-border p-8 md:p-12 flex flex-col justify-center items-center bg-white/40 dark:bg-dark-bg/40 order-2 md:order-none">
                        <div className="mb-8 text-center">
                            <h3 className="text-2xl font-bold text-charcoal dark:text-white mb-2">Get Started</h3>
                            <p className="text-charcoal/60 dark:text-slate-400 text-sm">
                                Log in securely to access your personal AI workspace.
                            </p>
                        </div>

                        <button
                            onClick={handleLogin}
                            className="w-full bg-button dark:bg-blue-600 hover:bg-button/80 dark:hover:bg-blue-500 text-white py-4 px-6 rounded-xl flex items-center justify-center gap-3 group transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 font-medium"
                        >
                            <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                            <span>Continue with Google</span>
                        </button>

                        <p className="mt-8 text-xs text-center text-charcoal/40 dark:text-slate-500">
                            By continuing, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </div>
                </div>
            </div>

            <Footer onOpenDev={() => setIsDevModalOpen(true)} />
            <DeveloperModal isOpen={isDevModalOpen} onClose={() => setIsDevModalOpen(false)} />
        </div>
    );
}
