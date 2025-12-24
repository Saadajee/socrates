// src/pages/AppPage.jsx
import { useParams, useNavigate } from 'react-router-dom';
import ChatMessage from '../components/ChatMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import Promptbar from '../components/Promptbar';
import { useState, useEffect, useRef } from 'react';
import api from '../api/client';

export default function AppPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [currentSources, setCurrentSources] = useState([]);
  const [status, setStatus] = useState('ok');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load history when sessionId changes
  useEffect(() => {
    if (!sessionId) {
      setMessages([]);
      setCurrentSources([]);
      setIsFirstMessage(true);
      return;
    }

    const loadHistory = async () => {
      setHistoryLoading(true);
      try {
        const res = await api.get(`/rag/session/${sessionId}/messages`);
        const loaded = res.data.map(msg => ({ role: msg.role, content: msg.content }));
        setMessages(loaded);
        setCurrentSources([]);
        setIsFirstMessage(loaded.length === 0);
      } catch (err) {
        setError('Failed to load conversation history');
        console.error(err);
      } finally {
        setHistoryLoading(false);
      }
    };

    loadHistory();
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAsk = async (query) => {
    let effectiveSessionId = sessionId ? Number(sessionId) : null;
    let wasFirstMessage = isFirstMessage;

    if (!effectiveSessionId) {
      try {
        const createRes = await api.post('/rag/create_session', { title: 'New Dialogue' });
        effectiveSessionId = createRes.data.id;
        navigate(`/chat/${effectiveSessionId}`, { replace: true });
      } catch (err) {
        setError('Failed to start new dialogue. Please try again.');
        console.error('Session creation failed:', err);
        return;
      }
    }

    const userMessage = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    setIsFirstMessage(false);

    setLoading(true);
    setError('');
    setCurrentSources([]);
    setStatus('ok');

    try {
      const res = await api.post('/rag/ask', {
        query,
        session_id: effectiveSessionId,
        top_k: 5,
      });

      const assistantMessage = { role: 'assistant', content: res.data.answer };
      setMessages(prev => [...prev, assistantMessage]);
      setCurrentSources(res.data.sources || []);
      setStatus(res.data.status);

      if (wasFirstMessage) {
        const words = query.trim().split(' ').slice(0, 8);
        const newTitle = words.join(' ');
        const truncatedTitle = newTitle.length > 60 ? newTitle.slice(0, 57) + '...' : newTitle;

        try {
          await api.put(`/rag/session/${effectiveSessionId}`, { title: truncatedTitle || 'Untitled Dialogue' });
        } catch (titleErr) {
          console.warn('Failed to auto-title session:', titleErr);
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to get answer');
      setMessages(prev => prev.slice(0, -1));
      setIsFirstMessage(wasFirstMessage);
    } finally {
      setLoading(false);
    }
  };

  const isEmpty = messages.length === 0 && !loading && !historyLoading;
  const showPromptbar = !!sessionId;  // This is the only new line you need!

  return (
    <div className="flex flex-col h-screen bg-marble">
      <ErrorBanner message={error} onDismiss={() => setError('')} />

      <div className="flex-1 overflow-y-auto pt-24 px-6 pb-32">
        {isEmpty && (
          <div className="h-full flex items-center justify-center">
            <p className="text-3xl text-deep/60 font-serif text-center leading-relaxed animate-fade-in">
              What question shall we explore today?
            </p>
          </div>
        )}

        {historyLoading && (
          <div className="h-full flex items-center justify-center">
            <LoadingSpinner />
          </div>
        )}

        <div className="max-w-4xl mx-auto w-full space-y-8">
          {messages.map((msg, i) => {
            const isLastAssistant = i === messages.length - 1 && msg.role === 'assistant';
            const showLowContext = isLastAssistant && status === 'low_context';
            const showSources = isLastAssistant && currentSources.length > 0;

            return (
              <div key={i} className="animate-fade-in">
                <ChatMessage message={msg} sources={showSources ? currentSources : []} />

                {showLowContext && (
                  <p className="text-center text-deep/70 italic mt-8 text-lg animate-fade-in">
                    I lack sufficient context to answer reliably.
                  </p>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className="px-8 py-6">
                <LoadingSpinner />
              </div>
            </div>
          )}
        </div>

        <div ref={messagesEndRef} />
      </div>

      {/* Promptbar only shows when a dialogue is selected */}
      {showPromptbar && (
        <div className="fixed bottom-0 left-0 right-0 p-6 pointer-events-none z-10">
          <div className="max-w-4xl mx-auto pointer-events-auto">
            <Promptbar onSubmit={handleAsk} disabled={loading || historyLoading} />
          </div>
        </div>
      )}
    </div>
  );
}
