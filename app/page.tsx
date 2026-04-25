"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  MessageCircle, Sword, CheckCircle, Shield, 
  ArrowRight, Sparkles, ShieldCheck, Anchor,
  Wind, Cloud, Zap, LifeBuoy, Lightbulb
} from 'lucide-react';
import { createClient } from '@/lib/supabase';

const features = [
  { title: "O Porto", desc: "Chat anônimo com nossa IA acolhedora.", icon: MessageCircle, href: "/porto", color: "bg-blue-600", subtitle: "ACOLHIMENTO", dark: false },
  { title: "O Farol", desc: "Inteligência proativa que guia seu progresso.", icon: Lightbulb, href: "/farol", color: "bg-emerald-600", subtitle: "INSIGHTS", dark: true },
  { title: "Logs de sobrevivencia", desc: "Rastreamento diário de progresso emocional.", icon: CheckCircle, href: "/log", color: "bg-teal-600", subtitle: "HÁBITOS", dark: true },
  { title: "O Cofre", desc: "Seu diário ultra-seguro para desabafos profundos.", icon: Shield, href: "/cofre", color: "bg-amber-600", subtitle: "PRIVACIDADE", dark: false }
];

export default function Home() {
  const [greeting, setGreeting] = useState('');
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const hour = new Date().getHours();
    let baseGreeting = '';
    if (hour >= 5 && hour < 12) baseGreeting = 'Bom dia';
    else if (hour >= 12 && hour < 18) baseGreeting = 'Boa tarde';
    else baseGreeting = 'Boa noite';
    setGreeting(baseGreeting);

    const fetchUser = async (sessionUser: any) => {
      if (sessionUser) {
        const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', sessionUser.id).single();
        let displayName = profile?.display_name || 
                            sessionUser.user_metadata?.display_name || 
                            'Amigo';
        
        // Garantindo Primeira Letra Maiúscula
        displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
        
        setUser({ ...sessionUser, display_name: displayName });
      } else {
        setUser(null);
      }
    };

    supabase.auth.getUser().then(({ data: { user } }) => fetchUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUser(session?.user ?? null);
    });

    router.prefetch('/porto');

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  const handleEmotionalCheckin = (mood: string) => {
    router.push(`/porto?mood=${encodeURIComponent(mood)}`);
  };

  return (
    <main className="lg:pl-64 lg:pr-64 min-h-screen bg-transparent flex justify-center items-center overflow-x-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl w-full p-8 lg:p-12 flex flex-col space-y-40 pb-40"
      >
        
        {/* 1. HERO SECTION */}
        <section className="text-center flex flex-col items-center pt-24">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 text-emerald-800 rounded-full text-[11px] font-black mb-10 border border-emerald-500/20 shadow-sm uppercase tracking-[0.2em]"
          >
            <Sparkles size={14} className="animate-pulse" />
            Seu refúgio digital
          </motion.div>
          
          <div className="space-y-4">
            <h1 className="text-5xl md:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter">
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="block md:whitespace-nowrap"
              >
                Sua mente em
              </motion.span>
              <motion.span 
                initial={{ opacity: 0, x: 20 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  textShadow: ["0 0 0px #10b981", "0 0 40px #10b981", "0 0 0px #10b981"]
                }}
                transition={{ 
                  opacity: { duration: 0.8, delay: 0.4 },
                  x: { duration: 0.8, delay: 0.4 },
                  textShadow: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                className="text-emerald-500 italic block mt-2"
              >
                Solo firme.
              </motion.span>
            </h1>
          </div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-10 text-xl md:text-2xl text-slate-600 max-w-2xl leading-relaxed font-bold opacity-90"
          >
            Encontre o equilíbrio necessário em um ambiente projetado para acolher e proteger sua jornada emocional.
          </motion.p>

          <div className="mt-16 group relative">
            <Link href="/porto">
              <motion.button 
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="px-14 py-8 bg-slate-900 text-white rounded-[2.5rem] font-black flex items-center gap-6 shadow-2xl hover:bg-slate-800 transition-all text-xl"
              >
                Ir para o Porto
                <div className="flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                  <Anchor size={22} className="text-emerald-400" />
                  <ArrowRight size={24} />
                </div>
              </motion.button>
            </Link>
          </div>
        </section>

        {/* 2. CHECK-IN EMOCIONAL */}
        <section className="space-y-20">
          <div className="text-center">
            <motion.h2 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight"
            >
              Como está seu mar hoje, <span className="text-emerald-600 underline decoration-emerald-200 decoration-8 underline-offset-[12px]">{user?.display_name || 'Amigo'}</span>?
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <EmotionButton 
              icon={Wind} color="text-emerald-500" label="Calmo" 
              onClick={() => handleEmotionalCheckin('calmo')} 
            />
            <EmotionButton 
              icon={Cloud} color="text-orange-500" label="Ansioso" 
              onClick={() => handleEmotionalCheckin('ansioso')} 
            />
            <EmotionButton 
              icon={Zap} color="text-red-500" label="Agitado" 
              onClick={() => handleEmotionalCheckin('agitado')} 
            />
            <EmotionButton 
              icon={LifeBuoy} color="text-blue-700" label="Ajuda Agora" 
              onClick={() => handleEmotionalCheckin('precisando de ajuda urgente')} 
            />
          </div>
        </section>

        {/* 3. GRID DE FERRAMENTAS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {features.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={item.href}>
                <motion.div 
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    group p-12 h-full border transition-all cursor-pointer relative overflow-hidden text-center flex flex-col items-center rounded-[3.5rem]
                    ${item.dark 
                      ? 'bg-slate-900/5 border-slate-900/10' 
                      : 'bg-white/95 border-white shadow-xl hover:shadow-2xl'}
                  `}
                >
                  <div className={`w-16 h-16 ${item.color} rounded-3xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform shadow-lg`}>
                    <item.icon size={32} />
                  </div>
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">{item.subtitle}</h4>
                  <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">{item.title}</h3>
                  <p className="text-slate-600 text-lg leading-relaxed font-bold opacity-80">{item.desc}</p>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </section>

        {/* 4. ESPAÇO DE DESCOMPRESSÃO */}
        <section className="flex flex-col items-center justify-center py-24 border-t border-slate-200/50 space-y-16">
          <div className="text-center">
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">Respire fundo, {user?.display_name || 'Amigo'}</h3>
          </div>

          <div className="relative flex items-center justify-center">
            <motion.div 
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="w-56 h-56 rounded-full border-4 border-emerald-400/20 flex items-center justify-center bg-white shadow-2xl"
            />
            <motion.div 
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute text-emerald-600 font-black tracking-[0.5em] uppercase text-sm"
            >
              Respire
            </motion.div>
          </div>
        </section>
      </motion.div>
    </main>
  );
}

function EmotionButton({ icon: Icon, color, label, onClick }: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.08, y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className="flex flex-col items-center gap-6 p-12 bg-white border border-white shadow-xl rounded-[3.5rem] hover:shadow-2xl transition-all"
    >
      <div className={`${color} p-6 bg-slate-50 rounded-[2rem] shadow-inner`}>
        <Icon size={48} />
      </div>
      <span className="font-black text-xs uppercase tracking-widest text-slate-800">{label}</span>
    </motion.button>
  );
}
