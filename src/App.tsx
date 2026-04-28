/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, Settings2, RefreshCw, ChevronRight, Hash, Paperclip, MoreHorizontal, Circle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getChatResponse } from './services/geminiService';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [isSetup, setIsSetup] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleStart = () => {
    if (topic.trim()) {
      setIsSetup(false);
      setMessages([
        {
          id: '1',
          role: 'model',
          text: `Hola. He analizado los parámetros de nuestro agente enfocado en **${topic}**. Estoy listo para profundizar en cualquier autor o corriente que desees explorar. ¿Por dónde te gustaría empezar hoy?`,
          timestamp: getCurrentTime(),
        },
      ]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: getCurrentTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));
    
    history.push({ role: 'user', parts: [{ text: input }] });

    const systemInstruction = `Eres un experto amable y servicial especializado en el tema: ${topic}. 
    Responde siempre en español. Mantén un tono minimalista, profesional y sumamente claro. 
    Utiliza formato Markdown.`;

    const aiResponseText = await getChatResponse(history, systemInstruction);

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: aiResponseText,
      timestamp: getCurrentTime(),
    };

    setMessages((prev) => [...prev, botMessage]);
    setIsLoading(false);
  };

  if (isSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-zinc-200 p-8"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-zinc-900 rounded-full mb-6 mx-auto">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          
          <h1 className="text-xl font-bold text-center text-zinc-900 mb-2">Configura tu Agente</h1>
          <p className="text-zinc-500 text-sm text-center mb-8">Estructura una conversación especializada</p>
          
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="topic" className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 block px-1">Tema del Agente</label>
              <input
                id="topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ej: Filosofía Contemporánea"
                className="w-full px-4 py-3 text-sm bg-zinc-50 rounded border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleStart()}
              />
            </div>
            
            <button
              onClick={handleStart}
              disabled={!topic.trim()}
              className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold uppercase tracking-tight rounded-lg transition-colors disabled:opacity-50"
            >
              Nueva Sesión
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden font-sans text-zinc-900">
      {/* Sidebar: Agent Configuration */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-zinc-200 flex-col shrink-0">
        <div className="p-6 border-b border-zinc-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-white font-bold text-sm">A</div>
            <div>
              <h1 className="font-semibold text-sm leading-tight">Agente Especializado</h1>
              <p className="text-[10px] text-zinc-400">v2.4.0 • Online</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Tema</label>
              <div className="text-xs font-medium p-2 bg-zinc-50 rounded border border-zinc-200 truncate">{topic}</div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Modelo</label>
              <div className="text-xs font-medium p-2 bg-zinc-50 rounded border border-zinc-200 uppercase">Gemini 3 Flash</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 px-2 mb-2">Contexto Actual</div>
          <div className="px-3 py-2 bg-zinc-100 rounded text-sm font-medium flex items-center gap-2">
            <Hash size={14} className="text-zinc-500" />
            Sesión Activa
          </div>
        </nav>

        <div className="p-6 border-t border-zinc-100">
          <button 
            onClick={() => setIsSetup(true)}
            className="w-full py-2 bg-zinc-900 text-white text-xs font-bold uppercase tracking-tight rounded transition-colors hover:bg-zinc-800"
          >
            Reiniciar
          </button>
        </div>
      </aside>

      {/* Main Content: Chat Interface */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-zinc-200 px-4 md:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500 animate-pulse" />
            <span className="text-xs md:text-sm font-medium truncate">Sesión Activa: {topic}</span>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setIsSetup(true)}
              className="lg:hidden p-2 text-zinc-400 hover:text-zinc-900"
            >
              <Settings2 size={20} />
            </button>
            <button className="text-zinc-400 hover:text-zinc-900">
              <MoreHorizontal size={20} />
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 max-w-2xl ${message.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center text-[10px] font-bold shadow-sm ${
                  message.role === 'user' ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-600 uppercase'
                }`}>
                  {message.role === 'user' ? 'TU' : 'AI'}
                </div>
                
                <div className={`space-y-2 ${message.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`p-4 shadow-sm text-sm leading-relaxed ${
                    message.role === 'user' 
                    ? 'bg-zinc-900 text-white rounded-tl-2xl rounded-br-2xl rounded-bl-2xl' 
                    : 'bg-white border border-zinc-200 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl'
                  }`}>
                    <div className="markdown-body">
                      {message.role === 'user' ? (
                        <p>{message.text}</p>
                      ) : (
                        <ReactMarkdown>{message.text}</ReactMarkdown>
                      )}
                    </div>
                  </div>
                  <p className={`text-[10px] text-zinc-400 ${message.role === 'user' ? 'mr-1' : 'ml-1'}`}>
                    {message.timestamp}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4 max-w-2xl"
            >
              <div className="w-8 h-8 rounded bg-zinc-200 shrink-0 flex items-center justify-center text-[10px] font-bold text-zinc-600">AI</div>
              <div className="bg-white border border-zinc-200 p-4 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl shadow-sm flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce"></span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-8 pt-0 shrink-0 bg-zinc-50">
          <div className="relative bg-white border border-zinc-200 rounded-xl shadow-lg flex items-center p-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Pregunta algo a tu agente..."
              className="flex-1 px-4 py-3 text-sm focus:outline-none bg-transparent placeholder:text-zinc-400"
              disabled={isLoading}
            />
            <div className="flex gap-2 pr-2">
              <button className="hidden md:flex p-2 text-zinc-400 hover:text-zinc-600 transition-colors">
                <Paperclip size={20} />
              </button>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold uppercase tracking-tight transition-all active:scale-95 flex items-center justify-center"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin text-zinc-400" /> : 'Enviar'}
              </button>
            </div>
          </div>
          <p className="text-center text-[10px] text-zinc-400 mt-4 hidden md:block">
            Este agente utiliza una conexión segura via API. Los datos de la conversación son privados.
          </p>
        </div>
      </main>
    </div>
  );
}
