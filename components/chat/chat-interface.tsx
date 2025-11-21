'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef, useState } from 'react';
import { Send, StopCircle, Sparkles, Bot, User, Plus, ArrowUp } from 'lucide-react';
import { MarkdownContent } from './markdown-content';
import AionAiAnimatedLogo from '@/components/aion-ai-animated-logo';
import { VoiceMode } from '@/components/voice/voice-mode';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export function ChatInterface() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isVoiceModeOpen, setIsVoiceModeOpen] = useState(false);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    // ID para el mensaje del asistente
    const assistantId = crypto.randomUUID();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const fullContent = data.content || data.response || 'No response';

      // Crear mensaje del asistente cuando llega la respuesta
      const assistantMessage: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
        isStreaming: true,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Simular streaming palabra por palabra
      const words = fullContent.split(' ');
      let currentContent = '';

      for (let i = 0; i < words.length; i++) {
        currentContent += (i > 0 ? ' ' : '') + words[i];

        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantId
              ? { ...msg, content: currentContent, isStreaming: i < words.length - 1 }
              : msg
          )
        );

        // Pequeña pausa entre palabras para efecto de streaming
        await new Promise(resolve => setTimeout(resolve, 30));
      }

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const stop = () => {
    setIsLoading(false);
  };

  const suggestedQuestions = [
    '¿Qué es NAD+?',
    '¿Cuáles son los beneficios de Muscle+?',
    '¿Qué productos tenéis disponibles?',
    'Información sobre Magnesio 5',
  ];

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Contenedor principal con bordes redondeados */}
      <div className="flex flex-col h-full max-w-5xl mx-auto w-full rounded-[64px] overflow-hidden bg-black border border-white/10">
        {/* Header futurista */}
        <div className="flex relative items-center justify-between px-8 pt-8 pb-4 shrink-0">
          <button
            onClick={() => setIsVoiceModeOpen(true)}
            className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 transition-all cursor-pointer active:scale-95"
            title="Activar modo voz"
          >
            <AionAiAnimatedLogo className="w-full h-full" />
          </button>

          <button
            onClick={() => setIsVoiceModeOpen(true)}
            className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-primary bg-primary/20 font-semibold text-xs rounded-full py-1.5 px-4 ring-1 ring-primary hover:bg-primary/30 transition-all active:scale-95 cursor-pointer"
          >
            AION AI
          </button>

          <div className="flex items-center gap-2">
            {isLoading && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse-slow" />
              </div>
            )}
          </div>
        </div>

        {/* Messages Area con scrollbar personalizado */}
        <div className="flex-1 overflow-hidden flex flex-col justify-end">
          <div className="overflow-y-auto custom-scrollbar px-8 pt-3" id="conversations-container">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <button
                  onClick={() => setIsVoiceModeOpen(true)}
                  className="w-24 h-24 bg-white/10 rounded-full mb-6 hover:bg-white/20 transition-all cursor-pointer active:scale-95"
                >
                  <AionAiAnimatedLogo className="w-full h-full" />
                </button>
                <h2 className="text-2xl font-semibold mb-3 text-white">
                  Pregunta cualquier cosa
                </h2>
                <p className="text-[#A3A3A3] max-w-md mb-4 text-base">
                  AION AI™
                </p>
                <button
                  onClick={() => setIsVoiceModeOpen(true)}
                  className="text-primary hover:text-primary/80 text-sm font-medium mb-8 transition-colors"
                >
                  O haz click para hablar con AION →
                </button>
                <div className="flex gap-2.5 flex-wrap justify-center">
                  {suggestedQuestions.map((question, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(question)}
                      className="shrink-0 text-primary hover:bg-primary/20 transition-all font-medium text-xs rounded-full py-2 px-3 border border-primary"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => {
                  // No mostrar el mensaje si es del asistente y no tiene contenido todavía
                  if (message.role === 'assistant' && !message.content) {
                    return null;
                  }

                  const isUser = message.role === 'user';

                  return (
                    <div key={message.id || index} className="mb-3.5">
                      <div className={`flex gap-3 items-start ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar/Icon */}
                        {isUser ? (
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-primary/20 rounded-full shrink-0">
                            <AionAiAnimatedLogo className="w-full h-full" />
                          </div>
                        )}

                        {/* Message Bubble */}
                        <div
                          className={`w-fit max-w-[75%] text-sm rounded-3xl px-6 py-3.5 animate-slide-in ${
                            isUser
                              ? 'bg-primary/15'
                              : 'bg-white/[0.07]'
                          }`}
                        >
                          <div className="leading-relaxed relative">
                            <span className={message.isStreaming ? 'inline-cursor' : ''}>
                              <MarkdownContent
                                content={message.content}
                                isUser={isUser}
                              />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Loading Indicator - Solo mostrar si no hay mensaje del asistente en streaming */}
                {isLoading && !messages.some(m => m.role === 'assistant' && m.isStreaming) && (
                  <div className="mb-3.5">
                    <div className="flex items-center gap-3 text-primary w-fit">
                      <div className="w-7 h-7 bg-primary/20 rounded-full shrink-0">
                        <AionAiAnimatedLogo className="w-full h-full" />
                      </div>
                      <span className="aion-typing-animation text-sm">AION está pensando...</span>
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="mb-3.5">
                    <div className="w-fit max-w-[75%] text-sm rounded-3xl px-6 py-3.5 bg-red-500/20 border border-red-500/30 animate-slide-in">
                      <p className="text-sm text-red-300">
                        ⚠️ {error.message}
                      </p>
                    </div>
                  </div>
                )}

                <div ref={scrollRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area futurista */}
        <div className="shrink-0 px-8 pb-4 pt-4">
          <form onSubmit={handleSubmit} className="flex items-end p-2 rounded-[30px] overflow-hidden border border-white/15 focus-within:border-white/30 duration-200">
            <button
              type="button"
              className="w-9 h-9 rounded-full shrink-0 text-primary flex justify-center items-center transition-all hover:bg-primary/20"
            >
              <Plus className="w-[18px] h-[18px]" strokeWidth={2} />
            </button>

            <label className="grow flex items-center self-stretch" aria-label="Message input">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
                disabled={isLoading}
                className="text-white w-full py-2 px-2 resize-none outline-none border-none shadow-none placeholder:text-[#989898] text-sm bg-transparent disabled:opacity-50"
                placeholder="Escribe lo que quieras"
              />
            </label>

            {isLoading ? (
              <button
                type="button"
                onClick={stop}
                className="w-9 h-9 rounded-full shrink-0 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-white transition-all backdrop-blur-sm flex justify-center items-center"
              >
                <StopCircle className="w-[18px] h-[18px]" strokeWidth={2} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 rounded-full shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 transition-all backdrop-blur-sm flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowUp className="w-[18px] h-[18px]" strokeWidth={2} />
              </button>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="shrink-0 pb-7 pt-3 px-8">
          <p className="text-center text-[#848180] text-xs">
            Powered by AION Agent
          </p>
        </div>
      </div>

      {/* Modo Voz */}
      <VoiceMode
        isOpen={isVoiceModeOpen}
        onClose={() => setIsVoiceModeOpen(false)}
      />
    </div>
  );
}
