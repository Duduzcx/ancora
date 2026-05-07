"use client";

import React, { useState, useEffect } from 'react';
import { Anchor, Mail, Lock, ArrowRight, Loader2, User, Wind, Cloud, Zap, LifeBuoy, MessageCircle, Sword, Lightbulb, CheckCircle2, Shield, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import AnimatedBackground from '@/components/AnimatedBackground';

const LighthouseIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M8 9h8" />
    <path d="M9 14h6" />
    <path d="M12 3l2 3h-4l2-3z" />
    <path d="M10 6L8 21h8l-2-15" />
    <path d="M3 21h18" />
  </svg>
);

// Animações
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleSession = (session: any) => {
      if (session?.user) {
        setUser({
          ...session.user,
          display_name: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'Navegador'
        });
      } else {
        setUser(null);
      }
    };

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      handleSession(session);
      setIsCheckingAuth(false);
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleNavigate = (e: React.MouseEvent | React.FormEvent, href: string) => {
    if (e) e.preventDefault();
    router.push(href);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'com.zcx.norica://login-callback',
          queryParams: { prompt: 'select_account' },
          skipBrowserRedirect: true
        },
      });
      if (error) throw error;
      if (data?.url) await Browser.open({ url: data.url, windowName: '_self' });
    } catch (err: any) {
      setError("Falha na conexão Google.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password: password.trim() 
      });
      if (signInError) throw signInError;
      if (data?.session) handleSession(data.session);
    } catch (err: any) {
      setError("E-mail ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  };

  const handleSession = (session: any) => {
    if (session?.user) {
      setUser({
        ...session.user,
        display_name: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'Navegador'
      });
    } else {
      setUser(null);
    }
  };

  if (isCheckingAuth) {
    return (
      <main className="h-[100dvh] w-full bg-[#FDFCF7] flex items-center justify-center">
        <Loader2 className="text-emerald-500 animate-spin" size={40} />
      </main>
    );
  }

  const rawName = user?.user_metadata?.display_name || user?.display_name || "Navegador";
  const formattedName = rawName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');

  if (user) {
    return (
      <main className="min-h-screen relative transition-all overflow-x-hidden pb-40 selection:bg-emerald-500/10">
        <AnimatedBackground subtle={false} />
        
        {/* Top Section */}
        <div className="pt-16 pb-8 px-6 text-center space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            Protocolo de Segurança Mental
          </div>
          
          <h1 className="font-black text-slate-900 tracking-tighter leading-tight mt-6 whitespace-nowrap">
            <span className="text-[34px] md:text-[42px] block leading-none mb-3">Sua<span className="font-brain text-6xl md:text-7xl text-pink-wave normal-case ml-1 mr-3">mente</span>em</span>
            <span className="text-emerald-500 italic block text-[52px] md:text-[64px] tracking-[-0.05em]">Solo firme.</span>
          </h1>
          
          <p className="text-slate-600 text-lg max-w-xs mx-auto font-bold leading-relaxed px-4 italic">
            A vida é um mar que não obedece a ninguém. Nórica é o seu sistema de navegação emocional.
          </p>

          <button 
            onClick={(e) => handleNavigate(e, '/porto/')}
            className="mt-2 px-10 py-4 bg-slate-900 text-white rounded-full font-black text-[12px] uppercase tracking-widest inline-flex items-center gap-3 shadow-2xl active:scale-95 transition-transform"
          >
            Entrar no Porto
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Cais / Humor Section */}
        <div className="mx-6 p-10 bg-white border border-slate-100 rounded-[3.5rem] shadow-2xl relative z-20 mb-12 text-center">
          <div className="space-y-1 mb-8">
            <h2 className="text-[28px] font-black text-slate-900 tracking-tighter leading-tight">
              Bem-vindo ao cais, <span className="text-[#00D88B] italic">{formattedName}</span>.
            </h2>
          <div className="mx-auto w-full max-w-sm mt-12 mb-10 px-6 relative">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/40 backdrop-blur-md border border-white/50 rounded-3xl p-6 shadow-sm flex flex-col items-start justify-center overflow-visible"
            >
              <div className="overflow-visible w-full">
                <motion.p 
                  animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  className="text-sm md:text-base font-black italic tracking-tighter leading-tight bg-gradient-to-r from-blue-600 via-sky-400 to-blue-600 bg-[length:200%_auto] bg-clip-text text-transparent py-1 text-left block transform -translate-x-1"
                >
                  Como está seu mar hoje?
                </motion.p>
              </div>
              <div className="h-[2px] w-8 bg-blue-500/10 rounded-full mt-3 ml-0" />
            </motion.div>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            {[{h:'CALMO', i:Wind, c:'emerald'}, {h:'ANSIOSO', i:Cloud, c:'orange'}, {h:'AGITADO', i:Zap, c:'rose'}, {h:'S.O.S', i:LifeBuoy, c:'blue'}].map((item, idx) => (
              <motion.button 
                key={item.h} 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5, backgroundColor: '#f8fafc' }} 
                whileTap={{ scale: 0.95 }} 
                onClick={(e) => handleNavigate(e, `/porto/?humor=${item.h.toLowerCase()}`)} 
                className="bg-white border border-slate-100 shadow-xl rounded-[2.5rem] p-6 flex flex-col items-center gap-4 transition-all"
              >
                <div className={`w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center text-${item.c}-500 shadow-inner`}><item.i size={28} /></div>
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{item.h}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Divisor Visual */}
        <div className="px-10 py-12 flex items-center gap-4">
           <div className="h-[1px] flex-1 bg-emerald-200/50"></div>
           <span className="text-[10px] font-black text-emerald-600/60 uppercase tracking-[0.6em] italic">Sistema Nórica</span>
           <div className="h-[1px] flex-1 bg-emerald-200/50"></div>
        </div>

        {/* Modules Section */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="px-6 space-y-8 max-w-md mx-auto"
        >
          {/* O Porto */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => handleNavigate(e, '/porto/')}
            className="group bg-white/90 backdrop-blur-xl border border-white rounded-[3.5rem] p-8 text-center space-y-4 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-400 rounded-[2rem] flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20 group-hover:rotate-6 transition-transform">
              <LifeBuoy size={32} className="text-white" />
            </div>
            <div className="space-y-1 relative z-10">
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.4em]">DESCANSO & ACOLHIMENTO</p>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">O Porto</h2>
            </div>
            <p className="text-slate-500 text-sm font-bold leading-relaxed px-4 opacity-80 group-hover:opacity-100 transition-opacity">
              Seu cais seguro para descarregar o peso da jornada. Um espaço de acolhimento e total anonimato.
            </p>
          </motion.div>

          {/* A Arena */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => handleNavigate(e, '/arena/')}
            className="group bg-white/90 backdrop-blur-xl border border-white rounded-[3.5rem] p-8 text-center space-y-4 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
            <div className="w-16 h-16 bg-gradient-to-br from-rose-600 to-rose-400 rounded-[2rem] flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20 group-hover:rotate-6 transition-transform">
              <Sword size={32} className="text-white" />
            </div>
            <div className="space-y-1 relative z-10">
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.4em]">SIMULADOR TÁTICO</p>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">A Arena</h2>
            </div>
            <p className="text-slate-500 text-sm font-bold leading-relaxed px-4 opacity-80 group-hover:opacity-100 transition-opacity">
              O convés de treinamento para a vida. Pratique diálogos difíceis e prepare sua voz para o mar aberto.
            </p>
          </motion.div>

          {/* O Farol */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => handleNavigate(e, '/farol/')}
            className="group bg-white/90 backdrop-blur-xl border border-white rounded-[3.5rem] p-8 text-center space-y-4 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-emerald-400 rounded-[2rem] flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 group-hover:rotate-6 transition-transform">
              <LighthouseIcon size={32} className="text-white" />
            </div>
            <div className="space-y-1 relative z-10">
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.4em]">VISÃO & CLAREZA</p>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">O Farol</h2>
            </div>
            <p className="text-slate-500 text-sm font-bold leading-relaxed px-4 opacity-80 group-hover:opacity-100 transition-opacity">
              A luz que guia seus pensamentos. Analise padrões e encontre a direção certa para sua bússola.
            </p>
          </motion.div>

          {/* O Cofre */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => handleNavigate(e, '/cofre/')}
            className="group bg-white/90 backdrop-blur-xl border border-white rounded-[3.5rem] p-8 text-center space-y-4 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
            <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-teal-400 rounded-[2rem] flex items-center justify-center mx-auto shadow-lg shadow-teal-500/20 group-hover:rotate-6 transition-transform">
              <Shield size={32} className="text-white" />
            </div>
            <div className="space-y-1 relative z-10">
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.4em]">SIGILO ABSOLUTO</p>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">O Cofre</h2>
            </div>
            <p className="text-slate-500 text-sm font-bold leading-relaxed px-4 opacity-80 group-hover:opacity-100 transition-opacity">
              Suas memórias mais preciosas sob tranca e chave. Um baú digital que só você pode acessar.
            </p>
          </motion.div>

          {/* Logs */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => handleNavigate(e, '/log/')}
            className="group bg-white/90 backdrop-blur-xl border border-white rounded-[3.5rem] p-8 text-center space-y-4 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
            <div className="w-16 h-16 bg-gradient-to-br from-sky-600 to-sky-400 rounded-[2rem] flex items-center justify-center mx-auto shadow-lg shadow-sky-500/20 group-hover:rotate-6 transition-transform">
              <CheckCircle2 size={32} className="text-white" />
            </div>
            <div className="space-y-1 relative z-10">
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.4em]">DIÁRIO DE BORDO</p>
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Logs</h2>
            </div>
            <p className="text-slate-500 text-sm font-bold leading-relaxed px-4 opacity-80 group-hover:opacity-100 transition-opacity">
              O registro histórico da sua navegação. Acompanhe cada milha na sua jornada pessoal.
            </p>
          </motion.div>

          {/* Respiração Section */}
          <div className="pt-24 pb-16 text-center space-y-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-sky-500/[0.02] blur-3xl -z-10" />
            <motion.h3 
              animate={{ 
                rotate: [-1, 1, -1],
                scale: [0.98, 1, 0.98]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="text-4xl md:text-5xl font-black text-sky-600 uppercase tracking-tighter italic bg-gradient-to-b from-sky-600 to-sky-400 bg-clip-text text-transparent py-4"
            >
              Respiração
            </motion.h3>
            <p className="text-[10px] font-black text-sky-400/60 uppercase tracking-[0.6em] italic">Sincronize seu fluxo vital</p>
            <div className="flex flex-col items-center pt-8">
              <motion.button
                onClick={(e) => handleNavigate(e, '/respiracao/')}
                animate={{ 
                  scale: [1, 1.15, 1],
                  boxShadow: [
                    "0 0 0px rgba(14, 165, 233, 0)",
                    "0 0 40px rgba(14, 165, 233, 0.2)",
                    "0 0 0px rgba(14, 165, 233, 0)"
                  ]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="w-56 h-56 rounded-full bg-white border-2 border-sky-100 flex items-center justify-center relative overflow-hidden shadow-2xl active:scale-95 transition-all group"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-sky-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Wind className="text-sky-500 relative z-10 group-hover:scale-110 transition-transform" size={64} />
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-2 border-t-2 border-sky-200 rounded-full opacity-40" />
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute inset-4 border-b-2 border-sky-100 rounded-full opacity-30" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="h-[100dvh] w-full bg-[#080D19] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-[#00D88B]/30 touch-none overscroll-none">
      <AnimatedBackground subtle={false} />
      
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-[380px] flex flex-col items-center z-10 pointer-events-auto scale-[0.95] md:scale-100">
        
        <motion.div 
          variants={logoVariants} 
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative mb-6 shrink-0"
        >
          <div className="w-20 h-20 bg-[#00D88B] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(0,216,139,0.25)] border-4 border-[#080D19]">
            <Anchor size={36} className="text-[#080D19]" strokeWidth={2.5} />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center mb-8 shrink-0">
          <h1 className="text-[36px] font-black text-white italic tracking-tighter mb-1 uppercase leading-none drop-shadow-[0_2px_10px_rgba(255,255,255,0.1)]">PORTO SEGURO</h1>
          <p className="text-[9px] font-black text-[#00D88B] tracking-[0.3em] uppercase opacity-80">Nórica • Navegação Mental</p>
        </motion.div>

        <motion.div 
          variants={itemVariants} 
          className="w-full bg-[#101726]/85 backdrop-blur-3xl rounded-[2.5rem] p-6 md:p-8 border border-white/5 shadow-2xl flex-none"
        >
          <div className="space-y-5">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleLogin} 
              disabled={googleLoading} 
              className="w-full h-[58px] bg-white rounded-full flex items-center justify-center gap-3 font-black text-[10px] text-black transition-all shadow-xl active:scale-[0.98]"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
              ENTRAR COM GOOGLE
            </motion.button>

            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-[1px] bg-white/10" />
              <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">OU E-MAIL</span>
              <div className="flex-1 h-[1px] bg-white/10" />
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#00D88B] transition-colors" size={16} />
                <input 
                  type="email" 
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[58px] bg-white/5 border border-white/10 rounded-full pl-14 pr-6 text-sm font-bold text-white outline-none focus:border-[#00D88B]/40 focus:bg-white/10 transition-all placeholder:text-white/10"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#00D88B] transition-colors" size={16} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[58px] bg-white/5 border border-white/10 rounded-full pl-14 pr-14 text-sm font-bold text-white outline-none focus:border-[#00D88B]/40 focus:bg-white/10 transition-all placeholder:text-white/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="flex justify-end px-4">
                <button 
                  type="button"
                  onClick={() => router.push('/auth/forgot-password/')}
                  className="text-[8px] font-black text-[#00D88B] uppercase tracking-widest hover:text-[#00D88B]/70 transition-colors"
                >
                  Esqueci a senha
                </button>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-[9px] font-black uppercase tracking-widest text-center"
                >
                  {error}
                </motion.div>
              )}

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={loading}
                className="w-full h-[60px] bg-[#00D88B] rounded-full flex items-center justify-center gap-3 font-black text-[10px] text-[#080D19] transition-all shadow-xl shadow-[#00D88B]/10 active:scale-[0.98] uppercase tracking-widest"
              >
                {loading ? "Entrando..." : "Entrar na Nórica"}
                <ArrowRight size={16} />
              </motion.button>
            </form>

            <div className="text-center pt-2">
              <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Novo por aqui? </span>
              <button 
                onClick={() => router.push('/auth/signup/')}
                className="text-[9px] font-black text-[#00D88B] uppercase tracking-widest hover:underline"
              >
                Criar Conta
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}

const logoVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: "backOut" }
  }
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};
