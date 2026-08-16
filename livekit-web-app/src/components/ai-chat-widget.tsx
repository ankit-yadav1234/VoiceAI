'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, User, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Persona } from '@/components/agent-persona-modal';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}

interface AIChatWidgetProps {
  persona: Persona;
  onOpenVideoAvatar: () => void;
}

export function AIChatWidget({ persona, onOpenVideoAvatar }: AIChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'agent',
      text: `Hi Ankit! I'm ${persona.name} from ${persona.department}. How can I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentQuery = inputText;
    setInputText('');
    setIsTyping(true);

    // Simulate Agent Text Response
    setTimeout(() => {
      let responseText = `I am ${persona.name} from ${persona.department}. I can definitely help with "${currentQuery}".`;
      if (persona.id === 'elly') {
        responseText = `[Elly - Eligibility] Let me verify your member status for "${currentQuery}". Coverage status: Active & Verified!`;
      } else if (persona.id === 'april') {
        responseText = `[April - Scheduling] Available slots for "${currentQuery}": Tomorrow at 10:00 AM, 11:30 AM, or 3:00 PM.`;
      } else if (persona.id === 'priya') {
        responseText = `[Priya - Payments] Invoice breakdown retrieved for "${currentQuery}". No outstanding unpaid balance found!`;
      }

      const agentReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, agentReply]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto">
      {/* Expanded Popup Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-80 sm:w-96 bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[480px]"
          >
            {/* Panel Header */}
            <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-cyan-400/80 shrink-0">
                  <Image
                    src={persona.avatar}
                    alt={persona.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-white">{persona.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {persona.department}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Text Chat Agent • AI Assistant</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={onOpenVideoAvatar}
                  title="Switch to Video Voice Call"
                  className="p-2 rounded-xl text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                >
                  <Video className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Transcript Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${
                    msg.sender === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    }`}
                  >
                    {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-tl-none'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span className="text-[9px] text-slate-400 mt-1 block text-right">{msg.timestamp}</span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-slate-400 text-xs italic">
                  <Bot className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
                  <span>{persona.name} is typing...</span>
                </div>
              )}
            </div>

            {/* Message Input Bar */}
            <div className="p-3 border-t border-white/10 bg-slate-950/80 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={`Ask ${persona.name}...`}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <Button
                size="sm"
                onClick={handleSendMessage}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl p-2 h-8 w-8 flex items-center justify-center shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Buttons (Matching Image 2 Bottom-Right Corner) */}
      <div className="flex flex-col items-center gap-3">
        {/* Floating Active Agent Video Avatar Button */}
        <button
          onClick={onOpenVideoAvatar}
          title={`Call ${persona.name} (Video Voice Agent)`}
          className="group relative focus:outline-none"
        >
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-transform duration-300 group-hover:scale-110">
            <Image
              src={persona.avatar}
              alt={persona.name}
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          </span>
        </button>

        {/* Floating Chat Button (💬) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          title="Open AI Chat Widget"
          className="w-12 h-12 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/30 flex items-center justify-center transition-transform duration-300 hover:scale-110 active:scale-95 focus:outline-none"
        >
          <MessageSquare className="w-5 h-5 fill-current" />
        </button>
      </div>
    </div>
  );
}
