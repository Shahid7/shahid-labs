"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  Compass, 
  ArrowRight, 
  Target, 
  Wind, 
  Loader2, 
  Copy, 
  Check,
  Sparkles
} from "lucide-react";

interface ActionStep {
  text: string;
}

interface AdviceData {
  perspective: string;
  actionPlan: string[];
  focusTask: string;
}

export default function ProductivityPage() {
  const [input, setInput] = useState("");
  const [data, setData] = useState<AdviceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const getAdvice = async () => {
    if (!input) return;
    setLoading(true);
    setData(null);
    try {
      const res = await fetch("/api/mood", {
        method: "POST",
        body: JSON.stringify({ moodDescription: input }),
        headers: { "Content-Type": "application/json" },
      });
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("Error fetching advice:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!data) return;
    const text = `Perspective: ${data.perspective}\n\nTasks:\n${data.actionPlan.join("\n")}\n\nDeep Work: ${data.focusTask}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#040D08] text-emerald-50 p-6 flex flex-col items-center justify-center font-sans relative overflow-hidden">
      
      {/* 1. Premium Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-600/10 blur-[130px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-900/20 blur-[120px] rounded-full"></div>
      
      {/* 2. Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" 
           style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }}></div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full space-y-8 z-10"
      >
        <header className="text-center space-y-4">
          <div className="flex justify-center">
            <motion.div 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.6 }}
              className="p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/5"
            >
              <Compass size={32} />
            </motion.div>
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-b from-emerald-50 to-emerald-400 bg-clip-text text-transparent">
              Focus & Clarity
            </h1>
            <p className="text-emerald-900 font-medium italic">Mindful productivity powered by Gemini 2.5 Flash</p>
          </div>
        </header>

        {/* Input Section */}
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-2 shadow-2xl transition-all focus-within:border-emerald-500/40">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What is weighing on your mind or blocking your progress?"
            className="w-full h-32 bg-transparent p-5 outline-none resize-none placeholder:text-emerald-950 text-emerald-100 leading-relaxed"
          />
          <div className="flex justify-between items-center p-3">
            <span className="text-[10px] text-emerald-900 uppercase tracking-widest ml-2 font-bold flex items-center gap-1">
              <Sparkles size={10} /> Halal & Productive
            </span>
            <button 
              onClick={getAdvice}
              disabled={loading || !input}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-20 shadow-lg shadow-emerald-900/20"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Seek Path <ArrowRight size={18} /></>}
            </button>
          </div>
        </div>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {data && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="relative"
            >
              <div className="absolute -inset-0.5 bg-emerald-500/10 blur rounded-[2rem]"></div>
              <div className="relative p-8 bg-[#06120a]/80 backdrop-blur-2xl border border-emerald-500/20 rounded-[2rem] shadow-2xl">
                
                {/* Header with Copy Button */}
                <div className="flex justify-between items-start mb-6">
                   <div className="flex items-center gap-2 text-emerald-400">
                      <Wind size={20} />
                      <span className="text-xs font-bold uppercase tracking-[0.2em]">Perspective</span>
                   </div>
                   <button 
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-emerald-500/10 rounded-lg transition-colors text-emerald-500"
                   >
                     {copied ? <Check size={18} /> : <Copy size={18} />}
                   </button>
                </div>

                <p className="text-xl text-emerald-50 font-medium leading-relaxed italic mb-10 border-l-2 border-emerald-500/30 pl-6">
                    {data.perspective}
                </p>

                {/* Action Items */}
                <div className="space-y-3 mb-10">
                  <h3 className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mb-4">Immediate Actions</h3>
                  {data.actionPlan.map((step: any, i: number) => (
  <motion.div 
    key={i} 
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: i * 0.1 }}
    className="flex items-start gap-4 p-4 bg-emerald-500/5 rounded-2xl border border-white/5 group hover:border-emerald-500/30 transition-all"
  >
    <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
    <div className="flex flex-col">
      <span className="text-emerald-100/80 text-sm group-hover:text-emerald-50 font-medium">
        {/* If step is an object, show the 'step' or 'title' property. If it's a string, show it directly */}
        {typeof step === 'object' ? (step.step || step.title || step.action) : step}
      </span>
      {/* If there is a description in the object, show it in smaller text */}
      {typeof step === 'object' && (step.description || step.detail) && (
        <span className="text-emerald-900 text-xs mt-1 leading-relaxed">
          {step.description || step.detail}
        </span>
      )}
    </div>
  </motion.div>
))}
                </div>

                {/* Deep Work Task */}
                <div className="p-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl">
                  <div className="p-5 bg-zinc-950/40 rounded-[14px] flex items-center justify-between">
                  <div className="flex items-center gap-4">
    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
      <Target size={22} />
    </div>
    <div>
        <p className="text-[9px] uppercase tracking-widest text-emerald-500 font-black">25m Deep Work</p>
        <p className="text-md font-bold text-white">
          {/* 🔍 Flexible rendering for focusTask */}
          {typeof data.focusTask === 'object' 
            ? ((data.focusTask as any).title || (data.focusTask as any).task || "Deep Work Session") 
            : data.focusTask}
        </p>
        {/* Optional: if the object has a description, show it here */}
        {typeof data.focusTask === 'object' && (data.focusTask as any).description && (
          <p className="text-[11px] text-emerald-700 leading-tight mt-1">
            {(data.focusTask as any).description}
          </p>
        )}
    </div>
</div>
                      <div className="px-3 py-1 bg-emerald-500/20 rounded-full text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                        TIMED
                      </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}