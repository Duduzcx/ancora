"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, Sparkles, MessageSquare, ArrowLeft, 
  Target, TrendingUp, CheckCircle2, ShieldAlert,
  ArrowRight, Anchor, Compass, Zap, Waves,
  ShieldCheck, Star, Ship
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AnimatedBackground from '@/components/AnimatedBackground';
import { createClient } from '@/lib/supabase';

export default function FarolPage() {
  const [progress, setProgress] = useState<number | null>(null);
  const [userName, setUserName] = useState("Amigo");
  const [isMounted, setIsMounted] = useState(false);
  const [timeState, setTimeState] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setIsMounted(true);
    const savedProgress = localStorage.getItem('ancora-progress');
    setProgress(savedProgress !== null ? parseFloat(savedProgress) : 0);

    const hour = new Date().getHours();
    if (hour < 12) setTimeState("Manhã");
    else if (hour < 18) setTimeState("Tarde");
    else setTimeState("Noite");

    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', user.id).single();
        let name = profile?.display_name || user.user_metadata?.display_name || "Amigo";
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
      }
    };
    getProfile();
  }, [supabase]);

  if (!isMounted) return null;

  let title = "";
  let message = "";
  let moodTrigger = "";
  let colorClass = "";
  let iconBg = "";

  if (progress === 0) {
    title = "O Início da Jornada";
    message = `${userName}, o Farol notou que as águas estão paradas hoje. Que tal lançarmos a primeira âncora com um passo pequeno, como abrir a janela ou respirar fundo por 1 minuto?`;
    moodTrigger = "ajuda para começar meu dia";
    colorClass = "text-blue-500";
    iconBg = "bg-blue-500";
  } else if (progress! < 100) {
    title = "Navegando com Propósito";
    message = `Você já está em movimento, ${userName}! Seu ecossistema já tem vida. Continue navegando; o solo firme está cada vez mais visível no horizonte.`;
    moodTrigger = "motivação para continuar minhas tarefas";
    colorClass = "text-emerald-500";
    iconBg = "bg-emerald-500";
  } else {
    title = "Porto Seguro Conquistado";
    message = `Incrível superação! Você completou todas as missões de hoje. O Farol agora brilha em celebração à sua paz. Aproveite o seu porto seguro, você merece.`;
    moodTrigger = "celebrar minhas vitórias de hoje";
    colorClass = "text-amber-500";
    iconBg = "bg-amber-500";
  }

  return (
    <main className="min-h-screen bg-transparent p-4 md:p-12 relative overflow-hidden flex flex-col items-center custom-scrollbar">
      <AnimatedBackground />

      {/* FEIXE DE LUZ DO FAROL (ANIMAÇÃO) */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-px h-screen bg-gradient-to-b from-emerald-400/40 to-transparent z-0 pointer-events-none origin-top">
        <motion.div 
          animate={{ rotate: [-45, 45, -45] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="w-[1000px] h-[1000px] bg-emerald-400/5 blur-[150px] -ml-[500px]"
        />
      </div>

      <div className="max-w-6xl w-full relative z-10 space-y-12 pb-24">
        {/* HEADER BAR */}
        <div className="flex items-center justify-between bg-white/40 backdrop-blur-3xl p-6 rounded-[2.5rem] border border-white shadow-xl">
          <div className="flex items-center gap-6">
            <Link href="/">
              <motion.button whileHover={{ scale: 1.1, x: -5 }} className="p-4 bg-slate-900 text-white rounded-full">
                <ArrowLeft size={20} />
              </motion.button>
            </Link>
            <div>
              <h2 className="text-xl font-black text-slate-900">O Farol</h2>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Inteligência de Jornada</p>
            </div>
          </div>
          <div className="bg-slate-900 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Zap size={14} className="text-amber-400" />
            Status: {timeState}
          </div>
        </div>

        {/* HERO SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-8 bg-white/60 backdrop-blur-3xl rounded-[4rem] p-12 md:p-20 border border-white shadow-2xl flex flex-col justify-between"
          >
            <div className="space-y-8 text-center lg:text-left">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${iconBg}/10 ${colorClass} text-[10px] font-black uppercase tracking-widest border border-current/20`}>
                <Target size={14} />
                {title}
              </div>
              <h1 className="text-5xl md:text-8xl font-black text-slate-900 leading-[0.85] tracking-tighter">
                Sua jornada <br /> em <span className="italic text-emerald-600 underline decoration-emerald-200 decoration-8 underline-offset-8">Tempo Real.</span>
              </h1>
              <p className="text-2xl md:text-3xl text-slate-700 font-bold leading-tight max-w-2xl">
                "{message}"
              </p>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-6 justify-center lg:justify-start">
              <Link href="/log">
                <motion.button whileHover={{ scale: 1.05, y: -5 }} className="px-10 py-6 bg-slate-900 text-white rounded-full font-black flex items-center gap-3 shadow-xl">
                  <TrendingUp size={20} />
                  Continuar Jornada
                </motion.button>
              </Link>
              <motion.button 
                whileHover={{ scale: 1.05, y: -5 }} 
                onClick={() => router.push(`/porto?mood=${encodeURIComponent(moodTrigger)}`)}
                className={`px-10 py-6 ${iconBg} text-white rounded-full font-black flex items-center gap-3 shadow-xl`}
              >
                <MessageSquare size={20} />
                Falar sobre isso
              </motion.button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4 bg-slate-900 rounded-[4rem] p-12 text-white flex flex-col justify-between relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 p-8 text-white/5 rotate-12">
              <Anchor size={200} strokeWidth={1} />
            </div>

            <div className="relative z-10 space-y-12">
              <div className="space-y-2">
                <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em]">Progresso Atual</h3>
                <div className="flex items-end gap-3">
                  <span className="text-7xl font-black tabular-nums tracking-tighter">{Math.round(progress || 0)}</span>
                  <span className="text-2xl font-black text-emerald-400 mb-2">%</span>
                </div>
              </div>

              <div className="space-y-6">
                <InsightItem icon={Waves} text="Fluxo de hoje: Estável" />
                <InsightItem icon={Zap} text="Energia Mental: Recarregando" />
                <InsightItem icon={ShieldCheck} text="Zonas de Risco: Protegidas" />
              </div>
            </div>

            <div className="relative z-10 pt-12">
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)]"
                />
              </div>
              <p className="mt-4 text-[10px] font-black text-white/40 uppercase tracking-widest text-center">
                Faltam {tasksLeft(progress)} passos para o Porto Seguro
              </p>
            </div>
          </motion.div>
        </div>

        {/* BÚSSOLA DE INSIGHTS (FOOTER) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatCard 
            icon={Compass} 
            title="Norte Emocional" 
            desc="Seu foco hoje está voltado para o autocuidado e organização."
          />
          <StatCard 
            icon={Star} 
            title="Rastro de Luz" 
            desc="Você já superou os momentos mais críticos desta semana."
          />
          <StatCard 
            icon={Ship} 
            title="Sua Embarcação" 
            desc="Sua resiliência está 15% maior do que na última segunda-feira."
          />
        </div>
      </div>
    </main>
  );
}

function tasksLeft(progress: number | null) {
  if (progress === null) return 21;
  const done = (progress / 100) * 21;
  return Math.max(0, Math.round(21 - done));
}

function InsightItem({ icon: Icon, text }: any) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center text-emerald-400">
        <Icon size={16} />
      </div>
      <span className="text-sm font-bold text-white/80">{text}</span>
    </div>
  );
}

function StatCard({ icon: Icon, title, desc }: any) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="bg-white/40 backdrop-blur-md p-10 rounded-[3.5rem] border border-white shadow-xl space-y-6"
    >
      <div className="w-14 h-14 bg-slate-900 text-emerald-400 rounded-2xl flex items-center justify-center shadow-lg">
        <Icon size={28} />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
        <p className="text-slate-600 text-sm font-bold leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}
