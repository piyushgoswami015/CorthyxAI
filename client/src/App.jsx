import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import WelcomeScreen from './components/WelcomeScreen';
import { Loader2, Moon, Sun } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'system', text: 'Hello! Upload a document or paste a link to get started.' }
  ]);
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    checkAuth();
    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('/api/user');
      setUser(response.data.user);
    } catch (error) {
      console.error('Auth check failed', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleIngestSuccess = (sourceName) => {
    setIsReady(true);
    setMessages(prev => [
      ...prev,
      { type: 'system', text: `Source "${sourceName}" processed successfully.` }
    ]);
    closeSidebar(); // Close sidebar after successful upload on mobile
  };

  const handleSendMessage = async (text) => {
    setMessages(prev => [...prev, { type: 'user', text }]);
    setIsProcessing(true);

    try {
      const response = await axios.post('/api/chat', { question: text });
      setMessages(prev => [...prev, { type: 'bot', text: response.data.answer }]);
    } catch (error) {
      setMessages(prev => [...prev, { type: 'bot', text: 'Sorry, something went wrong.' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream dark:bg-dark-bg flex items-center justify-center transition-colors">
        <Loader2 className="animate-spin text-beige dark:text-blue-500" size={32} />
      </div>
    );
  }

  if (!user) {
    return <WelcomeScreen />;
  }

  return (
    <div className="flex h-screen bg-cream dark:bg-dark-bg overflow-hidden transition-colors">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      <Sidebar
        onIngestSuccess={handleIngestSuccess}
        user={user}
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />
      <ChatArea
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isProcessing}
        isReady={isReady}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onToggleSidebar={toggleSidebar}
      />
    </div>
  );
}

export default App;
