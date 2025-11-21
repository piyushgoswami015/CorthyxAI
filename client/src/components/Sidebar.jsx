import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Upload, FileText, Globe, Youtube, CheckCircle, AlertCircle, Loader2, LogOut, X, Edit2, Crown } from 'lucide-react';

export default function Sidebar({ onIngestSuccess, user, isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('pdf');
    const [status, setStatus] = useState({ type: 'idle', message: '' });
    const [urlInput, setUrlInput] = useState('');
    const fileInputRef = useRef(null);

    // Profile state
    const [nickname, setNickname] = useState(user?.displayName || 'User');
    const [isEditingNickname, setIsEditingNickname] = useState(false);

    useEffect(() => {
        if (user?.displayName) {
            setNickname(user.displayName);
        }
    }, [user]);

    const handleLogout = async () => {
        const confirmed = window.confirm(
            '⚠️ WARNING: Logging out will permanently delete all your uploaded documents and context.\n\n' +
            'This includes:\n' +
            '• All PDF files\n' +
            '• All website content\n' +
            '• All YouTube transcripts\n\n' +
            'This action cannot be undone. Are you sure you want to logout?'
        );

        if (confirmed) {
            try {
                // Delete user data first
                await axios.post('/api/user/delete-data');

                // Then logout
                await axios.post('/api/logout');

                // Redirect to reload and show welcome screen
                window.location.href = '/';
            } catch (error) {
                console.error('Error during logout:', error);
                alert('Failed to logout. Please try again.');
            }
        }
    };

    const handleFileUpload = async (file) => {
        if (file.type !== 'application/pdf') {
            setStatus({ type: 'error', message: 'Please upload a PDF file' });
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setStatus({ type: 'loading', message: 'Processing PDF...' });

        try {
            const response = await axios.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setStatus({ type: 'success', message: `Ready! ${response.data.pages} pages.` });
            onIngestSuccess(file.name);
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.error || 'Upload failed' });
        }
    };

    const handleUrlSubmit = async (e) => {
        e.preventDefault();
        if (!urlInput) return;

        const endpoint = activeTab === 'youtube' ? '/api/ingest/youtube' : '/api/ingest/web';
        setStatus({ type: 'loading', message: `Processing ${activeTab === 'youtube' ? 'Video' : 'Website'}...` });

        try {
            const response = await axios.post(endpoint, { url: urlInput });
            setStatus({ type: 'success', message: 'Ready! Content indexed.' });
            onIngestSuccess(urlInput);
            setUrlInput('');
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.error || 'Ingestion failed' });
        }
    };

    return (
        <aside className={`
            fixed md:relative
            w-full md:w-64 lg:w-80
            h-full
            bg-white dark:bg-dark-surface
            border-r border-beige/30 dark:border-dark-border
            flex flex-col
            transition-all duration-300
            z-50 md:z-auto
            ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
            {/* Close button for mobile */}
            <button
                onClick={onClose}
                className="md:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-beige/10 dark:hover:bg-dark-border transition-colors"
                aria-label="Close sidebar"
            >
                <X size={20} className="text-charcoal dark:text-slate-400" />
            </button>

            <div className="p-6 border-b border-beige/30 dark:border-dark-border">
                <h2 className="text-xl font-bold text-charcoal dark:text-white flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-beige dark:bg-blue-500"></div>
                    Corthyx AI
                </h2>
                <p className="text-[10px] text-charcoal/50 dark:text-slate-500 ml-4 mt-1 uppercase tracking-widest">
                    Search less, understand more
                </p>
            </div>

            <div className="p-4 md:p-6 flex-1 overflow-y-auto">
                <div className="flex gap-2 mb-6 bg-cream dark:bg-dark-bg p-1 rounded-lg">
                    {['pdf', 'web', 'youtube'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); setStatus({ type: 'idle', message: '' }); }}
                            className={`flex-1 py-2 rounded-md flex justify-center transition-all ${activeTab === tab
                                ? 'bg-beige dark:bg-dark-border text-white shadow-sm'
                                : 'text-charcoal/60 dark:text-slate-400 hover:text-charcoal dark:hover:text-slate-200'
                                }`}
                        >
                            {tab === 'pdf' && <FileText size={18} />}
                            {tab === 'web' && <Globe size={18} />}
                            {tab === 'youtube' && <Youtube size={18} />}
                        </button>
                    ))}
                </div>

                <div className="mb-6">
                    {activeTab === 'pdf' ? (
                        <div
                            className="border-2 border-dashed border-beige dark:border-dark-border rounded-xl p-8 text-center cursor-pointer hover:border-beige/80 dark:hover:border-blue-500 hover:bg-beige/5 dark:hover:bg-dark-border/30 transition-all group"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="w-12 h-12 bg-beige/10 dark:bg-dark-border rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <Upload size={24} className="text-beige dark:text-blue-400" />
                            </div>
                            <p className="text-sm text-charcoal dark:text-slate-300 font-medium">Click to upload PDF</p>
                            <p className="text-xs text-charcoal/50 dark:text-slate-500 mt-1">or drag and drop</p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept=".pdf"
                                hidden
                                onChange={(e) => e.target.files.length && handleFileUpload(e.target.files[0])}
                            />
                        </div>
                    ) : (
                        <form onSubmit={handleUrlSubmit}>
                            <label className="block text-xs font-medium text-charcoal/60 dark:text-slate-400 mb-2 uppercase tracking-wider">
                                {activeTab === 'youtube' ? 'YouTube URL' : 'Website URL'}
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full px-3 py-2 rounded-lg text-sm bg-cream dark:bg-dark-bg border border-beige/30 dark:border-dark-border text-charcoal dark:text-slate-100 placeholder-charcoal/40 dark:placeholder-slate-500 focus:border-beige dark:focus:border-blue-500 focus:ring-1 focus:ring-beige dark:focus:ring-blue-500 transition-all outline-none"
                                />
                                <button type="submit" className="bg-button dark:bg-blue-600 hover:bg-button/80 dark:hover:bg-blue-500 text-white px-3 rounded-lg transition-colors">
                                    <Upload size={18} />
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {status.type !== 'idle' && (
                    <div className={`p-3 rounded-lg flex items-center gap-3 text-sm ${status.type === 'error' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' :
                        status.type === 'success' ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400' :
                            'bg-beige/10 dark:bg-blue-500/10 text-beige dark:text-blue-400'
                        }`}>
                        {status.type === 'loading' && <Loader2 className="animate-spin" size={16} />}
                        {status.type === 'success' && <CheckCircle size={16} />}
                        {status.type === 'error' && <AlertCircle size={16} />}
                        <span>{status.message}</span>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-beige/30 dark:border-dark-border bg-white dark:bg-dark-surface/50">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-beige to-beige/60 dark:from-blue-500 dark:to-purple-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {nickname?.[0] || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            {isEditingNickname ? (
                                <input
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    onBlur={() => setIsEditingNickname(false)}
                                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingNickname(false)}
                                    className="w-full bg-transparent border-b border-beige/50 dark:border-blue-500/50 text-sm font-medium text-charcoal dark:text-white outline-none px-0 py-0"
                                    autoFocus
                                />
                            ) : (
                                <div
                                    className="flex items-center gap-2 group cursor-pointer"
                                    onClick={() => setIsEditingNickname(true)}
                                >
                                    <p className="text-charcoal dark:text-white font-medium text-sm truncate">{nickname}</p>
                                    <Edit2 size={10} className="text-charcoal/30 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            )}
                            <p className="text-xs text-charcoal/50 dark:text-slate-400">Free Plan</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="text-charcoal/60 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1">
                        <LogOut size={16} />
                    </button>
                </div>

                <button disabled className="w-full py-2 rounded-lg border border-beige/30 dark:border-dark-border bg-white/50 dark:bg-dark-bg/50 text-xs font-medium text-charcoal/40 dark:text-slate-500 flex items-center justify-center gap-2 cursor-not-allowed opacity-70">
                    <Crown size={12} />
                    Upgrade Plan (Coming Soon)
                </button>
            </div>
        </aside>
    );
}
