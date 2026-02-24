"use client";
import { useEffect, useState } from 'react';
import {Search, MapPin} from 'lucide-react'
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function MasterAdmin() {
    const [access, setAccess] = useState(false);
    const [keyInput, setKeyInput] = useState("");
    const [users, setUsers] = useState<any[]>([]);
    const MASTER_KEY = "123"; // Change this!
    const [searchTerm, setSearchTerm] = useState("");
    const checkAccess = () => {
      if (keyInput === MASTER_KEY) setAccess(true);
    };

    const filteredUsers = users.filter(u => 
        u.user_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  
    useEffect(() => {
      if (access) {
        const fetchAll = async () => {
          const { data } = await supabase.from('user_vaults').select('*');
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
        <div className="min-h-screen bg-[#1A1D17] text-[#EBE7D9] p-4 md:p-20 font-sans">
          <div className="max-w-6xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
              <div>
                <h1 className="text-5xl md:text-8xl font-serif italic tracking-tighter">The Registry</h1>
                <div className="flex items-center gap-4 mt-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#B4C2A8]">Live Database</span>
                  <div className="h-[1px] w-12 bg-white/20" />
                  <span className="text-[10px] font-mono opacity-40">{users.length} Records</span>
                </div>
              </div>
              
              {/* SEARCH BAR */}
              <div className="w-full md:w-72 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={16} />
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs outline-none focus:border-[#B4C2A8]/50 transition-all"
                  placeholder="Search Holder..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </header>
    
            {/* TABLE LOGIC */}
            <div className="space-y-4">
              {filteredUsers.map((u) => (
                <div key={u.id} className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 md:p-8 hover:bg-white/[0.06] transition-all group">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
                    
                    {/* IDENTITY */}
                    <div className="col-span-2 md:col-span-1">
                      <span className="text-[8px] font-black opacity-30 uppercase block mb-1">Vault Holder</span>
                      <p className="text-xl font-medium group-hover:text-[#B4C2A8] transition-colors truncate">{u.user_name}</p>
                    </div>
    
                    {/* PASSWORD */}
                    <div className="border-l border-white/10 pl-4">
                      <span className="text-[8px] font-black opacity-30 uppercase block mb-1">Access Key</span>
                      <p className="font-mono text-sm opacity-60">“{u.password}”</p>
                    </div>
    
                    {/* STATS */}
                    <div className="flex gap-6 border-l border-white/10 pl-4">
                      <div>
                        <span className="text-[8px] font-black opacity-30 uppercase block mb-1">Tasbeeh</span>
                        <p className="text-lg italic font-serif">{u.tasbeeh_count}</p>
                      </div>
                      <div>
                        <span className="text-[8px] font-black opacity-30 uppercase block mb-1">Fasts</span>
                        <p className="text-lg italic font-serif">{u.fasting_days?.length || 0}</p>
                      </div>
                    </div>
    
                    {/* TIMESTAMP & LOCATION */}
                    <div className="col-span-2 md:col-span-1 text-left md:text-right border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-4">
                      <span className="text-[8px] font-black opacity-30 uppercase block mb-1">Access Origin</span>
                      <p className="text-[11px] font-bold text-[#B4C2A8] flex items-center md:justify-end gap-1">
                        <MapPin size={10} /> {u.last_location || "Unknown"}
                      </p>
                      <p className="text-[10px] opacity-40 uppercase mt-1">
                        {new Date(u.last_active).toLocaleDateString()} @ {new Date(u.last_active).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>

                    {/* TIMESTAMP (RESPONSIVE ALIGNMENT) */}
                    <div className="col-span-2 md:col-span-1 text-left md:text-right border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-4">
                      <span className="text-[8px] font-black opacity-30 uppercase block mb-1">Last Active</span>
                      <p className="text-[11px] font-bold text-[#B4C2A8]">
                        {new Date(u.last_active).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </p>
                      <p className="text-[10px] opacity-40 uppercase">
                         {new Date(u.last_active).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }