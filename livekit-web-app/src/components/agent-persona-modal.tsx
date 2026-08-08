'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Code2, Globe2, Briefcase, Check, X, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Persona {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  badgeColor: string;
  systemPrompt: string;
}

export const PERSONAS: Persona[] = [
  {
    id: 'general',
    name: 'Voice Assistant',
    role: 'General AI Helper',
    description: 'Friendly, versatile companion for everyday questions, brainstorming, and casual dialogue.',
    icon: Bot,
    gradient: 'from-blue-600 to-emerald-500',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    systemPrompt: 'You are a helpful, friendly, and concise real-time voice assistant.',
  },
  {
    id: 'coder',
    name: 'Code Engineer',
    role: 'Tech & Architecture Specialist',
    description: 'Deep technical knowledge in React, TypeScript, Python, backend architecture, and debugging.',
    icon: Code2,
    gradient: 'from-purple-600 to-indigo-500',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    systemPrompt: 'You are an expert senior software engineer and coding tutor. Provide clear, concise technical explanations.',
  },
  {
    id: 'tutor',
    name: 'Language Tutor',
    role: 'Conversational Practice',
    description: 'Practice English, Hindi, or multilingual conversation with instant pronunciation & grammar tips.',
    icon: Globe2,
    gradient: 'from-amber-500 to-orange-500',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    systemPrompt: 'You are a patient language tutor. Help the user speak fluently and offer gentle corrections.',
  },
  {
    id: 'interviewer',
    name: 'Mock Interviewer',
    role: 'Career & Tech Prep',
    description: 'Simulates technical & behavioral job interviews. Ask tough questions and give feedback.',
    icon: Briefcase,
    gradient: 'from-pink-600 to-rose-500',
    badgeColor: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    systemPrompt: 'You are a tech hiring manager conducting a mock interview. Ask realistic interview questions.',
  },
];

interface AgentPersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPersona: Persona;
  onSelectPersona: (persona: Persona) => void;
}

export function AgentPersonaModal({
  isOpen,
  onClose,
  selectedPersona,
  onSelectPersona,
}: AgentPersonaModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-xl bg-slate-900/95 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden z-10"
          >
            {/* Top decorative gradient glow */}
            <div className="absolute -top-24 -left-24 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600/30 to-emerald-500/30 border border-white/10 text-emerald-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">AI Agent Persona</h3>
                  <p className="text-xs text-slate-400">Select how the AI voice agent should respond</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
              {PERSONAS.map((persona) => {
                const Icon = persona.icon;
                const isSelected = selectedPersona.id === persona.id;

                return (
                  <div
                    key={persona.id}
                    onClick={() => {
                      onSelectPersona(persona);
                      onClose();
                    }}
                    className={`relative cursor-pointer p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-3 group ${
                      isSelected
                        ? 'bg-slate-800/90 border-blue-500/80 shadow-lg shadow-blue-500/10'
                        : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${persona.gradient} text-white shadow-md`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                          {persona.name}
                        </h4>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${persona.badgeColor}`}>
                          {persona.role}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {persona.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                Changes apply seamlessly during conversations
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="border-slate-700 text-slate-200 hover:bg-slate-800 rounded-xl"
              >
                Done
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
