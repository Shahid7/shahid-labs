"use client";
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, BookOpen, Heart, Check, ShieldCheck, PhoneOff, Wind, CloudMoon, Zap, Bell, Eye } from 'lucide-react';

const TAHAJJUD_WHISPERS = {
  en: [
    "The Dua made at Tahajjud is like an arrow that does not miss its target.",
    "In the darkness of the night, the light of the believer's heart is polished.",
    "While the world sleeps, the Lovers of Allah stand in conversation with Him.",
    "Tahajjud is the gate where the King calls out: 'Who is asking, that I may give?'"
  ],
  ur: [
    "تہجد میں مانگی گئی دعا اس تیر کی طرح ہے جو اپنے نشانے سے نہیں چوکتا۔",
    "رات کی تاریکی میں مومن کے دل کا نور اور زیادہ ہوجاتا ہے۔",
    "جب دنیا سوتی ہے، اللہ کے پیارے اس سے گفتگو میں مصروف ہوتے ہیں۔",
    "تہجد وہ دروازہ ہے جہاں بادشاہ پکارتا ہے: 'ہے کوئی مانگنے والا، کہ میں اسے عطا کروں؟'"
  ]
};

const OVERLAY_T = {
  en: {
    label: "A Whisper for the Awakened",
    title: "Lailah Mubarak",
    preserved: "Your intentions are preserved.",
    rest: "Rest in the protection of Al-Hafiz.",
    awake: "Awake"
  },
  ur: {
    label: "بیداری کے لیے ایک سرگوشی",
    title: "لیلہ مبارک",
    preserved: "آپ کی نیتیں محفوظ ہیں۔",
    rest: "الحفیظ کی حفاظت میں آرام کریں۔",
    awake: "جاگ گئے"
  }
};

// Custom Miswak Icon Component
const MiswakIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20L15 9" strokeWidth="2.5" />
    <path d="M14 8l2-3" />
    <path d="M15.5 9.5l3.5-2.5" />
    <path d="M16 11l4-1" />
    <path d="M16.5 12.5l3.5 1.5" />
    <path d="M7 17l2-2" opacity="0.5" strokeWidth="1"/>
  </svg>
);

const RITUALS = [
  { id: 'adhkar', label: 'Tasbeeh', icon: <ShieldCheck />, desc: '33/33/34' },
  { id: 'quran', label: 'Quran', icon: <BookOpen />, desc: 'Mulk' },
  { id: 'miswak', label: 'Miswak', icon: <MiswakIcon />, desc: 'Cleanse' },
  { id: 'dua', label: 'Dua', icon: <Moon />, desc: 'Talk' },
  { id: 'wudu', label: 'Wudu', icon: <Wind />, desc: 'Purity' },
  { id: 'tech', label: 'Offline', icon: <PhoneOff />, desc: 'Digital Fast' },
  { id: 'gratitude', label: 'Shukr', icon: <Heart />, desc: 'Blessings' },
];

const StaticStars = React.memo(() => {
  const starData = React.useMemo(() => 
    [...Array(50)].map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 2,
    })), []);

  return (
    <>
      {starData.map((star, i) => (
        <motion.div
          key={`star-${i}`}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: star.duration, repeat: Infinity, delay: star.delay }}
          className="absolute w-[2px] h-[2px] bg-white rounded-full shadow-[0_0_8px_white]"
          style={{ top: star.top, left: star.left }}
        />
      ))}
    </>
  );
});

export default function AlKhatm({ user, sync }: { user: any, sync: any }) {
  const [lang, setLang] = useState<'en' | 'ur'>('en');
  const [completed, setCompleted] = useState<string[]>([]);
  const [gratitudeText, setGratitudeText] = useState("");
  const [blessings, setBlessings] = useState<{text: string, x: number, y: number}[]>([]);
  const [showGratitudeInput, setShowGratitudeInput] = useState(false);
  const [showSunnahVisual, setShowSunnahVisual] = useState(false);
  const [isSealed, setIsSealed] = useState(false);
  const audioCtx = useRef<AudioContext | null>(null);
  const [adhkarCount, setAdhkarCount] = useState(0);
  const [tahajjudIntent, setTahajjudIntent] = useState(false);
  const [showMulk, setShowMulk] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [activeWhisper, setActiveWhisper] = useState("");
  const [fontSize, setFontSize] = useState("32px");

  const ot = lang === 'ur' ? OVERLAY_T.ur : OVERLAY_T.en;

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const scrollValue = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setScrollPercent(scrollValue);
    }
  };

  const getPhase = (count: number) => {
    if (count < 33) return { label: "SubhanAllah", color: "#10b981", shadow: "rgba(16, 185, 129, 0.3)" };
    if (count < 66) return { label: "Alhamdulillah", color: "#3b82f6", shadow: "rgba(59, 130, 246, 0.3)" };
    return { label: "Allahu Akbar", color: "#f43f5e", shadow: "rgba(244, 63, 94, 0.3)" };
  };

  const playTone = (freq: number, type: OscillatorType, duration: number) => {
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.current.createOscillator();
    const gain = audioCtx.current.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.current.currentTime);
    osc.connect(gain); gain.connect(audioCtx.current.destination);
    gain.gain.setValueAtTime(0.05, audioCtx.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.current.currentTime + duration);
    osc.start(); osc.stop(audioCtx.current.currentTime + duration);
  };

  const toggleRitual = (id: string) => {
    if (id === 'gratitude') {
      if (!completed.includes('gratitude')) { setShowGratitudeInput(true); } 
      else { setCompleted(prev => prev.filter(i => i !== 'gratitude')); }
      return;
    }
    if (id === 'quran') {
        if (!completed.includes('quran')) { setShowMulk(true); } 
        else { setCompleted(prev => prev.filter(i => i !== 'quran')); }
        return;
    }
    if (id === 'adhkar' && adhkarCount < 100) {
      const next = adhkarCount + 1;
      setAdhkarCount(next);
      if (navigator.vibrate) navigator.vibrate(15);
      playTone(300 + (next % 33 * 5), 'sine', 0.1);
      if (next === 100) {
        setCompleted(prev => [...prev, 'adhkar']);
        playTone(800, 'sine', 0.5);
      }
      return;
    }
    const isAdding = !completed.includes(id);
    setCompleted(prev => isAdding ? [...prev, id] : prev.filter(i => i !== id));
    playTone(isAdding ? 600 : 300, 'sine', 0.2);
  };

  const phase = getPhase(adhkarCount);

  return (
    <div className={`min-h-screen transition-colors duration-1000 flex flex-col items-center justify-center p-6 overflow-hidden ${isSealed ? 'bg-[#050a08]' : 'bg-[#020403]'}`}>
  
      <header className="relative z-10 text-center mb-8 w-full max-w-xs">
        <div className="relative inline-block">
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-serif italic text-[#2D3328] tracking-tight">
            Sunnatul <span className="font-light border-b border-[#2D3328]/20">Layl</span>
          </motion.h1>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} className="absolute -top-1 -right-4 w-2 h-2 rounded-full bg-[#7C8A71]/40" />
        </div>
        <p className="mt-4 text-[#90EE90] text-[10px] tracking-[0.5em] uppercase font-bold">The Nightly Path</p>
        
        <button onClick={() => setShowSunnahVisual(!showSunnahVisual)} className={`mt-4 mx-auto flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-500 ${showSunnahVisual ? 'bg-amber-500 border-amber-500 text-black shadow-lg' : 'bg-white/5 border-white/10 text-zinc-500'}`}>
          <Eye size={12} />
          <span className="text-[8px] font-black uppercase tracking-widest">Sunnah Position</span>
        </button>

        {/* NEW: Urdu/English Toggle Button */}
    <button 
      onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
      className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-zinc-500 transition-all active:scale-95"
    >
      <div className={`w-1.5 h-1.5 rounded-full ${lang === 'ur' ? 'bg-amber-500' : 'bg-zinc-700'}`} />
      <span className="text-[8px] font-black uppercase tracking-widest">
        {lang === 'en' ? 'اردو' : 'English'}
      </span>
    </button>
  

        <AnimatePresence>
          {showSunnahVisual && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="mt-6 p-8 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[3rem] flex flex-col items-center">
              <svg width="220" height="110" viewBox="0 0 200 120" fill="none">
                <path d="M20 105Q100 110 180 105" stroke="white" strokeWidth="0.5" strokeOpacity="0.1"/>
                <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 4 }} d="M150 90C150 90 145 55 110 50C90 48 65 55 55 75" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="45" cy="50" r="18" stroke="white" strokeWidth="2.5"/>
                <path d="M25 70C22 75 22 85 32 87C42 89 52 83 55 75" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
                <path d="M150 90L195 100" stroke="white" strokeWidth="2" strokeOpacity="0.4" strokeLinecap="round" />
                <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1, duration: 2 }} d="M148 88C155 75 165 70 185 80" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              <p className="text-[9px] text-amber-500 font-bold uppercase tracking-widest mt-4">One leg stretched • Other bent • Hand on cheek</p>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-lg px-4">
        {RITUALS.map((r) => {
          const isDone = completed.includes(r.id);
          const isAdhkar = r.id === 'adhkar';
          return (
            <motion.div key={r.id} onClick={() => toggleRitual(r.id)} style={isAdhkar && !isDone ? { boxShadow: `0 0 20px ${phase.shadow}`, borderColor: phase.color } : {}} className={`aspect-square rounded-3xl flex flex-col items-center justify-center relative cursor-pointer border-2 transition-all duration-500 ${isDone ? 'bg-amber-500/10 border-amber-500' : 'bg-zinc-900/40 border-white/5'}`}>
              {isAdhkar && !isDone ? (
                <div className="flex flex-col items-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="50%" cy="50%" r="42%" stroke={phase.color} strokeWidth="4" fill="transparent" strokeDasharray="260" strokeDashoffset={260 - (260 * (adhkarCount / 100))} className="transition-all duration-300" />
                  </svg>
                  <motion.span key={phase.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: phase.color }} className="text-[7px] font-black uppercase mb-1">{phase.label}</motion.span>
                  <span className="text-2xl font-mono font-black">{adhkarCount % 33 || (adhkarCount === 0 ? 0 : 33)}</span>
                </div>
              ) : (
                <>
                  <div className={`text-2xl mb-2 ${isDone ? 'text-amber-400' : 'text-zinc-600'}`}>{r.icon}</div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isDone ? 'text-white' : 'text-zinc-700'}`}>{r.label}</span>
                </>
              )}
              {isDone && (
                <motion.div layoutId="activeCheck" className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center border-2 border-[#020205] z-20 shadow-xl">
                  <Check size={12} strokeWidth={4} color="black"/>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </main>

      <div className="relative z-10 mt-8 w-full max-w-xs">
        <div className="flex items-center justify-between p-5 rounded-2xl bg-zinc-900/40 border border-white/5">
          <div className="flex items-center gap-3 text-zinc-500">
            <Bell size={18} className={tahajjudIntent ? 'text-amber-400' : ''} />
            <p className="text-[9px] font-black uppercase tracking-widest">Tahajjud Intent</p>
          </div>
          <button onClick={() => setTahajjudIntent(!tahajjudIntent)} className={`w-12 h-6 rounded-full relative ${tahajjudIntent ? 'bg-amber-500' : 'bg-zinc-800'}`}>
            <motion.div animate={{ x: tahajjudIntent ? 26 : 4 }} className="absolute top-1 w-4 h-4 bg-white rounded-full" />
          </button>
        </div>
      </div>

      <div className="relative z-10 mt-8 w-full max-w-xs h-16">
        <AnimatePresence>
          {completed.length === RITUALS.length && !isSealed && (
            <motion.button 
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => {
                setIsSealed(true);
                const list = lang === 'ur' ? TAHAJJUD_WHISPERS.ur : TAHAJJUD_WHISPERS.en;
                const randomWhisper = list[Math.floor(Math.random() * list.length)];
                setActiveWhisper(randomWhisper);
                const today = new Date().toISOString().split('T')[0];
                sync({ last_sealed: today, sunnah_completed: completed, tahajjud_intent: tahajjudIntent });
              }}
              className="w-full py-5 rounded-full bg-white text-black font-black text-xs uppercase tracking-[0.4em]"
            >
              Seal Night
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showGratitudeInput && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-[#020205]/95 backdrop-blur-xl flex items-center justify-center p-8">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-sm text-center">
              <Heart className="mx-auto text-amber-500 mb-6 animate-pulse" size={32} />
              <h2 className="text-xl font-serif italic mb-2 text-amber-100">What warmed your heart today?</h2>
              <textarea autoFocus className="w-full bg-transparent border-b border-white/10 text-white text-center italic text-lg outline-none h-24 mb-10 resize-none" placeholder="..." onChange={(e) => setGratitudeText(e.target.value)} />
              <button onClick={() => { if (gratitudeText.trim()) { setBlessings([...blessings, { text: gratitudeText, x: Math.random() * 90, y: Math.random() * 90 }]); setCompleted([...completed, 'gratitude']); setShowGratitudeInput(false); setGratitudeText(""); playTone(800, 'sine', 0.4); } }} className="px-10 py-4 bg-amber-500 text-black rounded-full font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-transform">Release to Sky</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSealed && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            dir={lang === 'ur' ? 'rtl' : 'ltr'}
            className="fixed inset-0 z-[150] bg-[#020617] flex flex-col items-center justify-center overflow-hidden"
          >

            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 15, repeat: Infinity }} className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_#0ea5e9_0%,_transparent_70%)] blur-[100px]" />
            
            {tahajjudIntent && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2, duration: 1.5 }} className="absolute top-12 left-0 right-0 md:left-10 md:right-auto md:top-45 z-[170] px-6 md:px-0 md:max-w-xs pointer-events-none">
                <div className="relative border-b border-white/10 md:border-t md:border-amber-500/20 py-4 md:py-6">
                  <p className="hidden md:block text-[9px] text-amber-500 tracking-normal uppercase mb-4 opacity-70">{ot.label}</p>
                  <p className={`text-amber-100/90 font-serif italic leading-relaxed px-4 ${lang === 'ur' ? 'text-lg text-right' : 'text-xs sm:text-sm md:text-lg text-center md:text-left'}`}>"{activeWhisper}"</p>
                </div>
              </motion.div>
            )}

            <StaticStars />

            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 1.5 }} className="relative z-10 flex flex-col items-center text-center px-6">
              <div className="relative mb-16 flex items-center justify-center w-48 h-40">
                <motion.div initial={{ rotate: -10, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 2 }} className="absolute top-0 right-6 text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]"><Moon size={90} fill="currentColor" stroke="none" /></motion.div>
                <motion.svg width="120" height="70" viewBox="0 0 24 24" fill="white" className="absolute bottom-2 left-4 drop-shadow-lg opacity-90" animate={{ x: [-4, 4, -4] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}><path d="M17.5,19c-3.037,0-5.5-2.463-5.5-5.5c0-0.007,0-0.013,0-0.02c-0.014,0.001-0.028,0.002-0.042,0.002c-2.485,0-4.5-2.015-4.5-4.5c0-0.065,0.002-0.129,0.005-0.193C6.347,8.34,5.191,8,4,8c-2.209,0-4,1.791-4,4c0,2.209,1.791,4,4,4h1c0,1.657,1.343,3,3,3h9.5c2.485,0,4.5-2.015,4.5-4.5c0-2.485-2.015-4.5-4.5-4.5c-0.124,0-0.246,0.005-0.367,0.015C16.536,8.441,14.475,7,12,7c-0.385,0-0.758,0.038-1.118,0.11C11.319,5.321,12.973,4,15,4c2.209,0,4,1.791,4,4c0,0.125-0.006,0.248-0.017,0.37C21.144,8.814,23,10.686,23,13C23,16.314,20.314,19,17.5,19z" /></motion.svg>
              </div>
              <div className={lang === 'ur' ? 'urdu-font text-right' : 'font-serif text-center'}>
        <motion.h2 
          className={`
          text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]
          /* Logic: Use specific Urdu font/spacing vs English */
          ${lang === 'ur' ? 'urdu-font text-7xl tracking-normal mt-[-40px]' : 'font-serif italic text-6xl tracking-tight mt-[-20px]'}
        `}
        style={{ fontSize: lang === 'ur' ? '5rem' : '4rem' }} 
      >
        {ot.title}
        </motion.h2>

        <motion.p 
          className={`text-amber-200/70 transition-all duration-1000 ${lang === 'ur' ? 'text-2xl' : 'text-sm tracking-[0.4em]'}`}
        >
          {ot.preserved}
        </motion.p>
      </div>
              <div className="space-y-4 max-w-xs">
              {/* <p className={`text-white/60 uppercase font-black leading-relaxed 
      ${lang === 'ur' ? 'text-lg tracking-normal' : 'text-[10px] tracking-[0.5em]'}`}>
      {ot.preserved}
    </p> */}
                <div className="h-[1px] w-8 bg-white/20 mx-auto" />
                <p className={`font-serif italic text-sky-100/80 
      ${lang === 'ur' ? 'text-xl tracking-normal mt-2' : 'text-base tracking-wide'}`}>
      {ot.rest}
    </p>
              </div>
            </motion.div>

            <button onClick={() => setIsSealed(false)} className="absolute bottom-12 px-10 py-3 rounded-full border border-white/10 text-[9px] text-white/30 uppercase tracking-normal transition-all active:scale-95">{ot.awake}</button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMulk && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-[#020205] flex flex-col overflow-hidden">
            <motion.div className="fixed top-0 left-0 h-[2px] bg-amber-500 z-[210] shadow-[0_0_10px_#f59e0b]" style={{ width: `${scrollPercent}%` }} />
            <div className="w-full p-6 flex flex-col gap-4 z-[210] bg-gradient-to-b from-[#020205] via-[#020205]/80 to-transparent">
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /><h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Surah Al-Mulk</h3></div>
                <button onClick={() => { setShowMulk(false); setScrollPercent(0); }} className="p-2 text-zinc-500 hover:text-white transition-colors">✕</button>
              </div>
              <div className="flex items-center gap-4 bg-white/5 px-4 py-3 rounded-2xl border border-white/10 self-center md:self-start">
                 <span className="text-[10px] text-zinc-500 font-bold uppercase">Size</span>
                 <input type="range" min="24" max="80" value={parseInt(fontSize)} onChange={(e) => setFontSize(`${e.target.value}px`)} className="w-32 sm:w-48 accent-amber-500 cursor-pointer h-1 bg-zinc-800 rounded-lg appearance-none" />
                 <span className="text-xs text-zinc-300 font-bold">{parseInt(fontSize)}</span>
              </div>
            </div>
            <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto custom-scrollbar-hidden px-6 md:px-12">
              <div className="text-center w-full max-w-none pt-12 pb-60">
                <motion.p className="arabic-font text-4xl text-amber-200/90 mb-24">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</motion.p>
                <div className="text-right" dir="rtl">
                <p 
    className="arabic-font text-white/95 leading-[2.2] tracking-wide transition-all duration-200"
    style={{ fontSize: fontSize }} 
  >
    تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ <span className="text-amber-500/30 text-[0.6em] mx-2 font-sans">﴿١﴾</span>
    الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ <span className="text-amber-500/30 text-[0.6em] mx-2 font-sans">﴿٢﴾</span>
    الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا ۖ مَّا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ ۖ فَارْجِعِ الْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍ <span className="text-amber-500/30 text-[0.6em] mx-2 font-sans">﴿٣﴾</span>
    ثُمَّ ارْجِعِ الْبَصَرَ كَرَّتَيْنِ يَنقَلِبْ إِلَيْكَ الْبَصَرُ خَاسِئًا وَهُوَ حَسِيرٌ <span className="text-amber-500/30 text-[0.6em] mx-2 font-sans">﴿٤﴾</span>
    وَلَقَدْ زَيَّنَّا السَّمَاءَ الدُّنْيَا بِمَصَابِيحَ وَجَعَلْنَاهَا رُجُومًا لِّلشَّيَاطِينِ ۖ وَأَعْتَدْنَا لَهُمْ عَذَابَ السَّعِيرِ <span className="text-amber-500/30 text-[0.6em] mx-2 font-sans">﴿٥﴾</span>
    وَلِلَّذِينَ كَفَرُوا بِرَبِّهِمْ عَذَابُ جَهَنَّمَ ۖ وَبِئْسَ الْمَصِيرُ <span className="text-amber-500/30 text-[0.6em] mx-2 font-sans">﴿٦﴾</span>
    إِذَا أُلْقُوا فِيهَا سَمِعُوا لَهَا شَهِيقًا وَهِيَ تَفُورُ <span className="text-amber-500/30 text-[0.6em] mx-2 font-sans">﴿٧﴾</span>
    تَكَادُ تَمَيَّزُ مِنَ الْغَيْظِ ۖ كُلَّمَا أُلْقِيَ فِيهَا فَوْجٌ سَأَلَهُمْ خَزَنَتُهَا أَلَمْ يَأْتِكُمْ نَذِيرٌ <span className="text-amber-500/30 text-[0.6em] mx-2 font-sans">﴿٨﴾</span>
    قَالُوا بَلَىٰ قَدْ جَاءَنَا نَذِيرٌ فَكَذَّبْنَا وَقُلْنَا مَا نَزَّلَ اللَّهُ مِن شَيْءٍ إِنْ أَنتُمْ إِلَّا فِي ضَلَالٍ كَبِيرٍ <span className="text-amber-500/30 text-[0.6em] mx-2 font-sans">﴿٩﴾</span>
    وَقَالُوا لَوْ كُنَّا نَسْمَعُ أَوْ نَعْقِلُ مَا كُنَّا فِي أَصْحَابِ السَّعِيرِ <span className="text-amber-500/30 text-[0.6em] mx-2 font-sans">﴿١٠﴾</span>
    فَاعْتَرَفُوا بِذَنْبِهِمْ فَسُحْقًا لِّأَصْحَابِ السَّعِيرِ <span className="text-amber-500/30 text-[0.6em] mx-2 font-sans">﴿١١﴾</span>
    إِنَّ الَّذِينَ يَخْشَوْنَ رَبَّهُم بِالْغَيْبِ لَهُم مَّغْفِرَةٌ وَأَجْرٌ كَبِيرٌ <span className="text-amber-500/30 text-[0.6em] mx-2 font-sans">﴿١٢﴾</span>
    وَأَسِرُّوا قَوْلَكُمْ أَوِ اجْهَرُوا بِهِ ۖ إِنَّهُ عَلِيمٌ بِذَاتِ الصُّدُورِ <span className="text-amber-500/30 text-[0.6em] mx-2 font-sans">﴿١٣﴾</span>
    أَلَا يَعْلَمُ مَنْ خَلَقَ وَهُوَ اللَّطِيفُ الْخَبِيرُ <span className="text-amber-500/30 text-[0.6em] mx-2 font-sans">﴿١٤﴾</span>
    هُوَ الَّذِي جَعَلَ لَكُمُ الْأَرْضَ ذَلُولًا فَامْشُوا فِي مَنَاكِبِهَا وَكُلُوا مِن رِّزْقِهِ ۖ وَإِلَيْهِ النُّشُورُ <span className="text-amber-500/30 text-[0.6em] mx-2 font-sans">﴿١٥﴾</span>
    أَأَمِنتُم مَّن فِي السَّمَاءِ أَن يَخْسِفَ بِكُمُ الْأَرْضَ فَإِذَا هِيَ تَمُورُ <span className="text-amber-500/30 text-[0.6em] mx-2 font-sans">﴿١٦﴾</span>
    أَمْ أَمِنتُم مَّن فِي السَّمَاءِ أَن يُرْسِلَ عَلَيْكُمْ حَاصِبًا ۖ فَسَتَعْلَمُونَ كَيْفَ نَذِيرِ <span className="text-amber-500/30 text-[0.6em] mx-2 font-sans">﴿١٧﴾</span>
    وَلَقَدْ كَذَّبَ الَّذِينَ مِن قَبْلِهِمْ فَكَيْفَ كَانَ نَكِيرِ <span className="text-amber-500/30 text-[0.6em] mx-2 font-sans">﴿١٨﴾</span>
    أَوَلَمْ يَرَوْا إِلَى الطَّيْرِ فَوْقَهُمْ صَافَّاتٍ وَيَقْبِضْنَ ۚ مَا يُمْسِكُهُنَّ إِلَّا الرَّحْمَٰنُ ۚ إِنَّهُ بِكُلِّ شَيْءٍ بَصِيرٌ <span className="text-amber-500/30 text-[0.6em] mx-2 font-sans">﴿١٩﴾</span>
    أَمَّنْ هَٰذَا الَّذِي هُوَ جُندٌ لَّكُمْ يَنصُرُكُم مِّن دُونِ الرَّحْمَٰنِ ۚ إِنِ الْكَافِرُونَ إِلَّا فِي غُرُورٍ <span className="text-amber-500/30 text-[0.6em] mx-2 font-sans">﴿٢٠﴾</span>
    أَمَّنْ هَٰذَا الَّذِي يَرْزُقُكُمْ إِنْ أَمْسَكَ رِزْقَهُ ۚ بَل لَّجُّوا فِي عُتُوٍّ وَنُفُورٍ <span className="text-amber-500/30 text-[0.6em] mx-2 font-sans">﴿٢١﴾</span>
    أَفَمَن يَمْشِي مُكِبًّا عَلَىٰ وَجْهِهِ أَهْدَىٰ أَمَّن يَمْشِي سَوِيًّا عَلَىٰ صِرَاطٍ مُّسْتَقِيمٍ <span className="text-amber-500/30 text-[0.6em] mx-2 font-sans">﴿٢٢﴾</span>
    قُلْ هُوَ الَّذِي أَنشَأَكُمْ وَجَعَلَ لَكُمُ السَّمْعَ وَالْأَبْصَارَ وَالْأَفْئِدَةَ ۖ قَلِيلًا مَّا تَشْكُرُونَ <span className="text-amber-500/30 text-[0.6em] mx-2 font-sans">﴿٢٣﴾</span>
    قُلْ هُوَ الَّذِي ذَرَأَكُمْ فِي الْأَرْضِ وَإِلَيْهِ تُحْشَرُونَ <span className="text-amber-500/30 text-[0.6em] mx-2 font-sans">﴿٢٤﴾</span>
    وَيَقُولُونَ مَتَىٰ هَٰذَا الْوَعْدُ إِن كُنتُمْ صَادِقِينَ <span className="text-amber-500/30 text-[0.6em] mx-2 font-sans">﴿٢٥﴾</span>
    قُلْ إِنَّمَا الْعِلْمُ عِندَ اللَّهِ وَإِنَّمَا أَنَا نَذِيرٌ مُّبِينٌ <span className="text-amber-500/30 text-[0.6em] mx-2 font-sans">﴿٢٦﴾</span>
    فَلَمَّا رَأَوْهُ زُلْفَةً سِيئَتْ وُجُوهُ الَّذِينَ كَفَرُوا وَقِيلَ هَٰذَا الَّذِي كُنتُم بِهِ تَدَّعُونَ <span className="text-amber-500/30 text-[0.6em] mx-2 font-sans">﴿٢٧﴾</span>
    قُلْ أَرَأَيْتُمْ إِنْ أَهْلَكَنِيَ اللَّهُ وَمَن مَّعِيَ أَوْ رَحِمَنَا فَمَن يُجِيرُ الْكَافِرِينَ مِنْ عَذَابٍ أَلِيمٍ <span className="text-amber-500/30 text-[0.6em] mx-2 font-sans">﴿٢٨﴾</span>
    قُلْ هُوَ الرَّحْمَٰنُ آمَنَّا بِهِ وَعَلَيْهِ تَوَكَّلْنَا ۖ فَسَتَعْلَمُونَ مَنْ هُوَ فِي ضَلَالٍ مُّبِينٍ <span className="text-amber-500/30 text-[0.6em] mx-2 font-sans">﴿٢٩﴾</span>
    قُلْ أَرَأَيْتُمْ إِنْ أَصْبَحَ مَاؤُكُمْ غَوْرًا فَمَن يَأْتِيكُم بِمَاءٍ مَّعِينٍ <span className="text-amber-500/30 text-[0.6em] mx-2 font-sans">﴿٣٠﴾</span>
  </p>
                </div>
              </div>
            </div>
            <AnimatePresence>
              {scrollPercent > 95 && (
                <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="fixed bottom-10 left-0 right-0 px-8 flex justify-center z-[220]">
                  <button onClick={() => { setCompleted([...completed, 'quran']); setShowMulk(false); }} className="w-full max-w-md py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.4em]">Recitation Finished</button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}