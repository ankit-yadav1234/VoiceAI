'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { Persona } from '@/components/agent-persona-modal';
import { useVoiceAssistant } from '@livekit/components-react';

interface AgentVideoAvatarPresentationProps {
  isOpen: boolean;
  onClose: () => void;
  persona: Persona;
  agentState?: 'listening' | 'thinking' | 'speaking' | 'idle';
  onDisconnect?: () => void;
}

export function AgentVideoAvatarPresentation({
  isOpen,
  onClose,
  persona,
  agentState = 'idle',
}: AgentVideoAvatarPresentationProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [testTalking, setTestTalking] = useState(false);

  // Safely hook into LiveKit's real-time voice assistant state if inside room context
  let liveKitState = 'idle';
  try {
    const va = useVoiceAssistant();
    if (va && va.state) {
      liveKitState = va.state;
    }
  } catch {
    // Fallback to prop state if rendered outside room provider
  }

  const isSpeaking = liveKitState === 'speaking' || agentState === 'speaking' || testTalking;

  // Realistic audio progress bar movement ONLY when speaking
  useEffect(() => {
    if (!isOpen || !isSpeaking) {
      setProgress(0);
      return;
    }
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 5 : prev + 3));
    }, 120);
    return () => clearInterval(interval);
  }, [isOpen, isSpeaking]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed top-20 right-6 sm:right-12 z-50 flex flex-col items-center pointer-events-auto"
        >
          {/* Top "SKIP" text option directly above the circle avatar (Matching User Screenshot) */}
          <button
            onClick={onClose}
            className="mb-2 text-xs font-extrabold text-slate-200 hover:text-white tracking-[0.25em] uppercase drop-shadow-md transition-all hover:scale-105 focus:outline-none flex items-center gap-1"
          >
            <span>SKIP</span>
          </button>

          {/* Floating Circle Video Avatar Container (Matching User Screenshot) */}
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden border-2 border-slate-300/80 shadow-[0_10px_50px_rgba(0,0,0,0.6)] group bg-slate-900/90">
            
            {/* Outer Talking Frequency Ripple (Active ONLY when Agent Speaks) */}
            {isSpeaking && (
              <motion.div
                animate={{
                  scale: [1, 1.06, 1, 1.04, 1],
                  opacity: [0.4, 0.8, 0.4, 0.7, 0.4],
                }}
                transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full border-4 border-cyan-400/60 shadow-[0_0_30px_rgba(34,211,238,0.8)] pointer-events-none z-10"
              />
            )}

            {/* Base Avatar Image with Head & Jaw Talking Deformations */}
            <motion.div
              animate={
                isSpeaking
                  ? {
                      scale: [1, 1.02, 1, 1.03, 1],
                      rotate: [0, -0.8, 0.8, -0.5, 0],
                      y: [0, -1, 1, -0.5, 0],
                    }
                  : { scale: 1, rotate: 0, y: 0 }
              }
              transition={{ repeat: Infinity, duration: 0.4, ease: 'easeInOut' }}
              className="w-full h-full relative"
            >
              <Image
                src={persona.avatar}
                alt={persona.name}
                width={320}
                height={320}
                className={`w-full h-full object-cover object-center transition-all duration-300 ${
                  isSpeaking ? 'brightness-110 contrast-105' : 'brightness-100'
                }`}
              />

              {/* Realistic Lip-Sync & Lower Facial Speech Movement Overlay */}
              {isSpeaking && (
                <>
                  {/* Mouth/Chin Speech Expansion Overlay */}
                  <motion.div
                    animate={{
                      scaleY: [1, 1.08, 0.96, 1.06, 1],
                      opacity: [0.3, 0.7, 0.3, 0.8, 0.3],
                    }}
                    transition={{ repeat: Infinity, duration: 0.25 }}
                    className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-28 h-12 bg-cyan-400/20 rounded-full blur-md pointer-events-none"
                  />

                  {/* Speech Soundwave Aura */}
                  <motion.div
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ repeat: Infinity, duration: 0.3 }}
                    className="absolute inset-0 bg-gradient-to-t from-cyan-500/25 via-transparent to-transparent pointer-events-none"
                  />
                </>
              )}
            </motion.div>

            {/* Mute/Unmute Icon Floating inside Bottom-Center of Circle (Matching Screenshot) */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-white hover:bg-slate-800 transition-all shadow-lg hover:scale-110 active:scale-95 focus:outline-none"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-slate-200" />
                )}
              </button>
            </div>

            {/* White Audio Progress Timeline Bar across Bottom of Circle (Matching Screenshot) */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-white/25 rounded-full overflow-hidden backdrop-blur-sm z-20">
              <div
                className="h-full bg-white rounded-full transition-all duration-150 shadow-[0_0_10px_white]"
                style={{ width: `${isSpeaking ? progress : 0}%` }}
              />
            </div>
          </div>

          {/* Quick Demo Talking Preview Button */}
          <button
            onClick={() => setTestTalking(!testTalking)}
            className="mt-2 text-[10px] font-bold text-cyan-400/80 hover:text-cyan-300 bg-slate-900/80 px-2.5 py-0.5 rounded-full border border-cyan-500/20 transition-all flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            {testTalking ? 'Stop Talking Demo' : 'Test Video Motion'}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
