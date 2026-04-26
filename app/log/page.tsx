"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Droplets, Apple, Wind, Smartphone, Sun, Bed, 
  CheckCircle2, Circle, ArrowLeft, Anchor, Sparkles, 
  RefreshCcw, Heart, ShowerHead, Shirt, Pill, 
  StretchHorizontal, PenLine, VolumeX, Monitor, 
  UtensilsCrossed, Trash2, MessageCircle, Music, 
  MapPin, ShieldOff, LifeBuoy, Fish, Leaf, Sprout, 
  Waves, Star, X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import AnimatedBackground from '@/components/AnimatedBackground';

interface Task {
  id: number;
  category: "Corpo" | "Mente" | "Ambiente" | "Conexão";
  text: string;
  completed: boolean;
  icon: any;
}

const defaultTasks: Task[] = [
  { id: 1, category: "Corpo", text: "Bebi água", completed: false, icon: Droplets },
  { id: 2, category: "Corpo", text: "Comi algo nutritivo", completed: false, icon: Apple },
  { id: 3, category: "Corpo", text: "Tomei banho", completed: false, icon: ShowerHead },
  { id: 4, category: "Corpo", text: "Vesti roupa limpa", completed: false, icon: Shirt },
  { id: 5, category: "Corpo", text: "Tomei medicamentos", completed: false, icon: Pill },
  { id: 6, category: "Corpo", text: "Fiz um alongamento", completed: false, icon: StretchHorizontal },
  { id: 7, category: "Mente", text: "Respirei fundo", completed: false, icon: Wind },
  { id: 8, category: "Mente", text: "Fiquei longe das telas", completed: false, icon: Smartphone },
  { id: 9, category: "Mente", text: "Anotei uma gratidão", completed: false, icon: PenLine },
  { id: 10, category: "Mente", text: "Fiz 5 minutos de silêncio", completed: false, icon: VolumeX },
  { id: 11, category: "Mente", text: "Reconheci o meu esforço", completed: false, icon: Heart },
  { id: 12, category: "Ambiente", text: "Abri a janela", completed: false, icon: Sun },
  { id: 13, category: "Ambiente", text: "Arrumei a cama", completed: false, icon: Bed },
  { id: 14, category: "Ambiente", text: "Organizei meu espaço", completed: false, icon: Monitor },
  { id: 15, category: "Ambiente", text: "Lavei a louça", completed: false, icon: UtensilsCrossed },
  { id: 16, category: "Ambiente", text: "Coloquei o lixo fora", completed: false, icon: Trash2 },
  { id: 17, category: "Conexão", text: "Falei com alguém", completed: false, icon: MessageCircle },
  { id: 18, category: "Conexão", text: "Escutei música boa", completed: false, icon: Music },
  { id: 19, category: "Conexão", text: "Saí de casa um pouco", completed: false, icon: MapPin },
  { id: 20, category: "Conexão", text: "Evitei conflitos", completed: false, icon: ShieldOff },
  { id: 21, category: "Conexão", text: "Pedi ajuda se precisei", completed: false, icon: LifeBuoy },
];

const reflections = [
  "A calma não é a ausência de tempestade, mas a paz no meio dela.",
  "O que você faz hoje é o que mais importa para o seu amanhã.",
  "Seu esforço de hoje, por menor que pareça, é uma vitória.",
  "Respire. Você está fazendo o melhor que pode com o que tem.",
  "O mar se acalma após a tormenta. O mesmo acontece com a sua mente.",
];

export default function LogPage() {
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [pearls, setPearls] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showVictory, setShowVictory] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [currentReflection, setCurrentReflection] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  // Estados para valores aleatórios estáveis (evita erro de hidratação)
  const [particlePos, setParticlePos] = useState<{top: number, left: number}[]>([]);
  const [bubbleLefts, setBubbleLefts] = useState<number[]>([]);

  useEffect(() => {
    setIsMounted(true);
    
    // Gera posições aleatórias apenas no cliente
    const isMobile = window.innerWidth < 768;
    setParticlePos([...Array(isMobile ? 8 : 20)].map(() => ({
      top: Math.random() * 100,
      left: Math.random() * 100
    })));
    setBubbleLefts([...Array(isMobile ? 5 : 10)].map(() => Math.random() * 100));

    try {
      const saved = localStorage.getItem('ancora-tasks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Garante que os ícones sejam mantidos (JSON.parse remove referências de funções)
          const merged = defaultTasks.map(dt => {
            const savedTask = parsed.find((st: any) => st.id === dt.id);
            return savedTask ? { ...dt, completed: savedTask.completed } : dt;
          });
          setTasks(merged);
        }
      }
    } catch (e) {
      console.error("Erro ao carregar tarefas:", e);
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const count = tasks.filter(t => t.completed).length;
    setPearls(count);
    const newProgress = tasks.length > 0 ? (count / tasks.length) * 100 : 0;
    setProgress(newProgress);
    
    localStorage.setItem('ancora-tasks', JSON.stringify(tasks));
    localStorage.setItem('ancora-progress', newProgress.toString());

    if (newProgress === 100 && !showVictory) {
      setTimeout(() => {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        setShowVictory(true);
      }, 500);
    }
  }, [tasks, isMounted, showVictory]);

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const newState = !t.completed;
        if (newState) {
          setFeedback("Pérola coletada!");
          setTimeout(() => setFeedback(null), 1500);
        }
        return { ...t, completed: newState };
      }
      return t;
    }));
  };

  const openReflection = () => {
    const random = reflections[Math.floor(Math.random() * reflections.length)];
    setCurrentReflection(random);
    setShowReflection(true);
  };

  const categories: Task["category"][] = ["Corpo", "Mente", "Ambiente", "Conexão"];

  if (!isMounted) return null;

  return (
    <main className="flex flex-col h-[100dvh] overflow-hidden bg-slate-50 relative pl-0 md:pl-64 transition-all overscroll-none touch-pan-y">
      <AnimatedBackground subtle />

      <div className="flex-1 overflow-y-auto w-full custom-scrollbar overscroll-contain p-4 md:p-8 lg:p-12">
        <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/40 backdrop-blur-3xl p-6 md:p-10 rounded-[3rem] border border-white shadow-2xl">
          <div className="flex items-center gap-6">
            <Link href="/">
              <motion.button whileHover={{ scale: 1.1 }} className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl">
                <ArrowLeft size={20} />
              </motion.button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">Log de Sobrevivência</h1>
              <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mt-1">Evolução do seu Ecossistema</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Conclusão</p>
              <div className="flex items-center gap-4">
                <div className="w-32 md:w-48 h-3 bg-slate-200 rounded-full overflow-hidden border border-white shadow-inner">
                  <motion.div 
                    animate={{ width: `${progress}%` }} 
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
                  />
                </div>
                <span className="text-2xl font-black text-slate-900 tabular-nums">{Math.round(progress)}%</span>
              </div>
            </div>

            <div className="bg-slate-900 text-white px-8 py-4 rounded-3xl flex items-center gap-4 shadow-2xl border border-white/10">
              <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center shadow-lg">
                <div className="w-3 h-3 bg-white rounded-full opacity-80" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl leading-none">{pearls}</span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">Pérolas</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* VISUAL ECOSSISTEMA */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 h-[400px] md:h-[600px] bg-slate-950 rounded-[4rem] overflow-hidden shadow-2xl border-4 border-white/10 relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-slate-950 to-slate-950" />
            
            {/* Partículas estáveis */}
            {particlePos.map((pos, i) => (
              <motion.div
                key={i}
                animate={{ y: [-5, 5, -5], opacity: [0.1, 0.4, 0.1] }}
                transition={{ duration: 3 + (i % 5), repeat: Infinity }}
                className="absolute w-1 h-1 bg-emerald-400 rounded-full blur-[1px]"
                style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
              />
            ))}

            <div className="absolute bottom-0 inset-x-0 h-32 bg-amber-100/5 backdrop-blur-sm" />
            
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-16 left-1/2 -translate-x-1/2 text-slate-800"
            >
              <Anchor size={140} strokeWidth={1} className="opacity-40" />
            </motion.div>

            {/* Evolução Visual */}
            <AnimatePresence>
              {progress >= 20 && (
                <>
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={`p-${i}`}
                      initial={{ scale: 0, y: 50 }}
                      animate={{ scale: 1, y: 0 }}
                      className="absolute bottom-20 text-emerald-500/60"
                      style={{ left: `${15 + i * 14}%` }}
                    >
                      <motion.div animate={{ rotate: [-8, 8, -8] }} transition={{ duration: 4 + i, repeat: Infinity }}>
                        <Sprout size={30 + i * 8} />
                      </motion.div>
                    </motion.div>
                  ))}
                  {bubbleLefts.map((left, i) => (
                    <motion.div
                      key={`b-${i}`}
                      initial={{ y: 600, opacity: 0 }}
                      animate={{ y: -100, opacity: [0, 0.5, 0] }}
                      transition={{ duration: 4 + (i % 4), repeat: Infinity, delay: i * 0.5 }}
                      className="absolute w-2 h-2 bg-white/30 rounded-full border border-white/20"
                      style={{ left: `${left}%` }}
                    />
                  ))}
                </>
              )}
              
              {progress >= 60 && (
                [...Array(4)].map((_, i) => (
                  <motion.div
                    key={`f-${i}`}
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 600, opacity: 1 }}
                    transition={{ duration: 15 + i * 2, repeat: Infinity, ease: "linear", delay: i * 4 }}
                    className="absolute text-blue-400/50"
                    style={{ top: `${25 + i * 15}%` }}
                  >
                    <Fish size={40} />
                  </motion.div>
                ))
              )}

              {progress === 100 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-emerald-500/5 flex items-center justify-center"
                >
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="text-amber-400/10"
                  >
                    <Sparkles size={300} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reflexão */}
            <div className="absolute bottom-12 inset-x-0 flex justify-center px-8">
              <motion.button
                disabled={pearls < 10}
                whileHover={pearls >= 10 ? { scale: 1.05, y: -5 } : {}}
                whileTap={pearls >= 10 ? { scale: 0.95 } : {}}
                onClick={openReflection}
                className={`
                  w-full py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all shadow-2xl flex items-center justify-center gap-3
                  ${pearls >= 10 
                    ? 'bg-amber-400 text-slate-900 border-b-4 border-amber-600' 
                    : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'}
                `}
              >
                <Waves size={18} />
                {pearls >= 10 ? "Ver Reflexão do Dia" : `Mais ${10 - pearls} pérolas para liberar`}
              </motion.button>
            </div>
          </div>

          {/* LISTA DE TAREFAS */}
          <div className="lg:col-span-7 space-y-10 pb-32">
            {categories.map((cat) => (
              <div key={cat} className="space-y-6">
                <div className="flex items-center gap-4 px-2">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em] whitespace-nowrap">{cat}</h3>
                  <div className="h-px w-full bg-slate-200" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tasks.filter(t => t.category === cat).map((task) => (
                    <motion.div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        group relative flex items-center gap-4 p-5 rounded-[2.5rem] border transition-all cursor-pointer overflow-hidden
                        ${task.completed 
                          ? 'bg-emerald-500/10 border-emerald-500/30' 
                          : 'bg-white border-white shadow-xl hover:shadow-2xl'}
                      `}
                    >
                      <div className={`
                        w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500
                        ${task.completed ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400'}
                      `}>
                        <task.icon size={20} />
                      </div>

                      <div className="flex-1">
                        <p className={`font-black text-base transition-all ${task.completed ? 'opacity-30 line-through text-slate-500' : 'text-slate-800'}`}>
                          {task.text}
                        </p>
                      </div>

                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all
                        ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-100'}
                      `}>
                        {task.completed && <CheckCircle2 size={16} />}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL REFLEXÃO */}
      <AnimatePresence>
        {showReflection && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowReflection(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[4rem] p-12 md:p-20 max-w-2xl w-full relative z-10 text-center space-y-8 shadow-2xl border border-white"
            >
              <div className="w-20 h-20 bg-amber-400 text-slate-900 rounded-3xl mx-auto flex items-center justify-center shadow-xl">
                <Sparkles size={40} />
              </div>
              <div className="space-y-4">
                <h2 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.5em]">Sinal Captado</h2>
                <p className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter leading-tight italic">
                  "{currentReflection}"
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setShowReflection(false)}
                className="px-12 py-5 bg-slate-900 text-white rounded-full font-black shadow-xl"
              >
                Voltar à Jornada
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST FEEDBACK */}
      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[300] px-8 py-3 bg-blue-600 text-white font-black rounded-full shadow-2xl flex items-center gap-3"
          >
            <Star size={16} fill="white" />
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>
        </div>
    </main>
  );
}
