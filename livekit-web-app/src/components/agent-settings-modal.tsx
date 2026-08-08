'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Volume2, Mic, Activity, ShieldCheck, X, CheckCircle2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AgentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AgentSettingsModal({ isOpen, onClose }: AgentSettingsModalProps) {
  const [isPlayingAudioTest, setIsPlayingAudioTest] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [isMicTesting, setIsMicTesting] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play audio test ping
  const handleTestAudio = () => {
    try {
      setIsPlayingAudioTest(true);
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);

      setTimeout(() => {
        setIsPlayingAudioTest(false);
      }, 400);
    } catch (e) {
      console.error('Audio test failed:', e);
      setIsPlayingAudioTest(false);
    }
  };

  // Test microphone volume input
  const toggleMicTest = async () => {
    if (isMicTesting) {
      setIsMicTesting(false);
      setMicLevel(0);
      return;
    }

    try {
      setIsMicTesting(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyzer = ctx.createAnalyser();
      analyzer.fftSize = 64;
      src.connect(analyzer);

      const dataArray = new Uint8Array(analyzer.frequencyBinCount);
      let animId: number;

      const updateLevel = () => {
        if (!audioContextRef.current) return;
        analyzer.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setMicLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animId = requestAnimationFrame(updateLevel);
      };

      updateLevel();

      setTimeout(() => {
        stream.getTracks().forEach(t => t.stop());
        if (ctx.state !== 'closed') ctx.close();
        audioContextRef.current = null;
        setIsMicTesting(false);
        setMicLevel(0);
        cancelAnimationFrame(animId);
      }, 5000);
    } catch (e) {
      console.error('Mic test error:', e);
      setIsMicTesting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-slate-900/95 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden z-10 space-y-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Audio & System Diagnostics</h3>
                  <p className="text-xs text-slate-400">Test hardware & check WebRTC pipeline health</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Speaker & Mic Diagnostic Tools */}
            <div className="space-y-4">
              {/* Speaker Test */}
              <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-blue-400" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Audio Output Test</h4>
                    <p className="text-xs text-slate-400">Play chime to verify speakers / headphones</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={handleTestAudio}
                  disabled={isPlayingAudioTest}
                  className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-3.5 h-9 font-semibold text-xs gap-1.5 shadow-md shadow-blue-500/20"
                >
                  <Play className={`w-3.5 h-3.5 ${isPlayingAudioTest ? 'animate-spin' : ''}`} />
                  {isPlayingAudioTest ? 'Playing...' : 'Test Sound'}
                </Button>
              </div>

              {/* Mic Test */}
              <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mic className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Microphone Input Check</h4>
                      <p className="text-xs text-slate-400">Test voice pickup level (5s auto-stop)</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={isMicTesting ? 'destructive' : 'outline'}
                    onClick={toggleMicTest}
                    className="rounded-xl px-3.5 h-9 font-semibold text-xs border-slate-700"
                  >
                    {isMicTesting ? 'Stop Test' : 'Start Mic Test'}
                  </Button>
                </div>

                {isMicTesting && (
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-400">
                      <span>Mic Level</span>
                      <span className="text-emerald-400">{micLevel}%</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-75"
                        style={{ width: `${micLevel}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pipeline Diagnostics */}
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                Pipeline Diagnostics & Specs
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">Audio Codec</span>
                    <span className="font-bold text-white">OPUS 48kHz</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">Target Latency</span>
                    <span className="font-bold text-white">&lt; 100ms</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">Security</span>
                    <span className="font-bold text-white">AES-GCM TLS</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">Transport</span>
                    <span className="font-bold text-white">WebRTC / WSS</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="border-slate-700 text-slate-200 hover:bg-slate-800 rounded-xl"
              >
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
