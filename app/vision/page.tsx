"use client";
import React, { useState, useMemo } from 'react';
import { 
  Upload, Zap, Copy, Palette, Sparkles, 
  RefreshCcw, Eye, Code, Monitor, Smartphone, Check 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FLAVORS = [
  { id: 'classic', label: 'Classic', color: 'bg-blue-500', glow: 'shadow-blue-500/50' },
  { id: 'candy', label: 'Candy Pop', color: 'bg-pink-500', glow: 'shadow-pink-500/50' },
  { id: 'toxic', label: 'Toxic Neon', color: 'bg-lime-500', glow: 'shadow-lime-500/50' },
  { id: 'glass', label: 'Glassy', color: 'bg-cyan-400', glow: 'shadow-cyan-400/50' },
];

export default function UIAlchemist() {
  const [image, setImage] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [flavor, setFlavor] = useState('classic');
  const [view, setView] = useState<'preview' | 'code'>('preview');
  const [device, setDevice] = useState<'mobile' | 'desktop'>('desktop');
  const [copied, setCopied] = useState(false);

  // --- LOGIC: HANDLE FILE UPLOAD ---
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // --- LOGIC: STREAMING ALCHEMY ---
  const generateCode = async () => {
    if (!image) return;
    setLoading(true);
    setGeneratedCode(""); 
    
    try {
      const res = await fetch('/api/vision', {
        method: 'POST',
        body: JSON.stringify({ image, flavor }),
      });

      if (!res.ok) throw new Error("Alchemy Failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        // Sanitizing the stream to ensure no markdown backticks sneak in
        const cleanChunk = chunk.replace(/```html|```/g, "");
        setGeneratedCode((prev) => prev + cleanChunk);
      }
    } catch (err) {
      console.error(err);
      alert("Neural connection lost. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC: CLIPBOARD (THE MISSING PIECE) ---
  const copyToClipboard = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedFlavorObj = useMemo(() => FLAVORS.find(f => f.id === flavor), [flavor]);

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-lime-400 selection:text-black font-sans overflow-x-hidden">
      
      {/* VIBRANT AMBIENT BACKGROUND */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-20 -left-20 w-[500px] h-[500px] opacity-20 blur-[120px] rounded-full transition-colors duration-1000 ${selectedFlavorObj?.color}`} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-fuchsia-600/10 blur-[150px] rounded-full" />
      </div>

      <nav className="relative z-50 border-b border-white/5 backdrop-blur-3xl p-6 flex flex-wrap justify-between items-center px-6 md:px-12 gap-4">
        <div className="flex items-center gap-4">
          <motion.div animate={{ rotate: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 4 }} className={`p-3 rounded-2xl shadow-2xl ${selectedFlavorObj?.color} ${selectedFlavorObj?.glow}`}>
            <Zap size={24} className="text-black" fill="currentColor" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter italic">UI_ALCHEMIST</h1>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em]">Vision System v2.0</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/5 p-1.5 rounded-2xl border border-white/10">
          <button onClick={() => setView('preview')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 ${view === 'preview' ? 'bg-white text-black' : 'text-zinc-500'}`}>
            <Eye size={14} /> PREVIEW
          </button>
          <button onClick={() => setView('code')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 ${view === 'code' ? 'bg-white text-black' : 'text-zinc-500'}`}>
            <Code size={14} /> SOURCE
          </button>
        </div>
      </nav>

      <main className="relative z-10 p-6 md:p-10 grid lg:grid-cols-2 gap-10 max-w-[1800px] mx-auto">
        
        {/* LEFT PANEL: UPLOAD & CONTROLS */}
        <div className="space-y-6">
          <div className="bg-zinc-900/40 border border-white/10 p-8 rounded-[3rem] backdrop-blur-3xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
              <Palette size={16} className="text-lime-400" /> 01. Configure Style
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
              {FLAVORS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFlavor(f.id)}
                  className={`p-4 rounded-2xl border transition-all duration-500 ${flavor === f.id ? `border-white scale-105 bg-white/5 shadow-2xl` : 'border-white/5 opacity-30 grayscale hover:grayscale-0'}`}
                >
                  <div className={`w-full h-1.5 rounded-full mb-3 ${f.color}`} />
                  <span className="text-[10px] font-black uppercase tracking-tighter">{f.label}</span>
                </button>
              ))}
            </div>

            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
              <Upload size={16} className="text-lime-400" /> 02. Input Screenshot
            </h3>
            
            <label className="block aspect-video bg-black/60 border-2 border-dashed border-white/10 rounded-[2rem] cursor-pointer hover:border-white/40 transition-all overflow-hidden relative group">
              {image ? (
                <img src={image} className="w-full h-full object-contain p-4" alt="Target" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                  <Upload className="text-zinc-700 group-hover:text-white transition-colors" size={40} />
                  <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Drop UI Reference</p>
                </div>
              )}
              <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
            </label>

            <button onClick={generateCode} disabled={!image || loading} className={`w-full mt-10 py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-20 ${selectedFlavorObj?.color} text-black shadow-2xl`}>
              {loading ? <RefreshCcw className="animate-spin" /> : <Sparkles fill="black" />}
              {loading ? "TRANSMUTING..." : "ALCHEMIZE CODE"}
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: LIVE OUTPUT */}
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-6 px-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Neural Output</h3>
            
            <div className="flex gap-4 items-center">
              {view === 'preview' && (
                <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl">
                  <button onClick={() => setDevice('desktop')} className={`p-2 rounded-xl transition-all ${device === 'desktop' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}>
                    <Monitor size={18} />
                  </button>
                  <button onClick={() => setDevice('mobile')} className={`p-2 rounded-xl transition-all ${device === 'mobile' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}>
                    <Smartphone size={18} />
                  </button>
                </div>
              )}

              {view === 'code' && (
                <button onClick={copyToClipboard} className="text-[10px] font-black flex items-center gap-2 hover:text-lime-400 transition-colors bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                  {copied ? <Check size={14} className="text-lime-400" /> : <Copy size={14} />} 
                  {copied ? 'COPIED!' : 'COPY_SOURCE'}
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 relative min-h-[650px] flex justify-center">
            <AnimatePresence mode="wait">
              {view === 'preview' ? (
                <motion.div 
                  key="preview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, width: device === 'mobile' ? '375px' : '100%' }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="h-full bg-slate-50 rounded-[3rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden border-[10px] border-zinc-900 relative"
                >
                  {loading && (
                    <motion.div initial={{ top: "-10%" }} animate={{ top: "110%" }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-lime-400 to-transparent z-50 shadow-[0_0_15px_#a3e635]" />
                  )}
                  {generatedCode ? (
                    <iframe srcDoc={`<html><script src="https://cdn.tailwindcss.com"></script><body className="p-4 md:p-8 flex items-center justify-center min-h-screen bg-slate-50">${generatedCode}</body></html>`} className="w-full h-full border-none" />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-800">
                      <Zap size={60} className="mb-4 opacity-10 animate-pulse" />
                      <p className="font-mono text-[10px] uppercase tracking-[0.5em]">Neural Stream Idle</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div key="code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full bg-[#080808] border border-white/10 rounded-[3rem] p-8 font-mono overflow-hidden flex flex-col shadow-2xl">
                  <pre className="text-lime-400 text-xs leading-relaxed overflow-auto flex-1 scrollbar-hide">
                    {generatedCode || '// Alchemist is idle...'}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}