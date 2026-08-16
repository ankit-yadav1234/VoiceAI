'use client';

import { useEffect, useRef } from 'react';
import { type AgentState } from '@livekit/components-react';
import { cn } from '@/lib/utils';
import { Bot, User, Sparkles } from 'lucide-react';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: number;
}

export interface AgentChatTranscriptProps {
  messages: ChatMessage[];
  agentState: AgentState;
  className?: string;
}

export function AgentChatTranscript({
  messages,
  agentState,
  className,
}: AgentChatTranscriptProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [messages, agentState]);

  const handleExportMarkdown = () => {
    if (messages.length === 0) return;
    const content = messages
      .map(
        (m) =>
          `**${m.sender === 'user' ? 'User' : 'AI Assistant'}** [${new Date(m.timestamp).toLocaleTimeString()}]:\n${m.text}\n`
      )
      .join('\n---\n\n');

    const blob = new Blob([`# VoiceAI Transcript\n\n${content}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voiceai-transcript-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    if (messages.length === 0) return;
    const blob = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voiceai-transcript-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      ref={containerRef}
      className={cn('flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4 scroll-smooth', className)}
    >
      {messages.length > 0 && (
        <div className="sticky top-0 z-10 flex items-center justify-between px-3 py-2 bg-slate-900/90 backdrop-blur-md border border-slate-800/80 rounded-xl text-xs text-slate-400 shadow-md shrink-0">
          <span className="font-semibold text-slate-300">Transcript ({messages.length} messages)</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportMarkdown}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 font-semibold transition-colors"
            >
              Export Markdown
            </button>
            <button
              onClick={handleExportJSON}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 font-semibold transition-colors"
            >
              Download JSON
            </button>
          </div>
        </div>
      )}

      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3 my-auto">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-emerald-500/20 border border-white/10 flex items-center justify-center shadow-inner">
            <Sparkles className="w-6 h-6 text-blue-400 animate-pulse" />
          </div>
          <p className="text-sm font-semibold tracking-wide text-slate-300">No messages yet</p>
          <p className="text-xs text-slate-500 text-center max-w-xs leading-relaxed">
            Start speaking or type a message below to interact with your AI agent.
          </p>
        </div>
      )}

      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            'flex flex-col gap-1.5 max-w-[88%] animate-in fade-in slide-in-from-bottom-2 duration-300 group shrink-0',
            message.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
          )}
        >
          <div className="flex items-center gap-1.5 px-1">
            {message.sender === 'user' ? (
              <>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 group-hover:text-blue-300 transition-colors">
                  You
                </span>
                <User className="w-3 h-3 text-blue-400" />
              </>
            ) : (
              <>
                <Bot className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 group-hover:text-emerald-300 transition-colors">
                  AI Assistant
                </span>
              </>
            )}
          </div>

          <div
            className={cn(
              'px-5 py-3.5 rounded-2xl text-[15px] font-medium leading-relaxed transition-all duration-300 shadow-md',
              message.sender === 'user'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs border border-blue-400/30 hover:shadow-blue-500/20 hover:border-blue-400/50'
                : 'bg-slate-900/90 text-slate-100 border border-slate-700/80 rounded-tl-xs hover:border-slate-600 hover:shadow-black/40'
            )}
          >
            {message.text}
          </div>
        </div>
      ))}

      {agentState === 'thinking' && (
        <div className="flex flex-col gap-1.5 mr-auto items-start animate-pulse shrink-0">
          <div className="flex items-center gap-1.5 px-1">
            <Bot className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">AI Assistant</span>
          </div>
          <div className="px-5 py-3 rounded-2xl bg-slate-900/80 text-blue-300 border border-blue-500/30 rounded-tl-xs italic text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400 animate-spin" />
            Generating response...
          </div>
        </div>
      )}
    </div>
  );
}
