"use client";
import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { motion, AnimatePresence } from 'framer-motion';
import { Bomb, Plus, Zap, Ghost, Hourglass, Activity } from 'lucide-react';

// GLOBAL AUDIO POOL
let globalAudioCtx: AudioContext | null = null;

export default function ChronosDestroyer() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef(Matter.Engine.create());
  const targetTimeScale = useRef(1); // The speed we WANT to be at
  const [count, setCount] = useState(0);
  const [isIncinerating, setIsIncinerating] = useState(false);
  const [isSlowMo, setIsSlowMo] = useState(false);

  // --- 1. DYNAMIC AUDIO ENGINE ---
  const playCoolSound = (intensity: number, type: 'impact' | 'shatter') => {
    if (!globalAudioCtx || globalAudioCtx.state === 'suspended') return;
    
    const now = globalAudioCtx.currentTime;
    const osc = globalAudioCtx.createOscillator();
    const gain = globalAudioCtx.createGain();
    
    // Audio pitch scales with current engine timing
    const currentScale = engineRef.current.timing.timeScale;
    const pitchBase = type === 'shatter' ? 400 : 150;
    
    osc.type = type === 'shatter' ? 'square' : 'sine';
    osc.frequency.setValueAtTime(pitchBase * currentScale + (intensity * 2), now);
    
    gain.gain.setValueAtTime(type === 'shatter' ? 0.15 : 0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (0.4 / currentScale));

    osc.connect(gain);
    gain.connect(globalAudioCtx.destination);
    osc.start();
    osc.stop(now + 0.5);
  };

  // --- 2. CHAIN REACTION SHATTER ---
  const shatter = (body: Matter.Body) => {
    const { x, y } = body.position;
    const force = 0.04; 

    playCoolSound(20, 'shatter');
    Matter.Composite.remove(engineRef.current.world, body);
    
    for (let i = 0; i < 6; i++) {
      const fragment = Matter.Bodies.polygon(x, y, 3, 12, {
        label: 'Fragment',
        density: 0.001, // Lighter fragments for better bounce
        render: { fillStyle: i % 2 === 0 ? '#bfff00' : 'transparent', strokeStyle: '#bfff00', lineWidth: 1 },
        restitution: 0.8,
        frictionAir: 0.02
      });

      Matter.Body.applyForce(fragment, fragment.position, {
        x: (Math.random() - 0.5) * force,
        y: (Math.random() - 0.5) * force
      });

      Matter.Composite.add(engineRef.current.world, fragment);
      setCount(prev => prev + 1);
    }
  };

  useEffect(() => {
    const engine = engineRef.current;
    const render = Matter.Render.create({
      element: sceneRef.current!,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: 'transparent',
      },
    });

    const ground = Matter.Bodies.rectangle(window.innerWidth/2, window.innerHeight+50, window.innerWidth, 100, { isStatic: true });
    const leftWall = Matter.Bodies.rectangle(-50, window.innerHeight/2, 100, window.innerHeight, { isStatic: true });
    const rightWall = Matter.Bodies.rectangle(window.innerWidth+50, window.innerHeight/2, 100, window.innerHeight, { isStatic: true });

    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: Matter.Mouse.create(render.canvas),
      constraint: { stiffness: 0.2, render: { visible: false } }
    });

    // --- SMOOTH TIME LERP LOOP ---
    Matter.Events.on(engine, 'beforeUpdate', () => {
      const current = engine.timing.timeScale;
      const target = targetTimeScale.current;
      // Smoothly interpolate timeScale toward target
      engine.timing.timeScale = current + (target - current) * 0.08;
    });

    Matter.Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const speed = pair.bodyA.speed + pair.bodyB.speed;
        if (speed > 1.5) playCoolSound(speed, 'impact');
        if (speed > 12) {
          const target = pair.bodyA.isStatic ? pair.bodyB : pair.bodyA;
          if (target.label === 'Block') {
            target.label = 'Fragment';
            shatter(target);
            setCount(prev => prev - 1);
          }
        }
      });
    });

    // Keyboard Listeners
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Shift') { setIsSlowMo(true); targetTimeScale.current = 0.15; } };
    const handleKeyUp = (e: KeyboardEvent) => { if (e.key === 'Shift') { setIsSlowMo(false); targetTimeScale.current = 1; } };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    Matter.Composite.add(engine.world, [ground, leftWall, rightWall, mouseConstraint]);
    Matter.Runner.run(Matter.Runner.create(), engine);
    Matter.Render.run(render);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      Matter.Render.stop(render);
      Matter.Engine.clear(engine);
      render.canvas.remove();
    };
  }, []);

  const addBlock = () => {
    if (!globalAudioCtx) globalAudioCtx = new AudioContext();
    const b = Matter.Bodies.rectangle(Math.random() * window.innerWidth, -50, 60, 60, { 
      label: 'Block', 
      render: { fillStyle: '#050505', strokeStyle: '#bfff00', lineWidth: 3 },
      restitution: 0.7 
    });
    Matter.Composite.add(engineRef.current.world, b);
    setCount(prev => prev + 1);
  };

  return (
    <div className={`min-h-screen transition-colors duration-1000 overflow-hidden font-mono relative select-none bg-[#050505]`}>
      
      {/* BACKGROUND FX */}
      <div 
        ref={sceneRef} 
        className="absolute inset-0 z-0 transition-transform duration-700"
        style={{ transform: isSlowMo ? 'scale(1.05)' : 'scale(1)', filter: isSlowMo ? 'blur(1px) contrast(1.2)' : 'none' }}
      />

      <AnimatePresence>
        {isSlowMo && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-10 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(191,255,0,0.05)_100%)]"
          />
        )}
      </AnimatePresence>

      <div className="relative z-20 pointer-events-none p-10 flex flex-col justify-between h-screen">
        <header className="flex justify-between items-start">
          <div className="space-y-4">
            <h1 className="text-[#bfff00] text-5xl font-black tracking-tighter italic drop-shadow-2xl">
              Stress Smasher
            </h1>
            <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${isSlowMo ? 'bg-[#bfff00] text-black border-[#bfff00]' : 'bg-black text-zinc-600 border-zinc-800'}`}>
                    <Hourglass size={14} className={isSlowMo ? 'animate-spin' : ''} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{isSlowMo ? 'Slow_Motion' : 'Real_Time'}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                    <Activity size={14} /> Buffer: {count}
                </div>
            </div>
          </div>
          <div className="text-zinc-900 text-[15vw] font-black italic leading-none opacity-50">
            {count.toString().padStart(2, '0')}
          </div>
        </header>

        <footer className="flex justify-center gap-6 pointer-events-auto mb-10">
          <button 
            onMouseDown={addBlock}
            className="group relative px-16 py-8 bg-transparent border-2 border-[#bfff00] text-[#bfff00] overflow-hidden transition-all active:scale-95"
          >
            <div className="absolute inset-0 bg-[#bfff00] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative z-10 font-black flex items-center gap-3 uppercase italic tracking-tighter group-hover:text-black">
                <Plus size={24} /> Spawn Objects
            </span>
          </button>
          
          <button 
            onClick={() => {
              setIsIncinerating(true);
              setTimeout(() => {
                Matter.Composite.allBodies(engineRef.current.world).forEach(b => !b.isStatic && Matter.Composite.remove(engineRef.current.world, b));
                setCount(0);
                setIsIncinerating(false);
              }, 800);
            }}
            className="px-16 py-8 border-2 border-red-600 text-red-600 font-black uppercase italic hover:bg-red-600 hover:text-white transition-all active:scale-95"
          >
            <span className="flex items-center gap-3"><Bomb size={24} /> Force_Wipe</span>
          </button>
        </footer>
      </div>

      <AnimatePresence>
        {isIncinerating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-red-600 flex items-center justify-center">
            <motion.h2 
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }} 
              transition={{ repeat: Infinity, duration: 0.2 }}
              className="text-white text-9xl font-black italic"
            >
              VOID
            </motion.h2>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}