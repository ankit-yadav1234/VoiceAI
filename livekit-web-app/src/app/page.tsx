'use client';

import { useState, useCallback, useMemo } from 'react';
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
import { Loader2 } from 'lucide-react';

import { motion, AnimatePresence } from 'motion/react';

export default function Home() {
  const [connectionDetails, setConnectionDetails] = useState<{
    token: string;
    url: string;
  } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [insecureError, setInsecureError] = useState(false);

  const onConnect = useCallback(async () => {
    // Check for secure context
    if (typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost') {
      setInsecureError(true);
      return;
    }
    setInsecureError(false);

    setIsConnecting(true);
    try {
      const response = await fetch('/api/token');
      const data = await response.json();
      setConnectionDetails({
        token: data.token,
        url: data.url,
      });

      // Explicitly dispatch the agent to the room
      console.log('Dispatching agent to room:', data.roomName);
      await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: data.roomName,
          agentName: 'my-agent',
        }),
      });
    } catch (e) {
      console.error('Connection error:', e);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const onDisconnect = useCallback(() => {
    setConnectionDetails(null);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950/20 flex flex-col">
      {/* Navbar */}
      <nav className="h-24 px-8 flex items-center justify-between border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 shadow-xl shadow-blue-500/20 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white/90">Voice.ai</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-8 mr-8 text-base font-medium text-slate-400">
            <a href="#" className="hover:text-white transition-colors underline-offset-4 hover:underline">Documentation</a>
            <a href="#" className="hover:text-white transition-colors underline-offset-4 hover:underline">Pricing</a>
          </div>
          {connectionDetails && (
            <Button
              variant="outline"
              size="lg"
              onClick={onDisconnect}
              className="border-red-500/20 text-red-400 bg-red-400/5 hover:bg-red-400/10 h-11 px-6 text-base font-semibold"
            >
              End Session
            </Button>
          )}
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {!connectionDetails ? (
            <motion.div
              key="hero"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="z-10 max-w-2xl w-full text-center space-y-8 py-20"
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  v2.0 Beta Now Available
                </motion.div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white">
                  Next-Gen <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-400 bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]">
                    Voice Intelligence.
                  </span>
                </h1>
                <p className="text-slate-400 text-lg md:text-xl max-w-lg mx-auto leading-relaxed">
                  Real-time low-latency voice AI that understands context, tone, and intent. Experience the future of human-AI interaction.
                </p>
              </div>

              <div className="pt-4">
                <Button
                  size="lg"
                  onClick={onConnect}
                  disabled={isConnecting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-10 h-14 text-lg rounded-2xl transition-all shadow-xl shadow-blue-500/25 active:scale-95 group"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    <span className="flex items-center gap-2">
                      Start Conversation
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        →
                      </motion.span>
                    </span>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-12 border-t border-white/5 opacity-50">
                <div className="space-y-1">
                  <div className="text-xl font-bold text-white">50ms</div>
                  <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Latency</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xl font-bold text-white">HD</div>
                  <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Audio</div>
                </div>
              </div>

              {insecureError && (
                <div className="mt-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
                  <p className="font-bold mb-1 italic">Security Restriction:</p>
                  Microphone access is only allowed on <strong>HTTPS</strong> or <strong>localhost</strong>.
                  Please use <code className="bg-red-500/20 px-1 rounded">http://localhost:3000</code> to test.
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="app"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-6xl mx-auto py-8"
            >
              <LiveKitRoom
                serverUrl={connectionDetails.url}
                token={connectionDetails.token}
                connect={true}
                audio={typeof window !== 'undefined' ? window.isSecureContext : false}
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
                <SessionWrapper connectionDetails={connectionDetails} onDisconnect={onDisconnect} />
              </LiveKitRoom>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-16 px-8 border-t border-white/5 bg-slate-950/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3 opacity-70 scale-110">
            <div className="w-6 h-6 rounded bg-blue-500 shadow-lg shadow-blue-500/20" />
            <span className="text-sm font-bold tracking-[0.2em] uppercase text-white/90">Ankit Yadav</span>
          </div>
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-slate-400 text-sm font-bold tracking-wider">
              Ankit Yadav
            </p>
            <p className="text-slate-500 text-xs flex items-center gap-1.5">
              Copyright © 2026 Ankit Yadav | All Rights Reserved <span className="text-red-500 animate-pulse">❤️</span>
            </p>
          </div>
          <div className="flex items-center gap-8 opacity-70">
            <a href="https://www.linkedin.com/in/ankit-yadav-one9/" target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-white transition-colors hover:underline underline-offset-4">LinkedIn</a>
            <a href="https://github.com/ankit-yadav1234" target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-white transition-colors hover:underline underline-offset-4">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}


/** Wraps children in AgentSessionProvider using the room's session context */
function SessionWrapper({ connectionDetails, onDisconnect }: { connectionDetails: { token: string; url: string }; onDisconnect: () => void }) {
  const tokenSource = useMemo(() => TokenSource.literal({
    token: connectionDetails.token,
    url: connectionDetails.url,
  } as any), [connectionDetails]);
  const session = useSession(tokenSource);

  return (
    <AgentSessionProvider session={session}>
      <RoomAudioRenderer />
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <AssistantContent onDisconnect={onDisconnect} />
      </div>
    </AgentSessionProvider>
  );
}

function AssistantContent({ onDisconnect }: { onDisconnect: () => void }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Left Column - Visualizer & Status */}
      <div className="lg:col-span-7 space-y-6 flex flex-col">
        <Card className="glass-card glass-card-hover border-none flex-1 flex flex-col overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500 opacity-50" />

          <CardHeader className="pb-4 border-b border-white/5 bg-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <CardTitle className="text-base font-bold uppercase tracking-[0.25em] text-slate-400">Active Session</CardTitle>
              </div>
              <ConnectionStatus />
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col items-center justify-center relative py-12">
            {/* Decorative Background for Visualizer */}
            <div className="absolute inset-0 bg-mesh opacity-20 pointer-events-none" />

            <div className="relative flex items-center justify-center p-8 rounded-full border border-white/5 bg-white/[0.02]">
              <AgentAudioVisualizerAura className="w-[280px] h-[280px] md:w-[350px] md:h-[350px]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <AgentStateText />
              </div>
            </div>

            <div className="mt-8 z-10 w-full max-w-md px-6">
              <AgentAudioVisualizerBar className="w-full h-10 opacity-80" />
            </div>
          </CardContent>

          <CardHeader className="pt-0 pb-6 border-t border-white/5 bg-white/5">
            <div className="pt-4 px-2">
              <AgentControlBar
                variant="livekit"
                isConnected={true}
                onDisconnect={onDisconnect}
                className="border-none bg-transparent p-0 drop-shadow-none scale-110 origin-center justify-center"
              />
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Right Column - Transcript */}
      <div className="lg:col-span-5 mt-6 lg:mt-0">
        <div className="h-[730px] flex flex-col">
          <Card className="glass-card glass-card-hover border-none flex-1 flex flex-col overflow-hidden">
            <CardHeader className="pb-4 border-b border-white/5 bg-white/5 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-white/5">
                  <div className="w-4 h-4 rounded-full border-2 border-slate-500/30 border-t-slate-400 animate-spin" />
                </div>
                <CardTitle className="text-base font-bold uppercase tracking-[0.25em] text-slate-400">Live Transcript</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-full p-6">
                <AssistantTranscript />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AgentStateText() {
  const { state } = useVoiceAssistant();
  const stateConfig: Record<string, { text: string, color: string }> = {
    listening: { text: "Listening", color: "text-emerald-400" },
    thinking: { text: "Thinking", color: "text-blue-400" },
    speaking: { text: "Speaking", color: "text-purple-400" },
    connecting: { text: "Connecting", color: "text-slate-400" },
  };

  const current = stateConfig[state] || { text: state, color: "text-slate-500" };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      key={state}
      className="flex flex-col items-center justify-center gap-1"
    >
      <span className={`text-4xl font-black tracking-tighter ${current.color} drop-shadow-md`}>
        {current.text}
      </span>
      {state === 'listening' && (
        <span className="text-xs uppercase tracking-[0.4em] text-slate-500 font-extrabold">Go ahead, I'm waiting</span>
      )}
    </motion.div>
  );
}

function ConnectionStatus() {
  const { state } = useVoiceAssistant();
  const statusColors: Record<string, string> = {
    initializing: 'bg-yellow-500',
    listening: 'bg-green-500 animate-pulse',
    thinking: 'bg-blue-500 animate-bounce',
    speaking: 'bg-purple-500 animate-pulse',
    disconnected: 'bg-red-500',
    connecting: 'bg-blue-200 animate-pulse',
  };

  return (
    <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 shadow-inner">
      <div className={`w-2.5 h-2.5 rounded-full ${statusColors[state] || 'bg-slate-500'}`} />
      <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-300">{state}</span>
    </div>
  );
}

function AgentStateIndicator() {
  const { state } = useVoiceAssistant();

  if (state !== 'thinking') {
    return (
      <div className="h-24 flex items-center justify-center text-slate-500 italic text-sm text-center">
        {state === 'listening' ? 'Agent is listening to you...' : state === 'speaking' ? 'Agent is speaking...' : `Current state: ${state}`}
      </div>
    );
  }

  return (
    <div className="h-24 flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      <p className="text-blue-400 font-medium animate-pulse">Thinking...</p>
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
