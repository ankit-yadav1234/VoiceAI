'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export interface Persona {
  id: string;
  name: string;
  department: string;
  role: string;
  description: string;
  avatar: string;
  defaultVoice: string;
  gradient: string;
  badgeColor: string;
  systemPrompt: string;
  workflow: string[];
}

export const PERSONAS: Persona[] = [
  {
    id: 'elly',
    name: 'Elly',
    department: 'Eligibility',
    role: 'Eligibility & Coverage Specialist',
    description: 'Verifies customer/member identity, checks real-time insurance eligibility, and explains benefit coverage.',
    avatar: '/avatars/elly.jpg',
    defaultVoice: 'Anyar',
    gradient: 'from-cyan-600 to-blue-500',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    systemPrompt: 'You are Elly from the Eligibility department. Help users verify member eligibility, explain coverage status, and guide them through identity verification.',
    workflow: ['Verify Identity', 'Check Eligibility API', 'Explain Coverage', 'Log Case'],
  },
  {
    id: 'paige',
    name: 'Paige',
    department: 'Authorization',
    role: 'Service Pre-Authorization Officer',
    description: 'Determines pre-authorization requirements, submits authorization requests, and tracks approval status.',
    avatar: '/avatars/paige.jpg',
    defaultVoice: 'Kore',
    gradient: 'from-amber-500 to-orange-500',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    systemPrompt: 'You are Paige from the Authorization department. Assist users with pre-authorization requirements, submission tracking, and status explanations.',
    workflow: ['Identify Service', 'Check Requirements', 'Submit Request', 'Track Approval'],
  },
  {
    id: 'priya',
    name: 'Priya',
    department: 'Payments',
    role: 'Payments & Billing Specialist',
    description: 'Handles payment status inquiries, processes transactions securely, invoice questions, and refund requests.',
    avatar: '/avatars/priya.jpg',
    defaultVoice: 'Fenrir',
    gradient: 'from-purple-600 to-indigo-500',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    systemPrompt: 'You are Priya from the Payments department. Handle invoice questions, payment status, secure payment processing, and refund queries.',
    workflow: ['Retrieve Invoice', 'Confirm Amount', 'Process Transaction', 'Send Receipt'],
  },
  {
    id: 'april',
    name: 'April',
    department: 'Scheduling',
    role: 'Appointment Booking & Calendar Manager',
    description: 'Finds real-time provider slots, books appointments, reschedules existing slots, and sends instant confirmations.',
    avatar: '/avatars/april.jpg',
    defaultVoice: 'Puck',
    gradient: 'from-emerald-500 to-teal-500',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    systemPrompt: 'You are April from the Scheduling department. Help users book, reschedule, or cancel appointments, check provider availability, and send confirmations.',
    workflow: ['Identify Request', 'Check Available Slots', 'Confirm Details', 'Book & Notify'],
  },
  {
    id: 'curtis',
    name: 'Curtis',
    department: 'Support',
    role: 'General Support & KB Navigator',
    description: 'Provides general customer support, answers FAQs, resolves account issues, and routes to specialist agents.',
    avatar: '/avatars/curtis.jpg',
    defaultVoice: 'Aoede',
    gradient: 'from-pink-600 to-rose-500',
    badgeColor: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    systemPrompt: 'You are Curtis from General Support. Answer general customer questions, help with account issues, and route to specialist agents when needed.',
    workflow: ['Understand Query', 'Search Knowledge Base', 'Provide Answer', 'Route Specialist'],
  },
  {
    id: 'chris',
    name: 'Chris',
    department: 'Claims',
    role: 'Claims Intake & Status Officer',
    description: 'Manages claim intake, tracks claim processing status, requests missing documentation, and escalates disputes.',
    avatar: '/avatars/chris.jpg',
    defaultVoice: 'Fenrir',
    gradient: 'from-blue-600 to-indigo-600',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    systemPrompt: 'You are Chris from the Claims department. Assist users with claim intake, status tracking, documentation submission, and claim follow-ups.',
    workflow: ['Collect Claim Info', 'Retrieve Claim', 'Track Processing', 'Request Documents'],
  },
  {
    id: 'cindy',
    name: 'Cindy',
    department: 'Collections',
    role: 'Respectful Balance & Payment Plans',
    description: 'Discusses outstanding balances respectfully, arranges flexible payment plans, and records collection outcomes.',
    avatar: '/avatars/cindy.jpg',
    defaultVoice: 'Anyar',
    gradient: 'from-sky-500 to-blue-500',
    badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    systemPrompt: 'You are Cindy from Collections. Discuss outstanding balances respectfully, offer flexible payment arrangement options, and assist with resolution.',
    workflow: ['Explain Balance', 'Present Payment Plans', 'Process Arrangement', 'Record Outcome'],
  },
  {
    id: 'ariel',
    name: 'Ariel',
    department: 'AR',
    role: 'Accounts Receivable & Reconciliation',
    description: 'Inspects accounts receivable balances, reviews aging invoice records, and reconciles payment discrepancies.',
    avatar: '/avatars/ariel.jpg',
    defaultVoice: 'Kore',
    gradient: 'from-violet-600 to-purple-500',
    badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    systemPrompt: 'You are Ariel from Accounts Receivable. Help users inspect invoice balances, review receivables status, and reconcile payment records.',
    workflow: ['Retrieve Account', 'Inspect AR Aging', 'Identify Discrepancies', 'Reconcile Balance'],
  },
  {
    id: 'connie',
    name: 'Connie',
    department: 'Coding',
    role: 'Documentation & Coding Assistant',
    description: 'Reviews clinical/technical documentation, validates coding rules, and provides coding suggestions.',
    avatar: '/avatars/connie.jpg',
    defaultVoice: 'Aoede',
    gradient: 'from-orange-500 to-amber-500',
    badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    systemPrompt: 'You are Connie from the Coding department. Review documentation, validate coding rules, flag missing clinical information, and provide suggestions.',
    workflow: ['Retrieve Document', 'Validate Rules', 'Suggest Codes', 'Flag Missing Info'],
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-slate-900/95 border border-slate-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden z-10 my-auto"
          >
            {/* Top decorative glow */}
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-600/30 to-blue-500/30 border border-white/10 text-cyan-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Enterprise Multi-Agent Roster</h3>
                  <p className="text-xs text-slate-400">Select a specialized AI agent for your department workflow</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 9 Agents Avatar Grid (Matching User Reference Image) */}
            <div className="my-6">
              <p className="text-center text-xs font-semibold text-cyan-400 tracking-widest uppercase mb-6">
                Click on any agent to start a conversation
              </p>
              
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 justify-items-center mb-6">
                {PERSONAS.slice(0, 5).map((persona) => {
                  const isSelected = selectedPersona.id === persona.id;
                  return (
                    <button
                      key={persona.id}
                      onClick={() => {
                        onSelectPersona(persona);
                        onClose();
                      }}
                      className="group flex flex-col items-center space-y-2 text-center transition-all duration-300 focus:outline-none"
                    >
                      <div className="relative">
                        <div
                          className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 transition-all duration-300 shadow-lg ${
                            isSelected
                              ? 'border-cyan-400 ring-4 ring-cyan-400/30 scale-105 shadow-cyan-500/40'
                              : 'border-cyan-500/60 group-hover:border-cyan-400 group-hover:scale-105 group-hover:shadow-cyan-500/30'
                          }`}
                        >
                          <Image
                            src={persona.avatar}
                            alt={persona.name}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover object-center"
                          />
                        </div>
                        {isSelected && (
                          <div className="absolute top-0 right-0 w-6 h-6 rounded-full bg-cyan-500 border-2 border-slate-900 flex items-center justify-center text-slate-950 font-bold">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                          {persona.name}
                        </h4>
                        <span className="text-[11px] font-semibold text-slate-400 block">
                          {persona.department}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 justify-items-center max-w-2xl mx-auto">
                {PERSONAS.slice(5).map((persona) => {
                  const isSelected = selectedPersona.id === persona.id;
                  return (
                    <button
                      key={persona.id}
                      onClick={() => {
                        onSelectPersona(persona);
                        onClose();
                      }}
                      className="group flex flex-col items-center space-y-2 text-center transition-all duration-300 focus:outline-none"
                    >
                      <div className="relative">
                        <div
                          className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 transition-all duration-300 shadow-lg ${
                            isSelected
                              ? 'border-cyan-400 ring-4 ring-cyan-400/30 scale-105 shadow-cyan-500/40'
                              : 'border-cyan-500/60 group-hover:border-cyan-400 group-hover:scale-105 group-hover:shadow-cyan-500/30'
                          }`}
                        >
                          <Image
                            src={persona.avatar}
                            alt={persona.name}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover object-center"
                          />
                        </div>
                        {isSelected && (
                          <div className="absolute top-0 right-0 w-6 h-6 rounded-full bg-cyan-500 border-2 border-slate-900 flex items-center justify-center text-slate-950 font-bold">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                          {persona.name}
                        </h4>
                        <span className="text-[11px] font-semibold text-slate-400 block">
                          {persona.department}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Agent Quick Preview Banner */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-cyan-400/60 shrink-0">
                  <Image
                    src={selectedPersona.avatar}
                    alt={selectedPersona.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{selectedPersona.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${selectedPersona.badgeColor}`}>
                      {selectedPersona.department}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-snug">{selectedPersona.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-semibold text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                  Voice: <strong className="text-cyan-400">{selectedPersona.defaultVoice}</strong>
                </span>
                <Button
                  size="sm"
                  onClick={() => {
                    onSelectPersona(selectedPersona);
                    onClose();
                  }}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs px-4"
                >
                  Select {selectedPersona.name}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
