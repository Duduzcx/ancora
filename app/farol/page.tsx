"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, Sparkles, MessageSquare, ArrowLeft, 
  Target, TrendingUp, CheckCircle2, ShieldAlert,
  ArrowRight, Anchor
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AnimatedBackground from '@/components/AnimatedBackground';
import { createClient } from '@/lib/supabase';

export default function FarolPage() {
  const [progress, setProgress] = useState<number | null>(null);
  const [userName, setUserName] = useState("Amigo");
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setIsMounted(true);
    const savedProgress = localStorage.getItem('ancora-progress');
    setProgress(savedProgress !== null ? parseFloat(savedProgress) : 0);

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

  if (progress === 0) {
    title = "O Início da Jornada";
    message = `${userName}, notei que o seu Log ainda está vazio. Que tal começar com um passo pequeno hoje? O mar calmo começa com uma única âncora.`;
    moodTrigger = "preciso de ajuda para começar meu dia";
    colorClass = "text-blue-500";
  } else if (progress! < 100) {
    title = "Rumo ao Solo Firme";
    message = `Você já começou sua jornada hoje, ${userName}! Faltam apenas alguns passos para o seu ecossistema florescer por completo.`;
    moodTrigger = "estou no caminho, mas preciso de motivação";
    colorClass = "text-emerald-500";
  } else {
    title = "Porto Conquistado";
    message = `Incrível! Você completou todas as suas missões. Sua mente está em solo firme hoje. Aproveite este estado de paz.`;
    moodTrigger = "quero celebrar meu dia produtivo";
    colorClass = "text-amber-500";
  }

  return (
    <main className="min-h-screen bg-transparent p-4 md:p-12 relative overflow-hidden flex items-center justify-center">
      <AnimatedBackground />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full bg-white/40 backdrop-blur-3xl rounded-[4rem] border border-white p-8 md:p-20 shadow-2xl relative z-10 text-center"
      >
        <div className="absolute top-12 left-12">
          <Link href="/">
            <motion.button whileHover={{ scale: 1.1, x: -5 }} className="p-4 bg-slate-900 text-white rounded-full">
              <ArrowLeft size={20} />
            </motion.button>
          </Link>
        </div>

        <div className="space-y-12">
          <motion.div 
            animate={{ 
              scale: [1, 1.05, 1],
              boxShadow: ["0 0 0px rgba(16, 185, 129, 0)", "0 0 40px rgba(16, 185, 129, 0.2)", "0 0 0px rgba(16, 185, 129, 0)"]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-32 h-32 bg-emerald-500 text-white rounded-[2.5rem] mx-auto flex items-center justify-center shadow-2xl"
          >
            <Lightbulb size={60} strokeWidth={1.5} />
          </motion.div>

          <div className="space-y-6">
            <h2 className={`text-[12px] font-black uppercase tracking-[0.6em] ${colorClass}`}>
              {title}
            </h2>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[0.9] tracking-tighter">
              A Inteligência <br /> do <span className="italic text-emerald-600">Farol.</span>
            </h1>
          </div>

          <div className="bg-white/60 rounded-[3rem] p-10 border border-white/50 shadow-xl max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6 justify-center">
              <Sparkles className="text-emerald-500 animate-pulse" size={24} />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Análise Proativa</span>
            </div>
            <p className="text-xl md:text-2xl text-slate-700 font-bold leading-relaxed">
              "{message}"
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <Link href="/log">
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-6 bg-slate-900 text-white rounded-full font-black flex items-center gap-3 shadow-xl"
              >
                <TrendingUp size={20} />
                Ver meu Progresso
              </motion.button>
            </Link>

            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(`/porto?mood=${encodeURIComponent(moodTrigger)}`)}
              className="px-10 py-6 bg-emerald-500 text-white rounded-full font-black flex items-center gap-3 shadow-xl"
            >
              <MessageSquare size={20} />
              Falar sobre isso no Porto
            </motion.button>
          </div>
        </div>

        {/* INDICADORES DE STATUS */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-slate-200">
          <StatusItem icon={Target} label="Foco" value="Alta" />
          <StatusItem icon={CheckCircle2} label="Progresso" value={`${Math.round(progress || 0)}%`} />
          <StatusItem icon={Anchor} label="Solo" value={progress === 100 ? "Firme" : "Em Busca"} />
        </div>
      </motion.div>
    </main>
  );
}

function StatusItem({ icon: Icon, label, value }: any) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center">
        <Icon size={18} />
      </div>
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-sm font-black text-slate-800">{value}</span>
    </div>
  );
}
