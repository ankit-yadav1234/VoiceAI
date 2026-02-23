'use client';

import { useEffect, useRef } from 'react';
import { type AgentState } from '@livekit/components-react';
import { cn } from '@/lib/utils';

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

      // Auto-scroll logic (Keeping this as it was the first requested feature today, 
      // but if you want to remove it too, let me know)
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
                        <div className="flex flex-col items-center justify-center py-12 text-slate-500 space-y-2">
                              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                              </div>
                              <p className="text-sm font-medium italic">Waiting for transcript feedback...</p>
                        </div>
                  )}

                  {messages.map((message) => (
                        <div
                              key={message.id}
                              className={cn(
                                    'flex flex-col gap-1.5 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300',
                                    message.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                              )}
                        >
                              <div className="flex items-center gap-2 px-1">
                                    <span className={cn(
                                          'text-[9px] font-black uppercase tracking-[0.3em]',
                                          message.sender === 'user' ? 'text-blue-500' : 'text-slate-500'
                                    )}>
                                          {message.sender === 'user' ? 'User' : 'Intelligence Agent'}
                                    </span>
                              </div>
                              <div
                                    className={cn(
                                          'px-5 py-4 rounded-[1.8rem] text-[15px] font-medium leading-[1.6] transition-all shadow-xl',
                                          message.sender === 'user'
                                                ? 'bg-blue-600/10 text-blue-50 border border-blue-500/20 rounded-tr-none'
                                                : 'bg-white/5 text-slate-100 border border-white/5 rounded-tl-none'
                                    )}
                              >
                                    {message.text}
                              </div>
                        </div>
                  ))}

                  {agentState === 'thinking' && (
                        <div className="flex flex-col gap-1.5 mr-auto items-start animate-pulse">
                              <div className="px-1">
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Intelligence Agent</span>
                              </div>
                              <div className="px-4 py-3 rounded-2xl bg-white/5 text-slate-400 border border-white/5 rounded-tl-none italic text-sm">
                                    Thinking...
                              </div>
                        </div>
                  )}

                  {/* Hidden element to scroll to */}
                  <div ref={scrollRef} className="h-0" />
            </div>
      );
}
