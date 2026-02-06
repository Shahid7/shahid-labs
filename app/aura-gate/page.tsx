"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Wind, Lock, AlertTriangle, Fingerprint, CheckCircle2, TrendingDown } from 'lucide-react';

// Sub-component to handle the dynamic URL logic
function AuraGateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get the site name from the URL (?site=twitter.com), default to 'Unknown_Protocol'
  const targetSite = searchParams.get('site') || "Unknown_Protocol";

  const [status, setStatus] = useState<'scanning' | 'breathing' | 'deciding' | 'success' | 'debt_finalized'>('scanning');
  const [breathCount, setBreathCount] = useState(0);
  const [newScore, setNewScore] = useState(0);

  useEffect(() => {
    if (status === 'scanning') {
      const timer = setTimeout(() => setStatus('breathing'), 3000);
      return () => clearTimeout(timer);
    }
    if (status === 'breathing') {
      const breathTimer = setInterval(() => {
        setBreathCount((prev) => {
          if (prev >= 2) {
            clearInterval(breathTimer);
            setTimeout(() => setStatus('deciding'), 1000);
            return prev;
          }
          return prev + 1;
        });
      }, 4000); 
      return () => clearInterval(breathTimer);
    }
  }, [status]);

  const applyAuraDebt = () => {
    // 1. Check if this is a real violation or just a manual visit
    const isManualVisit = !searchParams.get('site') || targetSite === "Unknown_Protocol";
  
    if (isManualVisit) {
      // SAFE EXIT: No penalty, just a clean redirect
      setStatus('success'); // Show the green success screen instead of the red debt screen
      setTimeout(() => {
        router.push('/aura-tracker');
      }, 2000);
      return;
    }
  
    // 2. PENALTY EXIT: Only runs if there's a real target site
    const today = new Date().toLocaleDateString('en-CA');
    const savedHistory = localStorage.getItem('aura_history');
    let history: Record<string, number> = {};
    try { history = savedHistory ? JSON.parse(savedHistory) : {}; } catch (e) {}
    
    const currentScore = history[today] || 5; 
    const calculatedScore = Math.max(0, currentScore - 2); 
    setNewScore(calculatedScore);
    
    localStorage.setItem('aura_history', JSON.stringify({ ...history, [today]: calculatedScore }));
    setStatus('debt_finalized');
    
    setTimeout(() => {
      let cleanSite = targetSite.toLowerCase().replace('www.', '').replace('https://', '').replace('http://', '').split('/')[0];
      window.location.href = `https://www.${cleanSite}/?aura_bypass=true#aura_bypass=true`;
    }, 3000);
  };

  return (
    <div className="w-full max-w-2xl relative z-10">
        <AnimatePresence mode="wait">
          {/* DEBT OVERLAY */}
          {status === 'debt_finalized' && (
            <motion.div key="debt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-3xl p-6">
              <div className="max-w-md w-full border border-red-500/20 bg-red-500/5 rounded-[3rem] p-10 text-center shadow-[0_0_100px_rgba(239,68,68,0.1)]">
                <TrendingDown size={40} className="text-red-500 mx-auto mb-6" />
                <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2 text-red-500">Aura_Penalized</h2>
                <div className="bg-black/40 border border-white/5 rounded-2xl p-6 text-left mb-6">
                   <p className="text-[8px] text-zinc-600 font-bold uppercase mb-1 italic">Score_Update</p>
                   <p className="text-3xl font-black italic text-white">{newScore}.0 / 10</p>
                </div>
                <p className="text-[9px] text-zinc-700 font-mono uppercase italic animate-pulse">Relinking to {targetSite}...</p>
              </div>
            </motion.div>
          )}

          {/* SCANNING */}
          {status === 'scanning' && (
            <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-20">
              <div className="relative inline-block mb-8 p-6 rounded-full bg-zinc-900/50 border border-white/5">
                  <Fingerprint size={60} className="text-[#bfff00] opacity-40" />
                  <motion.div animate={{ top: ['0%', '100%', '0%'] }} transition={{ duration: 2, repeat: Infinity }}
                    className="absolute left-0 right-0 h-[2px] bg-[#bfff00] shadow-[0_0_15px_#bfff00]" />
              </div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2 italic">Scanning_Intent</h2>
              <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest italic">{targetSite}</p>
            </motion.div>
          )}

          {/* BREATHING */}
          {status === 'breathing' && (
            <motion.div key="breathing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center">
              <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 4, repeat: 2 }}
                className="w-40 h-40 border border-[#bfff00]/30 rounded-full flex items-center justify-center relative mx-auto mb-12">
                <Wind className="text-[#bfff00]" size={40} />
              </motion.div>
              <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4 italic italic">Neural_Resync</h2>
              <motion.p key={breathCount} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-zinc-400 text-sm font-medium uppercase tracking-widest mb-10 h-6">
                {breathCount === 0 && "Inhale: Logic Stability"}
                {breathCount === 1 && "Hold: Frequency Lock"}
                {breathCount === 2 && "Exhale: Purge Distraction"}
              </motion.p>
              <div className="flex gap-3 justify-center">
                {[0, 1, 2].map(i => <div key={i} className={`h-1 rounded-full transition-all duration-700 ${i <= breathCount ? 'bg-[#bfff00] w-12' : 'bg-zinc-800 w-3'}`} />)}
              </div>
            </motion.div>
          )}

          {/* DECIDING */}
          {status === 'deciding' && (
            <motion.div key="deciding" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/5 border border-red-500/10 rounded-[3rem] p-10 backdrop-blur-3xl border-t-red-500/30">
                <div className="flex justify-between items-start mb-10">
                  <h2 className="text-6xl font-black italic uppercase tracking-tighter leading-none">Aura_Debt</h2>
                  <AlertTriangle className="text-red-500" size={40} />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="bg-black/60 rounded-2xl p-6 border border-white/5">
                    <p className="text-[9px] font-black text-zinc-600 uppercase mb-2">Dest</p>
                    <p className="text-xl font-bold text-zinc-300 font-mono italic truncate">{targetSite}</p>
                  </div>
                  <div className="bg-black/60 rounded-2xl p-6 border border-white/5">
                    <p className="text-[9px] font-black text-zinc-600 uppercase mb-2">Cost</p>
                    <p className="text-xl font-bold text-red-500 font-mono">-2.0 XP</p>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <button onClick={() => { setStatus('success'); setTimeout(() => router.push('/aura-tracker'), 2500); }}
                    className="w-full py-8 bg-[#bfff00] text-black rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-95 transition-all">
                    ABORT_DISTRACTION
                  </button>
                  <button 
                    onClick={applyAuraDebt} 
                    className="w-full py-6 text-zinc-700 font-black uppercase tracking-widest text-[9px] hover:text-red-500 transition-colors italic"
                    >
                    {targetSite === "Unknown_Protocol" 
                        ? "Return_to_System (No_Cost)" 
                        : "Proceed_Anyway (Cost_Applied)"
                    }
                    </button>
                </div>
            </motion.div>
          )}

          {/* SUCCESS */}
          {status === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
              <CheckCircle2 size={60} className="text-[#bfff00] mx-auto mb-6" />
              <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4 text-[#bfff00]">Aura_Intact</h2>
              <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest italic">+5 XP STABILITY // SYSTEM SECURED</p>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}

// Wrapper to handle Suspense for searchParams
export default function AuraGate() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 font-sans overflow-hidden">
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(#ffffff10 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
      <Suspense fallback={<div className="text-zinc-500 font-mono text-xs animate-pulse">INIT_TERMINAL...</div>}>
        <AuraGateContent />
      </Suspense>
    </div>
  );
}