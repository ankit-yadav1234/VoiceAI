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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, agentState]);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
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
            'flex flex-col gap-1.5 max-w-[88%] animate-in fade-in slide-in-from-bottom-2 duration-300 group',
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
        <div className="flex flex-col gap-1.5 mr-auto items-start animate-pulse">
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

      <div ref={scrollRef} className="h-0" />
    </div>
  );
}
