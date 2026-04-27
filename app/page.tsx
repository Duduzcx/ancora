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
import { createClient } from '@/lib/supabase-client';
import FarolCompanion from '@/components/FarolCompanion';

const features = [
  { 
    title: "O Porto", 
    desc: "Seu cais seguro. Onde as águas são mansas e você pode descarregar o peso da jornada sem julgamentos e em total anonimato.", 
    icon: MessageCircle, 
    href: "/porto", 
    color: "bg-blue-600", 
    subtitle: "DESCANSO & ACOLHIMENTO", 
    dark: false 
  },
  { 
    title: "A Arena", 
    desc: "O convés de treinamento. Pratique diálogos e situações difíceis em um ambiente simulado antes de enfrentar o mar aberto da vida.", 
    icon: Sword, 
    href: "/arena", 
    color: "bg-rose-600", 
    subtitle: "TREINAMENTO TÁTICO", 
    dark: true 
  },
  { 
    title: "O Farol", 
    desc: "A luz que corta a neblina. Nossa inteligência proativa guia seu caminho de volta à segurança antes que você perca o rumo.", 
    icon: Lightbulb, 
    href: "/farol", 
    color: "bg-emerald-600", 
    subtitle: "IA PROATIVA", 
    dark: true 
  },
  { 
    title: "A Âncora", 
    desc: "Seus hábitos inegociáveis. O registro de sobrevivência que te prende ao que é real quando a ansiedade tenta te levar para o fundo.", 
    icon: CheckCircle, 
    href: "/log", 
    color: "bg-teal-600", 
    subtitle: "ESTABILIDADE", 
    dark: true 
  },
  { 
    title: "O Cofre", 
    desc: "O diário do capitão. Tranque seus pensamentos mais sombrios a sete chaves e queime-os para que eles não afundem sua embarcação.", 
    icon: Shield, 
    href: "/cofre", 
    color: "bg-amber-600", 
    subtitle: "PRIVACIDADE ABSOLUTA", 
    dark: false 
  }
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
    <main className="min-h-screen bg-transparent flex justify-center items-center overflow-x-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl w-full p-6 md:p-12 flex flex-col space-y-12 md:space-y-40 pb-40"
      >
        
        {/* 1. HERO SECTION */}
        <section className="text-center flex flex-col items-center pt-6 md:pt-24">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 text-emerald-800 rounded-full text-[11px] font-black mb-10 border border-emerald-500/20 shadow-sm uppercase tracking-[0.2em]"
          >
            <Sparkles size={14} className="animate-pulse" />
            Manual de Navegação Emocional
          </motion.div>
          
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter">
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
            A vida é um mar que não obedece a ninguém. Aprenda a navegar, a ancorar e a encontrar o seu porto seguro.
          </motion.p>

          <div className="mt-16 group relative">
            <Link href="/porto">
              <motion.button 
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 md:px-14 py-6 md:py-8 bg-slate-900 text-white rounded-3xl md:rounded-[2.5rem] font-black flex items-center gap-4 md:gap-6 shadow-2xl hover:bg-slate-800 transition-all text-lg md:text-xl"
              >
                Ir para o Porto
                <div className="flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                  <Anchor size={20} className="text-emerald-400" />
                  <ArrowRight size={22} />
                </div>
              </motion.button>
            </Link>
          </div>
        </section>

        {/* COMPANHEIRO DIÁRIO PREDITIVO */}
        <FarolCompanion />

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
              className={index === 0 ? "md:col-span-2" : ""} 
            >
              <Link href={item.href}>
                <motion.div 
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    group p-10 md:p-14 h-full border transition-all cursor-pointer relative overflow-hidden flex flex-col items-center text-center rounded-[3.5rem]
                    ${item.dark 
                      ? 'bg-slate-900 border-slate-800 text-white' 
                      : 'bg-white/95 border-white shadow-xl hover:shadow-2xl text-slate-900'}
                  `}
                >
                  <div className={`w-16 h-16 ${item.color} rounded-3xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform shadow-lg`}>
                    <item.icon size={32} />
                  </div>
                  <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] mb-3 ${item.dark ? 'text-emerald-400/60' : 'text-slate-400'}`}>{item.subtitle}</h4>
                  <h3 className="text-3xl font-black mb-4 tracking-tight">{item.title}</h3>
                  <p className={`text-lg leading-relaxed font-bold opacity-80 ${item.dark ? 'text-slate-300' : 'text-slate-600'}`}>{item.desc}</p>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </section>

        {/* 3.5 ANIMATED TEASER */}
        <section className="flex justify-center py-10 overflow-hidden">
          <motion.div 
            animate={{ x: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-center space-y-4"
          >
            <div className="inline-flex items-center gap-3 text-emerald-600 font-black text-xs uppercase tracking-[0.3em] bg-emerald-50 py-3 px-6 rounded-2xl border border-emerald-100">
              <Wind size={16} className="animate-bounce" />
              Sente o vento? O Âncora te guia.
            </div>
            <p className="text-slate-400 text-[11px] font-black italic">Deslize para descobrir como não naufragar nas ondas da vida.</p>
          </motion.div>
        </section>

        {/* 4. O MANIFESTO DO NAVEGANTE (CONCEITO) */}
        <section className="relative overflow-hidden bg-slate-900 text-white rounded-[4rem] p-12 md:p-24 space-y-20 border border-white/5 shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Anchor size={400} strokeWidth={1} />
          </div>

          <div className="max-w-3xl space-y-8 relative z-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20"
            >
              O Conceito Âncora
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
              Você não pode parar as ondas, mas pode aprender a <span className="text-emerald-400 italic">surfar</span>.
            </h2>
            <p className="text-xl text-slate-400 font-bold leading-relaxed">
              A vida é um mar imprevisível. Tem dias de calmaria e dias de tempestade violenta. O Âncora existe porque o mar não obedece a ninguém — mas você pode ser o capitão do seu próprio destino.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            <ManifestoItem 
              icon={Anchor}
              title="A Âncora"
              desc="Quando o vento sopra forte e as ondas tentam te arrastar, a Âncora (seus hábitos) garante que você não derive. Ela te prende ao que é real e essencial."
            />
            <ManifestoItem 
              icon={Lightbulb}
              title="O Farol"
              desc="A neblina da mente pode ser espessa. O Farol é a luz constante que te guia de volta para a segurança antes que você bata nas rochas."
            />
            <ManifestoItem 
              icon={MessageCircle}
              title="O Porto"
              desc="Todo marinheiro precisa de um cais onde possa baixar as velas e apenas ser. O Porto é o espaço seguro onde nada pode te atingir."
            />
          </div>
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

      {/* MOBILE NAVIGATION BAR */}
      <nav className="lg:hidden fixed bottom-6 inset-x-6 h-20 bg-white/60 backdrop-blur-3xl border border-white rounded-[2.5rem] shadow-2xl z-[100] flex items-center justify-around px-4">
        <MobileNavLink icon={MessageCircle} href="/porto" active={false} />
        <MobileNavLink icon={Sword} href="/arena" active={false} />
        <div className="relative -top-10">
          <Link href="/">
            <div className="w-16 h-16 bg-slate-900 text-emerald-400 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white">
              <Anchor size={28} />
            </div>
          </Link>
        </div>
        <MobileNavLink icon={CheckCircle} href="/log" active={false} />
        <MobileNavLink icon={Shield} href="/cofre" active={false} />
      </nav>
    </main>
  );
}

function ManifestoItem({ icon: Icon, title, desc }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="space-y-6"
    >
      <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-black tracking-tight">{title}</h3>
      <p className="text-slate-400 text-sm font-bold leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function MobileNavLink({ icon: Icon, href, active }: { icon: any, href: string, active: boolean }) {
  return (
    <Link href={href}>
      <div className={`p-3 rounded-2xl transition-all ${active ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-900'}`}>
        <Icon size={24} />
      </div>
    </Link>
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
