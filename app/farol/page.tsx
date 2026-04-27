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
import { createClient } from '@/lib/supabase-client';

export default function FarolPage() {
  const [progress, setProgress] = useState<number>(0);
  const [userName, setUserName] = useState("Amigo");
  const [isMounted, setIsMounted] = useState(false);
  const [timeState, setTimeState] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setIsMounted(true);
    
    // Carregamento inicial do progresso
    const loadProgress = () => {
      const savedProgress = localStorage.getItem('ancora-progress');
      setProgress(savedProgress !== null ? parseFloat(savedProgress) : 0);
    };
    
    loadProgress();

    const hour = new Date().getHours();
    if (hour < 12) setTimeState("Manhã");
    else if (hour < 18) setTimeState("Tarde");
    else setTimeState("Noite");

    const getProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', user.id).maybeSingle();
        let name = profile?.display_name || user.user_metadata?.display_name || "Amigo";
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
      }
    };
    getProfile();

    // Listener para mudanças no localStorage caso o usuário complete algo em outra aba (raro mas bom ter)
    window.addEventListener('storage', loadProgress);
    return () => window.removeEventListener('storage', loadProgress);
  }, [supabase]);

  if (!isMounted) return null;

  const getStatusData = () => {
    if (progress === 0) return {
      title: "Radar de Início",
      message: `${userName}, o Farol detectou águas calmas até demais. Que tal agitar um pouco com o primeiro hábito do dia?`,
      trigger: "ajuda para começar meu dia",
      glow: "shadow-blue-500/20",
      energy: "Em Espera",
      flow: "Estático"
    };
    if (progress < 50) return {
      title: "Sinal de Movimento",
      message: `O radar detectou seus primeiros passos, ${userName}. Continue navegando, você já saiu da inércia.`,
      trigger: "motivação para continuar",
      glow: "shadow-emerald-500/20",
      energy: "Ativando",
      flow: "Oscilante"
    };
    if (progress < 100) return {
      title: "Navegação Estável",
      message: `Você está quase lá, ${userName}. O radar mostra que solo firme está a poucos nós de distância. Sinta a brisa.`,
      trigger: "foco para terminar o dia",
      glow: "shadow-emerald-500/40",
      energy: "Otimizada",
      flow: "Harmônico"
    };
    return {
      title: "Farol de Vitória",
      message: `Missão cumprida! O Farol agora emite um sinal de paz total. Seu ecossistema está em equilíbrio perfeito hoje.`,
      trigger: "celebrar minhas vitórias",
      glow: "shadow-amber-500/40",
      energy: "Plena",
      flow: "Total"
    };
  };

  const status = getStatusData();

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 lg:p-12 relative overflow-x-hidden flex flex-col items-center">
      <AnimatedBackground subtle />

      {/* Efeito de Radar */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-gradient-to-tr from-emerald-500/5 via-transparent to-transparent opacity-20"
        />
      </div>

      <div className="max-w-7xl w-full relative z-10 space-y-8 pb-24">
        
        {/* NAV BAR (Desktop) */}
        <div className="hidden lg:flex items-center justify-between bg-white/40 backdrop-blur-3xl p-6 rounded-[3rem] border border-white shadow-2xl">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg">
                <Radio size={20} className="text-emerald-500 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">O Farol</h2>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Centro de Inteligência</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex px-6 py-2 bg-slate-900 text-white rounded-full text-xs font-black uppercase tracking-widest gap-2">
              <Activity size={14} className="text-emerald-400" />
              Monitoramento Ativo
            </div>
          </div>
        </div>

        {/* HUD PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`lg:col-span-8 bg-white/60 backdrop-blur-3xl rounded-[4rem] p-10 md:p-16 border border-white shadow-2xl relative overflow-hidden group ${status.glow}`}
          >
            <div className="relative z-10 space-y-10">
              <div className="flex items-center gap-4">
                <div className={`px-5 py-2 rounded-full bg-slate-900 text-white text-xs font-black uppercase tracking-[0.3em] shadow-lg`}>
                  {status.title}
                </div>
                <div className="h-px flex-1 bg-slate-900/10" />
              </div>

              <h1 className="text-5xl md:text-8xl font-black text-slate-900 leading-[0.85] tracking-tighter">
                Navegação <br /> em <span className="text-emerald-600 italic">Solo Firme.</span>
              </h1>

              <div className="bg-slate-900/5 p-8 rounded-[3rem] border border-slate-900/5 hover:bg-white/40 transition-all duration-500">
                <p className="text-xl md:text-3xl text-slate-700 font-bold leading-tight">
                  "{status.message}"
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <Link href="/log">
                  <motion.button whileHover={{ scale: 1.05, y: -5 }} className="px-10 py-6 bg-slate-900 text-white rounded-[2.5rem] font-black flex items-center gap-4 shadow-2xl hover:bg-slate-800 transition-all text-sm">
                    <Map size={24} className="text-emerald-400" />
                    Abrir Log de Sobrevivência
                  </motion.button>
                </Link>
                <motion.button 
                  whileHover={{ scale: 1.05, y: -5 }}
                  onClick={() => router.push(`/porto?humor=${encodeURIComponent(status.trigger)}`)}
                  className="px-10 py-6 bg-emerald-500 text-white rounded-[2.5rem] font-black flex items-center gap-4 shadow-2xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all text-sm"
                >
                  <MessageSquare size={24} />
                  Desabafar agora
                </motion.button>
              </div>
            </div>

            <div className="absolute -bottom-20 -right-20 text-slate-900/5 opacity-20 pointer-events-none">
              <Compass size={400} strokeWidth={0.5} />
            </div>
          </motion.div>

          <div className="lg:col-span-4 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-900 rounded-[4rem] p-10 text-white shadow-2xl relative overflow-hidden h-full"
            >
              <div className="absolute top-0 right-0 p-8 text-emerald-500/10 rotate-45">
                <Target size={180} />
              </div>
              
              <div className="relative z-10 space-y-12">
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-emerald-400 uppercase tracking-[0.4em]">Resiliência Hoje</h3>
                  <div className="flex items-end gap-3">
                    <span className="text-7xl md:text-8xl font-black tabular-nums tracking-tighter">{Math.round(progress)}</span>
                    <span className="text-2xl font-black text-emerald-400 mb-2">%</span>
                  </div>
                </div>

                <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)]"
                  />
                </div>

                <div className="space-y-4 pt-4">
                  <HUDItem icon={Zap} label="Energia Mental" value={status.energy} />
                  <HUDItem icon={Waves} label="Fluxo Emocional" value={status.flow} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* BOTTOM CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <InsightCard icon={Compass} title="Norte" desc="Sua bússola hoje aponta para hábitos de autocuidado." />
          <InsightCard icon={Star} title="Brilho" desc="Você está mantendo a constância no mar das emoções." />
          <InsightCard icon={ShieldCheck} title="Proteção" desc="Escudo mental ativado contra gatilhos externos." />
          <InsightCard icon={BarChart3} title="Tendência" desc="Crescimento estável de resiliência detectado." />
        </div>
      </div>
    </main>
  );
}

function HUDItem({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center justify-between p-5 bg-white/5 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-all group">
      <div className="flex items-center gap-4">
        <div className="text-emerald-400 group-hover:scale-110 transition-transform">
          <Icon size={18} />
        </div>
        <span className="text-xs font-black text-white/40 uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-xs font-black">{value}</span>
    </div>
  );
}

function InsightCard({ icon: Icon, title, desc }: any) {
  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      className="bg-white/40 backdrop-blur-xl p-8 rounded-[3rem] border border-white shadow-xl space-y-4 hover:shadow-2xl transition-all"
    >
      <div className="w-12 h-12 bg-slate-900 text-emerald-400 rounded-2xl flex items-center justify-center shadow-lg">
        <Icon size={24} />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{title}</h3>
        <p className="text-sm text-slate-500 font-bold leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}
