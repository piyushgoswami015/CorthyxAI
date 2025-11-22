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

      // Check if user has uploaded data
      try {
        const dataCheck = await axios.get('/api/user/has-data');
        if (dataCheck.data.hasData) {
          setIsReady(true);
          setMessages(prev => [
            ...prev,
            { type: 'system', text: 'Welcome back! Your documents are ready.' }
          ]);
        }
      } catch (e) {
        console.error('Failed to check user data status', e);
      }
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

    // Add empty bot message that will be updated as stream arrives
    const botMessageIndex = messages.length + 1; // +1 because we just added user message
    setMessages(prev => [...prev, { type: 'bot', text: '', streaming: true }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ question: text }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));

            if (data.error) {
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[botMessageIndex] = {
                  type: 'bot',
                  text: 'Sorry, something went wrong.',
                  streaming: false
                };
                return newMessages;
              });
              break;
            }

            if (data.done) {
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[botMessageIndex] = {
                  ...newMessages[botMessageIndex],
                  streaming: false
                };
                return newMessages;
              });
              break;
            }

            if (data.content) {
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[botMessageIndex] = {
                  type: 'bot',
                  text: (newMessages[botMessageIndex].text || '') + data.content,
                  streaming: true
                };
                return newMessages;
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[botMessageIndex] = {
          type: 'bot',
          text: 'Sorry, something went wrong.',
          streaming: false
        };
        return newMessages;
      });
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
