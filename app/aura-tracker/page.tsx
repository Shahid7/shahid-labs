"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, Brain, Wand2, X, TrendingUp, AlertCircle, 
  ShieldCheck, Lock, CheckCircle2, Activity, Fingerprint, Zap
} from 'lucide-react';
import { calculateAuraLocally } from '@/lib/aura-calc';

// --- HELPERS ---
const getFormattedDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- TYPES ---
interface DayData {
  date: Date;
  score: number;
  isFuture: boolean;
  key: string;
}

interface Goal {
  id: number;
  title: string;
  progress: number;
}

// --- AUDIT MODAL ---
const MonthlyAudit = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [stats, setStats] = useState({ aborts: 0, penalties: 0, topDistraction: "" });

  useEffect(() => {
    if (!isOpen) return;
    
    // 1. Get logs safely
    const rawData = localStorage.getItem('aura_logs');
    const logs = rawData ? JSON.parse(rawData) : [];
    console.log("Current Logs Found:", logs);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
  
    // 2. Filter logs for the current month
    const thisMonthLogs = logs.filter((l: any) => {
      const logDate = new Date(l.date);
      return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
    });
    
    const aborts = thisMonthLogs.filter((l: any) => l.type === 'ABORT').length;
    const penalties = thisMonthLogs.filter((l: any) => l.type === 'PENALTY').length;
    
    // 3. Clean site names for better matching
    const sites: string[] = thisMonthLogs
      .map((l: any) => {
        if (!l.site || l.site === "Unknown_Protocol") return null;
        // Clean: "https://www.twitter.com/home" -> "twitter.com"
        return l.site.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
      })
      .filter((s: string | null): s is string => s !== null);
  
    let topSite = "None_Detected";
    if (sites.length > 0) {
      // Sort by frequency
      topSite = sites.sort((a: string, b: string) => 
        sites.filter((v: string) => v === a).length - sites.filter((v: string) => v === b).length
      ).pop() || "None_Detected";
    }
  
    setStats({ aborts, penalties, topDistraction: topSite });
  }, [isOpen]);

  if (!isOpen) return null;

  const total = stats.aborts + stats.penalties;
  const defenseRatio = total > 0 ? Math.round((stats.aborts / total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} 
        className="max-w-xl w-full bg-zinc-900 border border-white/10 rounded-[3rem] p-12 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8">
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><X /></button>
        </div>
        <div className="mb-10 text-left">
          <p className="text-[10px] font-black text-[#bfff00] uppercase tracking-[0.4em] mb-2">Neural_Audit_v1.0</p>
          <h2 className="text-5xl font-black italic uppercase tracking-tighter">System_Integrity</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-8 text-left">
          <div className="bg-black/40 p-6 rounded-3xl border border-white/5">
            <p className="text-[9px] font-bold text-zinc-600 uppercase mb-1">Defense_Ratio</p>
            <p className="text-4xl font-black italic text-[#bfff00]">{defenseRatio}%</p>
          </div>
          <div className="bg-black/40 p-6 rounded-3xl border border-white/5">
            <p className="text-[9px] font-bold text-zinc-600 uppercase mb-1">Primary_Breach</p>
            <p className="text-xl font-black italic text-red-500 truncate uppercase">{stats.topDistraction}</p>
          </div>
        </div>
        <div className="space-y-4 mb-10 text-left">
           <div className="flex justify-between items-end px-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Aborted_Loops</span>
              <span className="text-lg font-black text-white">{stats.aborts}</span>
           </div>
           <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-[#bfff00]" style={{ width: `${defenseRatio}%` }} />
           </div>
           <div className="flex justify-between items-end px-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Penalized_Access</span>
              <span className="text-lg font-black text-red-500">{stats.penalties}</span>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- AURA CELL ---
const AuraCell = ({ day, isFuture, isSelected, onClick, dailyProgress = 0 }: { day: DayData, isFuture: boolean, isSelected: boolean, onClick: () => void, dailyProgress?: number }) => {
  const todayKey = getFormattedDate(new Date());
  const isToday = day.key === todayKey;

  return (
    <div className="relative flex items-center justify-center w-[22px] h-[22px]">
      {isToday && !isFuture && dailyProgress > 0 && (
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none z-30" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/5" />
          <motion.circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="62.8"
            initial={{ strokeDashoffset: 62.8 }} animate={{ strokeDashoffset: 62.8 - (62.8 * dailyProgress) / 100 }}
            className="text-[#bfff00]" />
        </svg>
      )}
      <motion.button onClick={onClick} whileHover={!isFuture ? { scale: 1.15 } : {}}
        className={`relative z-10 w-3.5 h-3.5 rounded-[3px] transition-all duration-700 outline-none ${isSelected ? 'ring-2 ring-[#bfff00] ring-offset-2 ring-offset-[#050505]' : ''} ${isFuture ? 'bg-white/[0.02] border border-white/5 cursor-not-allowed' : day.score === 0 ? 'bg-zinc-900 border border-white/5' : 'bg-[#bfff00]'} ${isToday && day.score > 0 ? 'animate-pulse' : ''}`}
        style={{ opacity: !isFuture && day.score > 0 ? (day.score / 10) + 0.2 : 1 }}
      />
    </div>
  );
};

// --- MAIN PAGE ---
export default function AuraTracker() {
  const [mounted, setMounted] = useState(false);
  const [log, setLog] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{score: number, verdict: string} | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [history, setHistory] = useState<Record<string, number>>({});
  const [isLocked, setIsLocked] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([{ id: 1, title: "Neural Engineering", progress: 0 }, { id: 2, title: "Physical Peak", progress: 0 }, { id: 3, title: "Deep Work Protocol", progress: 0 }]);

  useEffect(() => {
    const todayKey = getFormattedDate(new Date());
    const savedHistory = localStorage.getItem('aura_history');
    const savedGoals = localStorage.getItem('aura_goals');
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory);
      setHistory(parsed);
      if (parsed[todayKey] !== undefined) setIsLocked(true);
    }
    if (savedGoals) setGoals(JSON.parse(savedGoals));
    setMounted(true);
  }, []);

  const { gridData, stats, forecast, weeklyTrend } = useMemo(() => {
    const days: DayData[] = [];
    const today = new Date(); today.setHours(0,0,0,0);
    let total = 0, logged = 0; const trend: number[] = [];
    for (let i = 0; i < 371; i++) {
      const d = new Date(2026, 0, 1); d.setDate(d.getDate() + i);
      const key = getFormattedDate(d); const isFuture = d > today; const score = history[key] || 0;
      if (score > 0) { total += score; logged++; trend.push(score); }
      days.push({ date: d, score, isFuture, key });
    }
    const avg = logged ? (total / logged).toFixed(1) : "0.0";
    return { gridData: days, stats: { avg, loggedDays: logged }, forecast: parseFloat(avg) > 7 ? "Apex" : "Stable", weeklyTrend: trend.slice(-7) };
  }, [history]);

  const syncAura = async () => {
    if (!log || isLocked) return;
    setLoading(true);
    const todayKey = getFormattedDate(new Date());
    const data = calculateAuraLocally(log); // Defaulting to local for demo speed
    const updated = { ...history, [todayKey]: data.score };
    setHistory(updated);
    localStorage.setItem('aura_history', JSON.stringify(updated));
    setResult(data); setIsLocked(true); setLoading(false); setLog("");
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-16 font-sans selection:bg-[#bfff00] selection:text-black overflow-x-hidden">
      <MonthlyAudit isOpen={isAuditOpen} onClose={() => setIsAuditOpen(false)} />
      
      <div className="max-w-7xl mx-auto">
        <header className="mb-16 flex flex-col lg:flex-row justify-between items-end gap-8 pb-8 border-b border-white/5">
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-3 text-[#bfff00] font-mono text-[10px] tracking-[0.5em] mb-4 uppercase opacity-70">
              <div className="w-2 h-2 rounded-full bg-[#bfff00] animate-pulse" /> Kinetic_System_2026
            </div>
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter italic uppercase leading-[0.75]">Momentum<span className="text-zinc-800">.</span></h1>
          </div>
          <div className="flex gap-2 bg-zinc-900/40 p-1.5 rounded-[20px] border border-white/10">
            <div className="px-5 py-3 border-r border-white/5 text-center"><p className="text-[8px] text-zinc-600 font-black uppercase mb-1">Avg_Aura</p><p className="text-2xl font-black text-white italic leading-none">{stats.avg}</p></div>
            <div className="px-5 py-3 text-center"><p className="text-[8px] text-zinc-600 font-black uppercase mb-1">Active</p><p className="text-2xl font-black text-[#bfff00] italic leading-none">{stats.loggedDays}D</p></div>
          </div>
        </header>

        <section className="bg-zinc-900/20 border border-white/5 rounded-[2.5rem] p-10 mb-8 backdrop-blur-3xl relative">
          <div className="overflow-x-auto pb-6 scrollbar-hide">
            <div className="grid grid-flow-col grid-rows-7 gap-2.5 w-max">
              {gridData.map((d) => (
                <AuraCell key={d.key} day={d} isFuture={d.isFuture} isSelected={selectedDay?.key === d.key} onClick={() => !d.isFuture && setSelectedDay(d)} />
              ))}
            </div>
          </div>

          {/* --- BROADER VIEW PANEL --- */}
          <AnimatePresence>
            {selectedDay && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="mt-8 pt-8 border-t border-white/5 grid md:grid-cols-3 gap-8 text-left">
                  <div className="bg-zinc-900/40 p-8 rounded-[2rem] border border-white/10 relative overflow-hidden group">
                    <Fingerprint className="absolute -right-4 -top-4 text-white/[0.03] w-32 h-32 rotate-12 group-hover:text-[#bfff00]/[0.05] transition-colors" />
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">Neural_Memory // {selectedDay.key}</p>
                    <h3 className="text-6xl font-black italic uppercase tracking-tighter leading-none mb-4">Aura_{selectedDay.score}<span className="text-[#bfff00]">.</span></h3>
                    <div className="flex gap-2">
                       <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${selectedDay.score > 7 ? 'bg-[#bfff00] text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                         {selectedDay.score > 7 ? 'Apex_Stability' : 'Idle_State'}
                       </span>
                    </div>
                  </div>

                  <div className="bg-zinc-900/40 p-8 rounded-[2rem] border border-white/10 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-black text-zinc-500 uppercase">Focus_Intensity</span>
                        <span className="text-xl font-black text-white italic">{selectedDay.score * 10}%</span>
                      </div>
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${selectedDay.score * 10}%` }} className="h-full bg-[#bfff00]" />
                      </div>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed font-medium uppercase mt-4 italic">
                      {selectedDay.score === 0 ? "No data archived for this cycle." : `Archived frequency suggests ${selectedDay.score > 5 ? 'minimal' : 'significant'} drift during deep work protocols.`}
                    </p>
                  </div>

                  <div className="flex flex-col justify-between">
                    <button onClick={() => setSelectedDay(null)} className="self-end p-4 hover:bg-white/5 rounded-full text-zinc-600 transition-all"><X size={24}/></button>
                    <div className="p-8 bg-[#bfff00]/5 border border-[#bfff00]/10 rounded-[2rem] flex items-center gap-4">
                      <Zap size={20} className="text-[#bfff00]" />
                      <p className="text-[9px] font-black text-zinc-400 uppercase leading-tight italic">Status: Record_Immutable<br/><span className="text-white">Neural integrity locked</span></p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* --- STATS SECTION --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 text-left">
          <div className="bg-zinc-900/10 border border-white/5 rounded-3xl p-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-6">Objective_Sync</p>
            <div className="space-y-6">
              {goals.map((g) => (
                <div key={g.id} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase italic text-zinc-400"><span>{g.title}</span><span className="text-[#bfff00]">{g.progress}%</span></div>
                  <div className="h-[2px] bg-zinc-800 rounded-full overflow-hidden"><motion.div animate={{ width: `${g.progress}%` }} className="h-full bg-[#bfff00]" /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-zinc-900/10 border border-white/5 rounded-3xl p-8 flex flex-col justify-between">
            <div className="flex items-center gap-4"><TrendingUp className="text-[#bfff00]" /><p className="text-2xl font-black italic uppercase text-white">{forecast}</p></div>
            <div className="flex items-end gap-1 mt-6 h-10">{weeklyTrend.map((s, i) => (<motion.div key={i} animate={{ height: `${s * 10}%` }} className={`flex-1 rounded-t-sm ${s > 7 ? 'bg-[#bfff00]' : 'bg-zinc-800'}`} />))}</div>
          </div>
          <div className="bg-zinc-900/10 border border-white/5 rounded-3xl p-8 flex flex-col justify-between">
             <div className="flex items-center gap-4 mb-4"><Activity className="text-blue-400" /><p className="text-[10px] font-black text-zinc-500 uppercase italic">Integrity_Control</p></div>
             <button onClick={() => setIsAuditOpen(true)} className="w-full py-4 bg-white/5 hover:bg-[#bfff00] hover:text-black border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Run_System_Audit</button>
          </div>
        </div>

        {/* --- INPUT AREA --- */}
        <div className="max-w-2xl mx-auto lg:mx-0">
          <AnimatePresence mode="wait">
            {isLocked ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-zinc-900/90 border border-[#bfff00]/20 rounded-3xl p-10 flex flex-col items-center justify-center text-center">
                <Lock size={24} className="text-[#bfff00] mb-4" />
                <h3 className="text-2xl font-black italic uppercase text-white mb-2">Frequency_Locked</h3>
                <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">Archive Active // No Overrides Allowed</p>
              </motion.div>
            ) : (
              <div className="relative bg-zinc-900/90 border border-white/10 rounded-3xl p-2 flex items-center shadow-2xl">
                <input className="flex-1 bg-transparent px-8 py-6 outline-none text-sm placeholder:text-zinc-800 font-medium" placeholder="Declare today's frequency..." value={log} onChange={(e) => setLog(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && syncAura()} />
                <button onClick={syncAura} className="bg-[#bfff00] text-black px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-lime-500/10">PUNCH IN</button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}