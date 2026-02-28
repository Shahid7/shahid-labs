"use client";
import { useEffect, useState } from 'react';
import {motion} from 'framer-motion';
import { Search, MapPin, Moon, CheckCircle2, Quote, History, X, Calendar } from 'lucide-react'
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function MasterAdmin() {
    const [access, setAccess] = useState(false);
    const [keyInput, setKeyInput] = useState("");
    const [users, setUsers] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    
    // History Modal States
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const MASTER_KEY = "123";

    const checkAccess = () => {
      if (keyInput === MASTER_KEY) setAccess(true);
    };

    const fetchHistory = async (userName: string) => {
      setLoadingHistory(true);
      setSelectedUser(userName);
      const { data } = await supabase
        .from('nightly_registry')
        .select('*')
        .eq('user_name', userName)
        .order('date', { ascending: false });
        // Deduplicate by date on the frontend (Safety Net)
  const uniqueHistory = data ? Array.from(new Map(data.map(item => [item.date, item])).values()) : [];
      setHistory(uniqueHistory || []);
      setLoadingHistory(false);
    };

    useEffect(() => {
      if (access) {
        const fetchAll = async () => {
          const { data } = await supabase.from('user_vaults').select('*').order('last_active', { ascending: false });
          setUsers(data || []);
        };
        fetchAll();
      }
    }, [access]);

    if (!access) return (
      <div className="min-h-screen bg-[#2D3328] flex items-center justify-center p-6">
        <input 
          type="password" 
          className="bg-transparent border-b border-white/20 text-white text-center text-2xl outline-none"
          placeholder="ENTER MASTER KEY"
          onChange={(e) => setKeyInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && checkAccess()}
        />
      </div>
    );

    return (
        <div className="min-h-screen bg-[#1A1D17] text-[#EBE7D9] p-4 md:p-20 font-sans relative">
          <div className="max-w-6xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
              <div>
                <h1 className="text-5xl md:text-8xl font-serif italic tracking-tighter">The Registry</h1>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#B4C2A8] mt-4">Master Executive Control</p>
              </div>
              <div className="w-full md:w-72 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={16} />
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs outline-none focus:border-[#B4C2A8]/50"
                  placeholder="Search Holder..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </header>
    
            <div className="space-y-6">
              {users.filter(u => u.user_name.toLowerCase().includes(searchTerm.toLowerCase())).map((u) => (
                <div key={u.id} className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-6 md:p-10 hover:bg-white/[0.05] transition-all relative overflow-hidden group">
                  
                  {/* HISTORY BUTTON (Existing) */}
  <button 
    onClick={() => fetchHistory(u.user_name)}
    className="absolute top-6 right-6 p-3 bg-white/5 rounded-full hover:bg-[#B4C2A8] hover:text-[#1A1D17] transition-all"
  >
    <History size={16} />
  </button>

  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
    {/* 1. Identity & Credentials */}
    <div className="space-y-4">
        <div>
          <span className="text-[8px] font-black opacity-30 uppercase block">Vault Holder</span>
          <p className="text-2xl font-serif italic text-[#B4C2A8]">{u.user_name}</p>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-white/40">
            <MapPin size={10} />
            <span className="text-[10px] uppercase font-bold tracking-tighter">{u.city || 'Unknown City'}</span>
          </div>
          <div className="flex items-center gap-2 text-amber-500/50">
            <span className="text-[8px] font-black uppercase">Key:</span>
            <span className="text-[10px] font-mono">{u.password || '••••••'}</span>
          </div>
        </div>
    </div>

    {/* 2. Quran Progress Tracker */}
<div className="border-l border-white/5 pl-6">
    <span className="text-[8px] font-black opacity-30 uppercase block mb-3 tracking-widest text-emerald-500/60">
      Quranic Milestone
    </span>
    
    <div className="flex items-baseline gap-2">
        {/* This displays the actual number (e.g., 22) */}
        <p className={`text-3xl font-serif italic ${u.quran_progress === 30 ? 'text-amber-400 drop-shadow-md' : 'text-white/90'}`}>
    {u.quran_progress === 30 ? "Khatam" : u.quran_progress}
    </p>
        <p className="text-[10px] font-black opacity-30 uppercase">
            Parahs Marked
        </p>
    </div>

    {/* Visual Progress Bar */}
    <div className="mt-4 w-full h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((u.quran_progress || 0) / 30) * 100}%` }}
            className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]"
        />
    </div>

    <p className="text-[7px] font-black opacity-20 uppercase mt-2 tracking-tighter">
        Goal: 30 / 30 Completion
    </p>
</div>

    {/* 3. Ritual Stats */}
    <div className="border-l border-white/5 pl-6">
        <span className="text-[8px] font-black opacity-30 uppercase block mb-3 tracking-widest">Ritual Activity</span>
        <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-lg font-serif italic text-white/80">{u.fasting_days?.length || 0}</p>
              <p className="text-[8px] opacity-30 uppercase">Fasts</p>
            </div>
            <div>
              <p className="text-lg font-serif italic text-white/80">{u.tasbeeh_count || 0}</p>
              <p className="text-[8px] opacity-30 uppercase">Tasbeeh</p>
            </div>
        </div>
    </div>

    {/* 4. Latest Intent */}
    <div className="border-l border-white/5 pl-6">
        <span className="text-[8px] font-black opacity-30 uppercase block mb-2 tracking-widest text-amber-500/60">Current Intent</span>
        <p className="text-xs italic opacity-80 leading-relaxed max-h-20 overflow-y-auto">
            {u.tahajjud_intent ? `"${u.tahajjud_intent}"` : "No intent active."}
        </p>
    </div>
  </div>
</div>
              ))}
            </div>
          </div>

          {/* HISTORY MODAL OVERLAY */}
          {selectedUser && (
            <div className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-xl flex items-center justify-end">
                <div className="w-full max-w-2xl h-full bg-[#1A1D17] border-l border-white/10 p-8 md:p-16 overflow-y-auto">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h2 className="text-4xl font-serif italic">{selectedUser}'s Timeline</h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-2">Historical Nightly Records</p>
                        </div>
                        <button onClick={() => setSelectedUser(null)} className="p-4 bg-white/5 rounded-full hover:bg-red-500/20"><X size={20}/></button>
                    </div>

                    {loadingHistory ? (
                        <div className="flex items-center justify-center h-64 opacity-20 animate-pulse text-xs uppercase font-black tracking-widest">Accessing Registry...</div>
                    ) : (
                        <div className="space-y-12 relative">
                            {/* Vertical Timeline Line */}
                            <div className="absolute left-[11px] top-0 bottom-0 w-[1px] bg-white/10" />

                            {history.length > 0 ? history.map((entry, i) => (
                                <div key={i} className="relative pl-10">
                                    <div className="absolute left-0 top-1 w-6 h-6 bg-[#1A1D17] border-2 border-[#B4C2A8] rounded-full flex items-center justify-center">
                                        <div className="w-2 h-2 bg-[#B4C2A8] rounded-full" />
                                    </div>
                                    
                                    <div className="flex items-center gap-3 mb-3">
                                        <Calendar size={12} className="opacity-30" />
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                                            {new Date(entry.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                                        </span>
                                    </div>

                                    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl">
                                        <p className="text-sm italic text-white/80 mb-4 leading-relaxed">"{entry.intent}"</p>
                                        <div className="flex flex-wrap gap-2">
                                            {entry.completed_items?.map((item: string) => (
                                                <span key={item} className="text-[7px] font-black px-2 py-1 bg-green-500/10 text-green-500 rounded border border-green-500/20 uppercase">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center opacity-30 py-20 italic">No sealed nights found in history.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
          )}
        </div>
      );
}