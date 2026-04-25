"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, Sparkles, MessageSquare, ArrowLeft, 
  Target, TrendingUp, CheckCircle2, ShieldAlert,
  ArrowRight, Anchor, Compass, Zap, Waves,
  ShieldCheck, Star, Ship, BarChart3, Map,
  Activity, Radio
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
  let accentColor = "";
  let glowColor = "";

  if (progress === 0) {
    title = "Radar de Início";
    message = `${userName}, o Farol detectou águas calmas até demais. Que tal agitar um pouco com o primeiro hábito do dia?`;
    moodTrigger = "ajuda para começar meu dia";
    accentColor = "text-blue-500";
    glowColor = "shadow-blue-500/20";
  } else if (progress! < 100) {
    title = "Sinal de Movimento";
    message = `Você está navegando bem, ${userName}. O radar mostra que você já superou o mais difícil. O solo firme está a poucos nós de distância.`;
    moodTrigger = "motivação para continuar minhas tarefas";
    accentColor = "text-emerald-500";
    glowColor = "shadow-emerald-500/20";
  } else {
    title = "Farol de Vitória";
    message = `Missão cumprida! O Farol agora emite um sinal de paz total. Seu ecossistema está em equilíbrio perfeito.`;
    moodTrigger = "celebrar minhas vitórias de hoje";
    accentColor = "text-amber-500";
    glowColor = "shadow-amber-500/20";
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 lg:p-12 relative overflow-hidden flex flex-col items-center custom-scrollbar">
      <AnimatedBackground subtle />

      {/* Efeito de Feixe de Varredura (Radar) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-gradient-to-tr from-emerald-500/5 via-transparent to-transparent opacity-30"
        />
      </div>

      <div className="max-w-7xl w-full relative z-10 space-y-8 pb-24">
        
        {/* NAV BAR ULTRA-GLASS */}
        <div className="flex items-center justify-between bg-white/30 backdrop-blur-3xl p-6 rounded-[3rem] border border-white/50 shadow-2xl">
          <div className="flex items-center gap-6">
            <Link href="/">
              <motion.button whileHover={{ scale: 1.1, rotate: -90 }} className="p-4 bg-slate-900 text-white rounded-2xl">
                <ArrowLeft size={20} />
              </motion.button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Radio size={14} className="text-emerald-500 animate-pulse" />
                <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase">O Farol</h2>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Intelligence & Navigation Center</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex px-6 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest gap-2">
              <Activity size={14} className="text-emerald-400" />
              Sinal Ativo
            </div>
          </div>
        </div>

        {/* MAIN HUD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* PAINEL CENTRAL */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`lg:col-span-8 bg-white/60 backdrop-blur-3xl rounded-[4rem] p-10 md:p-16 border border-white shadow-2xl relative overflow-hidden group ${glowColor}`}
          >
            <div className="relative z-10 space-y-10">
              <div className="flex items-center gap-4">
                <div className={`px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-lg`}>
                  {title}
                </div>
                <div className="h-px flex-1 bg-slate-900/5" />
              </div>

              <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.85] tracking-tighter">
                Sua mente <br /> em <span className="text-emerald-600 italic">Alta Definição.</span>
              </h1>

              <div className="bg-slate-900/5 p-8 rounded-[3rem] border border-slate-900/5 relative group-hover:bg-white/40 transition-all duration-500">
                <p className="text-2xl md:text-3xl text-slate-700 font-bold leading-tight">
                  "{message}"
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <Link href="/log">
                  <motion.button whileHover={{ scale: 1.05, y: -5 }} className="px-12 py-7 bg-slate-900 text-white rounded-[2.5rem] font-black flex items-center gap-4 shadow-2xl hover:bg-slate-800 transition-all">
                    <Map size={24} className="text-emerald-400" />
                    Mapa de Progresso
                  </motion.button>
                </Link>
                <motion.button 
                  whileHover={{ scale: 1.05, y: -5 }}
                  onClick={() => router.push(`/porto?mood=${encodeURIComponent(moodTrigger)}`)}
                  className="px-12 py-7 bg-emerald-500 text-white rounded-[2.5rem] font-black flex items-center gap-4 shadow-2xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
                >
                  <MessageSquare size={24} />
                  Falar agora
                </motion.button>
              </div>
            </div>

            {/* Grafismos de Fundo */}
            <div className="absolute -bottom-20 -right-20 text-slate-900/5 opacity-20 pointer-events-none">
              <Compass size={400} strokeWidth={0.5} />
            </div>
          </motion.div>

          {/* PAINEL LATERAL (MÉTRICAS) */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-900 rounded-[4rem] p-10 text-white shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 text-emerald-500/10 rotate-45">
                <Target size={180} />
              </div>
              
              <div className="relative z-10 space-y-12">
                <div className="space-y-2">
                  <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em]">Estabilidade Atual</h3>
                  <div className="flex items-end gap-3">
                    <span className="text-7xl font-black tabular-nums tracking-tighter">{Math.round(progress || 0)}</span>
                    <span className="text-2xl font-black text-emerald-400 mb-2">%</span>
                  </div>
                </div>

                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)]"
                  />
                </div>

                <div className="space-y-6 pt-4">
                  <HUDItem icon={Zap} label="Energia Mental" value="Otimizada" />
                  <HUDItem icon={Waves} label="Fluxo Emocional" value="Estável" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/40 backdrop-blur-3xl rounded-[3.5rem] p-10 border border-white shadow-xl flex flex-col items-center justify-center text-center space-y-6"
            >
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center shadow-inner">
                <Ship size={32} />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 tracking-tight">Status da Embarcação</h4>
                <p className="text-xs text-slate-500 font-bold mt-2 leading-relaxed">
                  {progress === 100 ? "Casco blindado. Você está pronto para qualquer mar." : "Casco em manutenção. Continue cultivando seus hábitos."}
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* BOTTOM INSIGHTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <InsightCard 
            icon={Compass} 
            title="Norte" 
            desc="Sua bússola hoje aponta para o autocuidado físico."
          />
          <InsightCard 
            icon={Star} 
            title="Brilho" 
            desc="Seu histórico mostra 3 dias de solo firme seguidos."
          />
          <InsightCard 
            icon={ShieldCheck} 
            title="Proteção" 
            desc="Gatilhos de ansiedade reduzidos em 40% hoje."
          />
          <InsightCard 
            icon={BarChart3} 
            title="Análise" 
            desc="Tendência positiva de estabilidade para amanhã."
          />
        </div>
      </div>
    </main>
  );
}

function HUDItem({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all">
      <div className="flex items-center gap-4">
        <div className="text-emerald-400">
          <Icon size={18} />
        </div>
        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-xs font-black">{value}</span>
    </div>
  );
}

function InsightCard({ icon: Icon, title, desc }: any) {
  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      className="bg-white/40 backdrop-blur-xl p-8 rounded-[3rem] border border-white shadow-lg space-y-4 hover:shadow-2xl transition-all"
    >
      <div className="w-12 h-12 bg-slate-900 text-emerald-400 rounded-2xl flex items-center justify-center shadow-xl">
        <Icon size={24} />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{title}</h3>
        <p className="text-[11px] text-slate-500 font-bold leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}
