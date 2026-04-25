"use client";

import React, { useState, useEffect } from 'react';
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
  { id: 5, category: "Corpo", text: "Tomei medicamentos/suplementos", completed: false, icon: Pill },
  { id: 6, category: "Corpo", text: "Fiz um alongamento", completed: false, icon: StretchHorizontal },
  { id: 7, category: "Mente", text: "Respirei fundo", completed: false, icon: Wind },
  { id: 8, category: "Mente", text: "Fiquei longe das redes sociais", completed: false, icon: Smartphone },
  { id: 9, category: "Mente", text: "Anotei uma gratidão", completed: false, icon: PenLine },
  { id: 10, category: "Mente", text: "Fiz 5 minutos de silêncio", completed: false, icon: VolumeX },
  { id: 11, category: "Mente", text: "Reconheci o meu esforço", completed: false, icon: Heart },
  { id: 12, category: "Ambiente", text: "Abri a janela", completed: false, icon: Sun },
  { id: 13, category: "Ambiente", text: "Arrumei a cama", completed: false, icon: Bed },
  { id: 14, category: "Ambiente", text: "Organizei a mesa de trabalho", completed: false, icon: Monitor },
  { id: 15, category: "Ambiente", text: "Lavei a louça", completed: false, icon: UtensilsCrossed },
  { id: 16, category: "Ambiente", text: "Coloquei o lixo para fora", completed: false, icon: Trash2 },
  { id: 17, category: "Conexão", text: "Falei com um amigo/familiar", completed: false, icon: MessageCircle },
  { id: 18, category: "Conexão", text: "Escutei música boa", completed: false, icon: Music },
  { id: 19, category: "Conexão", text: "Saí de casa por 5 min", completed: false, icon: MapPin },
  { id: 20, category: "Conexão", text: "Evitei conflitos desnecessários", completed: false, icon: ShieldOff },
  { id: 21, category: "Conexão", text: "Pedi ajuda se precisei", completed: false, icon: LifeBuoy },
];

const reflections = [
  "A calma não é a ausência de tempestade, mas a paz no meio dela.",
  "O que você faz hoje é o que mais importa para o seu amanhã.",
  "Seu esforço de hoje, por menor que pareça, é uma vitória.",
  "Respire. Você está fazendo o melhor que pode com o que tem.",
  "O mar se acalma após a tormenta. O mesmo acontece com a sua mente.",
  "Grandes jornadas começam com pequenos passos de coragem.",
  "Você é o capitão da sua própria calma. Navegue com paciência.",
  "Cada âncora que você lança hoje fortalece o seu amanhã.",
  "O autocuidado é a bússola que te guia para solo firme.",
  "Não se compare com a maré dos outros. Siga o seu próprio ritmo.",
  "A vulnerabilidade é a sua maior força disfarçada.",
  "Mesmo no escuro, as estrelas (e as âncoras) brilham.",
  "O descanso é parte essencial do progresso. Respeite seu tempo.",
  "Você já sobreviveu a 100% dos seus dias difíceis. Continue firme.",
  "Sua mente é um jardim. Continue cultivando a paz hoje."
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

  useEffect(() => {
    setIsMounted(true);
    try {
      // Carrega dados do localStorage ao iniciar de forma segura
      const saved = localStorage.getItem('ancora-tasks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTasks(parsed);
        }
      }
    } catch (e) {
      console.error("Erro ao carregar tarefas:", e);
      // Se der erro, mantemos as defaultTasks já inicializadas
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const count = tasks.filter(t => t.completed).length;
    setPearls(count);
    const newProgress = (count / tasks.length) * 100;
    setProgress(newProgress);
    
    // Salva no localStorage para o Farol ler
    localStorage.setItem('ancora-tasks', JSON.stringify(tasks));
    localStorage.setItem('ancora-progress', newProgress.toString());

    if (newProgress === 100) {
      setTimeout(() => {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        setShowVictory(true);
      }, 500);
    }
  }, [tasks]);

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

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Anchor size={48} className="text-slate-900 animate-spin-slow" />
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Sincronizando Ecossistema...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-transparent p-4 md:p-8 relative overflow-hidden">
      <AnimatedBackground />

      {/* HEADER FIXO NO TOPO */}
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 mb-12 relative z-50 bg-white/40 backdrop-blur-3xl p-6 rounded-[3rem] border border-white shadow-2xl">
        <div className="flex items-center gap-6">
          <Link href="/">
            <motion.button whileHover={{ scale: 1.1 }} className="p-4 bg-slate-900 text-white rounded-full">
              <ArrowLeft size={20} />
            </motion.button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter">Log de Sobrevivência</h1>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Seu Ecossistema Pessoal</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Progresso</p>
            <div className="flex items-center gap-3">
              <div className="w-32 h-3 bg-slate-200 rounded-full overflow-hidden border border-white">
                <motion.div animate={{ width: `${progress}%` }} className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              </div>
              <span className="text-xl font-black text-slate-900 tabular-nums">{Math.round(progress)}%</span>
            </div>
          </div>

          <div className="bg-slate-900 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-xl">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-blue-100 rounded-full shadow-inner" />
            </div>
            <span className="font-black text-lg">{pearls} Pérolas</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-200px)]">
        
        {/* COLUNA ESQUERDA: O ECOSSISTEMA (VISUAL) */}
        <div className="lg:col-span-5 relative bg-slate-950 rounded-[4rem] overflow-hidden shadow-2xl border-4 border-white/10 group">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent" />
          
          {/* Areia e Âncora (Sempre presentes) */}
          <div className="absolute bottom-0 inset-x-0 h-24 bg-amber-100/10 backdrop-blur-sm" />
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 text-slate-700/40"
          >
            <Anchor size={120} strokeWidth={1} />
          </motion.div>

          {/* Nível 1: Plantas (25%+) */}
          {progress >= 25 && (
            <AnimatePresence>
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={`plant-${i}`}
                  initial={{ scale: 0, y: 100 }}
                  animate={{ scale: 1, y: 0 }}
                  className="absolute bottom-16 text-emerald-500/30"
                  style={{ left: `${20 + i * 15}%` }}
                >
                  <motion.div animate={{ rotate: [-5, 5, -5] }} transition={{ duration: 3 + i, repeat: Infinity }}>
                    <Sprout size={32 + i * 10} />
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Nível 2: Bolhas (25%+) */}
          {progress >= 25 && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={`bubble-${i}`}
                  initial={{ y: 800, opacity: 0 }}
                  animate={{ y: -100, opacity: [0, 1, 0] }}
                  transition={{ duration: 5 + i, repeat: Infinity, delay: i }}
                  className="absolute w-2 h-2 bg-white/20 rounded-full border border-white/10"
                  style={{ left: `${Math.random() * 100}%` }}
                />
              ))}
            </div>
          )}

          {/* Nível 3: Peixes (50%+) */}
          {progress >= 50 && (
            <AnimatePresence>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={`fish-${i}`}
                  initial={{ x: -200 }}
                  animate={{ x: 1000 }}
                  transition={{ duration: 12 + i * 2, repeat: Infinity, ease: "linear", delay: i * 3 }}
                  className="absolute text-blue-400/40"
                  style={{ top: `${20 + i * 20}%` }}
                >
                  <div className="flex flex-col items-center">
                    <Fish size={40} />
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0, 1, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-[8px] font-bold text-white/20"
                    >
                      Blorp
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Nível Final: Brilho e Corais (100%) */}
          {progress === 100 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 via-transparent to-amber-500/10 mix-blend-overlay"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="text-amber-400/20"
                >
                  <Sparkles size={400} />
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Botão de Reflexão Especial */}
          <div className="absolute bottom-12 inset-x-0 flex justify-center">
            <motion.button
              disabled={pearls < 15}
              whileHover={pearls >= 15 ? { scale: 1.1 } : {}}
              whileTap={pearls >= 15 ? { scale: 0.9 } : {}}
              onClick={openReflection}
              className={`
                px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all shadow-2xl flex items-center gap-3
                ${pearls >= 15 
                  ? 'bg-amber-400 text-slate-900 animate-bounce' 
                  : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'}
              `}
            >
              <Waves size={20} />
              {pearls >= 15 ? "Liberar Reflexão do Dia" : `Mais ${15 - pearls} Pérolas para Reflexão`}
            </motion.button>
          </div>
        </div>

        {/* COLUNA DIREITA: A LISTA (INTERAÇÃO) */}
        <div className="lg:col-span-7 overflow-y-auto pr-4 space-y-12 pb-20 custom-scrollbar">
          {categories.map((cat) => (
            <div key={cat} className="space-y-6">
              <div className="flex items-center gap-4 px-4">
                <div className="h-px flex-1 bg-slate-200" />
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{cat}</h3>
                <div className="h-px flex-1 bg-slate-200" />
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
                        ? 'bg-emerald-500/10 border-emerald-500/20' 
                        : 'bg-white/60 border-white/80 shadow-lg hover:shadow-xl'}
                    `}
                  >
                    <div className={`
                      w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500
                      ${task.completed ? 'bg-emerald-500 text-white rotate-[360deg]' : 'bg-slate-100 text-slate-400'}
                    `}>
                      <task.icon size={20} />
                    </div>

                    <div className="flex-1">
                      <p className={`font-black text-sm transition-all ${task.completed ? 'opacity-30 line-through text-slate-500' : 'text-slate-800'}`}>
                        {task.text}
                      </p>
                    </div>

                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all
                      ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200'}
                    `}>
                      {task.completed ? <CheckCircle2 size={16} /> : <Circle size={16} className="opacity-5" />}
                    </div>

                    {/* Feedback Flutuante no Card */}
                    <AnimatePresence>
                      {task.completed && (
                        <motion.div 
                          initial={{ scale: 0, y: 0 }}
                          animate={{ scale: [0, 1.5, 0], y: -50 }}
                          className="absolute right-12 text-blue-500"
                        >
                          <Star size={16} fill="currentColor" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DE REFLEXÃO */}
      <AnimatePresence>
        {showReflection && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReflection(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              className="bg-white rounded-[4rem] p-12 md:p-20 max-w-2xl w-full relative z-10 text-center space-y-8 shadow-2xl border border-white"
            >
              <button 
                onClick={() => setShowReflection(false)}
                className="absolute top-8 right-8 p-3 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>

              <div className="w-20 h-20 bg-amber-400 text-slate-900 rounded-3xl mx-auto flex items-center justify-center shadow-xl">
                <Sparkles size={40} />
              </div>

              <div className="space-y-4">
                <h2 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.5em]">Reflexão Liberada</h2>
                <p className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter leading-tight italic">
                  "{currentReflection}"
                </p>
              </div>

              <div className="pt-8 flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                  <LifeBuoy size={14} className="text-blue-500 animate-spin-slow" />
                  Exercício de Respiração Sugerido: 4-4-4
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowReflection(false)}
                  className="px-12 py-5 bg-slate-900 text-white rounded-full font-black shadow-xl"
                >
                  Continuar Navegando
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FEEDBACK TOAST */}
      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[200] px-8 py-3 bg-blue-600 text-white font-black rounded-full shadow-2xl border border-white/20 flex items-center gap-3"
          >
            <Star size={16} fill="white" />
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
