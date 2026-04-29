"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MessageCircle, Sword, CheckCircle, Shield,
  ArrowRight, Sparkles, Anchor,
  Wind, Cloud, Zap, LifeBuoy, Lightbulb
} from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import AnimatedBackground from '@/components/AnimatedBackground';

const features = [
  {
    title: "O Porto",
    desc: "Seu cais seguro para descarregar o peso da jornada. Um espaço de escuta profunda, acolhimento e total anonimato.",
    icon: MessageCircle,
    href: "/porto",
    color: "from-blue-600 to-indigo-700",
    subtitle: "DESCANSO & ACOLHIMENTO",
    dark: true
  },
  {
    title: "A Arena",
    desc: "O convés de treinamento para a vida. Pratique diálogos difíceis e prepare sua voz para enfrentar qualquer mar aberto.",
    icon: Sword,
    href: "/arena",
    color: "from-rose-500 to-red-700",
    subtitle: "SIMULADOR TÁTICO",
    dark: true
  },
  {
    title: "O Farol",
    desc: "A luz que corta a neblina da mente. Nossa inteligência guia seus passos de volta à segurança antes da tempestade.",
    icon: Lightbulb,
    href: "/farol",
    color: "from-emerald-500 to-teal-700",
    subtitle: "GUIA PROATIVO",
    dark: true
  },
  {
    title: "A Âncora",
    desc: "Seus hábitos inegociáveis. O registro diário que te mantém firme na realidade quando a ansiedade tenta te levar.",
    icon: CheckCircle,
    href: "/log",
    color: "from-teal-500 to-cyan-700",
    subtitle: "ESTABILIDADE DIÁRIA",
    dark: true
  },
  {
    title: "O Cofre",
    desc: "Tranque seus pensamentos mais pesados. Um santuário de privacidade absoluta onde seus segredos estão a salvo.",
    icon: Shield,
    href: "/cofre",
    color: "from-amber-500 to-orange-700",
    subtitle: "PRIVACIDADE TOTAL",
    dark: true
  }
];

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const initialize = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Define o usuário imediatamente com o que temos na sessão
        const initialUser = {
          ...session.user,
          display_name: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'Amigo'
        };
        setUser(initialUser);
        setIsCheckingAuth(false);

        // Busca o perfil real em segundo plano para precisão
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile?.display_name) {
          setUser((prev: any) => ({ ...prev, display_name: profile.display_name }));
        }
      } else {
        setIsCheckingAuth(false);
      }
    };
    initialize();
  }, [supabase]);

  const handleEmotionalCheckin = (mood: string) => {
    router.push(`/porto?humor=${encodeURIComponent(mood)}`);
  };

  return (
    <main className="fixed inset-0 flex flex-col overflow-hidden bg-[#fdfcf7] overscroll-none touch-none">
      <AnimatedBackground />

      {/* Background Watermarks - Posicionadas nas bordas para evitar ruído central */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03] z-0">
        <Anchor size={140} strokeWidth={2} className="text-slate-900 absolute top-10 -left-10 rotate-[-15deg]" />
        <Anchor size={110} strokeWidth={2} className="text-slate-900 absolute bottom-1/4 -right-10 rotate-[15deg]" />
        <Anchor size={90} strokeWidth={2} className="text-slate-900 absolute top-1/4 -right-10 rotate-[45deg]" />
        <Anchor size={100} strokeWidth={2} className="text-slate-900 absolute bottom-10 left-1/4 rotate-[25deg]" />
      </div>

      <div className="flex-1 overflow-x-hidden overflow-y-auto w-full custom-scrollbar overscroll-contain flex justify-center pt-12 md:pt-24 pb-40 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-6xl p-4 md:p-12 flex flex-col space-y-16 md:space-y-32"
        >

          {/* HEADER CONCEITUAL */}
          <div className="text-center relative z-10">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/10 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-14 border border-emerald-500/20 shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Protocolo de Segurança Mental
            </motion.div>

            <h1 className="text-5xl md:text-8xl font-black tracking-tight text-slate-950 mb-8 leading-tight flex flex-col items-center">
              <span className="whitespace-nowrap">Sua mente em</span>
              <span className="text-5xl md:text-8xl text-emerald-500 italic">Solo firme.</span>
            </h1>

            <p className="text-slate-500 font-medium text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12">
              A vida é um mar que não obedece a ninguém. <br className="hidden md:block" />
              A Âncora é o seu sistema de navegação emocional.
            </p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center"
            >
              <Link href={user ? "/porto" : "/auth"}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-slate-900 text-white rounded-full font-black text-sm uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:bg-slate-800 transition-all"
                >
                  Entrar no Porto
                  <ArrowRight size={20} />
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* ... DASHBOARD DE HUMOR ... */}
          {user && (
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12 bg-white/40 backdrop-blur-3xl p-8 md:p-16 rounded-[4rem] border border-white/60 shadow-2xl relative z-10"
            >
              <div className="text-center">
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                  Bem-vindo ao cais, <span className="text-emerald-600">{user?.display_name?.split(' ')[0] || 'Amigo'}</span>.
                </h2>
                <p className="text-slate-500 font-bold mt-4 uppercase tracking-widest text-xs">Como está a maré hoje?</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                <EmotionButton icon={Wind} color="text-emerald-500" label="Calmo" onClick={() => handleEmotionalCheckin('calmo')} />
                <EmotionButton icon={Cloud} color="text-orange-500" label="Ansioso" onClick={() => handleEmotionalCheckin('ansioso')} />
                <EmotionButton icon={Zap} color="text-red-500" label="Agitado" onClick={() => handleEmotionalCheckin('agitado')} />
                <EmotionButton icon={LifeBuoy} color="text-blue-700" label="S.O.S" onClick={() => handleEmotionalCheckin('ajuda urgente')} />
              </div>
            </motion.section>
          )}

          {/* ... GRID DE FERRAMENTAS ... */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {features.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={index === 0 ? "md:col-span-2" : ""}
              >
                <Link href={user ? item.href : '/auth'}>
                  <motion.div
                    whileHover={{ scale: 1.02, y: -8 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      group p-10 md:p-16 h-full border transition-all cursor-pointer relative overflow-hidden flex flex-col items-center text-center rounded-[3rem] md:rounded-[4rem]
                      bg-slate-900 border-slate-800 text-white shadow-2xl hover:shadow-emerald-500/10 hover:border-slate-700
                    `}
                  >
                    <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${item.color} opacity-20 blur-[80px] group-hover:opacity-40 transition-opacity`} />
                    <div className={`w-20 h-20 bg-gradient-to-br ${item.color} rounded-[2rem] flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform shadow-xl relative z-10`}>
                      <item.icon size={36} />
                    </div>
                    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] mb-4 text-emerald-400/60 relative z-10">{item.subtitle}</h4>
                    <h3 className="text-3xl md:text-4xl font-black mb-6 tracking-tight relative z-10">{item.title}</h3>
                    <p className="text-lg md:text-xl leading-relaxed font-bold opacity-80 text-slate-300 relative z-10">{item.desc}</p>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </section>

          {/* EXERCÍCIO DE RESPIRAÇÃO */}
          <section className="flex flex-col items-center justify-center py-32 border-t border-slate-200/50 space-y-16 relative z-10">
            <div className="text-center space-y-4">
              <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight italic">Respiração.</h3>
              <p className="text-slate-500 font-bold max-w-md mx-auto">Sincronize-se com o ritmo da Âncora.</p>
            </div>

            <div className="relative flex items-center justify-center w-full max-w-sm aspect-square">
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-emerald-400 rounded-full blur-3xl"
              />

              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="w-56 h-56 md:w-72 md:h-72 rounded-full border-2 border-white/40 flex items-center justify-center bg-white/20 backdrop-blur-xl shadow-2xl relative z-10"
              >
                <motion.div
                  animate={{
                    scale: [0.7, 1.2, 0.7],
                    opacity: [0.4, 1, 0.4]
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="flex items-center justify-center"
                >
                  <Anchor size={56} className="text-emerald-500" strokeWidth={3} />
                </motion.div>
              </motion.div>
            </div>
          </section>

        </motion.div>
      </div>
    </main>
  );
}

function EmotionButton({ icon: Icon, color, label, onClick }: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -5, boxShadow: "0 30px 60px rgba(0,0,0,0.12)" }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center gap-4 p-6 md:p-10 bg-white border border-white shadow-xl rounded-[2.5rem] hover:shadow-2xl transition-all"
    >
      <div className={`${color} p-4 md:p-6 bg-slate-50 rounded-3xl shadow-inner`}>
        <Icon size={32} className="md:w-10 md:h-10" />
      </div>
      <span className="font-black text-[10px] md:text-xs uppercase tracking-widest text-slate-800">{label}</span>
    </motion.button>
  );
}
