import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, BookOpen, Wrench, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ChatAssistant() {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hello! I am your Campus Laundry Assistant. I can check your recent bookings, explain transaction & refund statuses, and answer questions using campus laundry policies. How can I help today?`,
      toolsUsed: [],
      docsUsed: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend = null) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    if (text.length > 500) {
      setError('Message exceeds the maximum limit of 500 characters.');
      return;
    }

    setError(null);
    setInput('');
    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: text })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: data.reply,
          toolsUsed: data.toolsUsed || [],
          docsUsed: data.docsUsed || []
        }
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "What is the cancellation and refund policy?",
    "Check my recent bookings",
    "What does 'Status unknown' mean?",
    "How does the 5-minute payment window work?"
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-5rem)] flex flex-col space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">Campus Laundry AI Assistant</h1>
            <p className="text-[11px] text-slate-500">Claude Haiku 5.5 • Grounded via RAG & Scoped Tools</p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 shadow-sm ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-line">{m.text}</div>

              {/* Tools or Docs badges for assistant messages */}
              {m.role === 'assistant' && (m.toolsUsed?.length > 0 || m.docsUsed?.length > 0) && (
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                  {m.toolsUsed?.map((tool, i) => (
                    <span key={i} className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">
                      <Wrench className="w-2.5 h-2.5 text-blue-500" />
                      <span>{tool}</span>
                    </span>
                  ))}
                  {m.docsUsed?.map((doc, i) => (
                    <span key={i} className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">
                      <BookOpen className="w-2.5 h-2.5" />
                      <span>{doc}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 mt-1 text-xs font-bold shadow-sm">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-3.5 text-xs text-slate-500 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <span>Thinking and checking policy documents...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts */}
      {messages.length <= 2 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSend(s)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-[11px] font-medium transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Form */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-2 focus-within:border-blue-500 transition-colors">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            maxLength={500}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about booking policies, refund status, or machine details..."
            className="flex-1 px-3 py-2 text-xs focus:outline-none bg-transparent"
          />
          <span className="text-[10px] text-slate-400 font-mono pr-2">
            {input.length}/500
          </span>
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-40 transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
