"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, RefreshCw, Palette, Check, Layout } from "lucide-react";

export default function PalettePage() {
  const [vibe, setVibe] = useState("");
  const [colors, setColors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const getPalette = async () => {
    if (!vibe) return;
    setLoading(true);
    try {
      const res = await fetch("/api/palette", {
        method: "POST",
        body: JSON.stringify({ vibe }),
      });
      const data = await res.json();
      setColors(data.colors);
    } catch (err) {
      console.error("Failed to generate");
    }
    setLoading(false);
  };

  const copyColor = (color: string, index: number) => {
    navigator.clipboard.writeText(color);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 p-8 flex flex-col items-center justify-center">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-purple-600/10 blur-[100px] rounded-full" />
      </div>

      <div className="w-full max-w-5xl z-10">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4 flex items-center justify-center gap-3">
            <Palette className="text-blue-500" /> AI Color Studio
          </h1>
          <p className="text-zinc-500">Transform any "vibe" into a production-ready color system.</p>
        </header>

        {/* Input Bar */}
        <div className="flex gap-3 mb-16 max-w-xl mx-auto p-2 bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-2xl">
          <input 
            value={vibe}
            onChange={(e) => setVibe(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && getPalette()}
            placeholder="Try 'Vintage Polaroid' or 'Mars Colony'..."
            className="flex-1 bg-transparent px-4 py-2 outline-none text-zinc-200 placeholder:text-zinc-600"
          />
          <button 
            onClick={getPalette}
            disabled={loading}
            className="bg-zinc-100 text-black px-6 py-2 rounded-xl font-bold hover:bg-white transition flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : "Generate"}
          </button>
        </div>

        {/* Palette Display */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 h-80 mb-12">
          <AnimatePresence mode="popLayout">
            {colors.length > 0 ? colors.map((color, i) => (
              <motion.div
                key={color + i}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => copyColor(color, i)}
                className="group relative rounded-3xl cursor-pointer flex flex-col items-center justify-end pb-6 hover:flex-[1.4] transition-all duration-500"
                style={{ backgroundColor: color }}
              >
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-md p-2 rounded-full mb-4">
                  {copiedIndex === i ? <Check size={20} className="text-white" /> : <Copy size={20} className="text-white" />}
                </div>
                <span className="bg-white/90 text-black text-[10px] font-bold px-2 py-1 rounded-md tracking-wider">
                  {color}
                </span>
              </motion.div>
            )) : (
              // Empty State
              [...Array(5)].map((_, i) => (
                <div key={i} className="bg-zinc-900/50 border border-zinc-800 border-dashed rounded-3xl" />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Live UI Preview Section */}
        {colors.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8"
          >
            <h2 className="text-sm font-bold text-zinc-500 mb-6 flex items-center gap-2 uppercase tracking-widest">
              <Layout size={16} /> Live UI Preview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div style={{ color: colors[0] }} className="text-3xl font-bold">This is your primary heading.</div>
                    <p className="text-zinc-400">This is how your text looks. We use <span style={{ color: colors[1] }} className="font-bold underline">Accent Colors</span> to highlight important information in the interface.</p>
                    <div className="flex gap-2">
                        <button style={{ backgroundColor: colors[2] }} className="px-6 py-2 rounded-full font-bold text-black text-sm">Primary Action</button>
                        <button style={{ borderColor: colors[3], color: colors[3] }} className="px-6 py-2 rounded-full font-bold border text-sm">Secondary</button>
                    </div>
                </div>
                <div style={{ backgroundColor: colors[4] }} className="rounded-2xl p-6 flex flex-col justify-between border border-white/10">
                    <div className="h-8 w-8 rounded-full" style={{ backgroundColor: colors[0] }} />
                    <div className="text-xs opacity-70 mt-8" style={{ color: colors[1] }}>Card Component Preview</div>
                </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}