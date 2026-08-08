'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useVoiceAssistant,
  useChat,
  useSession,
  useSessionMessages,
  useSessionContext,
} from '@livekit/components-react';
import { TokenSource } from 'livekit-client';
import { AgentSessionProvider } from '@/components/agent-session-provider';
import { AgentControlBar } from '@/components/agent-control-bar';
import { AgentAudioVisualizerAura } from '@/components/agent-audio-visualizer-aura';
import { AgentAudioVisualizerBar } from '@/components/agent-audio-visualizer-bar';
import { AgentChatTranscript } from '@/components/agent-chat-transcript';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AgentPersonaModal, PERSONAS, Persona } from '@/components/agent-persona-modal';
import { AgentSettingsModal } from '@/components/agent-settings-modal';
import {
  Loader2,
  Send,
  MessageSquare,
  Sparkles,
  Shield,
  Zap,
  Settings,
  Activity,
  ArrowRight,
  Code2,
  Globe2,
  Briefcase,
  Bot,
  Volume2,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const QUICK_PROMPTS = [
  { icon: Sparkles, text: 'Tell me a fun tech trivia fact', prompt: 'Tell me a fun tech trivia fact!' },
  { icon: Code2, text: 'How do I optimize React state?', prompt: 'How do I optimize React state and prevent useless re-renders?' },
  { icon: Briefcase, text: 'Simulate a mock job interview', prompt: 'Simulate a mock technical job interview with me!' },
  { icon: Globe2, text: 'Teach me 3 useful French phrases', prompt: 'Teach me 3 useful conversational French phrases!' },
];

export default function Home() {
  const [connectionDetails, setConnectionDetails] = useState<{
    token: string;
    url: string;
  } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [insecureError, setInsecureError] = useState(false);

  // Modals state
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<Persona>(PERSONAS[0]);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  const onConnect = useCallback(async (initialPrompt?: string) => {
    if (typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost') {
      setInsecureError(true);
      return;
    }
    setInsecureError(false);
    setIsConnecting(true);

    if (initialPrompt) {
      setPendingPrompt(initialPrompt);
    }

    try {
      const response = await fetch('/api/token');
      const data = await response.json();
      
      setConnectionDetails({
        token: data.token,
        url: data.url,
      });

      fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: data.roomName,
          agentName: 'my-agent',
        }),
      }).catch(err => console.log('Dispatch background notice:', err));
    } catch (e) {
      console.error('Connection error:', e);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const onDisconnect = useCallback(() => {
    setConnectionDetails(null);
    setPendingPrompt(null);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950/20 flex flex-col no-underline">
      {/* Navbar */}
      <nav className="h-20 px-4 sm:px-8 flex items-center justify-between border-b border-white/5 backdrop-blur-md sticky top-0 z-40 bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 shadow-lg shadow-blue-500/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white">Voice.ai</span>
            <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">Live Realtime Agent</span>
          </div>
        </div>

        {/* Interactive Feature Controls (Replacing static Docs/Pricing) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Persona Switcher Pill */}
          <Button
            variant="ghost"
            onClick={() => setIsPersonaModalOpen(true)}
            className="flex items-center gap-2 text-slate-300 hover:text-white bg-slate-900/80 border border-slate-700/60 hover:border-slate-600 rounded-xl px-3.5 py-2 text-xs font-semibold shadow-inner"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Mode:</span>
            <span className="text-emerald-400 font-bold">{selectedPersona.name}</span>
          </Button>

          {/* Settings & Audio Diagnostics */}
          <Button
            variant="ghost"
            onClick={() => setIsSettingsModalOpen(true)}
            className="flex items-center gap-2 text-slate-300 hover:text-white bg-slate-900/80 border border-slate-700/60 hover:border-slate-600 rounded-xl px-3.5 py-2 text-xs font-semibold shadow-inner"
          >
            <Settings className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">Diagnostics</span>
          </Button>

          {/* Realtime Latency Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            &lt; 50ms Latency
          </div>

          {connectionDetails && (
            <div className="flex items-center gap-3 ml-2">
              <SessionTimer />
              <Button
                variant="outline"
                size="sm"
                onClick={onDisconnect}
                className="border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20 h-9 px-4 text-xs font-bold rounded-xl"
              >
                End Session
              </Button>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {!connectionDetails ? (
            <motion.div
              key="hero"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              className="z-10 max-w-3xl w-full text-center space-y-8 py-12 md:py-16"
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-blue-400 text-xs font-semibold shadow-lg"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Active Mode: <span className="text-white font-bold">{selectedPersona.name}</span> ({selectedPersona.role})
                </motion.div>

                <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter text-white leading-[1.1]">
                  Next-Gen <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-indigo-400 bg-[length:200%_auto] animate-[gradient_4s_linear_infinite]">
                    Voice Intelligence.
                  </span>
                </h1>
                <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                  Real-time low-latency voice AI powered by LiveKit & Gemini. Speaks, understands context, and responds in under 100 milliseconds.
                </p>
              </div>

              {/* Start Button */}
              <div className="pt-2 flex flex-col items-center gap-3">
                <Button
                  size="lg"
                  onClick={() => onConnect()}
                  disabled={isConnecting}
                  className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white px-10 h-14 text-lg rounded-2xl transition-all shadow-xl shadow-blue-500/25 active:scale-95 group font-bold"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Connecting Agent...
                    </>
                  ) : (
                    <span className="flex items-center gap-2">
                      Start Voice Session
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </div>

              {/* Quick Interactive Prompt Chips */}
              <div className="pt-4 max-w-2xl mx-auto space-y-2.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Or click a quick starter prompt to connect:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {QUICK_PROMPTS.map((qp, idx) => {
                    const Icon = qp.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => onConnect(qp.prompt)}
                        className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/60 text-slate-300 hover:text-white text-xs font-semibold text-left transition-all group"
                      >
                        <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:text-emerald-400 transition-colors">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="flex-1 truncate">{qp.text}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Features Pill Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-white/5 text-slate-400">
                <div className="p-3 rounded-2xl bg-slate-900/30 border border-white/5 text-center space-y-1">
                  <div className="text-base font-bold text-white flex items-center justify-center gap-1">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    &lt; 50ms
                  </div>
                  <div className="text-[11px] font-medium text-slate-500">Ultra-low Latency</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/30 border border-white/5 text-center space-y-1">
                  <div className="text-base font-bold text-white flex items-center justify-center gap-1">
                    <Volume2 className="w-4 h-4 text-blue-400" />
                    HD Audio
                  </div>
                  <div className="text-[11px] font-medium text-slate-500">OPUS 48kHz Codec</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/30 border border-white/5 text-center space-y-1">
                  <div className="text-base font-bold text-white flex items-center justify-center gap-1">
                    <Shield className="w-4 h-4 text-purple-400" />
                    Encrypted
                  </div>
                  <div className="text-[11px] font-medium text-slate-500">AES-GCM Security</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/30 border border-white/5 text-center space-y-1">
                  <div className="text-base font-bold text-white flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    Live Sync
                  </div>
                  <div className="text-[11px] font-medium text-slate-500">STT + TTS Transcript</div>
                </div>
              </div>

              {insecureError && (
                <div className="mt-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in fade-in">
                  <p className="font-bold mb-1">Security Restriction:</p>
                  Microphone access requires <strong>HTTPS</strong> or <strong>localhost</strong>.
                  Please open <code className="bg-red-500/20 px-1.5 py-0.5 rounded text-white">http://localhost:3000</code>.
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="app"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-6xl mx-auto py-4"
            >
              <LiveKitRoom
                serverUrl={connectionDetails.url}
                token={connectionDetails.token}
                connect={true}
                audio={true}
                className="w-full"
                onDisconnected={onDisconnect}
                onError={(e) => {
                  console.error("LiveKit Room Error:", e);
                  if (e.message.toLowerCase().includes("getusermedia") || e.message.toLowerCase().includes("secure context")) {
                    setInsecureError(true);
                    onDisconnect();
                  }
                }}
              >
                <RoomAudioRenderer />
                <SessionWrapper
                  connectionDetails={connectionDetails}
                  onDisconnect={onDisconnect}
                  selectedPersona={selectedPersona}
                  pendingPrompt={pendingPrompt}
                  onClearPendingPrompt={() => setPendingPrompt(null)}
                />
              </LiveKitRoom>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-10 px-8 border-t border-white/5 bg-slate-950/70 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
              VY
            </div>
            <span className="text-slate-300 font-bold text-sm tracking-wide">Voice.ai Experience</span>
          </div>

          <div className="flex flex-col items-center justify-center gap-1 text-center">
            <p className="text-slate-200 text-sm font-black tracking-[0.2em] uppercase">
              Ankit Yadav
            </p>
            <p className="text-slate-500 text-xs flex items-center justify-center gap-1.5">
              Copyright © 2026 Ankit Yadav | All Rights Reserved <span className="text-red-500 animate-pulse">❤️</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://www.linkedin.com/in/ankit-yadav-one9/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/ankit-yadav1234"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AgentPersonaModal
        isOpen={isPersonaModalOpen}
        onClose={() => setIsPersonaModalOpen(false)}
        selectedPersona={selectedPersona}
        onSelectPersona={(persona) => setSelectedPersona(persona)}
      />

      <AgentSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
}

/** Session Wrapper */
function SessionWrapper({
  connectionDetails,
  onDisconnect,
  selectedPersona,
  pendingPrompt,
  onClearPendingPrompt,
}: {
  connectionDetails: { token: string; url: string };
  onDisconnect: () => void;
  selectedPersona: Persona;
  pendingPrompt: string | null;
  onClearPendingPrompt: () => void;
}) {
  const tokenSource = useMemo(() => TokenSource.literal({
    token: connectionDetails.token,
    url: connectionDetails.url,
  } as any), [connectionDetails]);
  const session = useSession(tokenSource);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const resumeAudio = () => {
        const audioEls = document.querySelectorAll('audio');
        audioEls.forEach(el => {
          if (el.paused) {
            el.play().catch(() => {});
          }
        });
      };
      resumeAudio();
      window.addEventListener('click', resumeAudio, { once: true });
    }
  }, []);

  return (
    <AgentSessionProvider session={session}>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <AssistantContent
          onDisconnect={onDisconnect}
          selectedPersona={selectedPersona}
          pendingPrompt={pendingPrompt}
          onClearPendingPrompt={onClearPendingPrompt}
        />
      </div>
    </AgentSessionProvider>
  );
}

function AssistantContent({
  onDisconnect,
  selectedPersona,
  pendingPrompt,
  onClearPendingPrompt,
}: {
  onDisconnect: () => void;
  selectedPersona: Persona;
  pendingPrompt: string | null;
  onClearPendingPrompt: () => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full max-w-7xl mx-auto px-2 md:px-4">
      {/* Left Column - Visualizer & Session Status */}
      <div className="lg:col-span-7 space-y-6 flex flex-col">
        <Card className="glass-card glass-card-hover border-slate-800/80 flex-1 flex flex-col overflow-hidden relative group shadow-2xl transition-all duration-500 hover:border-slate-700/80">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-indigo-500 opacity-75" />

          <CardHeader className="pb-4 border-b border-white/5 bg-slate-900/50 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                <div>
                  <CardTitle className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-slate-300 group-hover:text-white transition-colors">
                    Active Voice Session
                  </CardTitle>
                  <p className="text-[11px] text-emerald-400 font-semibold">Mode: {selectedPersona.name}</p>
                </div>
              </div>
              <ConnectionStatus />
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col items-center justify-center relative py-10 md:py-14">
            <div className="absolute inset-0 bg-mesh opacity-25 pointer-events-none" />

            <div className="relative flex items-center justify-center p-8 rounded-full border border-white/5 bg-white/[0.02] shadow-inner">
              <AgentAudioVisualizerAura className="w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] md:w-[350px] md:h-[350px]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <AgentStateText />
              </div>
            </div>

            <div className="mt-8 z-10 w-full max-w-md px-6">
              <AgentAudioVisualizerBar className="w-full h-10 opacity-90" />
            </div>
          </CardContent>

          <CardHeader className="pt-0 pb-6 border-t border-white/5 bg-slate-900/40">
            <div className="pt-4 px-2 flex justify-center">
              <AgentControlBar
                variant="livekit"
                isConnected={true}
                onDisconnect={onDisconnect}
                controls={{ chat: false }}
                className="border-none bg-transparent p-0 drop-shadow-none scale-110 origin-center justify-center"
              />
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Right Column - Chat & Transcript */}
      <div className="lg:col-span-5 flex flex-col">
        <div className="h-[680px] sm:h-[720px] lg:h-[740px] flex flex-col">
          <Card className="glass-card glass-card-hover border-slate-800/80 flex-1 flex flex-col overflow-hidden shadow-2xl relative transition-all duration-500 hover:border-slate-700/80">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500 opacity-60" />
            
            <CardHeader className="pb-3 border-b border-white/5 bg-slate-900/60 backdrop-blur-md shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-inner">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-slate-300 hover:text-white transition-colors duration-300">
                      Live Chat & Transcript
                    </CardTitle>
                    <p className="text-[11px] text-slate-400 font-medium">Realtime voice-to-text sync</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-hidden relative flex flex-col bg-slate-950/40">
              <ScrollArea className="flex-1 p-4 sm:p-5">
                <AssistantTranscript />
              </ScrollArea>
              
              {/* Interactive Live Input Form */}
              <AgentChatInput
                pendingPrompt={pendingPrompt}
                onClearPendingPrompt={onClearPendingPrompt}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/** Live Text Input Form */
function AgentChatInput({
  pendingPrompt,
  onClearPendingPrompt,
}: {
  pendingPrompt: string | null;
  onClearPendingPrompt: () => void;
}) {
  const { send, isSending } = useChat();
  const [inputValue, setInputValue] = useState('');

  // Handle pending prompt auto-sending when room connects
  useEffect(() => {
    if (pendingPrompt) {
      send(pendingPrompt).catch(err => console.error('Auto prompt error:', err));
      onClearPendingPrompt();
    }
  }, [pendingPrompt, send, onClearPendingPrompt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSending) return;
    const textToSend = inputValue.trim();
    setInputValue('');
    try {
      await send(textToSend);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <div className="p-3 sm:p-4 border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-xl shrink-0 space-y-2">
      {/* Quick Prompts Bar inside Chat */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {QUICK_PROMPTS.slice(0, 3).map((qp, i) => (
          <button
            key={i}
            onClick={() => send(qp.prompt)}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-[11px] text-slate-300 hover:text-white font-medium transition-colors"
          >
            {qp.text}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 bg-slate-900/95 border border-slate-700/80 focus-within:border-blue-500/90 focus-within:ring-2 focus-within:ring-blue-500/30 rounded-2xl px-4 py-2 shadow-2xl transition-all duration-300">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message to the AI agent..."
            className="flex-1 bg-transparent text-white font-semibold text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none tracking-wide"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!inputValue.trim() || isSending}
            className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white rounded-xl px-3.5 h-8 text-xs font-bold shadow-lg shadow-blue-500/25 transition-all duration-300 active:scale-95 disabled:opacity-40"
          >
            {isSending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="hidden sm:inline">Send</span>
                <Send className="w-3 h-3 text-white" />
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function AgentStateText() {
  const { state } = useVoiceAssistant();
  const stateConfig: Record<string, { text: string, color: string }> = {
    listening: { text: "Listening", color: "text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" },
    thinking: { text: "Thinking", color: "text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" },
    speaking: { text: "Speaking", color: "text-purple-400 drop-shadow-[0_0_15px_rgba(192,132,252,0.5)]" },
    connecting: { text: "Connecting", color: "text-slate-400" },
  };

  const current = stateConfig[state] || { text: state, color: "text-slate-500" };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      key={state}
      className="flex flex-col items-center justify-center gap-1.5"
    >
      <span className={`text-3xl sm:text-4xl font-black tracking-tighter ${current.color} transition-all duration-300`}>
        {current.text}
      </span>
      {state === 'listening' && (
        <span className="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-black">Go ahead, I'm listening</span>
      )}
    </motion.div>
  );
}

function ConnectionStatus() {
  const { state } = useVoiceAssistant();
  const statusColors: Record<string, string> = {
    initializing: 'bg-yellow-500',
    listening: 'bg-emerald-500 animate-pulse',
    thinking: 'bg-blue-500 animate-bounce',
    speaking: 'bg-purple-500 animate-pulse',
    disconnected: 'bg-red-500',
    connecting: 'bg-blue-200 animate-pulse',
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 shadow-inner">
      <div className={`w-2 h-2 rounded-full ${statusColors[state] || 'bg-slate-500'}`} />
      <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-300">{state}</span>
    </div>
  );
}

function AssistantTranscript() {
  const session = useSessionContext();
  const { state } = useVoiceAssistant();
  const { messages } = useSessionMessages(session);

  return (
    <AgentChatTranscript
      messages={messages.map(m => {
        const text = (m as any).message || (m as any).text || '';
        let sender: 'user' | 'agent' = 'agent';

        if (m.type === 'userTranscript') {
          sender = 'user';
        } else if (m.type === 'agentTranscript') {
          sender = 'agent';
        } else if (m.type === 'chatMessage') {
          sender = m.from?.isLocal ? 'user' : 'agent';
        }

        return {
          id: m.id,
          text,
          sender,
          timestamp: m.timestamp
        };
      })}
      agentState={state}
    />
  );
}

function SessionTimer() {
  const [timeLeft, setTimeLeft] = useState(180);

  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  if (timeLeft === 0) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 text-red-400 font-bold rounded-full animate-pulse border border-red-500/30 text-xs">
        Session Ended
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono font-bold border transition-all duration-300 text-xs ${timeLeft < 30 ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse' : 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:border-blue-500/40'}`}>
      ⏱️ {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
}
